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

// ─── Delivery types ──────────────────────────────────────────────────────────

export interface DeliveryData {
  isDelivered: boolean;
  birthDate: string;         // YYYY-MM-DD
  weeksAtBirth: number;      // auto-calculated or manual
  birthWeight: number | null; // grams, optional
}

export type MaternityMode = "pregnancy" | "premature" | "postpartum";
export type RiskLevel = "high" | "moderate" | "low" | null;

const EMPTY_DELIVERY: DeliveryData = {
  isDelivered: false,
  birthDate: "",
  weeksAtBirth: 0,
  birthWeight: null,
};

/** Risk level based on gestational age at birth */
export function getRiskLevel(weeksAtBirth: number): RiskLevel {
  if (weeksAtBirth <= 0) return null;
  if (weeksAtBirth < 32) return "high";
  if (weeksAtBirth < 35) return "moderate";
  if (weeksAtBirth < 37) return "low";
  return null; // full-term
}

/** Corrected age = actual age minus weeks born early */
export function getCorrectedAge(
  birthDate: string,
  weeksAtBirth: number,
): { actualWeeks: number; correctedWeeks: number; weeksBornEarly: number } | null {
  if (!birthDate || weeksAtBirth <= 0 || weeksAtBirth >= 40) return null;
  const birth = new Date(birthDate + "T00:00:00").getTime();
  const now = Date.now();
  const actualWeeks = Math.floor((now - birth) / (7 * 86_400_000));
  const weeksBornEarly = 40 - weeksAtBirth;
  const correctedWeeks = Math.max(0, actualWeeks - weeksBornEarly);
  return { actualWeeks, correctedWeeks, weeksBornEarly };
}

/** Calculate weeks at birth from LMP + birth date */
export function calcWeeksAtBirth(lmp: string, birthDate: string): number {
  if (!lmp || !birthDate) return 0;
  const lmpMs = new Date(lmp + "T00:00:00").getTime();
  const birthMs = new Date(birthDate + "T00:00:00").getTime();
  return Math.max(0, Math.floor((birthMs - lmpMs) / (7 * 86_400_000)));
}

// ─── Profile type ────────────────────────────────────────────────────────────

export interface PregnancyProfile {
  name: string;
  lmp: string;            // YYYY-MM-DD — only required user input
  calculatedEDD: string;  // auto: LMP + 280
  userEDD: string;        // optional manual override (set from dashboard)
  region: Region;
  isSetup: boolean;
  delivery: DeliveryData;
  deliveryTransitionCompleted: boolean; // Flag to track if celebration flow completed

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
          delivery: raw.delivery || { ...EMPTY_DELIVERY },
          deliveryTransitionCompleted: raw.deliveryTransitionCompleted || false,
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
        delivery: raw.delivery || { ...EMPTY_DELIVERY },
        deliveryTransitionCompleted: raw.deliveryTransitionCompleted || false,
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
    delivery: { ...EMPTY_DELIVERY },
    deliveryTransitionCompleted: false,
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
  /** Save delivery details. */
  saveDelivery: (data: DeliveryData) => void;
  /** Mark delivery transition as completed (after celebration flow). */
  markDeliveryTransitionCompleted: () => void;
  clearProfile: () => void;
  /** The effective EDD used for all calculations. */
  activeEDD: string;
  currentWeek: number;
  daysLeft: number;
  trimester: number;
  progress: number;
  /** Current maternity mode based on delivery state. */
  mode: MaternityMode;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const EMPTY: PregnancyProfile = {
  name: "", lmp: "", calculatedEDD: "", userEDD: "", region: "north", isSetup: false, delivery: { ...EMPTY_DELIVERY }, deliveryTransitionCompleted: false, dueDate: "",
};

const PregnancyProfileContext = createContext<PregnancyProfileContextType>({
  profile: EMPTY,
  saveProfile: () => {},
  setUserEDD: () => {},
  saveDelivery: () => {},
  markDeliveryTransitionCompleted: () => {},
  clearProfile: () => {},
  activeEDD: "",
  currentWeek: 1,
  daysLeft: 280,
  trimester: 1,
  progress: 0,
  mode: "pregnancy",
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
          delivery: profile.delivery,
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
    setProfile((prev) => ({
      name: data.name,
      lmp: data.lmp,
      calculatedEDD,
      userEDD: "",
      region: data.region,
      isSetup: true,
      delivery: prev.delivery, // preserve delivery if exists
      deliveryTransitionCompleted: prev.deliveryTransitionCompleted || false,
      dueDate: calculatedEDD, // legacy compat
    }));
  }, []);

  // Set or clear user EDD override
  const setUserEDD = useCallback((edd: string | null) => {
    setProfile((prev) => {
      const userEDD = edd || "";
      const active = userEDD || prev.calculatedEDD;
      return { ...prev, userEDD, dueDate: active };
    });
  }, []);

  // Save delivery details
  const saveDelivery = useCallback((data: DeliveryData) => {
    setProfile((prev) => ({
      ...prev,
      delivery: data,
    }));
  }, []);

  // Mark delivery transition as completed (after celebration flow)
  const markDeliveryTransitionCompleted = useCallback(() => {
    setProfile((prev) => ({
      ...prev,
      deliveryTransitionCompleted: true,
    }));
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

  // Derived mode
  const mode: MaternityMode = useMemo(() => {
    if (!profile.delivery.isDelivered) return "pregnancy";
    if (profile.delivery.weeksAtBirth > 0 && profile.delivery.weeksAtBirth < 37) return "premature";
    return "postpartum";
  }, [profile.delivery]);

  const value: PregnancyProfileContextType = {
    profile,
    saveProfile,
    setUserEDD,
    saveDelivery,
    markDeliveryTransitionCompleted,
    clearProfile,
    activeEDD,
    currentWeek,
    daysLeft,
    trimester,
    progress,
    mode,
  };

  return createElement(PregnancyProfileContext.Provider, { value }, children);
}

export function usePregnancyProfile() {
  return useContext(PregnancyProfileContext);
}
