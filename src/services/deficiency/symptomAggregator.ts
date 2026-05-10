import type { Phase } from "@/hooks/usePhase";
import type { NormalizedSymptom, AggregatedSymptom } from "./types";
import { collectNormalizedSymptoms } from "./symptomNormalizer";

const SYMPTOM_META: Record<string, { label: string; emoji: string }> = {
  fatigue: { label: "Fatigue", emoji: "😴" },
  dizziness: { label: "Dizziness", emoji: "💫" },
  weakness: { label: "Weakness", emoji: "🫠" },
  moodSwings: { label: "Mood Swings", emoji: "🎭" },
  anxiety: { label: "Anxiety", emoji: "😰" },
  brainFog: { label: "Brain Fog", emoji: "🌫️" },
  sleepIssues: { label: "Sleep Issues", emoji: "🌙" },
  backPain: { label: "Back Pain", emoji: "🔙" },
  headache: { label: "Headache", emoji: "🤕" },
  appetiteChanges: { label: "Appetite Changes", emoji: "🍽️" },
  bloating: { label: "Bloating", emoji: "🫧" },
  constipation: { label: "Constipation", emoji: "😣" },
  swelling: { label: "Swelling", emoji: "🦶" },
  cramps: { label: "Cramps", emoji: "😖" },
  acne: { label: "Acne", emoji: "😤" },
  breastTenderness: { label: "Breast Tenderness", emoji: "💗" },
  heavyPeriod: { label: "Heavy Period", emoji: "🩸" },
  irregularCycle: { label: "Irregular Cycle", emoji: "📅" },
  hairThinning: { label: "Hair Thinning", emoji: "💇" },
  nausea: { label: "Nausea", emoji: "🤢" },
  vomiting: { label: "Vomiting", emoji: "🤮" },
  legCramps: { label: "Leg Cramps", emoji: "🦵" },
  heartburn: { label: "Heartburn", emoji: "🔥" },
  spotting: { label: "Spotting", emoji: "🔴" },
  breathlessness: { label: "Breathlessness", emoji: "😮‍💨" },
  pelvicPressure: { label: "Pelvic Pressure", emoji: "⬇️" },
  frequentUrination: { label: "Frequent Urination", emoji: "🚻" },
  skinChanges: { label: "Skin Changes", emoji: "✨" },
  foodAversions: { label: "Food Aversions", emoji: "🙅" },
  fetalMovement: { label: "Fetal Movement", emoji: "👶" },
  babyBumpGrowth: { label: "Baby Bump Growth", emoji: "🤰" },
  practiceContractions: { label: "Practice Contractions", emoji: "⏱️" },
  sleepDifficulty: { label: "Sleep Difficulty", emoji: "😴" },
  irritability: { label: "Irritability", emoji: "😤" },
  breastPain: { label: "Breast Pain", emoji: "😣" },
  nipplePain: { label: "Nipple Pain", emoji: "😖" },
  lowMilkSupply: { label: "Low Milk Supply", emoji: "🍼" },
  lowEnergy: { label: "Low Energy", emoji: "🔋" },
  sleepDeprivation: { label: "Sleep Deprivation", emoji: "😵" },
  bodyAche: { label: "Body Ache", emoji: "🤕" },
  hotFlashes: { label: "Hot Flashes", emoji: "🥵" },
  nightSweats: { label: "Night Sweats", emoji: "🌡️" },
  jointPain: { label: "Joint Pain", emoji: "🦴" },
  bonePain: { label: "Bone Pain", emoji: "🦴" },
  weightGain: { label: "Weight Gain", emoji: "⚖️" },
  memoryIssues: { label: "Memory Issues", emoji: "🧠" },
  heartPalpitations: { label: "Heart Palpitations", emoji: "💓" },
  stress: { label: "Stress", emoji: "😓" },
  ovulationPain: { label: "Ovulation Pain", emoji: "🎯" },
  lowLibido: { label: "Low Libido", emoji: "💔" },
  urinaryIssues: { label: "Urinary Issues", emoji: "🚻" },
  dryness: { label: "Vaginal Dryness", emoji: "💧" },
};

export function getSymptomMeta(canonicalId: string): { label: string; emoji: string } {
  return SYMPTOM_META[canonicalId] ?? { label: canonicalId, emoji: "❓" };
}

export function aggregateSymptoms(
  allLogs: Record<string, any>,
  phase: Phase,
  windowDays: number = 30
): AggregatedSymptom[] {
  const normalized: NormalizedSymptom[] = [];

  if (phase === "maternity") {
    normalized.push(...collectNormalizedSymptoms(allLogs, "maternity"));
  } else if (phase === "postpartum") {
    normalized.push(...collectNormalizedSymptoms(allLogs, "postpartum"));
  } else {
    normalized.push(...collectNormalizedSymptoms(allLogs, phase));
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);

  const recent = normalized.filter((s) => new Date(s.date) >= cutoff);

  const grouped: Record<string, { dates: string[]; severities: string[] }> = {};
  for (const s of recent) {
    if (!grouped[s.canonicalId]) {
      grouped[s.canonicalId] = { dates: [], severities: [] };
    }
    if (!grouped[s.canonicalId].dates.includes(s.date)) {
      grouped[s.canonicalId].dates.push(s.date);
    }
    if (s.severity) {
      grouped[s.canonicalId].severities.push(s.severity);
    }
  }

  return Object.entries(grouped).map(([canonicalId, data]) => {
    const dates = data.dates.sort().reverse();
    const severityScores = data.severities.map((sev) =>
      sev === "severe" ? 1 : sev === "moderate" ? 0.6 : 0.3
    );
    const avgSeverity =
      severityScores.length > 0
        ? severityScores.reduce((a, b) => a + b, 0) / severityScores.length
        : 0.5;
    const meta = getSymptomMeta(canonicalId);

    return {
      canonicalId,
      label: meta.label,
      emoji: meta.emoji,
      frequency: data.dates.length,
      severityScore: avgSeverity,
      recentDates: dates.slice(0, 5),
      sources: ["healthLog"],
    };
  }).sort((a, b) => {
    const freqDiff = b.frequency - a.frequency;
    if (freqDiff !== 0) return freqDiff;
    return b.severityScore - a.severityScore;
  });
}
