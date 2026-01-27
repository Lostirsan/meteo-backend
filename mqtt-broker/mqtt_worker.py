import psycopg2
import json
import time
import os
import paho.mqtt.client as mqtt
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL")

MQTT_HOST = os.getenv("MQTT_HOST", "test.mosquitto.org")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "greenhouse/#")

def get_conn():
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

def save_measurement(payload):
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

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        save_measurement(payload)
        print("Saved:", payload)
    except Exception as e:
        print("ERROR:", e)

def run():
    init_db()
    client = mqtt.Client()
    client.on_message = on_message
    client.connect(MQTT_HOST, MQTT_PORT)
    client.subscribe(MQTT_TOPIC)
    client.loop_forever()

if __name__ == "__main__":
    run()
