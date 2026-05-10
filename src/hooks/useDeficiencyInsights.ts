import { useMemo } from "react";
import { useMaternityDeficiencyPipeline } from "@/hooks/useMaternityDeficiencyPipeline";
import type { DeficiencyInsightOutput } from "@/services/deficiencyInsightEngine";

export function useDeficiencyInsights(): DeficiencyInsightOutput {
  const pipeline = useMaternityDeficiencyPipeline();

  return useMemo(() => {
    if (!pipeline.hasData) {
      return {
        overallRiskScore: 0,
        overallSeverity: "Low" as const,
        nutrientRisks: [],
        topDeficiencies: [],
        riskCounts: { high: 0, moderate: 0, low: 0, good: 0 },
        priorityNutrient: null,
        energyImpact: "Low" as const,
      };
    }

    return {
      overallRiskScore: pipeline.deficiencyScore,
      overallSeverity: pipeline.overallSeverity as any,
      nutrientRisks: pipeline.nutrients,
      topDeficiencies: pipeline.topDeficiencies,
      riskCounts: pipeline.riskCounts,
      priorityNutrient: pipeline.priorityNutrient,
      energyImpact: pipeline.energyImpact as any,
    };
  }, [pipeline]);
}
