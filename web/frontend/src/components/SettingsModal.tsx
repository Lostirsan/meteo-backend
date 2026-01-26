import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import "./settingsModal.css";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Settings = {
  volume: number;
  notifications: boolean;
};

export default function SettingsModal({ open, onClose }: Props) {
  const { user } = useUser();

  const settingsKey = user
    ? `settings_${user.username}`
    : "settings_guest";

  // ✅ флаг: настройки загружены
  const [loaded, setLoaded] = useState(false);

  // ✅ ЛЕНИВАЯ ИНИЦИАЛИЗАЦИЯ
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(settingsKey);
      return saved
        ? JSON.parse(saved)
        : { volume: 50, notifications: true };
    } catch {
      return { volume: 50, notifications: true };
    }
  });

  const [visible, setVisible] = useState(false);

  /* ===== плавное открытие / закрытие ===== */
  useEffect(() => {
    if (open) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  /* ===== ПЕРЕЗАГРУЗКА НАСТРОЕК ПРИ СМЕНЕ ПОЛЬЗОВАТЕЛЯ ===== */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(settingsKey);
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {}
    setLoaded(true);
  }, [settingsKey]);

  /* ===== СОХРАНЕНИЕ (ТОЛЬКО ПОСЛЕ ЗАГРУЗКИ) ===== */
  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings, loaded, settingsKey]);

  if (!visible) return null;

  return (
    <div
      className={`settings-overlay ${open ? "show" : "hide"}`}
      onClick={onClose}
    >
      <div
        className={`settings-modal ${open ? "show" : "hide"}`}
        onClick={e => e.stopPropagation()}
      >
        <h2>⚙️ Настройки приложения</h2>

        {/* 🔊 ГРОМКОСТЬ */}
        <div className="setting-row">
          <label>🔊 Громкость</label>
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={e =>
              setSettings(s => ({
                ...s,
                volume: Number(e.target.value),
              }))
            }
          />
          <span>{settings.volume}%</span>
        </div>

        {/* 🔔 УВЕДОМЛЕНИЯ */}
        <div className="setting-row notifications">
          <span className="setting-label">🔔 Уведомления</span>

          <div
            className={`switch ${settings.notifications ? "on" : ""}`}
            onClick={() =>
              setSettings(s => ({
                ...s,
                notifications: !s.notifications,
              }))
            }
          >
            <div className="knob" />
          </div>
        </div>

        <button className="settings-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
