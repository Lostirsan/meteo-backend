import os
import psycopg2
from psycopg2 import OperationalError

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# ===== CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mindful-reverence-production-2a76.up.railway.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== DATABASE =====
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

def get_conn():
    try:
        return psycopg2.connect(DATABASE_URL)
    except OperationalError:
        raise HTTPException(status_code=500, detail="Database connection failed")

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

# ===== WEATHER =====
@app.get("/api/weather")
def get_weather():
    api_key = os.getenv("OPENWEATHER_API_KEY")
    city = os.getenv("OPENWEATHER_CITY", "Kosice")
    units = os.getenv("OPENWEATHER_UNITS", "metric")
    lang = os.getenv("OPENWEATHER_LANG", "en")

    if not api_key:
        raise HTTPException(status_code=500, detail="Weather API key missing")

    url = "https://api.openweathermap.org/data/2.5/weather"
    params = {
        "q": city,
        "appid": api_key,
        "units": units,
        "lang": lang,
    }

    try:
        r = requests.get(url, params=params, timeout=5)
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        raise HTTPException(status_code=502, detail="Weather service error")

    return {
        "temp": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "wind": data["wind"]["speed"],
        "description": data["weather"][0]["description"],
        "icon": data["weather"][0]["icon"],
    }

# ===== AUTH =====
@app.post("/api/register")
def register(data: AuthData):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE username=%s", (data.username,))
    if cur.fetchone():
        cur.close()
        conn.close()
        raise HTTPException(status_code=409, detail="User already exists")

    cur.execute(
        "INSERT INTO users (username, password) VALUES (%s, %s)",
        (data.username, data.password),
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
        (data.username, data.password),
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    cur.close()
    conn.close()

    return {
        "success": True,
        "user": {
            "id": row[0],
            "username": row[1],
        },
    }

# ===== DATA FROM PICO =====
@app.post("/data")
def receive_measurement(data: PicoMeasurementIn):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO measurements
        (time, device_id, air_temp, air_hum, water_temp, soil, light)
        VALUES (NOW(), %s, %s, %s, %s, %s, %s)
        """,
        (
            data.device_id,
            data.air_temp,
            data.air_hum,
            data.water_temp,
            data.soil,
            data.light,
        ),
    )

    conn.commit()
    cur.close()
    conn.close()

    return {"status": "ok"}

# ===== PLANTS =====
@app.get("/api/plants")
def get_plants():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT id, name
        FROM plants
        ORDER BY name ASC
        """
    )

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {
            "id": row[0],
            "name": row[1],
        }
        for row in rows
    ]

# ===== LATEST DATA FOR FRONTEND =====
@app.get("/api/latest-data")
def latest_data():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT air_temp, air_hum, water_temp, soil, light, time
        FROM measurements
        ORDER BY time DESC
        LIMIT 1
        """
    )

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {}

    return {
        "air_temp": row[0],
        "air_hum": row[1],
        "water_temp": row[2],
        "soil": row[3],
        "light": row[4],
        "time": row[5].isoformat(),
    }

@app.get("/api/measurements/latest")
def get_latest_measurement(device_id: str):
    conn = get_conn()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT time, air_temp, air_hum, water_temp, soil, light
        FROM measurements
        WHERE device_id = %s
        ORDER BY time DESC
        LIMIT 1
        """,
        (device_id,)
    )

    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return None

    return {
        "time": row[0],
        "air_temp": row[1],
        "air_hum": row[2],
        "water_temp": row[3],
        "soil": row[4],
        "light": row[5],
    }

# ===== HEALTH =====
@app.get("/api/health")
def health():
    return {"status": "ok"}
