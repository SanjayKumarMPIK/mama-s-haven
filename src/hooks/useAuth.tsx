import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";

// ─── Storage keys ────────────────────────────────────────────────────────────
const STORAGE_KEY_USER = "swasthyasakhi_user";      // full profile data
const STORAGE_KEY_SESSION = "swasthyasakhi_session"; // session flag + minimal info

// ─── Types ───────────────────────────────────────────────────────────────────
export interface StoredUserData {
  basic: {
    fullName: string;
    age: string;
    dob: string;
    mobile?: string;
    email?: string;
    bloodGroup?: string;
    password: string;          // hashed in production; stored as-is for demo
  };
  location: {
    region: "north" | "south" | "east" | "west";
  };
  health: {
    lifeStage: string;
    expectedDueDate?: string;
    trimester?: string;
    lastPeriodDate?: string;
    cycleLength?: string;
    haemoglobin?: string;
    dietType?: "veg" | "non-veg" | "mixed" | "eggetarian";
    knownConditions?: string;
    medicalConditions?: string[];
  };
  registeredAt: string;        // ISO timestamp
}

export interface SessionUser {
  id: string;
  name: string;
  mobile?: string;
  email?: string;
  lifeStage?: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: SessionUser | null;
  fullProfile: StoredUserData | null;
  loginWithPassword: (emailOrMobile: string, password: string) => Promise<boolean>;
  loginWithOTP: (mobile: string, otp: string) => Promise<boolean>;
  sendOTP: (mobile: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  updateProfile: (updater: (prev: StoredUserData) => StoredUserData) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStoredUser(): StoredUserData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function createSessionFromStored(stored: StoredUserData): SessionUser {
  return {
    id: stored.basic.mobile || stored.basic.email || "anonymous", // unique ID for demo
    name: stored.basic.fullName,
    mobile: stored.basic.mobile || undefined,
    email: stored.basic.email || undefined,
    lifeStage: stored.health.lifeStage,
    isLoggedIn: true,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [fullProfile, setFullProfile] = useState<StoredUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const session = getSession();
    const stored = getStoredUser();
    if (session?.isLoggedIn) {
      setUser(session);
    }
    if (stored) {
      setFullProfile(stored);
    }
    setIsLoading(false);
  }, []);

  // ── Login with email/mobile + password (validates against localStorage) ────
  const loginWithPassword = async (emailOrMobile: string, password: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const stored = getStoredUser();
        if (!stored) {
          toast.error("No registered account found. Please sign up first.");
          resolve(false);
          return;
        }

        const matchesCredentials =
          ((stored.basic.mobile && stored.basic.mobile === emailOrMobile) || stored.basic.email === emailOrMobile) &&
          stored.basic.password === password;

        if (!matchesCredentials) {
          toast.error("Invalid credentials. Please check your mobile/email and password.");
          resolve(false);
          return;
        }

        const session = createSessionFromStored(stored);
        setUser(session);
        setFullProfile(stored);
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
        toast.success("Login successful! Welcome back.");
        resolve(true);
      }, 800);
    });
  };

  // ── Login with OTP (validates mobile exists in localStorage) ────────────────
  const loginWithOTP = async (mobile: string, otp: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const stored = getStoredUser();

        // Demo OTP is always "1234"
        if (otp !== "1234") {
          toast.error("Invalid OTP. Use 1234 for demo.");
          resolve(false);
          return;
        }

        if (!stored || stored.basic.mobile !== mobile) {
          toast.error("No account registered with this mobile. Please sign up first.");
          resolve(false);
          return;
        }

        const session = createSessionFromStored(stored);
        setUser(session);
        setFullProfile(stored);
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
        toast.success("OTP verified! Welcome back.");
        resolve(true);
      }, 800);
    });
  };

  // ── Send OTP (mock) ────────────────────────────────────────────────────────
  const sendOTP = async (mobile: string) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const stored = getStoredUser();
        if (!stored || stored.basic.mobile !== mobile) {
          toast.error("No account registered with this mobile number.");
          resolve(false);
          return;
        }
        toast.success(`OTP sent to ${mobile} (Use 1234 for demo)`);
        resolve(true);
      }, 800);
    });
  };

  // ── Register (stores full profile in localStorage) ─────────────────────────
  const register = async (userData: any) => {
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const storedData: StoredUserData = {
          basic: {
            fullName: userData.basic.fullName,
            age: userData.basic.age,
            dob: userData.basic.dob,
            mobile: userData.basic.mobile || undefined,
            email: userData.basic.email || undefined,
            bloodGroup: userData.basic.bloodGroup || undefined,
            password: userData.basic.password,
          },
          location: {
            region: userData.location.region,
          },
          health: {
            lifeStage: userData.health.lifeStage,
            expectedDueDate: userData.health.expectedDueDate || undefined,
            trimester: userData.health.trimester || undefined,
            lastPeriodDate: userData.health.lastPeriodDate || undefined,
            cycleLength: userData.health.cycleLength || undefined,
            haemoglobin: userData.health.haemoglobin || undefined,
            dietType: userData.health.dietType || undefined,
            knownConditions: userData.health.knownConditions || undefined,
            medicalConditions: userData.health.medicalConditions || [],
          },
          registeredAt: new Date().toISOString(),
        };

        // Persist full profile
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(storedData));

        // Create and persist session
        const session = createSessionFromStored(storedData);
        setUser(session);
        setFullProfile(storedData);
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));

        toast.success("Your profile has been securely saved on this device", {
          description: "Data is stored locally on your device for privacy",
          duration: 5000,
        });
        resolve(true);
      }, 1200);
    });
  };

  const updateProfile = (updater: (prev: StoredUserData) => StoredUserData) => {
    const current = getStoredUser();
    if (!current) return;
    const next = updater(current);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next));
    setFullProfile(next);
    if (user) {
      const refreshedSession = createSessionFromStored(next);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(refreshedSession));
      setUser(refreshedSession);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    // Note: we keep STORAGE_KEY_USER so the user can log back in
    toast.info("Logged out successfully. Your data remains safely on this device.");
  };

  return (
    <AuthContext.Provider
      value={{ user, fullProfile, loginWithPassword, loginWithOTP, sendOTP, register, updateProfile, logout, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
