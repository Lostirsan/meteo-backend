import { useState } from "react";
import Header from "../components/Header.tsx";
import Sidebar from "../components/Sidebar.tsx";
import "./appLayout.css";

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function AppLayout({ children, title }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-main">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </div>
    </div>
  );
}
