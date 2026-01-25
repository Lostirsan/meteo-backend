import { Thermometer, Droplet, Sun, Leaf } from "lucide-react";

interface DeviceCardProps {
  device: {
    id: string;
    name: string;
    plant: string;
    temperature: number;
    humidity: number;
    light: number;
  };
  onClick: () => void;
}

const PLANT_NAMES: { [key: string]: string } = {
  tomato: "Помидор",
  cucumber: "Огурец",
  pepper: "Перец",
  strawberry: "Клубника",
  basil: "Базилик",
  mint: "Мята",
  lettuce: "Салат",
  carrot: "Морковь",
  potato: "Картофель",
  onion: "Лук",
  garlic: "Чеснок",
  eggplant: "Баклажан",
  broccoli: "Брокколи",
  cabbage: "Капуста",
  pumpkin: "Тыква",
  corn: "Кукуруза",
  pea: "Горох",
  bean: "Фасоль",
  radish: "Редис",
  beet: "Свекла",
};

export function DeviceCard({ device, onClick }: DeviceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm">{device.name}</h3>
            <p className="text-xs text-muted-foreground">{PLANT_NAMES[device.plant] || device.plant}</p>
          </div>
        </div>
        <div className="w-2 h-2 bg-accent rounded-full"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
          <Thermometer className="w-5 h-5 text-chart-1 mb-1" />
          <span className="text-xs text-muted-foreground">Темп.</span>
          <span className="text-sm mt-1">{device.temperature}°C</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
          <Droplet className="w-5 h-5 text-chart-2 mb-1" />
          <span className="text-xs text-muted-foreground">Влажн.</span>
          <span className="text-sm mt-1">{device.humidity}%</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-muted/30 rounded-lg">
          <Sun className="w-5 h-5 text-chart-3 mb-1" />
          <span className="text-xs text-muted-foreground">Свет</span>
          <span className="text-sm mt-1">{device.light}%</span>
        </div>
      </div>
    </div>
  );
}