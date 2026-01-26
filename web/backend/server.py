from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import psycopg2
from psycopg2 import OperationalError
from typing import Optional, List, Dict, Any


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_HOST = "postgres"
DB_PORT = 5432
DB_NAME = "plant_monitoring"
DB_USER = "postgres"
DB_PASSWORD = "postgres"


def get_conn():
    try:
        return psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    except OperationalError:
        raise HTTPException(status_code=500, detail="Database connection failed")


class AuthData(BaseModel):
    username: str
    password: str


class PlantOut(BaseModel):
    id: int
    name: str


class DeviceCreate(BaseModel):
    user_id: int
    device_uid: str = Field(min_length=1)
    device_name: str = Field(min_length=1)
    plant_id: int


class UserDeviceOut(BaseModel):
    id: int
    device_uid: str
    device_name: str
    plant: str


class PicoMeasurementIn(BaseModel):
    device_id: str = Field(min_length=1)
    air_temp: float
    air_hum: float
    water_temp: float
    soil: int
    light: float


class MeasurementOut(BaseModel):
    time: str
    air_temp: float
    air_hum: float
    water_temp: float
    soil: int
    light: float


@app.post("/api/register")
def register(data: AuthData):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE username = %s", (data.username,))
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="User already exists")

        cur.execute(
            "INSERT INTO users (username, password) VALUES (%s, %s)",
            (data.username, data.password)
        )
        conn.commit()
        return {"success": True}
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.post("/api/login")
def login(data: AuthData):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            "SELECT id, username FROM users WHERE username = %s AND password = %s",
            (data.username, data.password)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {"success": True, "user": {"id": row[0], "username": row[1]}}
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/plants")
def get_plants():
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM plants ORDER BY name")
        rows = cur.fetchall()
        return [{"id": r[0], "name": r[1]} for r in rows]
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.post("/api/user-devices")
def create_user_device(data: DeviceCreate):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT id FROM users WHERE id = %s", (data.user_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        cur.execute("SELECT id FROM plants WHERE id = %s", (data.plant_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Plant not found")

        cur.execute(
            "SELECT id FROM user_devices WHERE user_id = %s AND device_uid = %s",
            (data.user_id, data.device_uid)
        )
        if cur.fetchone():
            raise HTTPException(status_code=409, detail="Device already linked to this user")

        cur.execute(
            """
            INSERT INTO user_devices (user_id, device_uid, device_name, plant_id)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (data.user_id, data.device_uid, data.device_name, data.plant_id)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"id": new_id}
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/user-devices/{user_id}")
def get_user_devices(user_id: int):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT ud.id, ud.device_uid, ud.device_name, p.name
            FROM user_devices ud
            JOIN plants p ON ud.plant_id = p.id
            WHERE ud.user_id = %s
            ORDER BY ud.id DESC
            """,
            (user_id,)
        )
        rows = cur.fetchall()
        return [{"id": r[0], "device_uid": r[1], "device_name": r[2], "plant": r[3]} for r in rows]
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/devices")
def get_devices_from_measurements():
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT device_id FROM measurements ORDER BY device_id")
        rows = cur.fetchall()
        return [r[0] for r in rows]
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.post("/data")
def receive_measurement_from_pico(data: PicoMeasurementIn):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute(
            """
            INSERT INTO measurements (time, device_id, air_temp, air_hum, water_temp, soil, light)
            VALUES (NOW(), %s, %s, %s, %s, %s, %s)
            RETURNING time
            """,
            (data.device_id, data.air_temp, data.air_hum, data.water_temp, data.soil, data.light)
        )
        t = cur.fetchone()[0]
        conn.commit()
        return {"status": "ok", "time": t.isoformat(), "device_id": data.device_id}
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/measurements/{device_uid}")
def get_measurements(device_uid: str, limit: int = 100):
    if limit < 1 or limit > 5000:
        raise HTTPException(status_code=400, detail="limit must be between 1 and 5000")

    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            """
            SELECT time, air_temp, air_hum, water_temp, soil, light
            FROM measurements
            WHERE device_id = %s
            ORDER BY time DESC
            LIMIT %s
            """,
            (device_uid, limit)
        )
        rows = cur.fetchall()
        out = []
        for r in rows[::-1]:
            out.append({
                "time": r[0].isoformat() if hasattr(r[0], "isoformat") else str(r[0]),
                "air_temp": float(r[1]),
                "air_hum": float(r[2]),
                "water_temp": float(r[3]),
                "soil": int(r[4]),
                "light": float(r[5])
            })
        return out
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
