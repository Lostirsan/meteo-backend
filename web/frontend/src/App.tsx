import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx";
import Programs from "./pages/Programs.tsx";
import { useUser } from "./context/UserContext.tsx";
import Help from "./pages/Help.tsx";


export default function App() {
  const { user } = useUser();

  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED */}
      <Route
        path="/dashboard"
        element={user ? <Home /> : <Navigate to="/register" />}
      />

      <Route
        path="/programs"
        element={user ? <Programs /> : <Navigate to="/register" />}
      />
      <Route path="/help" element={user ? <Help /> : <Navigate to="/register" />} />




      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
