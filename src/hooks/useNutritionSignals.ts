import { useMemo } from "react";
import { calculateNutritionSignals, type NutritionSignalInput } from "@/services/nutritionSignalEngine";
import { useHealthSignals } from "@/hooks/useHealthSignals";
import { useProfileDerivedStats } from "@/hooks/useProfileDerivedStats";

export function useNutritionSignals() {
  const healthSignals = useHealthSignals();
  const profile = useProfileDerivedStats();

  const signals = useMemo(() => {
    const input: NutritionSignalInput = {
      hydration: 1 - healthSignals.hydrationLowFrequency,
      sleepQuality: 1 - healthSignals.poorSleepFrequency,
      stressLevel: healthSignals.stressFrequency,
      activityConsistency: healthSignals.activitySignal,
      dietaryVariety: 0.6, // This would come from food logs in a real implementation
    };

    return calculateNutritionSignals(input);
  }, [healthSignals, profile]);

  return signals;
}
