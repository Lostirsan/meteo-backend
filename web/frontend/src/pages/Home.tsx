import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
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

type Plant = {
  id: number;
  name: string;
};

export default function Home() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [sensor, setSensor] = useState<Sensor | null>(null);

  // modal
  const [showConnect, setShowConnect] = useState(false);

  // device fields
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");

  // plants
  const [plants, setPlants] = useState<Plant[]>([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [plantsError, setPlantsError] = useState<string | null>(null);

  const [selectedPlantId, setSelectedPlantId] = useState<number | "">("");
  const selectedPlantName = useMemo(() => {
    if (selectedPlantId === "") return "";
    return plants.find(p => p.id === selectedPlantId)?.name ?? "";
  }, [plants, selectedPlantId]);

  // user-based storage key
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const storageKey = user?.username ? `device_${user.username}` : null;

  // restore saved device for user
  useEffect(() => {
    if (!storageKey) return;

    const saved = localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setDeviceId(parsed.deviceId || "");
      setDeviceName(parsed.deviceName || "");
      setSelectedPlantId(parsed.plantId ?? "");
    } catch {
      // ignore
    }
  }, [storageKey]);

  // weather + sensors loop
  useEffect(() => {
    fetch("http://localhost:3001/api/weather")
      .then(r => r.json())
      .then(setWeather)
      .catch(console.error);

    const loadSensors = async () => {
      try {
        const res = await fetch("http://192.168.0.147:8000/data");
        const json = await res.json();
        if (json.greenhouse_1) setSensor(json.greenhouse_1);
      } catch (e) {
        console.error("Sensor fetch error", e);
      }
    };

    loadSensors();
    const i = setInterval(loadSensors, 5000);
    return () => clearInterval(i);
  }, []);

  // load plants when modal opens
  useEffect(() => {
    if (!showConnect) return;

    const loadPlants = async () => {
      setPlantsLoading(true);
      setPlantsError(null);

      try {
        const res = await fetch("http://localhost:3001/api/plants");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Plants response is not an array");
        }

        setPlants(data);

        // если ничего не выбрано — поставим первый вариант
        if (data.length > 0 && selectedPlantId === "") {
          setSelectedPlantId(data[0].id);
        }
      } catch (e: any) {
        setPlants([]);
        setPlantsError(
          "Nepodarilo sa načítať kultúry. Skontroluj backend: /api/plants"
        );
        console.error("Plants fetch error:", e);
      } finally {
        setPlantsLoading(false);
      }
    };

    loadPlants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showConnect]);

  const today = new Date().toLocaleDateString("sk-SK", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const savedDevice = useMemo(() => {
    if (!storageKey) return null;
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }, [storageKey, deviceId, deviceName, selectedPlantId]);

const handleSave = () => {
  if (!storageKey) {
    alert("Najprv sa prihlás");
    return;
  }

  if (!deviceName.trim()) {
    alert("Zadaj názov zariadenia");
    return;
  }

  if (!deviceId.trim()) {
    alert("Zadaj Device ID");
    return;
  }

  if (selectedPlantId === "") {
    alert("Vyber kultúru");
    return;
  }

  const plantName =
    plants.find(p => p.id === selectedPlantId)?.name || "";

  const data = {
    deviceName: deviceName.trim(),
    deviceId: deviceId.trim(),
    plantId: selectedPlantId,
    plantName
  };

  localStorage.setItem(storageKey, JSON.stringify(data));

  setShowConnect(false);
};

const handleResetDevice = () => {
  if (!storageKey) return;

  localStorage.removeItem(storageKey);

  setDeviceName("");
  setDeviceId("");
  setSelectedPlantId("");
};

{savedDevice && (
  <div className="connected-device">
    <p><strong>✅ Устройство подключено</strong></p>
    <p>📟 Название: {savedDevice.deviceName}</p>
    <p>🆔 ID: {savedDevice.deviceId}</p>
    <p>🌱 Культура: {savedDevice.plantName}</p>

    <button
      style={{
        marginTop: 10,
        padding: "6px 12px",
        background: "#c0392b",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer"
      }}
      onClick={handleResetDevice}
    >
      🔄 Reset
    </button>
  </div>
)}

  return (
    <AppLayout>
      <div className="dashboard">
        {/* 🔌 CENTER BUTTON */}
        <div className="connect-device-center">
          <button className="connect-btn" onClick={() => setShowConnect(true)}>
            🔌 Pripojiť zariadenie
          </button>
        </div>

        {/* 🌤 WEATHER */}
        <div className="weather-panel">
          {weather && (
            <>
              <div className="weather-temp">{Math.round(weather.temp)}°</div>
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

        {/* 📊 DASHBOARD */}
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
                  🌱 Soil
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

          {/* ✅ CONNECTED DEVICE INFO */}
     {savedDevice && (
  <div className="connected-device">
    <div><strong>Pripojené zariadenie:</strong> {savedDevice.deviceName} ({savedDevice.deviceId})</div>
    <div><strong>Kultúra:</strong> {savedDevice.plantName}</div>
  </div>
)}

        </div>

        {/* 🧩 CONNECT MODAL */}
        {showConnect && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>🔌 Pripojiť zariadenie</h2>

              <input
                placeholder="Názov zariadenia"
                value={deviceName}
                onChange={e => setDeviceName(e.target.value)}
              />

              <input
                placeholder="Device ID"
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
              />

              {/* 🌿 PLANT SELECT */}
              <div className="plant-row">
                <select
                  className="plant-select"
                  value={selectedPlantId}
                  onChange={e =>
                    setSelectedPlantId(e.target.value ? Number(e.target.value) : "")
                  }
                  disabled={plantsLoading || plants.length === 0}
                >
                  {plantsLoading && <option value="">Načítavam kultúry...</option>}

                  {!plantsLoading && plants.length === 0 && (
                    <option value="">
                      Žiadne kultúry (skontroluj /api/plants)
                    </option>
                  )}

                  {!plantsLoading &&
                    plants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>

              </div>

              {plantsError && (
                <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                  ⚠️ {plantsError}
                </div>
              )}

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowConnect(false)}>
                  Zrušiť
                </button>

                <button className="btn-primary" onClick={handleSave}>
                  Pripojiť
                </button>
              </div>
            </div>
          </div>
        )}
        
      </div>
      {/* ⬇️ ОБЯЗАТЕЛЬНО ВНИЗУ СТРАНИЦЫ */}
{savedDevice && (
  <div
    style={{
      position: "fixed",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      background: "#0f2d2f",
      color: "#fff",
      padding: "14px 20px",
      borderRadius: 12,
      boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
      zIndex: 9999,
      minWidth: 320,
      textAlign: "left",
    }}
  >
    <div><strong>✅ Устройство подключено</strong></div>
    <div>📟 Название: {savedDevice.deviceName}</div>
    <div>🆔 ID: {savedDevice.deviceId}</div>
    <div>🌱 Культура: {savedDevice.plantName}</div>
    {/* ⬇️ КНОПКИ-ЗАГЛУШКИ */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        marginTop: 12,
      }}
    >
      <button className="placeholder-btn">-------</button>
      <button className="placeholder-btn">-------</button>
      <button className="placeholder-btn">-------</button>
      <button className="placeholder-btn">-------</button>
    </div>

    <button
      onClick={handleResetDevice}
      style={{
        marginTop: 10,
        width: "100%",
        padding: "6px 10px",
        background: "#c0392b",
        color: "#fff",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      🔄 Reset
    </button>
  </div>
)}

    </AppLayout>
  );
}
