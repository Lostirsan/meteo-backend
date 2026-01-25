import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Thermometer, Droplet, Sun, Leaf } from "lucide-react";

interface DeviceDetailModalProps {
  open: boolean;
  onClose: () => void;
  device: {
    id: string;
    name: string;
    plant: string;
    temperature: number;
    humidity: number;
    light: number;
  } | null;
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

// Mock data for charts
const generateMockData = () => {
  const hours = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    hours.push({
      time: `${time.getHours()}:00`,
      temperature: Math.floor(Math.random() * 8 + 18),
      humidity: Math.floor(Math.random() * 20 + 70),
    });
  }
  return hours;
};

export function DeviceDetailModal({ open, onClose, device }: DeviceDetailModalProps) {
  if (!device) return null;

  const chartData = generateMockData();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div>{device.name}</div>
              <div className="text-sm text-muted-foreground">{PLANT_NAMES[device.plant] || device.plant}</div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Thermometer className="w-5 h-5 text-chart-1" />
                <span className="text-sm text-muted-foreground">Температура</span>
              </div>
              <p className="text-2xl">{device.temperature}°C</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplet className="w-5 h-5 text-chart-2" />
                <span className="text-sm text-muted-foreground">Влажность</span>
              </div>
              <p className="text-2xl">{device.humidity}%</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-chart-3" />
                <span className="text-sm text-muted-foreground">Освещение</span>
              </div>
              <p className="text-2xl">{device.light}%</p>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="mb-4 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-chart-1" />
              График температуры (24 часа)
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--color-muted-foreground)"
                  tick={{ fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  tick={{ fill: 'var(--color-muted-foreground)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="var(--color-chart-1)" 
                  strokeWidth={2}
                  name="Температура °C"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity Chart */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-chart-2" />
              График влажности (24 часа)
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--color-muted-foreground)"
                  tick={{ fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  tick={{ fill: 'var(--color-muted-foreground)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="var(--color-chart-2)" 
                  strokeWidth={2}
                  name="Влажность %"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}