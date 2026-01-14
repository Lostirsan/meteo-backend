import { useState } from "react";
import AppLayout from "../layouts/AppLayout.tsx";
import { useUser } from "../context/UserContext.tsx";
import "./programs.css";

type Settings = {
  sound: boolean;
  notifications: boolean;
};

export default function Programs() {
  const { user } = useUser();

  const storageKey = user ? `settings_${user.username}` : null;

  const [settings, setSettings] = useState<Settings>(() => {
    if (!storageKey) {
      return { sound: true, notifications: true };
    }

    const saved = localStorage.getItem(storageKey);
    return saved
      ? JSON.parse(saved)
      : { sound: true, notifications: true };
  });

  // сохраняем при ЛЮБОМ изменении
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
    }
  };

  return (
    <AppLayout>
      <main className="programs-content">
        <h2>⚙️ Programs</h2>
        <p className="subtitle">Application settings</p>

        <div className="settings-card">
          <div className="setting-row">
            <span>🔊 Sound</span>
            <Toggle
              value={settings.sound}
              onChange={(v) =>
                updateSettings({ ...settings, sound: v })
              }
            />
          </div>

          <div className="setting-row">
            <span>🔔 Notifications</span>
            <Toggle
              value={settings.notifications}
              onChange={(v) =>
                updateSettings({ ...settings, notifications: v })
              }
            />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

/* ===== Toggle ===== */
function Toggle({
  value,
  onChange
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className={`toggle ${value ? "on" : ""}`}
      onClick={() => onChange(!value)}
    >
      <span />
    </button>
  );
}
