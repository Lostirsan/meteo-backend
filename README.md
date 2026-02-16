# IoT Meteorological Station for Smart Agriculture

A distributed IoT system for monitoring environmental conditions in greenhouses and agricultural environments.  
The system collects sensor data from a Raspberry Pi Pico W device and sends it to a backend server for storage, analysis, and visualization.

---

## Overview

The project consists of several services.

Device layer:
- Raspberry Pi Pico W
- Sensors:
  - BME680 (temperature, humidity, pressure, air quality)
  - BH1750 (light)
  - DS18B20 (soil or external temperature)
  - Soil moisture sensor

Server layer:
- MQTT broker
- FastAPI backend
- PostgreSQL database
- Redis (optional for caching)
- React frontend dashboard

---

## Architecture

Device → MQTT → Backend API → Database → Frontend

The microcontroller collects sensor readings and publishes them to MQTT topics.  
The backend subscribes to topics, processes data, and stores it in PostgreSQL.  
The frontend visualizes the data in real time.

---

## Tech Stack

Backend:
- Python
- FastAPI
- PostgreSQL
- MQTT
- Docker

Frontend:
- React
- Vite
- Chart.js

Device:
- MicroPython
- Raspberry Pi Pico W

Infrastructure:
- Docker Compose
- Cloud deployment (Railway / VPS / AWS compatible)

---

## Features

- Real-time sensor data collection
- Remote monitoring dashboard
- Historical data storage
- Modular microservice architecture
- Cloud-ready deployment
- MQTT communication

---

## Project Structure

project-root/

backend/  
&nbsp;&nbsp;&nbsp;&nbsp;app/  
&nbsp;&nbsp;&nbsp;&nbsp;Dockerfile  

frontend/  
&nbsp;&nbsp;&nbsp;&nbsp;src/  
&nbsp;&nbsp;&nbsp;&nbsp;Dockerfile  

device/  
&nbsp;&nbsp;&nbsp;&nbsp;pico_code.py  

docker-compose.yml  
README.md  

---

## Requirements

To run the full system you will need:

- Docker and Docker Compose
- MQTT broker (included in docker-compose if configured)
- Raspberry Pi Pico W with MicroPython firmware
- Sensor hardware (optional for simulation)

Important:  
The system also requires firmware code running on the Raspberry Pi Pico W device.  
The device is responsible for collecting sensor data and publishing it to MQTT topics.  
Without the device code, the backend and frontend can run, but no real sensor data will be received.

---

## How to Run

### 1. Clone repository
git clone https://github.com/USERNAME/REPO_NAME.git  
cd REPO_NAME  

### 2. Start services
docker-compose up --build  

Backend will start on:  
http://localhost:8000  

Frontend:  
http://localhost:5173  

### 3. Upload firmware to Raspberry Pi Pico W

- Flash MicroPython firmware
- Copy the device code to the Pico W
- Configure WiFi and MQTT broker address
- Restart the device

After startup, the device will begin sending data automatically.

---

## MQTT Topics

Example topics:

greenhouse/greenhouse_1  
greenhouse/greenhouse_1/cmd  

Payload example:

{
  "temperature": 23.4,
  "humidity": 45,
  "soil": 512,
  "light": 300
}

---

## Screenshots

(Add screenshots here)

Dashboard example:
- charts
- sensor values
- device status

---

## Future Improvements

- OTA firmware updates
- Alerts and notifications
- Mobile version
- Multiple device support
- AI-based predictions

