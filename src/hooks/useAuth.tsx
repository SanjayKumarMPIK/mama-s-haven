import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { toast } from "sonner";
import { supabaseUserClient } from "@/lib/supabase-user";
import { clearUserSessionCaches } from "@/lib/authSessionCleanup";
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
    weight?: string;
    height?: string;
  };
  location: {
    region: "north" | "south" | "east" | "west";
    state: string;
    nearbyPhc: "Anna Nagar PHC" | "Tambaram PHC";
    regionType: "rural" | "urban" | "hillstation";
  };
  health: {
    lifeStage: string;
    expectedDueDate?: string;
    trimester?: string;
    lastPeriodDate?: string;
    cycleLength?: string;
    haemoglobin?: string;
    dietType?: "veg" | "mixed" | "non-veg" | "eggetarian";
    knownConditions?: string;
    medicalConditions?: string[];
    menarcheDate?: string | null;
    periodDurationDays?: number;
    activityLevel?: "sedentary" | "moderate" | "active";
    climate?: "hot" | "moderate" | "cold";
  };
  registeredAt: string;        // ISO timestamp
  onboardingCompleted?: boolean;
  onboardingStep?: string;
  onboardingData?: any;
  familyPlanningGoal?: string;
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
  saveFullProfile: (data: StoredUserData) => Promise<void>;
  logout: () => Promise<void>;
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
      weight: basic.weight ? String(basic.weight) : undefined,
      height: basic.height ? String(basic.height) : undefined,
    },
    location: {
      region: (location.region as StoredUserData["location"]["region"]) || "north",
      state: location.state ? String(location.state) : "",
      nearbyPhc: (location.nearbyPhc as StoredUserData["location"]["nearbyPhc"]) || "Anna Nagar PHC",
      regionType: (location.regionType as StoredUserData["location"]["regionType"]) || "urban",
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
      menarcheDate: health.menarcheDate != null ? String(health.menarcheDate) : undefined,
      periodDurationDays:
        typeof health.periodDurationDays === "number" ? health.periodDurationDays : undefined,
      activityLevel: health.activityLevel as StoredUserData["health"]["activityLevel"] | undefined,
      climate: health.climate as StoredUserData["health"]["climate"] | undefined,
    },
    registeredAt: String(metadata?.registeredAt ?? new Date().toISOString()),
  };
}

function readFamilyPlanningGoalFromRow(row: Record<string, unknown>): string | undefined {
  if (row.family_planning_goal != null && String(row.family_planning_goal).trim() !== "") {
    return String(row.family_planning_goal);
  }
  const od = row.onboarding_data;
  if (od && typeof od === "object" && !Array.isArray(od)) {
    const v = (od as Record<string, unknown>).familyPlanningGoal;
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return undefined;
}

function readOnboardingCompletedFromRow(row: Record<string, unknown>): boolean {
  if (row.onboarding_completed != null) return Boolean(row.onboarding_completed);
  const od = row.onboarding_data;
  if (od && typeof od === "object" && !Array.isArray(od)) {
    const v = (od as Record<string, unknown>).onboardingCompleted;
    if (typeof v === "boolean") return v;
  }
  return false;
}

function readOnboardingStepFromRow(row: Record<string, unknown>): string | undefined {
  if (row.onboarding_step != null && String(row.onboarding_step).trim() !== "") {
    return String(row.onboarding_step);
  }
  const od = row.onboarding_data;
  if (od && typeof od === "object" && !Array.isArray(od)) {
    const v = (od as Record<string, unknown>).onboardingStep;
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return undefined;
}

/** Optional EDD: only meaningful in maternity phase; stored in JSON when DB columns are absent. */
function readExpectedDueDateFromRow(row: Record<string, unknown>, lifeStage: string): string | undefined {
  if (lifeStage !== "maternity") return undefined;
  if (row.pregnancy_due_date != null && String(row.pregnancy_due_date).trim() !== "") {
    return String(row.pregnancy_due_date).split("T")[0];
  }
  const od = row.onboarding_data;
  if (od && typeof od === "object" && !Array.isArray(od)) {
    const rec = od as Record<string, unknown>;
    const v = rec.expectedDueDate ?? rec.maternityExpectedDueDate;
    if (v != null && String(v).trim() !== "") return String(v).split("T")[0];
  }
  return undefined;
}

/**
 * Merges app-only fields into `onboarding_data` JSON so saves succeed when dedicated
 * columns are missing (family_planning_goal, onboarding flags, pregnancy_due_date, etc.).
 */
function buildOnboardingDataForDb(payload: StoredUserData): Record<string, unknown> | null {
  const base =
    payload.onboardingData && typeof payload.onboardingData === "object" && !Array.isArray(payload.onboardingData)
      ? { ...(payload.onboardingData as Record<string, unknown>) }
      : {};
  if (payload.familyPlanningGoal && String(payload.familyPlanningGoal).trim() !== "") {
    base.familyPlanningGoal = payload.familyPlanningGoal;
  } else {
    delete base.familyPlanningGoal;
  }
  if (typeof payload.onboardingCompleted === "boolean") {
    base.onboardingCompleted = payload.onboardingCompleted;
  }
  if (payload.onboardingStep !== undefined) {
    if (String(payload.onboardingStep).trim() !== "") {
      base.onboardingStep = payload.onboardingStep;
    } else {
      delete base.onboardingStep;
    }
  }
  const isMaternity = payload.health.lifeStage === "maternity";
  if (isMaternity && payload.health.expectedDueDate && String(payload.health.expectedDueDate).trim() !== "") {
    base.expectedDueDate = String(payload.health.expectedDueDate).split("T")[0];
  } else {
    delete base.expectedDueDate;
    delete base.maternityExpectedDueDate;
  }
  return Object.keys(base).length ? base : null;
}

function mapDbRowToStored(row: Record<string, unknown>): StoredUserData {
  const lifeStage = String(row.health_cycle_status ?? "");
  return {
    basic: {
      fullName: String(row.full_name ?? ""),
      age: String(row.age ?? ""),
      dob: String(row.dob ?? ""),
      mobile: row.mobile ? String(row.mobile) : undefined,
      email: row.email ? String(row.email) : undefined,
      bloodGroup: row.blood_group ? String(row.blood_group) : undefined,
      password: "",
      weight: row.weight ? String(row.weight) : undefined,
      height: row.height ? String(row.height) : undefined,
    },
    location: {
      region: (row.region as StoredUserData["location"]["region"]) || "north",
      state: row.state ? String(row.state) : "",
      nearbyPhc: (row.nearby_phc as StoredUserData["location"]["nearbyPhc"]) || "Anna Nagar PHC",
      regionType: (row.region_type as StoredUserData["location"]["regionType"]) || "urban",
    },
    health: {
      lifeStage,
      expectedDueDate: readExpectedDueDateFromRow(row, lifeStage),
      lastPeriodDate: row.last_period_date ? String(row.last_period_date) : undefined,
      cycleLength: row.cycle_length != null ? String(row.cycle_length) : undefined,
      haemoglobin: row.haemoglobin != null ? String(row.haemoglobin) : undefined,
      dietType: row.diet_type as StoredUserData["health"]["dietType"] | undefined,
      knownConditions: row.known_conditions ? String(row.known_conditions) : undefined,
      medicalConditions: Array.isArray(row.medical_conditions)
        ? row.medical_conditions.map((item) => String(item))
        : [],
      menarcheDate:
        row.menarche_date != null && String(row.menarche_date).trim() !== ""
          ? String(row.menarche_date).split("T")[0]
          : null,
      periodDurationDays:
        typeof row.period_duration_days === "number" ? row.period_duration_days : undefined,
      activityLevel: row.activity_level as StoredUserData["health"]["activityLevel"] | undefined,
      climate: row.climate as StoredUserData["health"]["climate"] | undefined,
    },
    registeredAt: String(row.registered_at ?? new Date().toISOString()),
    onboardingCompleted: readOnboardingCompletedFromRow(row),
    onboardingStep: readOnboardingStepFromRow(row),
    onboardingData: row.onboarding_data ?? undefined,
    familyPlanningGoal: readFamilyPlanningGoalFromRow(row),
  };
}

async function fetchDbProfile(userId: string): Promise<StoredUserData | null> {
  const db = supabaseUserClient as any;
  const { data, error } = await db
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapDbRowToStored(data as Record<string, unknown>);
}

async function upsertDbProfile(userId: string, payload: StoredUserData): Promise<void> {
  const db = supabaseUserClient as any;
  await db.from("user_profiles").upsert(
    {
      id: userId,
      full_name: payload.basic.fullName,
      age: Number(payload.basic.age),
      dob: payload.basic.dob,
      email: payload.basic.email,
      mobile: payload.basic.mobile || null,
      blood_group: payload.basic.bloodGroup || null,
      weight: payload.basic.weight ? Number(payload.basic.weight) : null,
      height: payload.basic.height ? Number(payload.basic.height) : null,
      region: payload.location.region,
      state: payload.location.state,
      nearby_phc: payload.location.nearbyPhc,
      region_type: payload.location.regionType,
      health_cycle_status: payload.health.lifeStage,
      last_period_date: payload.health.lastPeriodDate || null,
      cycle_length: payload.health.cycleLength ? Number(payload.health.cycleLength) : null,
      haemoglobin: payload.health.haemoglobin ? Number(payload.health.haemoglobin) : null,
      diet_type: payload.health.dietType || null,
      known_conditions: payload.health.knownConditions || null,
      medical_conditions: payload.health.medicalConditions || [],
      menarche_date:
        payload.health.menarcheDate && String(payload.health.menarcheDate).trim()
          ? payload.health.menarcheDate
          : null,
      period_duration_days:
        typeof payload.health.periodDurationDays === "number" ? payload.health.periodDurationDays : null,
      activity_level: payload.health.activityLevel ?? null,
      climate: payload.health.climate ?? null,
      registered_at: payload.registeredAt,
      onboarding_data: buildOnboardingDataForDb(payload),
    },
    { onConflict: "id" },
  );
}

async function updateDbProfile(userId: string, payload: StoredUserData): Promise<{ error?: string }> {
  const db = supabaseUserClient as any;
  const { error } = await db
    .from("user_profiles")
    .update({
      full_name: payload.basic.fullName,
      age: Number(payload.basic.age),
      dob: payload.basic.dob,
      email: payload.basic.email,
      mobile: payload.basic.mobile || null,
      blood_group: payload.basic.bloodGroup || null,
      weight: payload.basic.weight ? Number(payload.basic.weight) : null,
      height: payload.basic.height ? Number(payload.basic.height) : null,
      region: payload.location.region,
      state: payload.location.state,
      nearby_phc: payload.location.nearbyPhc,
      region_type: payload.location.regionType,
      health_cycle_status: payload.health.lifeStage,
      last_period_date: payload.health.lastPeriodDate || null,
      cycle_length: payload.health.cycleLength ? Number(payload.health.cycleLength) : null,
      haemoglobin: payload.health.haemoglobin ? Number(payload.health.haemoglobin) : null,
      diet_type: payload.health.dietType || null,
      known_conditions: payload.health.knownConditions || null,
      medical_conditions: payload.health.medicalConditions || [],
      menarche_date:
        payload.health.menarcheDate && String(payload.health.menarcheDate).trim()
          ? payload.health.menarcheDate
          : null,
      period_duration_days:
        typeof payload.health.periodDurationDays === "number" ? payload.health.periodDurationDays : null,
      activity_level: payload.health.activityLevel ?? null,
      climate: payload.health.climate ?? null,
      registered_at: payload.registeredAt,
      onboarding_data: buildOnboardingDataForDb(payload),
    })
    .eq("id", userId);
  if (error) return { error: error.message };
  return {};
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

  // Doctors have no user_profiles row — skip the lookup to avoid a 400 error.
  const isDoctor = sessionStorage.getItem('ss-role') === 'doctor';
  const profileFromDb = isDoctor ? null : await fetchDbProfile(currentUser.id);
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
      } = await supabaseUserClient.auth.getSession();
      await applySession(supabaseSession);
    };

    init();

    const { data: subscription } = supabaseUserClient.auth.onAuthStateChange((_event, session) => {
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

    const { data, error } = await supabaseUserClient.auth.signInWithPassword({
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
    if (!Number.isInteger(parsedAge) || parsedAge < 8 || parsedAge > 120) {
      toast.error("Please provide a valid age between 8 and 120.");
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
        weight: userData.basic.weight || undefined,
        height: userData.basic.height || undefined,
      },
      location: {
        region: userData.location.region,
        state: userData.location.state,
        nearbyPhc: userData.location.nearbyPhc,
        regionType: userData.location.regionType,
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

    const { data, error } = await supabaseUserClient.auth.signUp({
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
      supabaseUserClient.auth.updateUser({
        data: {
          ...next,
          healthCycleStatus: next.health.lifeStage,
        },
      }).catch(() => {});
    }
    if (user) {
      const refreshedSession = createSessionFromStored(next);
      refreshedSession.id = user.id;
      setUser(refreshedSession);
    }
  };

  // ── Save Full Profile (async, for profile page) ─────────────────────────────
  const saveFullProfile = async (data: StoredUserData): Promise<void> => {
    if (!user?.id) throw new Error("No authenticated user");

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
    setFullProfile(data);

    const { error } = await updateDbProfile(user.id, data);
    if (error) throw new Error(error);

    await supabaseUserClient.auth.updateUser({
      data: { ...data, healthCycleStatus: data.health.lifeStage },
    });

    if (user) {
      const refreshed = createSessionFromStored(data);
      refreshed.id = user.id;
      setUser(refreshed);
    }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    const onboardingUserId = user?.id;
    setUser(null);
    setFullProfile(null);
    setAccessToken(null);
    try {
      await supabaseUserClient.auth.signOut({ scope: "global" });
    } catch {
      await supabaseUserClient.auth.signOut({ scope: "local" });
    }
    clearUserSessionCaches({ onboardingUserId });
    toast.info("Logged out successfully.");
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  return (
    <AuthContext.Provider
      value={{ user, fullProfile, accessToken, loginWithPassword, register, updateProfile, saveFullProfile, logout, isLoading }}
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
