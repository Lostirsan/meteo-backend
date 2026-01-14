import { useNavigate, useLocation } from "react-router-dom";
import "./sidebar.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path: string) => {
    navigate(path);
    onClose(); // закрываем sidebar после клика
  };

  return (
    <>
      {open && <div className="overlay" onClick={onClose} />}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* HEADER */}
        <div className="sidebar-header">
          <button className="sidebar-close" onClick={onClose}>
            ☰
          </button>
          <strong>Smart Irrigation</strong>
        </div>

        {/* MENU */}
        <nav className="sidebar-menu">
          <button
            className={`menu-item ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={() => goTo("/dashboard")}
          >
            🏠 Home
          </button>

          <button
            className={`menu-item ${
              location.pathname === "/programs" ? "active" : ""
            }`}
            onClick={() => goTo("/programs")}
          >
            ⚙️ Programs
          </button>

          <button
            className={`menu-item ${
              location.pathname === "/actions" ? "active" : ""
            }`}
            onClick={() => goTo("/actions")}
          >
            🚿 Actions
          </button>

          <button
            className={`menu-item ${
              location.pathname === "/reports" ? "active" : ""
            }`}
            onClick={() => goTo("/reports")}
          >
            📊 Reports
          </button>

          <button
            className={`menu-item ${
              location.pathname === "/help" ? "active" : ""
            }`}
            onClick={() => goTo("/help")}
          >
            ❓ Help
          </button>
        </nav>
      </aside>
    </>
  );
}
