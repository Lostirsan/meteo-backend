import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "./appLayout.css";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        {children}
      </div>
    </div>
  );
}
