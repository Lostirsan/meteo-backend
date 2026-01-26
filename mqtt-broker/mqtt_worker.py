import psycopg2
import json
import time
import paho.mqtt.client as mqtt
from datetime import datetime

DB_HOST = "postgres"
DB_PORT = 5432
DB_NAME = "plant_monitoring"
DB_USER = "postgres"
DB_PASSWORD = "postgres"

MQTT_HOST = "mqtt"
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
    except Exception as e:
        print("ERROR:", e)

def run():
    client = mqtt.Client()
    client.on_message = on_message
    client.connect(MQTT_HOST, MQTT_PORT)
    client.subscribe(MQTT_TOPIC)
    client.loop_forever()

if __name__ == "__main__":
    run()
