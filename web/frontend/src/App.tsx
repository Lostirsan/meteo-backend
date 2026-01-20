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
