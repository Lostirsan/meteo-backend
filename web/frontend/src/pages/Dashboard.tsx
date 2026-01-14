import AppLayout from "../layouts/AppLayout.tsx";
import "./home.css";

export default function Dashboard() {
  return (
    <AppLayout title="Home">
      <div className="home-content">
        <h3 className="section-title">Your Greenhouses</h3>

        <div className="grid">
          <div className="card">
            <img src="https://via.placeholder.com/300x200" alt="Front Garden" />
            <span>Front Garden</span>
          </div>

          <div className="card">
            <img src="https://via.placeholder.com/300x200" alt="Back Yard" />
            <span>Back Yard</span>
          </div>

          <div className="card add">
            <span>＋ Add greenhouse</span>
          </div>
        </div>

        <h3 className="section-title">Forecast & Observations</h3>

        <div className="forecast">
          <div className="forecast-card">
            <strong>Today</strong>
            <span>🌡 12°C</span>
            <span>💧 65%</span>
          </div>

          <div className="forecast-card">
            <strong>Tomorrow</strong>
            <span>🌡 15°C</span>
            <span>💧 60%</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
