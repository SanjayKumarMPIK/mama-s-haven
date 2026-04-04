import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePhase } from "@/hooks/usePhase";
import { useOnboarding } from "@/hooks/useOnboarding";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileExtras {
  periodDuration: number; // 3-7 days, default 5
}

export interface ProfileData {
  // Personal
  name: string;
  dob: string;           // ISO date string from registration
  age: number;           // computed from DOB, auto-advances
  mobile: string;
  email: string;

  // Location
  state: string;
  district: string;
  village: string;
  pincode: string;

  // Body metrics
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bmiCategory: string;

  // Cycle (puberty / family-planning)
  cycleLength: number | null;
  lastPeriodDate: string;
  periodDuration: number; // default 5

  // Health
  haemoglobin: string;
  knownConditions: string;
  lifeStage: string;

  // Meta
  registeredAt: string;
  isProfileAvailable: boolean;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const EXTRAS_KEY = "ss-profile-extras";
const WELLNESS_KEY = "ss-wellness-profile";

function readExtras(): ProfileExtras {
  try {
    const raw = localStorage.getItem(EXTRAS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        periodDuration: parsed.periodDuration ?? 5,
      };
    }
  } catch {}
  return { periodDuration: 5 };
}

function writeExtras(extras: ProfileExtras) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));
  } catch {}
}

function readWellnessProfile(): { weight: number; height: number; region: string } | null {
  try {
    const raw = localStorage.getItem(WELLNESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.weight && parsed.height) return parsed;
    }
  } catch {}
  return null;
}

function writeWellnessProfile(data: { weight: number; height: number; region: string }) {
  try {
    localStorage.setItem(WELLNESS_KEY, JSON.stringify(data));
  } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeAgeFromDOB(dob: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
}

function computeBMI(weight: number | null, height: number | null): number | null {
  if (!weight || !height || height < 50) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

function getBMICategory(bmi: number | null): string {
  if (bmi === null) return "N/A";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useProfile() {
  const { fullProfile } = useAuth();
  const { phase } = usePhase();
  const { config } = useOnboarding();

  const [extras, setExtras] = useState<ProfileExtras>(() => readExtras());
  const [wellnessProfile, setWellnessProfile] = useState(() => readWellnessProfile());

  const profile = useMemo<ProfileData>(() => {
    const basic = fullProfile?.basic;
    const loc = fullProfile?.location;
    const health = fullProfile?.health;

    const name = basic?.fullName ?? "";
    const dob = basic?.dob ?? "";
    const ageFromDOB = computeAgeFromDOB(dob);
    const age = ageFromDOB ?? (basic?.age ? parseInt(basic.age, 10) : 0);
    const mobile = basic?.mobile ?? "";
    const email = basic?.email ?? "";

    const state = loc?.state ?? "";
    const district = loc?.district ?? "";
    const village = loc?.village ?? "";
    const pincode = loc?.pincode ?? "";

    const weight = wellnessProfile?.weight ?? null;
    const height = wellnessProfile?.height ?? null;
    const bmi = computeBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    const cycleLength = health?.cycleLength ? parseInt(health.cycleLength, 10) : (config.age ? null : null);
    const lastPeriodDate = health?.lastPeriodDate ?? "";
    const periodDuration = extras.periodDuration;

    const haemoglobin = health?.haemoglobin ?? "";
    const knownConditions = health?.knownConditions ?? "";
    const lifeStage = health?.lifeStage ?? phase;

    const registeredAt = fullProfile?.registeredAt ?? "";

    return {
      name,
      dob,
      age,
      mobile,
      email,
      state,
      district,
      village,
      pincode,
      weight,
      height,
      bmi,
      bmiCategory,
      cycleLength,
      lastPeriodDate,
      periodDuration,
      haemoglobin,
      knownConditions,
      lifeStage,
      registeredAt,
      isProfileAvailable: !!name,
    };
  }, [fullProfile, wellnessProfile, extras, phase, config]);

  const updateWeight = useCallback((kg: number) => {
    const current = readWellnessProfile();
    const updated = {
      weight: kg,
      height: current?.height ?? 160,
      region: current?.region ?? "south",
    };
    writeWellnessProfile(updated);
    setWellnessProfile(updated);
  }, []);

  const updateHeight = useCallback((cm: number) => {
    const current = readWellnessProfile();
    const updated = {
      weight: current?.weight ?? 55,
      height: cm,
      region: current?.region ?? "south",
    };
    writeWellnessProfile(updated);
    setWellnessProfile(updated);
  }, []);

  const updatePeriodDuration = useCallback((days: number) => {
    const clamped = Math.max(3, Math.min(7, days));
    const updated = { ...extras, periodDuration: clamped };
    writeExtras(updated);
    setExtras(updated);
  }, [extras]);

  return {
    profile,
    updateWeight,
    updateHeight,
    updatePeriodDuration,
  };
}
