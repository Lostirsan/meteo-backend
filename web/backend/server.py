from fastapi import FastAPI, HTTPException
import psycopg2
from psycopg2 import OperationalError
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000"],
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

        return {
            "success": True,
            "user": {
                "id": row[0],
                "username": row[1]
            }
        }

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/devices")
def get_devices():
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("SELECT DISTINCT device_id FROM measurements")
        rows = cur.fetchall()
        return [r[0] for r in rows]
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/measurements/{device_id}")
def get_measurements(device_id: str, limit: int = 100):
    conn = None
    cur = None
    try:
        conn = get_conn()
        cur = conn.cursor()
        cur.execute("""
            SELECT time, air_temp, air_hum, air_press, gas, water_temp, soil, light
            FROM measurements
            WHERE device_id = %s
            ORDER BY time DESC
            LIMIT %s
        """, (device_id, limit))
        rows = cur.fetchall()
        return rows[::-1]
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
