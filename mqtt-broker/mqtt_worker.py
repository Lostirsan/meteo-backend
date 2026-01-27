import psycopg2
import json
import os
import time
import paho.mqtt.client as mqtt
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")

MQTT_HOST = os.getenv("MQTT_HOST", "broker.hivemq.com")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "greenhouse/greenhouse_1")

def get_conn():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL is not set")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS measurements (
            id SERIAL PRIMARY KEY,
            device_id TEXT,
            time TIMESTAMP NOT NULL,
            air_temp REAL,
            air_hum REAL,
            air_press REAL,
            gas REAL,
            water_temp REAL,
            soil REAL,
            light REAL
        );
    """)
    conn.commit()
    cur.close()
    conn.close()
    print("Database initialized successfully")

def save_measurement(payload):
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO measurements
            (device_id, time, air_temp, air_hum, air_press, gas, water_temp, soil, light)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            payload.get("device_id"),
            datetime.now(),
            payload.get("air_temp"),
            payload.get("air_hum"),
            payload.get("air_press"),
            payload.get("gas"),
            payload.get("water_temp"),
            payload.get("soil"),
            payload.get("light")
        ))
        conn.commit()
        cur.close()
        conn.close()
        print("Saved:", payload)
    except Exception as e:
        print("SAVE ERROR:", e)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT connected successfully")
        client.subscribe(MQTT_TOPIC)
        print("Subscribed to:", MQTT_TOPIC)
    else:
        print("MQTT connection failed, code:", rc)

def on_disconnect(client, userdata, rc):
    print("MQTT disconnected with code:", rc)

def on_message(client, userdata, msg):
    print("RAW MESSAGE:", msg.topic, msg.payload)

    try:
        raw = msg.payload.decode().strip()
        if not raw:
            print("EMPTY MESSAGE, SKIP")
            return

        payload = json.loads(raw)

        if not isinstance(payload, dict):
            print("INVALID PAYLOAD TYPE:", type(payload))
            return

        if "device_id" not in payload:
            print("NO device_id, SKIP:", payload)
            return

        save_measurement(payload)

    except json.JSONDecodeError as e:
        print("JSON ERROR:", e)
    except Exception as e:
        print("MESSAGE ERROR:", e)

def run():
    print("Starting MQTT worker...")
    print("Connecting to DB...")
    init_db()

    while True:
        try:
            print("Connecting to MQTT:", MQTT_HOST, MQTT_PORT, "Topic:", MQTT_TOPIC)

            client = mqtt.Client(protocol=mqtt.MQTTv311)
            client.on_connect = on_connect
            client.on_disconnect = on_disconnect
            client.on_message = on_message

            client.connect(MQTT_HOST, MQTT_PORT, 60)
            client.loop_forever()

        except Exception as e:
            print("MQTT ERROR:", e)
            print("Reconnecting in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    run()
