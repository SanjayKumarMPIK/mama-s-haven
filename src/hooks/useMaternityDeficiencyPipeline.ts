import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { computeMaternityDeficiencyPipeline, type ComputedMaternityInsights } from "@/services/maternityDeficiencyPipeline";
import { getEffectiveTrimester } from "@/lib/maternityLifecycleResolver";

const EMPTY_INSIGHTS: ComputedMaternityInsights = {
  hasData: false,
  deficiencyScore: 0,
  overallSeverity: "Low",
  riskCounts: { high: 0, moderate: 0, low: 0, good: 0 },
  deficiencies: [],
  topDeficiencies: [],
  recommendations: [],
  nutrients: [],
  foods: [],
  charts: { nutrientProbabilities: [], riskDistribution: [] },
  summary: {
    priorityNutrient: null,
    energyImpact: "Low",
    likelyDeficiencies: 0,
    frequentSymptoms: [],
    avgSleepHours: null,
    avgMoodScore: null,
    loggedDays: 0,
  },
  priorityNutrient: null,
  energyImpact: "Low",
  normalizedSymptoms: {},
  frequentSymptoms: [],
  lastUpdated: Date.now(),
  phase: "maternity",
  trimester: undefined,
  collectedData: null as any,
};

export function useMaternityDeficiencyPipeline(): ComputedMaternityInsights {
  const { getPhaseLogs } = useHealthLog();
  const { phase } = usePhase();
  const pregnancyProfile = usePregnancyProfile();

  const insights = useMemo(() => {
    if (phase !== "maternity") return EMPTY_INSIGHTS;

    const logs = getPhaseLogs("maternity");
    const effectiveTrimester = getEffectiveTrimester(
      pregnancyProfile.mode,
      pregnancyProfile.trimester
    );

    return computeMaternityDeficiencyPipeline(logs, effectiveTrimester);
  }, [
    phase,
    getPhaseLogs,
    pregnancyProfile.mode,
    pregnancyProfile.trimester,
  ]);

  return insights;
}
