import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import "./dashboard.css";
import SettingsModal from "../components/SettingsModal";

import DevicesModal from "../components/DevicesModal";

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
const [showAnalytics, setShowAnalytics] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [devicesOpen, setDevicesOpen] = useState(false);

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
const now = new Date();

const rawWeekday = now.toLocaleDateString("sk-SK", {
  weekday: "long",
});

const weekday =
  rawWeekday.charAt(0).toUpperCase() + rawWeekday.slice(1);

const dateNumeric = `${String(now.getDate()).padStart(2, "0")}.${String(
  now.getMonth() + 1
).padStart(2, "0")}.${now.getFullYear()}`;

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
<div>



<div className="weather-panel">
  {weather && (
    <>
      <div className="weather-temp">{Math.round(weather.temp)}°</div>
      <div className="weather-city">Košice</div>
      <div className="weather-desc">{weather.description}</div>
      <div className="weather-date">
  <div>{weekday}</div>
  <div>{dateNumeric}</div>
</div>

      <div className="weather-stats">
        <div>💧 {weather.humidity}%</div>
        <div>💨 {weather.wind} m/s</div>
      </div>

<img
  className="weather-icon"
  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
  alt="weather"
/>

{/* ⬇️ СПЕЙСЕР */}
<div className="weather-spacer" />

<div className="weather-menu">
  <button onClick={() => setDevicesOpen(true)}>
  Устройства
</button>

  <button onClick={() => setShowSettings(true)}>
  Настройки
</button>

</div>

    </>
  )}
</div>



        {/* 📊 DASHBOARD */}
<div className="dashboard">

  {/* KPI CARDS */}
  {/* KPI CARDS */}
<div className="kpi-row">
  {sensor && (
    <>
      <div className="kpi-card">
        <span className="kpi-label">🌡 Air temperature</span>
        <strong>
          {sensor.air_temp}
          <span className="unit">°C</span>
        </strong>
      </div>

      <div className="kpi-card">
        <span className="kpi-label">💧 Air humidity</span>
        <strong>
          {sensor.air_hum}
          <span className="unit">%</span>
        </strong>
      </div>

      <div className="kpi-card">
        <span className="kpi-label">🌱 Soil</span>
        <strong>
          {sensor.soil}
        </strong>
      </div>

      <div className="kpi-card">
        <span className="kpi-label">💡 Light</span>
        <strong>
          {sensor.light.toFixed(1)}
          <span className="unit">lx</span>
        </strong>
      </div>

      <div className="kpi-card">
        <span className="kpi-label">🚰 Water temperature</span>
        <strong>
          {sensor.water_temp.toFixed(1)}
          <span className="unit">°C</span>
        </strong>
      </div>

      <div className="kpi-card">
        <span className="kpi-label">🕒 Last update</span>
        <strong className="kpi-time">
          {new Date(sensor.time).toLocaleTimeString()}
        </strong>
      </div>
    </>
  )}
</div>
 {/* 🔥 БЛОК ПОД KPI */}
  <div className="device-actions">

    {/* ➕ КНОПКА СНАЧАЛА */}

    {/* 🟢 ПОТОМ ПАНЕЛЬ ПОДКЛЮЧЕННОГО УСТРОЙСТВА */}


  </div>




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
      {/* 🔌 CONNECTED DEVICE CARD */}
{savedDevice && (
  <div className="device-card">
    <div className="device-card-header">
     <span
  className="device-title plant-click"
  onClick={() => setShowAnalytics(true)}
>
  🌱 {savedDevice.deviceName}
</span>

    </div>

    <div className="device-grid">
      <div className="device-metric">
        <span>🌡 Temp</span>
        <strong>{sensor?.air_temp ?? "--"} °C</strong>
      </div>

      <div className="device-metric">
        <span>💧 Humidity</span>
        <strong>{sensor?.air_hum ?? "--"} %</strong>
      </div>

      <div className="device-metric">
        <span>🌱 Soil</span>
        <strong>{sensor?.soil ?? "--"}</strong>
      </div>

      <div className="device-metric">
        <span>💡 Light</span>
        <strong>{sensor?.light?.toFixed(1) ?? "--"} lx</strong>
      </div>
    </div>

<div className="device-footer">
  <span>
    Культура: <strong>{savedDevice?.plantName ?? "—"}</strong>
  </span>



  <button className="device-reset" onClick={handleResetDevice}>
    🔄 Reset
  </button>
</div>
<div style={{ color: "red", fontSize: 12 }}>
  DEBUG savedDevice: {JSON.stringify(savedDevice)}
</div>


  </div>
)}
{showAnalytics && (
  <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
    <div
      className="modal analytics-modal"
      onClick={e => e.stopPropagation()}
    >
      <h2>🌱 Аналитика культуры</h2>

      {/* ПОКА ПУСТАЯ / ЗАГЛУШКА */}
      <div className="analytics-placeholder">
        <p>📊 Аналитика будет добавлена позже</p>
        <p>Здесь появятся:</p>
        <ul>
          <li>Температурные графики</li>
          <li>Влажность почвы</li>
          <li>Освещённость</li>
          <li>Рекомендации по уходу</li>
        </ul>
      </div>

      <button
        className="btn-secondary"
        onClick={() => setShowAnalytics(false)}
      >
        Закрыть
      </button>
    </div>
  </div>
)}
<SettingsModal
  open={showSettings}
  onClose={() => setShowSettings(false)}
/>
<DevicesModal
  open={devicesOpen}
  onClose={() => setDevicesOpen(false)}
  device={savedDevice}   // 👈 то же устройство, что в device-card
/>
  <div
    className="add-device-card"
    onClick={() => setShowConnect(true)}
  >
    <div className="add-device-plus">+</div>
    <div className="add-device-text">Pripojiť zariadenie</div>
  </div>

    </AppLayout>
  );
}
