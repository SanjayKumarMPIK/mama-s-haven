import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

// ─── Storage keys ────────────────────────────────────────────────────────────
const STORAGE_KEY_USER = "swasthyasakhi_user";      // full profile data

// ─── Types ───────────────────────────────────────────────────────────────────
export interface StoredUserData {
  basic: {
    fullName: string;
    age: string;
    dob: string;
    mobile?: string;
    email?: string;
    bloodGroup?: string;
    password: string; 
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
    dietType?: "veg" | "mixed";
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
  accessToken: string | null;
  loginWithPassword: (emailOrMobile: string, password: string) => Promise<boolean>;
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

function resolveLifeStageFromAge(age: string): string {
  const parsedAge = Number(age);
  if (!Number.isFinite(parsedAge)) return "unknown";
  if (parsedAge > 20) return "maternity";
  if (parsedAge > 10) return "puberty";
  return "pre-puberty";
}

function mapSupabaseMetadataToStored(
  metadata: Record<string, unknown> | undefined,
  fallbackEmail: string | undefined,
): StoredUserData {
  const basic = (metadata?.basic as Record<string, unknown> | undefined) ?? {};
  const location = (metadata?.location as Record<string, unknown> | undefined) ?? {};
  const health = (metadata?.health as Record<string, unknown> | undefined) ?? {};

  return {
    basic: {
      fullName: String(basic.fullName ?? ""),
      age: String(basic.age ?? ""),
      dob: String(basic.dob ?? ""),
      mobile: basic.mobile ? String(basic.mobile) : undefined,
      email: (basic.email ? String(basic.email) : fallbackEmail) || undefined,
      bloodGroup: basic.bloodGroup ? String(basic.bloodGroup) : undefined,
      password: "",
    },
    location: {
      region: (location.region as StoredUserData["location"]["region"]) || "north",
    },
    health: {
      lifeStage: String(health.lifeStage ?? metadata?.healthCycleStatus ?? ""),
      expectedDueDate: health.expectedDueDate ? String(health.expectedDueDate) : undefined,
      trimester: health.trimester ? String(health.trimester) : undefined,
      lastPeriodDate: health.lastPeriodDate ? String(health.lastPeriodDate) : undefined,
      cycleLength: health.cycleLength ? String(health.cycleLength) : undefined,
      haemoglobin: health.haemoglobin ? String(health.haemoglobin) : undefined,
      dietType: health.dietType as StoredUserData["health"]["dietType"] | undefined,
      knownConditions: health.knownConditions ? String(health.knownConditions) : undefined,
      medicalConditions: Array.isArray(health.medicalConditions)
        ? health.medicalConditions.map((item) => String(item))
        : [],
    },
    registeredAt: String(metadata?.registeredAt ?? new Date().toISOString()),
  };
}

function mapDbRowToStored(row: Record<string, unknown>): StoredUserData {
  return {
    basic: {
      fullName: String(row.full_name ?? ""),
      age: String(row.age ?? ""),
      dob: String(row.dob ?? ""),
      mobile: row.mobile ? String(row.mobile) : undefined,
      email: row.email ? String(row.email) : undefined,
      bloodGroup: row.blood_group ? String(row.blood_group) : undefined,
      password: "",
    },
    location: {
      region: (row.region as StoredUserData["location"]["region"]) || "north",
    },
    health: {
      lifeStage: String(row.health_cycle_status ?? ""),
      lastPeriodDate: row.last_period_date ? String(row.last_period_date) : undefined,
      cycleLength: row.cycle_length ? String(row.cycle_length) : undefined,
      haemoglobin: row.haemoglobin ? String(row.haemoglobin) : undefined,
      dietType: row.diet_type as StoredUserData["health"]["dietType"] | undefined,
      knownConditions: row.known_conditions ? String(row.known_conditions) : undefined,
      medicalConditions: Array.isArray(row.medical_conditions)
        ? row.medical_conditions.map((item) => String(item))
        : [],
    },
    registeredAt: String(row.registered_at ?? new Date().toISOString()),
  };
}

async function fetchDbProfile(userId: string): Promise<StoredUserData | null> {
  const db = supabase as any;
  const { data, error } = await db
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapDbRowToStored(data as Record<string, unknown>);
}

async function upsertDbProfile(userId: string, payload: StoredUserData): Promise<void> {
  const db = supabase as any;
  await db.from("user_profiles").upsert(
    {
      id: userId,
      full_name: payload.basic.fullName,
      age: Number(payload.basic.age),
      dob: payload.basic.dob,
      email: payload.basic.email,
      mobile: payload.basic.mobile || null,
      blood_group: payload.basic.bloodGroup || null,
      region: payload.location.region,
      health_cycle_status: payload.health.lifeStage,
      last_period_date: payload.health.lastPeriodDate || null,
      cycle_length: payload.health.cycleLength ? Number(payload.health.cycleLength) : null,
      haemoglobin: payload.health.haemoglobin ? Number(payload.health.haemoglobin) : null,
      diet_type: payload.health.dietType || null,
      known_conditions: payload.health.knownConditions || null,
      medical_conditions: payload.health.medicalConditions || [],
      registered_at: payload.registeredAt,
    },
    { onConflict: "id" },
  );
}

async function buildAuthStateFromSession(supabaseSession: Session | null): Promise<{
  user: SessionUser | null;
  fullProfile: StoredUserData | null;
  accessToken: string | null;
}> {
  const currentUser = supabaseSession?.user;
  if (!currentUser) {
    return { user: null, fullProfile: null, accessToken: null };
  }

  const profileFromDb = await fetchDbProfile(currentUser.id);
  const storedFromMetadata = mapSupabaseMetadataToStored(
    currentUser.user_metadata as Record<string, unknown> | undefined,
    currentUser.email,
  );
  const effectiveProfile = profileFromDb ?? storedFromMetadata;
  const liveSession: SessionUser = {
    id: currentUser.id,
    name: effectiveProfile.basic.fullName || currentUser.email || "User",
    mobile: effectiveProfile.basic.mobile,
    email: currentUser.email || effectiveProfile.basic.email,
    lifeStage: effectiveProfile.health.lifeStage,
    isLoggedIn: true,
  };

  return {
    user: liveSession,
    fullProfile: effectiveProfile,
    accessToken: supabaseSession.access_token ?? null,
  };
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [fullProfile, setFullProfile] = useState<StoredUserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // JWT/session-driven auth state
  useEffect(() => {
    let mounted = true;

    const applySession = async (session: Session | null) => {
      const next = await buildAuthStateFromSession(session);
      if (!mounted) return;
      setUser(next.user);
      setFullProfile(next.fullProfile);
      setAccessToken(next.accessToken);
      if (next.fullProfile) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next.fullProfile));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
      setIsLoading(false);
    };

    const init = async () => {
      const {
        data: { session: supabaseSession },
      } = await supabase.auth.getSession();
      await applySession(supabaseSession);
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  // ── Login with email/mobile + password (validates against localStorage) ────
  const loginWithPassword = async (emailOrMobile: string, password: string) => {
    const email = emailOrMobile.trim().toLowerCase();
    if (!email.includes("@")) {
      toast.error("Please log in with your registered email.");
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      toast.error(error?.message || "Invalid credentials. Please try again.");
      return false;
    }

    const storedFromMetadata = mapSupabaseMetadataToStored(
      data.user.user_metadata as Record<string, unknown> | undefined,
      data.user.email,
    );
    const profileFromDb = await fetchDbProfile(data.user.id);
    const effectiveProfile = profileFromDb ?? storedFromMetadata;
    const session: SessionUser = {
      id: data.user.id,
      name: effectiveProfile.basic.fullName || data.user.email || "User",
      mobile: effectiveProfile.basic.mobile,
      email: data.user.email || effectiveProfile.basic.email,
      lifeStage: effectiveProfile.health.lifeStage,
      isLoggedIn: true,
    };

    setUser(session);
    setFullProfile(effectiveProfile);
    setAccessToken(data.session?.access_token ?? null);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(effectiveProfile));
    toast.success("Login successful! Welcome back.");
    return true;
  };

  // ── Register (stores full profile in localStorage) ─────────────────────────
  const register = async (userData: any) => {
    const email = String(userData.basic.email || "").trim().toLowerCase();
    const password = String(userData.basic.password || "");
    const age = String(userData.basic.age || "");
    const parsedAge = Number(age);

    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return false;
    }
    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      toast.error("Please provide a valid age between 1 and 120.");
      return false;
    }

    const lifeStage = resolveLifeStageFromAge(age);
    const registeredAt = new Date().toISOString();
    const dataForStorage: StoredUserData = {
      basic: {
        fullName: userData.basic.fullName,
        age,
        dob: userData.basic.dob,
        mobile: userData.basic.mobile || undefined,
        email,
        bloodGroup: userData.basic.bloodGroup || undefined,
        password: "",
      },
      location: {
        region: userData.location.region,
      },
      health: {
        lifeStage,
        expectedDueDate: userData.health.expectedDueDate || undefined,
        trimester: userData.health.trimester || undefined,
        lastPeriodDate: userData.health.lastPeriodDate || undefined,
        cycleLength: userData.health.cycleLength || undefined,
        haemoglobin: userData.health.haemoglobin || undefined,
        dietType: userData.health.dietType || undefined,
        knownConditions: userData.health.knownConditions || undefined,
        medicalConditions: userData.health.medicalConditions || [],
      },
      registeredAt,
    };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...dataForStorage,
          healthCycleStatus: lifeStage,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      return false;
    }

    const currentUser = data.user;
    if (!currentUser) {
      toast.error("Signup failed. Please try again.");
      return false;
    }

    const session: SessionUser = {
      id: currentUser.id,
      name: dataForStorage.basic.fullName || currentUser.email || "User",
      mobile: dataForStorage.basic.mobile,
      email: currentUser.email || dataForStorage.basic.email,
      lifeStage,
      isLoggedIn: true,
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(dataForStorage));
    setUser(session);
    setFullProfile(dataForStorage);
    setAccessToken(data.session?.access_token ?? null);
    await upsertDbProfile(currentUser.id, dataForStorage);

    toast.success("Signup successful. Please verify your email if prompted.");
    return true;
  };

  const updateProfile = (updater: (prev: StoredUserData) => StoredUserData) => {
    const current = getStoredUser();
    if (!current) return;
    const next = updater(current);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(next));
    setFullProfile(next);
    if (user?.id) {
      upsertDbProfile(user.id, next);
      supabase.auth.updateUser({
        data: {
          ...next,
          healthCycleStatus: next.health.lifeStage,
        },
      });
    }
    if (user) {
      const refreshedSession = createSessionFromStored(next);
      refreshedSession.id = user.id;
      setUser(refreshedSession);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    setFullProfile(null);
    setAccessToken(null);
    supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY_USER);
    toast.info("Logged out successfully.");
  };

  return (
    <AuthContext.Provider
      value={{ user, fullProfile, accessToken, loginWithPassword, register, updateProfile, logout, isLoading }}
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
