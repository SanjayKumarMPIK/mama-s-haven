import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AppRole = "user" | "doctor";

interface RoleContextType {
  role: AppRole | null;
  setRole: (role: AppRole) => void;
  clearRole: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  setRole: () => {},
  clearRole: () => {},
});

const ROLE_STORAGE_KEY = "ss-role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole | null>(() => {
    try {
      const raw = localStorage.getItem(ROLE_STORAGE_KEY);
      if (raw === "user" || raw === "doctor") return raw;
    } catch {}
    return null;
  });

  const setRole = (newRole: AppRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, newRole);
    } catch {}
  };

  const clearRole = () => {
    setRoleState(null);
    try {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    } catch {}
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROLE_STORAGE_KEY);
      if (raw === "user" || raw === "doctor") {
        setRoleState(raw);
      }
    } catch {}
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
