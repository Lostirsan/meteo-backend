import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import "../styles/auth.css";

type Props = {
  mode?: "login" | "register";
};

export default function AuthCard({ mode = "login" }: Props) {
  const isRegister = mode === "register";

  const navigate = useNavigate();
  const { setUser } = useUser();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  /* ===== REGISTER ===== */
  const handleRegister = async () => {
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      // сохраняем пользователя во фронте
      setUser({
        id: Date.now(), // временно, позже будет id с backend
        username
      });

      // переход на основной экран
      navigate("/dashboard");
    } catch {
      setError("Backend is not running");
    }
  };

  /* ===== LOGIN ===== */
  const handleLogin = async () => {
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // сохраняем пользователя
      setUser({
        id: data.user.id,
        username: data.user.username
      });

      // переход на dashboard
      navigate("/dashboard");
    } catch {
      setError("Backend is not running");
    }
  };

  return (
    <div className="auth-card">
      <h1>{isRegister ? "Create Account" : "Smart Irrigation"}</h1>
      <p>
        {isRegister
          ? "Register new greenhouse account"
          : "Greenhouse Control System"}
      </p>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isRegister && (
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      )}

      <button
        className="primary"
        onClick={isRegister ? handleRegister : handleLogin}
      >
        {isRegister ? "Register" : "Log in"}
      </button>

      {error && <div className="error">{error}</div>}

      {isRegister ? (
        <Link to="/login" className="switch-link dark">
          Already have an account? Log in
        </Link>
      ) : (
        <Link to="/register" className="switch-link dark">
          Create new account
        </Link>
      )}

      <span className="hint">
        {isRegister
          ? "Registration demo only"
          : "Use your registered credentials"}
      </span>
    </div>
  );
}
