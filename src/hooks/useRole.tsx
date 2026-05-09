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
      const raw = sessionStorage.getItem(ROLE_STORAGE_KEY);
      if (raw === "user" || raw === "doctor") return raw;
    } catch {}
    return null;
  });

  const setRole = (newRole: AppRole) => {
    setRoleState(newRole);
    try {
      sessionStorage.setItem(ROLE_STORAGE_KEY, newRole);
      localStorage.removeItem(ROLE_STORAGE_KEY); // Clean up old persist
    } catch {}
  };

  const clearRole = () => {
    setRoleState(null);
    try {
      sessionStorage.removeItem(ROLE_STORAGE_KEY);
      localStorage.removeItem(ROLE_STORAGE_KEY); // Clean up old persist
    } catch {}
  };

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(ROLE_STORAGE_KEY);
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
