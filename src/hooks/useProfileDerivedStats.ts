import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useProfile } from "@/hooks/useProfile";
import type { BiologicalSex } from "@/services/bodyMetricsService";
import type { FitnessActivityLevel, GoalPreference } from "@/services/fitnessCalculatorService";

interface ProfileDerivedStats {
  age: number;
  heightCm: number;
  weightKg: number;
  sex: BiologicalSex;
  activityLevel: FitnessActivityLevel;
  goalPreference: GoalPreference;
  phase: "puberty" | "maternity" | "postpartum" | "menopause" | "family-planning";
  climate: "cool" | "temperate" | "hot-humid";
  region: string;
}

function inferActivityLevel(goals: string[], phase: string): FitnessActivityLevel {
  const list = goals.join(" ").toLowerCase();
  if (list.includes("gain") || list.includes("baby_development") || list.includes("track_pregnancy")) return "moderate";
  if (list.includes("avoid") || list.includes("learn") || phase === "menopause") return "light";
  return "moderate";
}

function inferGoalPreference(goals: string[]): GoalPreference {
  const list = goals.join(" ").toLowerCase();
  if (list.includes("gain") || list.includes("development")) return "gain-muscle";
  if (list.includes("avoid") || list.includes("manage")) return "lose-weight";
  if (list.includes("health_nutrition") || list.includes("stay")) return "stay-healthy";
  return "maintain";
}

function regionToClimate(region: string): ProfileDerivedStats["climate"] {
  if (region === "south" || region === "east") return "hot-humid";
  if (region === "north") return "temperate";
  return "cool";
}

export function useProfileDerivedStats(): ProfileDerivedStats {
  const { profile } = useProfile();
  const { fullProfile } = useAuth();
  const { config } = useOnboarding();
  const { phase } = usePhase();
  const { mode } = usePregnancyProfile();

  return useMemo(() => {
    const rawGender = String((fullProfile as any)?.basic?.gender ?? "female").toLowerCase();
    const sex: BiologicalSex = rawGender.includes("male") && !rawGender.includes("female") ? "male" : "female";
    const mappedPhase: ProfileDerivedStats["phase"] = phase === "maternity" && mode === "postpartum" ? "postpartum" : phase;
    const goals = (config.goals ?? []).map(String);

    return {
      age: profile.age || 28,
      heightCm: profile.height ?? 160,
      weightKg: profile.weight ?? 60,
      sex,
      activityLevel: inferActivityLevel(goals, mappedPhase),
      goalPreference: inferGoalPreference(goals),
      phase: mappedPhase,
      climate: regionToClimate(profile.region),
      region: profile.region,
    };
  }, [config.goals, fullProfile, mode, phase, profile.age, profile.height, profile.region, profile.weight]);
}
