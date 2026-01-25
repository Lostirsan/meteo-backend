import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Search, Check } from "lucide-react";

interface AddDeviceModalProps {
  open: boolean;
  onClose: () => void;
  onAddDevice: (device: { name: string; password: string; plant: string }) => void;
}

const PLANTS = [
  { id: "tomato", name: "Помидор" },
  { id: "cucumber", name: "Огурец" },
  { id: "pepper", name: "Перец" },
  { id: "strawberry", name: "Клубника" },
  { id: "basil", name: "Базилик" },
  { id: "mint", name: "Мята" },
  { id: "lettuce", name: "Салат" },
  { id: "carrot", name: "Морковь" },
  { id: "potato", name: "Картофель" },
  { id: "onion", name: "Лук" },
  { id: "garlic", name: "Чеснок" },
  { id: "eggplant", name: "Баклажан" },
  { id: "broccoli", name: "Брокколи" },
  { id: "cabbage", name: "Капуста" },
  { id: "pumpkin", name: "Тыква" },
  { id: "corn", name: "Кукуруза" },
  { id: "pea", name: "Горох" },
  { id: "bean", name: "Фасоль" },
  { id: "radish", name: "Редис" },
  { id: "beet", name: "Свекла" },
];

export function AddDeviceModal({ open, onClose, onAddDevice }: AddDeviceModalProps) {
  const [deviceName, setDeviceName] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlant, setSelectedPlant] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = () => {
    if (deviceName && password && selectedPlant) {
      onAddDevice({ name: deviceName, password, plant: selectedPlant });
      setDeviceName("");
      setPassword("");
      setSelectedPlant("");
      onClose();
    }
  };

  const filteredPlants = PLANTS.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить устройство</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Device Name */}
          <div className="space-y-2">
            <label htmlFor="device-name" className="text-sm">Название устройства</label>
            <input
              id="device-name"
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Например: Теплица №1"
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm">Пароль устройства</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Plant Selection with Search */}
          <div className="space-y-2">
            <label className="text-sm">Выберите растение</label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск растения..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Plant List */}
            <div className="max-h-[240px] overflow-y-auto border border-border rounded-lg bg-input-background">
              {filteredPlants.length > 0 ? (
                filteredPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 ${
                      selectedPlant === plant.id ? "bg-primary/10" : ""
                    }`}
                  >
                    <span className="flex-1 text-left">{plant.name}</span>
                    {selectedPlant === plant.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  Растение не найдено
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!deviceName || !password || !selectedPlant}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Добавить устройство
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}