/**
 * useDeficiencyInsights.ts
 *
 * React hook that connects health log data to the deficiency scoring engine.
 * Returns both the new DeficiencyAnalysis AND the legacy ComputedDeficiencyInsights
 * for backward compatibility with existing components.
 */

import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { aggregateSymptoms } from "@/services/deficiency/symptomAggregator";
import { computeDeficiencyAnalysis, type DeficiencyAnalysis } from "@/services/deficiency/deficiencyRulesEngine";
import { computeDeficiencyInsights } from "@/services/deficiency/deficiencyEngine";
import type { ComputedDeficiencyInsights } from "@/services/deficiency/types";

/**
 * Combined return type — provides both the new analysis engine results
 * and the legacy insights format for backward compatibility.
 */
export interface DeficiencyInsightsResult extends ComputedDeficiencyInsights {
  /** New 8-step scoring engine results */
  analysis: DeficiencyAnalysis;
}

export function useDeficiencyInsights(): DeficiencyInsightsResult {
  const { logs } = useHealthLog();
  const { phase } = usePhase();
  const { trimester, mode } = usePregnancyProfile();

  return useMemo(() => {
    const aggregated = aggregateSymptoms(logs, phase, 30);

    const entries = Object.values(logs);
    const moodValues: number[] = [];
    let sleepSum = 0;
    let sleepCount = 0;

    for (const entry of entries) {
      const e = entry as any;
      if (e.mood === "Good") moodValues.push(3);
      else if (e.mood === "Okay") moodValues.push(2);
      else if (e.mood === "Low") moodValues.push(1);
      if (typeof e.sleepHours === "number") {
        sleepSum += e.sleepHours;
        sleepCount++;
      }
    }

    const avgMood = moodValues.length > 0
      ? moodValues.reduce((a, b) => a + b, 0) / moodValues.length
      : null;

    const avgSleep = sleepCount > 0 ? sleepSum / sleepCount : null;

    // Legacy insights (for backward compat with DeficiencyInsightsSection etc.)
    const legacyInsights = computeDeficiencyInsights(
      aggregated,
      phase,
      avgSleep,
      avgMood,
      Object.keys(logs).length
    );

    // New 8-step engine
    const analysis = computeDeficiencyAnalysis(
      aggregated,
      phase === "maternity" ? (trimester ?? null) : null,
      phase === "maternity" ? (mode ?? null) : null,
      Object.keys(logs).length
    );

    return {
      ...legacyInsights,
      analysis,
    };
  }, [logs, phase, trimester, mode]);
}
