import { useMemo } from "react";
import { useHealthLog, type HealthLogEntry, type MaternityEntry } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";

export interface HealthSignals {
  avgSleepHours: number | null;
  poorSleepFrequency: number;
  fatigueFrequency: number;
  headacheFrequency: number;
  hydrationLowFrequency: number;
  lowEnergyFrequency: number;
  stressFrequency: number;
  moodLowFrequency: number;
  activitySignal: number;
  recoveryDemand: number;
  weightTrend: "down" | "stable" | "up";
}

function latestEntries(entries: [string, HealthLogEntry][], count: number): [string, HealthLogEntry][] {
  return [...entries].sort((a, b) => b[0].localeCompare(a[0])).slice(0, count);
}

function sleepIsPoor(entry: HealthLogEntry): boolean {
  if (entry.sleepQuality === "Poor") return true;
  return entry.sleepHours !== null && entry.sleepHours < 6;
}

function hasSymptom(entry: HealthLogEntry, keys: string[]): boolean {
  const symptoms = (entry as any).symptoms ?? {};
  return keys.some((key) => Boolean(symptoms[key]));
}

export function useHealthSignals(): HealthSignals {
  const { getPhaseLogs } = useHealthLog();
  const { phase } = usePhase();

  return useMemo(() => {
    const logs = getPhaseLogs(phase);
    const rows = latestEntries(Object.entries(logs), 14);
    const total = Math.max(rows.length, 1);

    let sleepSum = 0;
    let sleepCount = 0;
    let poorSleep = 0;
    let fatigue = 0;
    let headache = 0;
    let hydrationLow = 0;
    let lowEnergy = 0;
    let stress = 0;
    let moodLow = 0;

    for (const [, entry] of rows) {
      if (entry.sleepHours !== null) {
        sleepCount += 1;
        sleepSum += entry.sleepHours;
      }
      if (sleepIsPoor(entry)) poorSleep += 1;
      if (hasSymptom(entry, ["fatigue"])) fatigue += 1;
      if (hasSymptom(entry, ["headache"])) headache += 1;
      if (hasSymptom(entry, ["stress"])) stress += 1;
      if (entry.mood === "Low") moodLow += 1;

      if (entry.phase === "maternity") {
        const m = entry as MaternityEntry;
        if ((m.hydrationGlasses ?? 0) < 6 || hasSymptom(entry, ["dizziness"])) hydrationLow += 1;
        if (m.fatigueLevel === "High" || m.fatigueLevel === "Medium") lowEnergy += 1;
      } else {
        if (hasSymptom(entry, ["sleepDisturbance", "sleepIssues", "dizziness"])) hydrationLow += 1;
        if (hasSymptom(entry, ["fatigue", "moodSwings", "moodChanges"])) lowEnergy += 1;
      }
    }

    const activitySignal = Math.min(1, rows.length / 10);
    const recoveryDemand = Math.min(1, poorSleep / total + fatigue / total * 0.9 + stress / total * 0.7);

    return {
      avgSleepHours: sleepCount ? Number((sleepSum / sleepCount).toFixed(1)) : null,
      poorSleepFrequency: poorSleep / total,
      fatigueFrequency: fatigue / total,
      headacheFrequency: headache / total,
      hydrationLowFrequency: hydrationLow / total,
      lowEnergyFrequency: lowEnergy / total,
      stressFrequency: stress / total,
      moodLowFrequency: moodLow / total,
      activitySignal,
      recoveryDemand,
      weightTrend: "stable",
    };
  }, [getPhaseLogs, phase]);
}
