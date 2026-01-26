import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import "./header.css";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  // 🌙 состояние темы
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

  // применяем тему к body
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

const logout = () => {
  setUser(null);
  localStorage.removeItem("user");
  navigate("/login");
};


  return (
    <header className="header">
      <div className="header-left">
        🌱 Mini Agrárny Assistant
      </div>

      {user && (
        <div className="header-right">
          <span className="user-name">👤 {user.username}</span>

          {/* 🌙 / ☀️ ПЕРЕКЛЮЧЕНИЕ ТЕМЫ */}
          <button
            className="theme-toggle"
            title="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button className="logout-btn" onClick={logout}>
            Выйти
          </button>
        </div>
      )}
    </header>
  );
}
