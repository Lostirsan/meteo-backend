import psycopg2
import json
import os
import time
import paho.mqtt.client as mqtt
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")

MQTT_HOST = os.getenv("MQTT_HOST", "test.mosquitto.org")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "greenhouse/#")

def get_conn():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL is not set")
    return psycopg2.connect(DATABASE_URL)

def init_db():
    try:
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
    except Exception as e:
        print("DB INIT ERROR:", e)
        raise

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

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        save_measurement(payload)
    except Exception as e:
        print("MESSAGE ERROR:", e)

def run():
    print("Starting MQTT worker...")
    print("Connecting to DB...")
    init_db()

    print("Connecting to MQTT:", MQTT_HOST, MQTT_PORT, "Topic:", MQTT_TOPIC)
    client = mqtt.Client(protocol=mqtt.MQTTv311)
    client.on_message = on_message

    try:
        client.connect(MQTT_HOST, MQTT_PORT, 60)
        client.subscribe(MQTT_TOPIC)
        print("Connected to MQTT, waiting for messages...")
        client.loop_forever()
    except Exception as e:
        print("MQTT CONNECTION ERROR:", e)
        time.sleep(5)
        run()

if __name__ == "__main__":
    run()
