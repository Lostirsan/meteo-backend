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
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS plants (
            id SERIAL PRIMARY KEY,
            name TEXT UNIQUE NOT NULL,
            air_temp_min REAL,
            air_temp_max REAL,
            air_hum_min REAL,
            air_hum_max REAL,
            air_press_min REAL,
            air_press_max REAL,
            gas_min REAL,
            gas_max REAL,
            water_temp_min REAL,
            water_temp_max REAL,
            soil_min INTEGER,
            soil_max INTEGER,
            light_min REAL,
            light_max REAL
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS user_devices (
            user_id INT UNIQUE,
            device_name TEXT,
            device_uid TEXT,
            plant_id INT REFERENCES plants(id)
        );
        """)

        cur.execute("""
        CREATE TABLE IF NOT EXISTS measurements (
            id SERIAL PRIMARY KEY,
            device_id TEXT,
            time TIMESTAMP,
            air_temp FLOAT,
            air_hum FLOAT,
            air_press FLOAT,
            gas FLOAT,
            water_temp FLOAT,
            soil FLOAT,
            light FLOAT
        );
        """)

        cur.execute("""
        INSERT INTO plants (
            name,
            air_temp_min, air_temp_max,
            air_hum_min, air_hum_max,
            air_press_min, air_press_max,
            gas_min, gas_max,
            water_temp_min, water_temp_max,
            soil_min, soil_max,
            light_min, light_max
        ) VALUES
        ('Wheat', 0,40,30,70,980,1030,0,10000,5,25,20000,50000,10,50),
        ('Corn', 10,35,40,80,980,1030,0,12000,10,28,25000,55000,15,60),
        ('Tomato', 12,30,50,85,980,1030,0,15000,10,26,20000,45000,20,70),
        ('Cucumber', 14,28,60,90,980,1030,0,14000,12,25,25000,50000,25,75),
        ('Potato', 8,25,40,75,980,1030,0,13000,6,22,22000,48000,15,55),
        ('Carrot', 5,25,35,70,980,1030,0,12000,5,20,18000,42000,10,50),
        ('Lettuce', 5,20,50,80,980,1030,0,10000,4,18,15000,35000,8,40),
        ('Strawberry', 10,28,60,85,980,1030,0,13000,8,22,22000,48000,15,60),
        ('Barley', 0,35,30,65,980,1030,0,10000,5,24,20000,45000,10,50),
        ('Sunflower', 12,38,30,70,980,1030,0,15000,10,26,30000,60000,20,80)
        ON CONFLICT (name) DO NOTHING;
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
