import { useEffect, useState } from "react";
import "./devicesModal.css";

type Device = {
  deviceId: string;     // 👈 ВВЕДЁННЫЙ ID
  deviceName: string;   // 👈 НАЗВАНИЕ
};

type Props = {
  open: boolean;
  onClose: () => void;
  device: Device | null;
};

export default function DevicesModal({ open, onClose, device }: Props) {
  const [visible, setVisible] = useState(false);

  /* ===== плавное открытие / закрытие ===== */
  useEffect(() => {
    if (open) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <div
      className={`devices-overlay ${open ? "show" : "hide"}`}
      onClick={onClose}
    >
      <div
        className={`devices-modal ${open ? "show" : "hide"}`}
        onClick={e => e.stopPropagation()}
      >
       <h2>📟 Подключённое устройство</h2>

{device ? (
  <div className="device-info">
    <div className="device-row">
      <span>🌱 Название устройства</span>
      <strong>{device.deviceName}</strong>
    </div>

    <div className="device-row">
      <span>🆔 ID устройства</span>
      <strong>{device.deviceId}</strong>
    </div>
  </div>
) : (
  <div className="device-empty">
    Нет подключённых устройств
  </div>
)}


        <button className="devices-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
