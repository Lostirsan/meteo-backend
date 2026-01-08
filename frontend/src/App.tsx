import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Programs from "./pages/Programs";
import { useUser } from "./context/UserContext";
import Help from "./pages/Help";


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
      <Route
  path="/help"
  element={user ? <Help /> : <Navigate to="/register" />}
/>


      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
