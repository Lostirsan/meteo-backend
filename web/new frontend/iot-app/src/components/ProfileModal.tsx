import { useState } from "react";
import { Upload, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("Yahor");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      // важно: onOpenChange отдаёт boolean
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      {/*
        Главное: ограничиваем ширину и убираем растягивание.
        w-[92vw] чтобы на телефоне не вылезала, max-w-md чтобы была аккуратная,
        p-0 чтобы не было двойных паддингов (часто DialogContent уже с padding)
      */}
<DialogContent className="w-[88vw] max-w-[340px] p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader>
            <DialogTitle className="text-base">Профиль</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                  title="Загрузить фото"
                >
                  <Upload className="w-4 h-4" />
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <p className="text-sm text-muted-foreground">Нажмите, чтобы загрузить фото</p>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm text-muted-foreground">
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-border bg-input-background
                           focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                defaultValue="yahor@example.com"
                className="w-full px-4 py-2 rounded-xl border border-border bg-input-background
                           focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Save Button */}
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors">
              Сохранить изменения
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
