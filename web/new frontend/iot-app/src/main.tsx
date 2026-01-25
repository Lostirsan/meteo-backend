import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./globals.css";   // ✅ добавь
import "./index.css";     // можно оставить, но лучше сделать минимальным
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
