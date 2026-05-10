import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { aggregateSymptoms } from "@/services/deficiency/symptomAggregator";
import { computeDeficiencyInsights } from "@/services/deficiency/deficiencyEngine";
import type { ComputedDeficiencyInsights } from "@/services/deficiency/types";

export function useDeficiencyInsights(): ComputedDeficiencyInsights {
  const { logs } = useHealthLog();
  const { phase } = usePhase();

  return useMemo(() => {
    const aggregated = aggregateSymptoms(logs, phase, 30);

    const entries = Object.values(logs);
    const moodValues: number[] = [];
    let sleepSum = 0;
    let sleepCount = 0;
    const dateSet = new Set<string>();

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

    return computeDeficiencyInsights(
      aggregated,
      phase,
      avgSleep,
      avgMood,
      Object.keys(logs).length
    );
  }, [logs, phase]);
}
