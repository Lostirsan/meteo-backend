import { Cloud, Droplet, Wind, MapPin } from "lucide-react";

export function WeatherPanel() {
  return (
    <aside className="w-72 shrink-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      {/* City & Temperature */}
      <div className="px-6 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sidebar-foreground/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Košice</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-chart-2/80" />
        </div>


        <div className="flex items-center gap-3">
          <span className="text-5xl leading-none font-semibold">1°</span>
          <Cloud className="w-10 h-10 text-sidebar-foreground/70" />
        </div>

        <p className="text-sidebar-foreground/70 text-sm mt-2">Пасмурно</p>
        <p className="text-sidebar-foreground/60 text-xs mt-1">Пятница, 23 января</p>
      </div>

      {/* Weather Details */}
      <div className="px-6 py-6 space-y-5">
        <div className="flex items-center gap-3">
          <Droplet className="w-5 h-5 text-chart-2" />
          <div className="leading-tight">
            <p className="text-sm text-sidebar-foreground/70">Влажность</p>
            <p className="text-lg font-medium">95%</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 text-chart-1" />
          <div className="leading-tight">
            <p className="text-sm text-sidebar-foreground/70">Ветер</p>
            <p className="text-lg font-medium">2.57 м/с</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-auto px-6 pb-6">
        <nav className="space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-sidebar-accent/70 hover:bg-sidebar-accent transition-colors">
            Устройства
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-sidebar-accent/60 transition-colors text-sidebar-foreground/80">
            Аналитика
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-sidebar-accent/60 transition-colors text-sidebar-foreground/80">
            Настройки
          </button>
        </nav>
      </div>
    </aside>
  );
}
