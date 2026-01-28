import { useEffect, useMemo, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import "./dashboard.css";
import SettingsModal from "../components/SettingsModal";
import WeeklyChart from "../components/WeeklyChart";
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

  air_press?: number; // 🌬 давление
  gas?: number;       // 🧪 качество воздуха
};


type Plant = {
  id: number;
  name: string;

  air_temp_min: number;
  air_temp_max: number;

  air_hum_min: number;
  air_hum_max: number;

  water_temp_min: number;
  water_temp_max: number;

  soil_min: number;
  soil_max: number;

  light_min: number;
  light_max: number;

  air_press_min: number;
  air_press_max: number;

  gas_min: number;
  gas_max: number;
};



export default function Home() {


  const [weather, setWeather] = useState<Weather | null>(null);
  const [sensor, setSensor] = useState<Sensor | null>(null);
const [showAnalytics, setShowAnalytics] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [devicesOpen, setDevicesOpen] = useState(false);
const [activeKpi, setActiveKpi] = useState<
  | "air_temp"
  | "air_hum"
  | "soil"
  | "light"
  | "water_temp"
  | "air_press"
  | "gas"
  | null
>(null);

  // modal
  const [showConnect, setShowConnect] = useState(false);


  // device fields
  const [deviceName, setDeviceName] = useState("");
  const [deviceId, setDeviceId] = useState("");

  // plants
// plants
const [plants, setPlants] = useState<Plant[]>([]);
const [plantsLoading, setPlantsLoading] = useState(false);
const [plantsError, setPlantsError] = useState<string | null>(null);
const [selectedPlantId, setSelectedPlantId] = useState<number | "">("");

// ✅ ПОСЛЕ этого
const selectedPlant = useMemo(() => {
  return plants.find(p => p.id === selectedPlantId) || null;
}, [plants, selectedPlantId]);


const user = useMemo(() => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}, []);

const storageKey = user?.username ? `device_${user.username}` : null;

// ================= SAVED DEVICE (REACTIVE) =================
const [savedDevice, setSavedDevice] = useState<any>(null);

// ================= RESTORE SAVED DEVICE =================
useEffect(() => {
  if (!storageKey) {
    setSavedDevice(null);
    return;
  }

  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    setSavedDevice(null);
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    setSavedDevice(parsed);
    setDeviceId(parsed.deviceId || "");
    setDeviceName(parsed.deviceName || "");
    setSelectedPlantId(parsed.plantId ?? "");
  } catch {
    setSavedDevice(null);
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
        const res = await fetch('https://meteo-backend-production-3f91.up.railway.app/api/measurements/latest?device_id=${savedDevice.deviceId}');
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
        const res = await fetch(`https://meteo-backend-production-3f91.up.railway.app/api/plants`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);

const data = await res.json();

if (!Array.isArray(data)) {
  console.error("Plants API returned:", data);
  throw new Error("Plants response is not array");
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
  setSavedDevice(data);   // 🔥 ВОТ ЭТО ГЛАВНОЕ
  setShowConnect(false);


};

const handleResetDevice = () => {
  if (!storageKey) return;

  localStorage.removeItem(storageKey);
  setSavedDevice(null);
  setDeviceName("");
  setDeviceId("");
  setSelectedPlantId("");
};



  return (
   <AppLayout>
  <div className="dashboard-layout">

    {/* LEFT SIDEBAR */}
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

          <div className="weather-spacer" />

          <div className="weather-menu">
            <button onClick={() => setDevicesOpen(true)}>Zariadenia</button>
            <button onClick={() => setShowSettings(true)}>Nastavenia</button>
          </div>
        </>
      )}
    </div>


        {/* 📊 DASHBOARD */}
<div className="dashboard">


<div className="kpi-row">
  {sensor && (
    <>
      {/* CURRENT */}
      <div className="kpi-card" onClick={() => setActiveKpi("air_temp")}>
        <span>🌡 Air temperature</span>
        <strong>{sensor.air_temp} °C</strong>
      </div>
{/* 🚰 Water temperature */}
<div className="kpi-card" onClick={() => setActiveKpi("water_temp")}>
  <span>🚰 Water temperature</span>
  <strong>{sensor.water_temp ?? "--"} °C</strong>
</div>

{/* 🌬 Air pressure */}
<div className="kpi-card" onClick={() => setActiveKpi("air_press")}>
  <span>🌬 Air pressure</span>
  <strong>{sensor.air_press ?? "--"} hPa</strong>
</div>

{/* 🧪 Gas / Air quality */}
<div className="kpi-card" onClick={() => setActiveKpi("gas")}>
  <span>🧪 Gas</span>
  <strong>{sensor.gas ?? "--"}</strong>
</div>

      <div className="kpi-card" onClick={() => setActiveKpi("air_hum")}>
        <span>💧 Air humidity</span>
        <strong>{sensor.air_hum} %</strong>
      </div>

      <div className="kpi-card" onClick={() => setActiveKpi("soil")}>
        <span>🌱 Soil</span>
        <strong>{sensor.soil}</strong>
      </div>

      <div className="kpi-card" onClick={() => setActiveKpi("light")}>
        <span>💡 Light</span>
        <strong>{sensor.light} lx</strong>
      </div>

      {/* NORMS */}
      {selectedPlant && (
        <>
          <div className="kpi-card">
            <span>🌡 Temp norm</span>
            <strong>
              {selectedPlant.air_temp_min}–{selectedPlant.air_temp_max} °C
            </strong>
          </div>
    {/* 🚰 Water temp norm */}
    <div className="kpi-card" onClick={() => setActiveKpi("water_temp")}>
      <span>🚰 Water temp norm</span>
      <strong>
        {selectedPlant.water_temp_min}–{selectedPlant.water_temp_max} °C
      </strong>
    </div>

    {/* 🌬 Air pressure norm */}
    <div className="kpi-card" onClick={() => setActiveKpi("air_press")}>
      <span>🌬 Air pressure norm</span>
      <strong>
        {selectedPlant.air_press_min}–{selectedPlant.air_press_max} hPa
      </strong>
    </div>

    {/* 🧪 Gas norm */}
    <div className="kpi-card" onClick={() => setActiveKpi("gas")}>
      <span>🧪 Gas norm</span>
      <strong>
        {selectedPlant.gas_min}–{selectedPlant.gas_max}
      </strong>
    </div>
          <div className="kpi-card">
            <span>💧 Humidity norm</span>
            <strong>
              {selectedPlant.air_hum_min}–{selectedPlant.air_hum_max} %
            </strong>
          </div>

          <div className="kpi-card">
            <span>🌱 Soil norm</span>
            <strong>
              {selectedPlant.soil_min}–{selectedPlant.soil_max}
            </strong>
          </div>

          <div className="kpi-card">
            <span>💡 Light norm</span>
            <strong>
              {selectedPlant.light_min}–{selectedPlant.light_max} lx
            </strong>
          </div>
        </>
      )}
    </>
  )}
</div>


{activeKpi && (
  <div className="modal-overlay" onClick={() => setActiveKpi(null)}>
    <div
      className="modal analytics-modal"
      onClick={e => e.stopPropagation()}
    >
      <h2>📊 Detaily ukazovateľa</h2>


<WeeklyChart
  title={`Týždenný prehľad ${activeKpi} — ${savedDevice?.plantName}`}
  unit={
    activeKpi === "air_temp" || activeKpi === "water_temp"
      ? "°C"
      : activeKpi === "air_press"
      ? "hPa"
      : activeKpi === "light"
      ? "lx"
      : "%"
  }
/>
      <button
        className="btn-secondary"
        onClick={() => setActiveKpi(null)}
      >
        Zavrieť
      </button>
    </div>
  </div>
)}

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
    setSelectedPlantId(
      e.target.value ? Number(e.target.value) : ""
    )
  }
  disabled={plantsLoading}
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

    {/* HEADER */}
    <div className="device-card-header">
      <span
        className="device-title plant-click"
        onClick={() => setShowAnalytics(true)}
      >
        🌱 {savedDevice.deviceName}
      </span>
    </div>

    <div className="device-grid">
  {/* 🌡 Air temperature */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("air_temp")}
  >
    <span>🌡 Temp</span>
    <strong>{sensor?.air_temp ?? "--"} °C</strong>
  </div>

  {/* 💧 Air humidity */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("air_hum")}
  >
    <span>💧 Humidity</span>
    <strong>{sensor?.air_hum ?? "--"} %</strong>
  </div>

  {/* 🌱 Soil */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("soil")}
  >
    <span>🌱 Soil</span>
    <strong>{sensor?.soil ?? "--"}</strong>
  </div>

  {/* 💡 Light */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("light")}
  >
    <span>💡 Light</span>
    <strong>{sensor?.light?.toFixed(1) ?? "--"} lx</strong>
  </div>

  {/* 🚰 Water temperature */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("water_temp")}
  >
    <span>🚰 Water</span>
    <strong>{sensor?.water_temp ?? "--"} °C</strong>
  </div>

  {/* 🌬 Air pressure */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("air_press")}
  >
    <span>🌬 Pressure</span>
    <strong>{sensor?.air_press ?? "--"} hPa</strong>
  </div>

  {/* 🧪 Gas */}
  <div
    className="device-metric"
    onClick={() => setActiveKpi("gas")}
  >
    <span>🧪 Gas</span>
    <strong>{sensor?.gas ?? "--"}</strong>
  </div>
</div>

     <div className="device-footer">
    <span>
      Plodina: <strong>{savedDevice?.plantName ?? "—"}</strong>
    </span>

    <button className="device-reset" onClick={handleResetDevice}>
      🔄 Reset
    </button>
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
