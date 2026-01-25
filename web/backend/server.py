from fastapi import FastAPI
from datetime import datetime
import time
import json
import threading
import psycopg2
import paho.mqtt.client as mqtt

app = FastAPI()

DB_HOST = "localhost"
DB_PORT = 5432
DB_NAME = "plant_monitoring"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

MQTT_HOST = "192.168.0.147"
MQTT_PORT = 1883
MQTT_TOPIC = "greenhouse/#"

def get_conn():
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )

def save_measurement(payload: dict):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()

        device_id = payload.get("device_id")
        air_temp = payload.get("air_temp")
        air_hum = payload.get("air_hum")
        air_press = payload.get("air_press")
        gas = payload.get("gas")
        water_temp = payload.get("water_temp")
        soil = payload.get("soil")
        light = payload.get("light")

        cur.execute(
            """
            INSERT INTO measurements
            (device_id, time, air_temp, air_hum, air_press, gas, water_temp, soil, light)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                device_id,
                datetime.now(),
                air_temp,
                air_hum,
                air_press,
                gas,
                water_temp,
                soil,
                light
            )
        )
        conn.commit()
        print("Saved data from device:", device_id)

    except Exception as e:
        print("DB ERROR:", e)
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def on_connect(client, userdata, flags, rc):
    print("MQTT connected with code", rc)
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        save_measurement(payload)
    except Exception as e:
        print("MQTT MESSAGE ERROR:", e)

def mqtt_worker():
    while True:
        try:
            print("Connecting to MQTT:", MQTT_HOST, MQTT_PORT)
            client = mqtt.Client()
            client.on_connect = on_connect
            client.on_message = on_message
            client.connect(MQTT_HOST, MQTT_PORT, 60)
            client.loop_forever()
        except Exception as e:
            print("MQTT connection error, retrying in 5s:", e)
            time.sleep(5)

@app.on_event("startup")
def start_mqtt():
    t = threading.Thread(target=mqtt_worker, daemon=True)
    t.start()
    print("MQTT listener started")

@app.get("/api/measurements/{device_id}")
def get_measurements(device_id: str):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT time, air_temp, air_hum, air_press, gas, water_temp, soil, light
            FROM measurements
            WHERE device_id = %s
            ORDER BY time DESC
            LIMIT 1000
            """,
            (device_id,)
        )
        rows = cur.fetchall()
        return rows
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

@app.get("/api/health")
def health():
    return {"status": "ok"}
