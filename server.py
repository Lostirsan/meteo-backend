from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from datetime import datetime, timedelta

app = FastAPI()

history = {}

@app.post("/data")
async def receive_data(request: Request):
    payload = await request.json()
    device_id = payload.get("device_id", "unknown")

    entry = {
        "time": datetime.now().isoformat(),
        "air_temp": payload.get("air_temp"),
        "air_hum": payload.get("air_hum"),
        "air_press": payload.get("air_press"),
        "gas": payload.get("gas"),
        "water_temp": payload.get("water_temp"),
        "soil": payload.get("soil"),
        "light": payload.get("light")
    }

    if device_id not in history:
        history[device_id] = []

    history[device_id].append(entry)

    cutoff = datetime.now() - timedelta(hours=24)
    history[device_id] = [
        e for e in history[device_id]
        if datetime.fromisoformat(e["time"]) > cutoff
    ]

    return {"status": "ok"}

@app.get("/data/{device_id}")
def get_device_data(device_id: str):
    return history.get(device_id, [])

app.mount("/", StaticFiles(directory="web/frontend/dist", html=True), name="static")
