  import AppLayout from "../layouts/AppLayout.tsx";
  import "./home.css";

  export default function Dashboard() {
    return (
      <AppLayout>
        <div className="dashboard">

          <div className="weather-panel">
            <div className="weather-temp">5°</div>
            <div className="weather-city">Košice</div>

            <div className="weather-spacer" />

            <div className="weather-menu">
              <button>Устройства</button>
              <button>Аналитика</button>
              <button>Настройки</button>
            </div>
          </div>

          <div className="dashboard-main">
            ЦЕНТР
          </div>

        </div>
      </AppLayout>
    );
  }
