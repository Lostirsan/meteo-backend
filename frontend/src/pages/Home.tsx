import AppLayout from "../layouts/AppLayout";
import "./home.css";

export default function Home() {
  return (
    <AppLayout title="Home">
      <main className="home-content">
        <div className="empty-state">
          <h2>Home</h2>
          <p>
            Здесь позже будут данные теплицы: температура, влажность, почва, насос,
            графики и управление поливом.
          </p>

          <div className="empty-box">
            <span>🪴 Пока пусто</span>
            <small>Подключим данные, когда будет устройство.</small>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
