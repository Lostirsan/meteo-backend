from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from datetime import datetime

app = FastAPI()

data_store = {}

@app.post("/data")
async def receive_data(request: Request):
    payload = await request.json()
    device_id = payload.get("device_id", "unknown")

    data_store[device_id] = {
        "time": datetime.now().isoformat(),
        "air_temp": payload.get("air_temp"),
        "air_hum": payload.get("air_hum"),
        "water_temp": payload.get("water_temp"),
        "soil": payload.get("soil"),
        "light": payload.get("light")
    }

    return {"status": "ok"}


@app.get("/data")
def get_data():
    return data_store


app.mount("/", StaticFiles(directory="web/frontend/dist", html=True), name="static")
