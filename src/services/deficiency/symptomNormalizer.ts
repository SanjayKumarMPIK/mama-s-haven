import type { Phase } from "@/hooks/usePhase";
import type { NormalizedSymptom } from "./types";

const SYMPTOM_ALIASES: Record<string, string> = {
  moodChanges: "moodSwings",
  sleepDisturbance: "sleepIssues",
  sleepDeprivation: "sleepIssues",
  sleepDifficulty: "sleepIssues",
  lowEnergy: "fatigue",
  tiredness: "fatigue",
  exhaustion: "fatigue",
  lethargy: "fatigue",
  foodCravings: "appetiteChanges",
  cravings: "appetiteChanges",
  increasedAppetite: "appetiteChanges",
  irritability: "moodSwings",
  poorSleep: "sleepIssues",
  insomnia: "sleepIssues",
  troubleSleeping: "sleepIssues",
  hairChanges: "hairThinning",
  growthPain: "bonePain",
  migraines: "headache",
  muscleCramps: "cramps",
  legCramps: "cramps",
  memoryIssues: "brainFog",
  forgetfulness: "brainFog",
  palpitations: "heartPalpitations",
  hotFlashes: "hotFlashes",
  nightSweats: "nightSweats",
};

export function normalizeSymptomId(rawId: string): string {
  return SYMPTOM_ALIASES[rawId] ?? rawId;
}

export function extractSymptomsFromEntry(entry: any, date: string, phase: Phase): string[] {
  const rawSymptoms = entry.symptoms as Record<string, boolean> | undefined;
  if (!rawSymptoms) return [];

  const result: string[] = [];
  for (const [symptomId, present] of Object.entries(rawSymptoms)) {
    if (present) {
      result.push(normalizeSymptomId(symptomId));
    }
  }
  return result;
}

const SEVERITY_MAP: Record<string, "mild" | "moderate" | "severe"> = {
  mild: "mild",
  moderate: "moderate",
  severe: "severe",
};

export function extractSeverity(entry: any, symptomId: string): "mild" | "moderate" | "severe" | undefined {
  const sevs = entry.symptomSeverities as Record<string, string> | undefined;
  if (sevs?.[symptomId]) {
    return SEVERITY_MAP[sevs[symptomId]];
  }
  return undefined;
}

export function collectNormalizedSymptoms(logs: Record<string, any>, phase: Phase): NormalizedSymptom[] {
  const results: NormalizedSymptom[] = [];

  for (const [date, entry] of Object.entries(logs)) {
    const matched = phase === "postpartum"
      ? entry.phase === "maternity" && (entry.maternityStage === "postpartum" || entry.maternityStage === undefined)
      : entry.phase === phase;

    if (!matched) continue;

    const canonicalIds = extractSymptomsFromEntry(entry, date, phase);
    for (const canonicalId of canonicalIds) {
      results.push({
        canonicalId,
        originalId: canonicalId,
        date,
        severity: extractSeverity(entry, canonicalId),
        source: "healthLog",
        phase,
      });
    }
  }

  return results;
}
