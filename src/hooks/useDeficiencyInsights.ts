import { useMemo } from "react";
import { calculateDeficiencyInsights, type DeficiencyInsightInput } from "@/services/deficiencyInsightEngine";
import { useProfileDerivedStats } from "@/hooks/useProfileDerivedStats";
import { useHealthSignals } from "@/hooks/useHealthSignals";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

export function useDeficiencyInsights() {
  const profile = useProfileDerivedStats();
  const healthSignals = useHealthSignals();
  const { phase } = usePhase();
  const pregnancyProfile = usePregnancyProfile();

  const insights = useMemo(() => {
    const input: DeficiencyInsightInput = {
      phase: phase as any,
      age: profile.age,
      gender: profile.sex,
      pregnancyWeek: pregnancyProfile.currentWeek,
      trimester: pregnancyProfile.trimester,
      symptoms: {
        fatigue: healthSignals.fatigueFrequency,
        headaches: healthSignals.headacheFrequency,
        dizziness: 0,
        hairFall: 0,
        paleSkin: 0,
        moodSwings: healthSignals.moodLowFrequency,
        poorSleep: healthSignals.poorSleepFrequency,
        cramps: 0,
        lowEnergy: healthSignals.lowEnergyFrequency,
        drySkin: 0,
        weakness: 0,
        brainFog: 0,
        cravings: 0,
        brittleNails: 0,
        muscleWeakness: 0,
        bonePain: 0,
        heavyPeriod: 0,
        lowOutdoorActivity: 0,
      },
    };

    return calculateDeficiencyInsights(input);
  }, [phase, profile, healthSignals, pregnancyProfile]);

  return insights;
}
