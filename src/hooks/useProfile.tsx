import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePhase } from "@/hooks/usePhase";
import { useOnboarding } from "@/hooks/useOnboarding";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProfileExtras {
  periodDuration: number; // 3-7 days, default 5
  cycleLength: number;    // 21-35 days, default 28
}

export interface ProfileData {
  // Personal
  name: string;
  dob: string;           // ISO date string from registration
  age: number;           // computed from DOB, auto-advances
  mobile: string;
  email: string;
  bloodGroup: string;

  // Location
  region: "north" | "south" | "east" | "west";

  // Body metrics
  weight: number | null;
  height: number | null;
  bmi: number | null;
  bmiCategory: string;

  // Cycle (puberty / family-planning)
  cycleLength: number | null;
  lastPeriodDate: string;
  periodDuration: number; // default 5
  menarcheDate: string | null; // Date of first period

  // Health
  haemoglobin: string;
  knownConditions: string;
  medicalConditions: string[];
  dietType: "veg" | "non-veg" | "mixed" | "eggetarian";
  lifeStage: string;

  // Lifestyle (nutrition engine inputs)
  activityLevel: "sedentary" | "moderate" | "active";
  climate: "hot" | "moderate" | "cold";

  // Meta
  registeredAt: string;
  isProfileAvailable: boolean;
  lastWeightUpdate: number | null; // epoch ms of last weight save
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
        cycleLength: parsed.cycleLength ?? 28,
      };
    }
  } catch {}
  return { periodDuration: 5, cycleLength: 28 };
}

function writeExtras(extras: ProfileExtras) {
  try {
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(extras));
  } catch {}
}

function readWellnessProfile(): { weight: number; height: number; region: string; lastWeightUpdate?: number; activityLevel?: string; climate?: string } | null {
  try {
    const raw = localStorage.getItem(WELLNESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.weight && parsed.height) return parsed;
    }
  } catch {}
  return null;
}

function writeWellnessProfile(data: { weight: number; height: number; region: string; lastWeightUpdate?: number; activityLevel?: string; climate?: string }) {
  try {
    localStorage.setItem(WELLNESS_KEY, JSON.stringify({ ...data, lastWeightUpdate: Date.now() }));
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
  const { fullProfile, updateProfile } = useAuth();
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
    const bloodGroup = basic?.bloodGroup ?? "";

    const region = (loc?.region ?? "north") as "north" | "south" | "east" | "west";

    const weight = wellnessProfile?.weight ?? null;
    const height = wellnessProfile?.height ?? null;
    const bmi = computeBMI(weight, height);
    const bmiCategory = getBMICategory(bmi);

    const cycleLength = extras.cycleLength ?? (health?.cycleLength ? parseInt(health.cycleLength, 10) : 28);
    const lastPeriodDate = health?.lastPeriodDate ?? "";
    const periodDuration = extras.periodDuration;
    const menarcheDate = (health as any)?.menarcheDate ?? null;

    const haemoglobin = health?.haemoglobin ?? "";
    const knownConditions = health?.knownConditions ?? "";
    const medicalConditions = health?.medicalConditions ?? [];
    const dietType = (health?.dietType ?? "mixed") as ProfileData["dietType"];
    const lifeStage = health?.lifeStage ?? phase;

    const activityLevel = (wellnessProfile?.activityLevel ?? "moderate") as ProfileData["activityLevel"];
    const climate = (wellnessProfile?.climate ?? "hot") as ProfileData["climate"];

    const registeredAt = fullProfile?.registeredAt ?? "";

    return {
      name,
      dob,
      age,
      mobile,
      email,
      bloodGroup,
      region,
      weight,
      height,
      bmi,
      bmiCategory,
      cycleLength,
      lastPeriodDate,
      periodDuration,
      menarcheDate,
      haemoglobin,
      knownConditions,
      medicalConditions,
      dietType,
      lifeStage,
      activityLevel,
      climate,
      registeredAt,
      isProfileAvailable: !!name,
      lastWeightUpdate: wellnessProfile?.lastWeightUpdate ?? null,
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

  const updateCycleConfig = useCallback((days: number, cycle: number) => {
    const clampedDur = Math.max(1, Math.min(10, days));
    const clampedCycle = Math.max(15, Math.min(45, cycle));
    const updated = { ...extras, periodDuration: clampedDur, cycleLength: clampedCycle };
    writeExtras(updated);
    setExtras(updated);
  }, [extras]);

  const updatePersonalInfo = useCallback((updates: { dob?: string; bloodGroup?: string; medicalConditions?: string[]; region?: "north" | "south" | "east" | "west"; menarcheDate?: string | null }) => {
    updateProfile((prev) => {
      const dob = updates.dob ?? prev.basic.dob;
      const age = computeAgeFromDOB(dob);
      const medicalConditions = updates.medicalConditions ?? prev.health.medicalConditions ?? [];
      const region = updates.region ?? prev.location.region ?? "north";
      const currentWellness = readWellnessProfile();
      writeWellnessProfile({
        weight: currentWellness?.weight ?? 55,
        height: currentWellness?.height ?? 160,
        region,
      });
      setWellnessProfile(readWellnessProfile());
      return {
        ...prev,
        basic: {
          ...prev.basic,
          dob,
          age: age !== null ? String(age) : prev.basic.age,
          bloodGroup: updates.bloodGroup ?? prev.basic.bloodGroup,
        },
        health: {
          ...prev.health,
          medicalConditions,
          knownConditions: medicalConditions.length > 0 ? medicalConditions.join(", ") : prev.health.knownConditions,
          menarcheDate: updates.menarcheDate ?? prev.health.menarcheDate,
        },
        location: {
          ...prev.location,
          region,
        },
      };
    });
  }, [updateProfile]);

  const updateLifestyle = useCallback((updates: { activityLevel?: ProfileData["activityLevel"]; climate?: ProfileData["climate"] }) => {
    const current = readWellnessProfile();
    const updated = {
      weight: current?.weight ?? 55,
      height: current?.height ?? 160,
      region: current?.region ?? "south",
      activityLevel: updates.activityLevel ?? current?.activityLevel ?? "moderate",
      climate: updates.climate ?? current?.climate ?? "hot",
    };
    writeWellnessProfile(updated);
    setWellnessProfile(updated);
  }, []);

  return {
    profile,
    updateWeight,
    updateHeight,
    updateCycleConfig,
    updatePersonalInfo,
    updateLifestyle,
  };
}
