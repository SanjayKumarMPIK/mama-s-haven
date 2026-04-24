/**
 * useFamilyPlanningProfile.ts
 *
 * Persists the Family Planning onboarding profile:
 *   - Reproductive history (children, birth types)
 *   - User intent (TTC / Avoid / Tracking)
 *   - Cycle regularity
 *   - Optional health context
 *
 * Data is stored in localStorage under "ss-fp-profile".
 */

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FPChild {
  birthType: "normal" | "c-section";
}

export type FPIntent = "ttc" | "avoid" | "tracking";
export type CycleRegularity = "regular" | "irregular" | "not-sure";

export interface FPProfile {
  onboardingComplete: boolean;
  /** Step 1 — reproductive history */
  hasChildren: boolean;
  children: FPChild[];
  /** Step 2 — user intent */
  intent: FPIntent;
  /** Step 3 — cycle awareness */
  cycleRegularity: CycleRegularity;
  /** Step 4 — optional health context */
  knownConditions: string;
  recentChildbirth: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_PROFILE: FPProfile = {
  onboardingComplete: false,
  hasChildren: false,
  children: [],
  intent: "tracking",
  cycleRegularity: "not-sure",
  knownConditions: "",
  recentChildbirth: false,
};

// ─── Storage ──────────────────────────────────────────────────────────────────

const LS_KEY = "ss-fp-profile";

function readProfile(): FPProfile {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<FPProfile>;
      return { ...DEFAULT_PROFILE, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_PROFILE };
}

function writeProfile(profile: FPProfile): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFamilyPlanningProfile() {
  const [profile, setProfile] = useState<FPProfile>(() => readProfile());

  const isOnboarded = useMemo(() => profile.onboardingComplete, [profile]);

  const saveProfile = useCallback((partial: Partial<FPProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...partial };
      writeProfile(next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback((data: Omit<FPProfile, "onboardingComplete">) => {
    const next: FPProfile = { ...data, onboardingComplete: true };
    writeProfile(next);
    setProfile(next);
  }, []);

  const updateIntent = useCallback((intent: FPIntent) => {
    setProfile((prev) => {
      const next = { ...prev, intent };
      writeProfile(next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(() => {
    const fresh = { ...DEFAULT_PROFILE };
    writeProfile(fresh);
    setProfile(fresh);
  }, []);

  return {
    profile,
    isOnboarded,
    saveProfile,
    completeOnboarding,
    updateIntent,
    resetProfile,
  };
}
