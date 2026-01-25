import { useState } from "react";
import { Plus, User } from "lucide-react";

import { WeatherPanel } from "./components/WeatherPanel";
import { ThemeToggle } from "./components/ThemeToggle";
import { DeviceCard } from "./components/DeviceCard";
import { AddDeviceModal } from "./components/AddDeviceModal";
import { DeviceDetailModal } from "./components/DeviceDetailModal";
import { ProfileModal } from "./components/ProfileModal";

interface Device {
  id: string;
  name: string;
  plant: string;
  password: string;
  temperature: number;
  humidity: number;
  light: number;
}

export default function App() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: "1",
      name: "Теплица №1",
      plant: "tomato",
      password: "****",
      temperature: 22,
      humidity: 85,
      light: 75,
    },
  ]);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleAddDevice = (newDevice: { name: string; password: string; plant: string }) => {
    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      plant: newDevice.plant,
      password: newDevice.password,
      temperature: Math.floor(Math.random() * 10 + 18),
      humidity: Math.floor(Math.random() * 30 + 70),
      light: Math.floor(Math.random() * 40 + 60),
    };
    setDevices((prev) => [...prev, device]);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <WeatherPanel />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background flex items-center justify-end px-6">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Yahor</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-10 py-10">
            <div className="flex flex-col items-center">
              <h1 className="text-center text-sm font-medium text-muted-foreground mb-6">
                Мои устройства
              </h1>

              {/* 👇 Тут ширина всей колонки (карточка + кнопка) */}
              <div className="w-full max-w-lg flex flex-col gap-6">
                {devices.map((device) => (
                  <DeviceCard
                    key={device.id}
                    device={device}
                    onClick={() => setSelectedDevice(device)}
                  />
                ))}

                <button
                  onClick={() => setIsAddDeviceOpen(true)}
                  className="w-full rounded-2xl bg-card border border-border/60 p-10
                             hover:border-primary/60 hover:bg-primary/5 transition-all
                             flex flex-col items-center justify-center gap-3"
                >
                  <Plus className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Добавить устройство</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Modals */}
        <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        <AddDeviceModal
          open={isAddDeviceOpen}
          onClose={() => setIsAddDeviceOpen(false)}
          onAddDevice={handleAddDevice}
        />
        <DeviceDetailModal
          open={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          device={selectedDevice}
        />
      </div>
    </div>
  );
}