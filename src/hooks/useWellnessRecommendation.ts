/**
 * useWellnessRecommendation.ts
 *
 * React hook that bridges the wellness engine with existing hooks
 * (useAuth, usePhase, useHealthLog) and persists the minimal user
 * profile (weight, height, region) in localStorage.
 */

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePhase } from "@/hooks/usePhase";
import { useHealthLog } from "@/hooks/useHealthLog";
import type { Region } from "@/lib/nutritionData";
import {
  generateWellnessRecommendation,
  type WellnessProfile,
  type WellnessRecommendation,
} from "@/lib/wellnessEngine";

// ─── Local Storage ────────────────────────────────────────────────────────────

const LS_KEY = "ss-wellness-profile";

function readProfile(): WellnessProfile | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.weight && parsed.height && parsed.region) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeProfile(profile: WellnessProfile) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
  } catch {}
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseWellnessResult {
  /** User-entered weight/height/region, or null if not yet set up */
  profile: WellnessProfile | null;
  /** Generated wellness recommendation, null until profile is complete */
  recommendation: WellnessRecommendation | null;
  /** Whether the user has completed the setup form */
  isProfileComplete: boolean;
  /** Persist and activate a new profile */
  saveProfile: (p: WellnessProfile) => void;
  /** Clear the profile and return to setup */
  clearProfile: () => void;
  /** The user's age derived from auth data */
  age: number;
  /** Current life-stage phase name */
  phaseName: string;
}

export function useWellnessRecommendation(): UseWellnessResult {
  const { fullProfile } = useAuth();
  const { phase, phaseName } = usePhase();
  const { logs } = useHealthLog();

  const [profile, setProfile] = useState<WellnessProfile | null>(() => readProfile());

  // Derive age from auth profile — fallback to 25
  const age = useMemo(() => {
    if (fullProfile?.basic?.age) {
      const parsed = parseInt(fullProfile.basic.age, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (fullProfile?.basic?.dob) {
      const dob = new Date(fullProfile.basic.dob);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        let a = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) a--;
        if (a > 0) return a;
      }
    }
    return 25;
  }, [fullProfile]);

  const saveProfile = useCallback((p: WellnessProfile) => {
    writeProfile(p);
    setProfile(p);
  }, []);

  const clearProfile = useCallback(() => {
    try { localStorage.removeItem(LS_KEY); } catch {}
    setProfile(null);
  }, []);

  const recommendation = useMemo<WellnessRecommendation | null>(() => {
    if (!profile) return null;
    return generateWellnessRecommendation(profile, age, phase, logs);
  }, [profile, age, phase, logs]);

  return {
    profile,
    recommendation,
    isProfileComplete: !!profile,
    saveProfile,
    clearProfile,
    age,
    phaseName,
  };
}
