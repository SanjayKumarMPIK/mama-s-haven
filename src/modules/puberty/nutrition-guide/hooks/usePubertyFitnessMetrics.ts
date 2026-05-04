import { useMemo } from "react";
import { calculateFitnessRequirements } from "../services/pubertyFitnessCalculatorService";
import { useHealthSignals } from "@/hooks/useHealthSignals";
import { useProfileDerivedStats } from "@/hooks/useProfileDerivedStats";

export function usePubertyFitnessMetrics() {
  const profile = useProfileDerivedStats();
  const healthSignals = useHealthSignals();

  const metrics = useMemo(
    () =>
      calculateFitnessRequirements({
        age: profile.age,
        heightCm: profile.heightCm,
        weightKg: profile.weightKg,
        sex: profile.sex,
        activityLevel: profile.activityLevel,
        goalPreference: profile.goalPreference,
        phase: profile.phase,
        climate: profile.climate,
        weightTrend: healthSignals.weightTrend,
        healthSignals,
      }),
    [healthSignals, profile],
  );

  return { metrics, profile, healthSignals };
}
