import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import Help from "./pages/Help";

import { useUser } from "./context/UserContext";

export default function App() {
  const { user } = useUser();

  // 🌙 ГЛОБАЛЬНОЕ ПРИМЕНЕНИЕ ТЕМЫ
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";

    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={user ? <Home /> : <Navigate to="/login" />}
      />

      <Route
        path="/programs"
        element={user ? <Programs /> : <Navigate to="/login" />}
      />

      <Route
        path="/help"
        element={user ? <Help /> : <Navigate to="/login" />}
      />

      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
