import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import "./header.css";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    navigate("/register");
  };

  const getTitle = () => {
  switch (location.pathname) {
    case "/dashboard":
      return "🏠 Home";
    case "/programs":
      return "Application settings";
    case "/actions":
      return "🚿 Actions";
    case "/reports":
      return "📊 Reports";
    case "/help":
      return "❓ Help & Support";
    default:
      return "";
  }
};


  return (
    <header className="header">
      {/* LEFT */}
      <button className="icon-btn" onClick={onMenuClick}>
        ☰
      </button>

      {/* CENTER */}
      <span className="header-title">{getTitle()}</span>

      {/* RIGHT */}
      {user && (
        <div className="user-box">
          <span className="user-name">👤 {user.username}</span>
          <button className="logout-glass" onClick={handleLogout}>
            Odhlásiť sa
          </button>
        </div>
      )}
    </header>
  );
}
