import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.tsx";
import "./auth.css";

type Props = {
  mode?: "login" | "register";
};

export default function AuthCard({ mode = "login" }: Props) {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const isRegister = mode === "register";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const api = import.meta.env.VITE_API_URL;

  if (!api) {
    throw new Error("VITE_API_URL is not defined");
  }

  const doLogin = async (u: string, p: string) => {
    const res = await fetch(`${api}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.success || !data?.user) {
      throw new Error(data?.message || "Invalid credentials");
    }

    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setError("Fill username & password");
      return;
    }

    if (isRegister && p !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        const res = await fetch(`${api}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, password: p }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.message || "Register failed");
        }

        await doLogin(u, p);
        return;
      }

      await doLogin(u, p);
    } catch (err: any) {
      setError(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>{isRegister ? "Register" : "Login"}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        {isRegister && (
          <input
            placeholder="Confirm password"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        )}

        {error && <div className="auth-error">{error}</div>}

        <button className="auth-btn" type="submit" disabled={loading}>
          {loading ? "..." : isRegister ? "Register" : "Login"}
        </button>
      </form>

      <div className="auth-switch">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <span className="auth-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </>
        ) : (
          <>
            No account?{" "}
            <span className="auth-link" onClick={() => navigate("/register")}>
              Register
            </span>
          </>
        )}
      </div>
    </div>
  );
}
