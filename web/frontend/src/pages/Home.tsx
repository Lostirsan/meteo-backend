import { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout.tsx";
import "./dashboard.css";

type Weather = {
  temp: number;
  humidity: number;
  wind: number;
  description: string;
  icon: string;
};

type Sensor = {
  time: string;
  air_temp: number;
  air_hum: number;
  water_temp: number;
  soil: number;
  light: number;
};

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [sensor, setSensor] = useState<Sensor | null>(null);

  useEffect(() => {
    /* WEATHER */
    fetch("http://localhost:3001/api/weather")
      .then(r => r.json())
      .then(setWeather)
      .catch(console.error);

    /* SENSORS */
    const loadSensors = async () => {
      try {
        const res = await fetch("http://192.168.0.147:8000/data");
        const json = await res.json();

        console.log("SENSOR JSON:", json);

        if (json.greenhouse_1) {
          setSensor(json.greenhouse_1);
        }
      } catch (e) {
        console.error("Sensor fetch error", e);
      }
    };

    loadSensors();
    const i = setInterval(loadSensors, 5000);
    return () => clearInterval(i);
  }, []);

  const today = new Date().toLocaleDateString("sk-SK", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });

  return (
    <AppLayout>
      <div className="dashboard">

        {/* LEFT WEATHER */}
        <div className="weather-panel">
          {weather && (
            <>
              <div className="weather-temp">
                {Math.round(weather.temp)}°
              </div>
              <div className="weather-city">Košice</div>
              <div className="weather-desc">{weather.description}</div>
              <div className="weather-date">{today}</div>

              <div className="weather-stats">
                <div>💧 {weather.humidity}%</div>
                <div>💨 {weather.wind} m/s</div>
              </div>

              <img
                className="weather-icon"
                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                alt="weather"
              />
            </>
          )}
        </div>

        {/* RIGHT DASHBOARD */}
        <div className="dashboard-main">

          <div className="kpi-row">
            {sensor && (
              <>
                <div className="kpi-card">
                  🌡 Air temperature
                  <strong>{sensor.air_temp} °C</strong>
                </div>

                <div className="kpi-card">
                  💧 Air humidity
                  <strong>{sensor.air_hum} %</strong>
                </div>

                <div className="kpi-card">
                  🌱 Soil (raw)
                  <strong>{sensor.soil}</strong>
                </div>

                <div className="kpi-card">
                  💡 Light
                  <strong>{sensor.light.toFixed(1)} lx</strong>
                </div>

                <div className="kpi-card">
                  🚰 Water temp
                  <strong>{sensor.water_temp.toFixed(1)} °C</strong>
                </div>

                <div className="kpi-card">
                  🕒 Last update
                  <strong>{new Date(sensor.time).toLocaleTimeString()}</strong>
                </div>
              </>
            )}
          </div>

          <div className="charts">
            <div className="chart">📈 Temperature trend</div>
            <div className="chart">📊 Humidity trend</div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
