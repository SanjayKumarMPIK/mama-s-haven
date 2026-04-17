import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentWeek, getDaysRemaining, getTrimester, getProgressPercentage } from "@/lib/pregnancyData";
import type { Region } from "@/lib/nutritionData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Add `days` to a YYYY-MM-DD string and return YYYY-MM-DD. */
function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** LMP + 280 days = Estimated Due Date */
function calculateEDD(lmp: string): string {
  return addDays(lmp, 280);
}

// ─── Validation ──────────────────────────────────────────────────────────────

/** LMP must not be in the future. */
export function isValidLMP(lmpISO: string): boolean {
  if (!lmpISO) return false;
  const lmp = new Date(lmpISO + "T00:00:00");
  const today = new Date();
  today.setHours(23, 59, 59, 999); // allow today
  return lmp <= today;
}

/**
 * A user-supplied EDD must be medically realistic:
 * between LMP + 240 days and LMP + 300 days.
 */
export function isValidUserEDD(eddISO: string, lmpISO: string): boolean {
  if (!eddISO || !lmpISO) return false;
  const edd = new Date(eddISO + "T00:00:00").getTime();
  const lmp = new Date(lmpISO + "T00:00:00").getTime();
  const minEDD = lmp + 240 * 86_400_000;
  const maxEDD = lmp + 300 * 86_400_000;
  return edd >= minEDD && edd <= maxEDD;
}

/** Return the valid range boundaries formatted as YYYY-MM-DD. */
export function getEDDRange(lmpISO: string): { min: string; max: string } {
  return {
    min: addDays(lmpISO, 240),
    max: addDays(lmpISO, 300),
  };
}

// ─── Profile type ────────────────────────────────────────────────────────────

export interface PregnancyProfile {
  name: string;
  lmp: string;            // YYYY-MM-DD — only required user input
  calculatedEDD: string;  // auto: LMP + 280
  userEDD: string;        // optional manual override (set from dashboard)
  region: Region;
  isSetup: boolean;

  /* ── legacy compat — kept so old code referencing `dueDate` doesn't crash
       during migration; equals activeEDD ─────────────────────────────────── */
  dueDate: string;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "mh-profile";

function loadProfile(): PregnancyProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const raw = JSON.parse(stored);

      // ── Migration: old format had only `dueDate`, no `lmp` ──────────────
      if (raw.dueDate && !raw.lmp) {
        const legacyDueDate: string = raw.dueDate;
        const approxLmp = addDays(legacyDueDate, -280);
        return {
          name: raw.name || "",
          lmp: approxLmp,
          calculatedEDD: legacyDueDate,
          userEDD: "",
          region: raw.region || "north",
          isSetup: true,
          dueDate: legacyDueDate,
        };
      }

      // ── New format ─────────────────────────────────────────────────────
      const lmp: string = raw.lmp || "";
      const calculatedEDD: string = lmp ? calculateEDD(lmp) : "";
      const userEDD: string = raw.userEDD || "";
      const activeEDD = userEDD || calculatedEDD;

      return {
        name: raw.name || "",
        lmp,
        calculatedEDD,
        userEDD,
        region: raw.region || "north",
        isSetup: !!lmp,
        dueDate: activeEDD, // legacy compat
      };
    }
  } catch { /* ignore */ }

  return {
    name: "",
    lmp: "",
    calculatedEDD: "",
    userEDD: "",
    region: "north",
    isSetup: false,
    dueDate: "",
  };
}

// ─── Context type ────────────────────────────────────────────────────────────

interface PregnancyProfileContextType {
  profile: PregnancyProfile;
  /** Save from setup screen — only needs name, lmp, region. */
  saveProfile: (data: { name: string; lmp: string; region: Region }) => void;
  /** Set or clear a manual EDD override (used from dashboard). */
  setUserEDD: (edd: string | null) => void;
  clearProfile: () => void;
  /** The effective EDD used for all calculations. */
  activeEDD: string;
  currentWeek: number;
  daysLeft: number;
  trimester: number;
  progress: number;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const EMPTY: PregnancyProfile = {
  name: "", lmp: "", calculatedEDD: "", userEDD: "", region: "north", isSetup: false, dueDate: "",
};

const PregnancyProfileContext = createContext<PregnancyProfileContextType>({
  profile: EMPTY,
  saveProfile: () => {},
  setUserEDD: () => {},
  clearProfile: () => {},
  activeEDD: "",
  currentWeek: 1,
  daysLeft: 280,
  trimester: 1,
  progress: 0,
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function PregnancyProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PregnancyProfile>(loadProfile);

  // Persist whenever profile changes
  useEffect(() => {
    if (profile.isSetup) {
      try {
        // Store only the essential fields (no derived `dueDate` legacy field)
        const toStore = {
          name: profile.name,
          lmp: profile.lmp,
          userEDD: profile.userEDD,
          region: profile.region,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch { /* ignore */ }
    }
  }, [profile]);

  // Derived: activeEDD
  const activeEDD = useMemo(
    () => profile.userEDD || profile.calculatedEDD,
    [profile.userEDD, profile.calculatedEDD],
  );

  // Save from setup screen
  const saveProfile = useCallback((data: { name: string; lmp: string; region: Region }) => {
    const calculatedEDD = calculateEDD(data.lmp);
    setProfile({
      name: data.name,
      lmp: data.lmp,
      calculatedEDD,
      userEDD: "",
      region: data.region,
      isSetup: true,
      dueDate: calculatedEDD, // legacy compat
    });
  }, []);

  // Set or clear user EDD override
  const setUserEDD = useCallback((edd: string | null) => {
    setProfile((prev) => {
      const userEDD = edd || "";
      const active = userEDD || prev.calculatedEDD;
      return { ...prev, userEDD, dueDate: active };
    });
  }, []);

  // Clear everything
  const clearProfile = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setProfile({ ...EMPTY });
  }, []);

  // Derived pregnancy metrics — all from activeEDD
  const currentWeek = activeEDD ? getCurrentWeek(activeEDD) : 1;
  const daysLeft = activeEDD ? getDaysRemaining(activeEDD) : 280;
  const trimester = getTrimester(currentWeek);
  const progress = getProgressPercentage(currentWeek);

  const value: PregnancyProfileContextType = {
    profile,
    saveProfile,
    setUserEDD,
    clearProfile,
    activeEDD,
    currentWeek,
    daysLeft,
    trimester,
    progress,
  };

  return createElement(PregnancyProfileContext.Provider, { value }, children);
}

export function usePregnancyProfile() {
  return useContext(PregnancyProfileContext);
}
