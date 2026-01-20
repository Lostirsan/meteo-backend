import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  username: string;
};

type Ctx = {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
};

const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) setUserState(JSON.parse(saved));
    } catch {
      setUserState(null);
    }
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const logout = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
