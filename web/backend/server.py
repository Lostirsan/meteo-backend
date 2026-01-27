import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import psycopg2
from psycopg2 import OperationalError

app = FastAPI()

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # для Railway
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== ENV =====
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 5432))
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

def get_conn():
    try:
        return psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    except OperationalError as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== MODELS =====
class AuthData(BaseModel):
    username: str
    password: str


class PicoMeasurementIn(BaseModel):
    device_id: str
    air_temp: float
    air_hum: float
    water_temp: float
    soil: int
    light: float


# ===== AUTH =====
@app.post("/api/register")
def register(data: AuthData):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE username=%s", (data.username,))
    if cur.fetchone():
        raise HTTPException(status_code=409, detail="User already exists")

    cur.execute(
        "INSERT INTO users (username, password) VALUES (%s,%s)",
        (data.username, data.password)
    )
    conn.commit()

    cur.close()
    conn.close()

    return {"success": True}


@app.post("/api/login")
def login(data: AuthData):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        "SELECT id, username FROM users WHERE username=%s AND password=%s",
        (data.username, data.password)
    )
    row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    cur.close()
    conn.close()

    return {
        "success": True,
        "user": {
            "id": row[0],
            "username": row[1]
        }
    }


# ===== DATA FROM PICO =====
@app.post("/data")
def receive_measurement(data: PicoMeasurementIn):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO measurements (time, device_id, air_temp, air_hum, water_temp, soil, light)
        VALUES (NOW(), %s, %s, %s, %s, %s, %s)
        """,
        (
            data.device_id,
            data.air_temp,
            data.air_hum,
            data.water_temp,
            data.soil,
            data.light
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "ok"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
