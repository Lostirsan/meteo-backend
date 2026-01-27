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

conn = None
cur = None
last_saved = 0

def get_conn():
    if not DATABASE_URL:
        raise Exception("DATABASE_URL is not set")
    return psycopg2.connect(DATABASE_URL, sslmode="require")

def init_db():
    global conn, cur
    conn = get_conn()
    cur = conn.cursor()

def save_measurement(payload):
    global last_saved
    now = time.time()
    if now - last_saved < 60:
        return
    try:
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
        last_saved = now
        print("Saved:", payload)
    except Exception as e:
        print("SAVE ERROR:", e)
        conn.rollback()

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("MQTT connected")
        client.subscribe(MQTT_TOPIC)
    else:
        print("MQTT connection failed:", rc)

def on_message(client, userdata, msg):
    try:
        raw = msg.payload.decode().strip()
        if not raw:
            return
        payload = json.loads(raw)
        if not isinstance(payload, dict):
            return
        if "device_id" not in payload:
            return
        save_measurement(payload)
    except Exception as e:
        print("MESSAGE ERROR:", e)

def run():
    print("Starting MQTT worker...")
    init_db()
    while True:
        try:
            client = mqtt.Client(protocol=mqtt.MQTTv311)
            client.on_connect = on_connect
            client.on_message = on_message
            client.connect(MQTT_HOST, MQTT_PORT, 60)
            client.loop_forever()
        except Exception as e:
            print("MQTT ERROR:", e)
            time.sleep(5)

if __name__ == "__main__":
    run()
