import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";
import type { CanonicalSymptom } from "./maternitySymptomNormalizer";
import { normalizeSymptomMap } from "./maternitySymptomNormalizer";

export interface CollectedMaternityData {
  phase: "maternity";
  trimester: number | undefined;
  logs: HealthLogs;
  maternityLogs: Record<string, MaternityEntry>;
  rawSymptomFrequencies: Record<string, number>;
  normalizedSymptomFrequencies: Record<CanonicalSymptom, number>;
  avgSleepHours: number | null;
  avgMoodScore: number | null;
  loggedDays: number;
  windowDays: number;
}

type FatigueLevel = "Low" | "Medium" | "High";
type MoodType = "Good" | "Okay" | "Low";

function collectCalendarDerivedSymptoms(
  entries: [string, MaternityEntry][]
): { symptomFreq: Record<string, number>; sleepSamples: number[]; moodSamples: number[] } {
  const symptomFreq: Record<string, number> = {};
  const sleepSamples: number[] = [];
  const moodSamples: number[] = [];

  for (const [, entry] of entries) {
    if (entry.symptoms) {
      for (const [key, val] of Object.entries(entry.symptoms)) {
        if (val) symptomFreq[key] = (symptomFreq[key] ?? 0) + 1;
      }
    }

    if (entry.sleepHours !== null && entry.sleepHours !== undefined) {
      sleepSamples.push(entry.sleepHours);
    }

    if (entry.mood) {
      moodSamples.push(entry.mood === "Good" ? 3 : entry.mood === "Okay" ? 2 : 1);
    }

    if (entry.fatigueLevel === "High" || entry.fatigueLevel === "Medium") {
      symptomFreq["fatigue"] = (symptomFreq["fatigue"] ?? 0) + 1;
    }

    if (entry.sleepHours !== null && entry.sleepHours < 6) {
      symptomFreq["poorSleep"] = (symptomFreq["poorSleep"] ?? 0) + 1;
    }

    if (entry.mood === "Low") {
      symptomFreq["moodSwings"] = (symptomFreq["moodSwings"] ?? 0) + 1;
    }
  }

  return { symptomFreq, sleepSamples, moodSamples };
}

export function collectMaternityData(
  logs: HealthLogs,
  trimester: number | undefined,
  windowDays: number = 14
): CollectedMaternityData {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffISO = cutoff.toISOString().slice(0, 10);

  const maternityLogs: Record<string, MaternityEntry> = {};
  const windowEntries: [string, MaternityEntry][] = [];

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "maternity") continue;
    const mEntry = entry as MaternityEntry;
    maternityLogs[dateISO] = mEntry;
    if (dateISO >= cutoffISO) {
      windowEntries.push([dateISO, mEntry]);
    }
  }

  const { symptomFreq, sleepSamples, moodSamples } = collectCalendarDerivedSymptoms(windowEntries);

  const total = Math.max(windowEntries.length, 1);
  const rawSymptomFrequencies: Record<string, number> = {};
  for (const [key, count] of Object.entries(symptomFreq)) {
    rawSymptomFrequencies[key] = count / total;
  }

  const normalizedSymptomFrequencies = normalizeSymptomMap(rawSymptomFrequencies);

  const avgSleepHours = sleepSamples.length > 0
    ? Number((sleepSamples.reduce((a, b) => a + b, 0) / sleepSamples.length).toFixed(1))
    : null;

  const avgMoodScore = moodSamples.length > 0
    ? Number((moodSamples.reduce((a, b) => a + b, 0) / moodSamples.length).toFixed(1))
    : null;

  return {
    phase: "maternity",
    trimester,
    logs,
    maternityLogs,
    rawSymptomFrequencies,
    normalizedSymptomFrequencies,
    avgSleepHours,
    avgMoodScore,
    loggedDays: windowEntries.length,
    windowDays,
  };
}
