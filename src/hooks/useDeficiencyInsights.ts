import { useMemo } from "react";
import { calculateDeficiencyInsights, type DeficiencyInsightInput } from "@/services/deficiencyInsightEngine";
import { useProfileDerivedStats } from "@/hooks/useProfileDerivedStats";
import { useHealthSignals } from "@/hooks/useHealthSignals";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useHealthLog, type MaternityEntry } from "@/hooks/useHealthLog";
import { getDeficiencyPhase, getEffectiveTrimester } from "@/lib/maternityLifecycleResolver";

/**
 * Compute symptom frequency (0–1) from maternity calendar entries.
 * Scans the last `window` days of maternity logs for the given symptom keys.
 */
function computeMaternitySymptomFrequencies(
  logs: Record<string, any>,
  window: number = 14
): Record<string, number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - window);

  const entries = Object.entries(logs)
    .filter(([dateISO]) => new Date(dateISO) >= cutoff)
    .map(([, entry]) => entry as MaternityEntry);

  const total = Math.max(entries.length, 1);
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    if (!entry.symptoms) continue;
    for (const [key, value] of Object.entries(entry.symptoms)) {
      if (value) {
        counts[key] = (counts[key] || 0) + 1;
      }
    }

    // Also count severity-based signals
    if (entry.fatigueLevel === "High") {
      counts["_highFatigue"] = (counts["_highFatigue"] || 0) + 1;
    }
    if (entry.hydrationGlasses !== null && entry.hydrationGlasses < 6) {
      counts["_lowHydration"] = (counts["_lowHydration"] || 0) + 1;
    }
    if (entry.sleepHours !== null && entry.sleepHours < 6) {
      counts["_poorSleep"] = (counts["_poorSleep"] || 0) + 1;
    }
    if (entry.mood === "Low") {
      counts["_moodLow"] = (counts["_moodLow"] || 0) + 1;
    }
  }

  const freq: Record<string, number> = {};
  for (const [key, count] of Object.entries(counts)) {
    freq[key] = count / total;
  }
  return freq;
}

export function useDeficiencyInsights() {
  const profile = useProfileDerivedStats();
  const healthSignals = useHealthSignals();
  const { phase } = usePhase();
  const pregnancyProfile = usePregnancyProfile();
  const { getPhaseLogs } = useHealthLog();

  const insights = useMemo(() => {
    // For maternity, compute symptom frequencies directly from calendar logs
    const maternityLogs = getPhaseLogs("maternity");
    const sf = computeMaternitySymptomFrequencies(maternityLogs, 14);

    // Helper: pick the max of existing healthSignal value and calendar-derived value
    const pick = (calendarKeys: string[], fallback: number = 0): number => {
      let max = fallback;
      for (const key of calendarKeys) {
        if ((sf[key] ?? 0) > max) max = sf[key];
      }
      return max;
    };

    // Use lifecycle-aware phase and trimester to prevent postpartum/premature
    // from inheriting stale 3rd trimester data
    const effectivePhase = phase === "maternity"
      ? getDeficiencyPhase(pregnancyProfile.mode)
      : phase;
    const effectiveTrimester = phase === "maternity"
      ? getEffectiveTrimester(pregnancyProfile.mode, pregnancyProfile.trimester)
      : undefined;

    const input: DeficiencyInsightInput = {
      phase: effectivePhase as any,
      age: profile.age,
      gender: profile.sex,
      pregnancyWeek: pregnancyProfile.currentWeek,
      trimester: effectiveTrimester,
      symptoms: {
        fatigue: Math.max(healthSignals.fatigueFrequency, pick(["fatigue"])),
        headaches: Math.max(healthSignals.headacheFrequency, pick(["headache", "headaches"])),
        dizziness: pick(["dizziness", "lightheadedness"]),
        hairFall: pick(["hairFall", "hairLoss"]),
        paleSkin: pick(["paleSkin", "_lowHydration"]) * 0.5, // low hydration as mild proxy
        moodSwings: Math.max(healthSignals.moodLowFrequency, pick(["moodSwings", "moodChanges", "_moodLow"])),
        poorSleep: Math.max(healthSignals.poorSleepFrequency, pick(["sleepDisturbance", "sleepIssues", "_poorSleep"])),
        cramps: pick(["cramps", "backPain", "legCramps", "abdominalPain"]),
        lowEnergy: Math.max(healthSignals.lowEnergyFrequency, pick(["lowEnergy", "_highFatigue"])),
        drySkin: pick(["drySkin"]),
        weakness: pick(["weakness", "_highFatigue"]) * 0.8,
        brainFog: pick(["brainFog", "confusion", "forgetfulness"]),
        cravings: pick(["cravings", "foodCravings"]),
        brittleNails: pick(["brittleNails"]),
        muscleWeakness: pick(["muscleWeakness", "legCramps", "muscleAches"]),
        bonePain: pick(["bonePain", "jointPain"]),
        heavyPeriod: 0, // not applicable for maternity
        lowOutdoorActivity: 0,
      },
    };

    return calculateDeficiencyInsights(input);
  }, [phase, profile, healthSignals, pregnancyProfile, getPhaseLogs]);

  return insights;
}
