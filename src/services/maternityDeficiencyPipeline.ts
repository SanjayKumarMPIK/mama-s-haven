import { calculateDeficiencyInsights } from "@/services/deficiencyInsightEngine";
import type { DeficiencyInsightInput, DeficiencyInsightOutput } from "@/services/deficiencyInsightEngine";
import type { HealthLogs } from "@/hooks/useHealthLog";
import { collectMaternityData, type CollectedMaternityData } from "./maternityDataCollector";
import { ALL_CANONICAL_SYMPTOMS } from "./maternitySymptomNormalizer";

export interface ComputedMaternityInsights {
  hasData: boolean;
  deficiencyScore: number;
  overallSeverity: string;
  riskCounts: { high: number; moderate: number; low: number; good: number };
  deficiencies: DeficiencyInsightOutput["nutrientRisks"];
  topDeficiencies: DeficiencyInsightOutput["topDeficiencies"];
  recommendations: string[];
  nutrients: DeficiencyInsightOutput["nutrientRisks"];
  foods: { nutrient: string; items: string[] }[];
  charts: {
    nutrientProbabilities: { nutrient: string; probability: number; severity: string }[];
    riskDistribution: { label: string; value: number; color: string }[];
  };
  summary: {
    priorityNutrient: string | null;
    energyImpact: string;
    likelyDeficiencies: number;
    frequentSymptoms: string[];
    avgSleepHours: number | null;
    avgMoodScore: number | null;
    loggedDays: number;
  };
  priorityNutrient: string | null;
  energyImpact: string;
  normalizedSymptoms: Record<string, number>;
  frequentSymptoms: string[];
  lastUpdated: number;
  phase: string;
  trimester: number | undefined;
  collectedData: CollectedMaternityData;
}

function getAgeFromProfile(): number {
  try {
    const raw = localStorage.getItem("mh-user-profile");
    if (raw) {
      const p = JSON.parse(raw);
      return p.age ?? 25;
    }
  } catch {}
  return 25;
}

function getGender(): "male" | "female" {
  try {
    const raw = localStorage.getItem("mh-user-profile");
    if (raw) {
      const p = JSON.parse(raw);
      return p.sex === "male" ? "male" : "female";
    }
  } catch {}
  return "female";
}

function getMaternityMode(): "pregnancy" | "postpartum" | "premature" {
  try {
    const raw = localStorage.getItem("mh-pregnancy-profile");
    if (raw) {
      const p = JSON.parse(raw);
      if (p.mode === "postpartum") return "postpartum";
      if (p.mode === "premature") return "premature";
    }
  } catch {}
  return "pregnancy";
}

function getDeficiencyPhase(mode: string): "maternity" | "postpartum" {
  if (mode === "postpartum" || mode === "premature") return "postpartum";
  return "maternity";
}

function buildEngineInput(
  collected: CollectedMaternityData,
  age: number,
  gender: "male" | "female",
): DeficiencyInsightInput {
  const mode = getMaternityMode();
  const sf = collected.normalizedSymptomFrequencies;

  const pick = (keys: string[], fallback: number = 0): number => {
    let max = fallback;
    for (const key of keys) {
      const val = sf[key as keyof typeof sf] ?? 0;
      if (val > max) max = val;
    }
    return max;
  };

  return {
    phase: getDeficiencyPhase(mode),
    age,
    gender,
    pregnancyWeek: collected.trimester !== undefined ? collected.trimester * 13 : undefined,
    trimester: collected.trimester,
    symptoms: {
      fatigue: pick(["fatigue"]),
      headaches: pick(["headaches"]),
      dizziness: pick(["dizziness"]),
      hairFall: pick(["hairFall"]),
      paleSkin: Math.max(sf["paleSkin"] ?? 0, (sf["_lowHydration" as any] ?? 0) * 0.5),
      moodSwings: pick(["moodSwings"]),
      poorSleep: pick(["poorSleep"]),
      cramps: pick(["cramps", "legCramps", "backPain"]),
      lowEnergy: pick(["lowEnergy"]),
      drySkin: pick(["drySkin"]),
      weakness: pick(["weakness"]) * 0.8,
      brainFog: pick(["brainFog"]),
      cravings: pick(["cravings"]),
      brittleNails: pick(["brittleNails"]),
      muscleWeakness: pick(["muscleWeakness"]),
      bonePain: pick(["bonePain"]),
      heavyPeriod: 0,
      lowOutdoorActivity: 0,
    },
  };
}

function computeFrequentSymptoms(
  sf: Record<string, number>,
  threshold: number = 0.15
): string[] {
  const CANONICAL_LABELS: Record<string, string> = {
    fatigue: "Fatigue", poorSleep: "Poor Sleep", moodSwings: "Mood Swings",
    headaches: "Headaches", dizziness: "Dizziness", hairFall: "Hair Fall",
    paleSkin: "Pale Skin", cramps: "Cramps", lowEnergy: "Low Energy",
    drySkin: "Dry Skin", weakness: "Weakness", brainFog: "Brain Fog",
    cravings: "Cravings", brittleNails: "Brittle Nails",
    muscleWeakness: "Muscle Weakness", bonePain: "Bone Pain",
    nausea: "Nausea", backPain: "Back Pain", legCramps: "Leg Cramps",
    swelling: "Swelling", heartburn: "Heartburn", breathlessness: "Breathlessness",
    anxiety: "Anxiety", stress: "Stress", bloating: "Bloating",
    constipation: "Constipation",
  };

  return ALL_CANONICAL_SYMPTOMS
    .filter((sym) => (sf[sym] ?? 0) >= threshold)
    .sort((a, b) => (sf[b] ?? 0) - (sf[a] ?? 0))
    .map((sym) => CANONICAL_LABELS[sym] || sym);
}

export function computeMaternityDeficiencyPipeline(
  logs: HealthLogs,
  trimester: number | undefined,
): ComputedMaternityInsights {
  const age = getAgeFromProfile();
  const gender = getGender();
  const collected = collectMaternityData(logs, trimester, 14);

  const hasSymptomData = Object.values(collected.normalizedSymptomFrequencies).some((v) => v > 0);

  if (!hasSymptomData || collected.loggedDays === 0) {
    return {
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
        avgSleepHours: collected.avgSleepHours,
        avgMoodScore: collected.avgMoodScore,
        loggedDays: collected.loggedDays,
      },
      priorityNutrient: null,
      energyImpact: "Low",
      normalizedSymptoms: collected.normalizedSymptomFrequencies,
      frequentSymptoms: [],
      lastUpdated: Date.now(),
      phase: "maternity",
      trimester,
      collectedData: collected,
    };
  }

  const engineInput = buildEngineInput(collected, age, gender);
  const engineOutput = calculateDeficiencyInsights(engineInput);

  const frequentSymptoms = computeFrequentSymptoms(collected.normalizedSymptomFrequencies);

  const foods = engineOutput.nutrientRisks.map((nr) => ({
    nutrient: nr.nutrient,
    items: nr.recommendations.slice(0, 4),
  }));

  const riskColors: Record<string, string> = {
    Critical: "#dc4f6f", High: "#dc4f6f",
    Moderate: "#bc8b32", Low: "#41a25f",
  };

  return {
    hasData: true,
    deficiencyScore: engineOutput.overallRiskScore,
    overallSeverity: engineOutput.overallSeverity,
    riskCounts: engineOutput.riskCounts,
    deficiencies: engineOutput.nutrientRisks,
    topDeficiencies: engineOutput.topDeficiencies,
    recommendations: engineOutput.topDeficiencies.flatMap((d) => d.recommendations),
    nutrients: engineOutput.nutrientRisks,
    foods,
    charts: {
      nutrientProbabilities: engineOutput.nutrientRisks.map((nr) => ({
        nutrient: nr.nutrient,
        probability: nr.probability,
        severity: nr.severity,
      })),
      riskDistribution: [
        { label: "High/Critical", value: engineOutput.riskCounts.high, color: riskColors["High"] },
        { label: "Moderate", value: engineOutput.riskCounts.moderate, color: riskColors["Moderate"] },
        { label: "Low", value: engineOutput.riskCounts.low, color: riskColors["Low"] },
        { label: "Good", value: engineOutput.riskCounts.good, color: "#3b8ed0" },
      ],
    },
    summary: {
      priorityNutrient: engineOutput.priorityNutrient,
      energyImpact: engineOutput.energyImpact,
      likelyDeficiencies: engineOutput.riskCounts.high + engineOutput.riskCounts.moderate,
      frequentSymptoms,
      avgSleepHours: collected.avgSleepHours,
      avgMoodScore: collected.avgMoodScore,
      loggedDays: collected.loggedDays,
    },
    priorityNutrient: engineOutput.priorityNutrient,
    energyImpact: engineOutput.energyImpact,
    normalizedSymptoms: collected.normalizedSymptomFrequencies,
    frequentSymptoms,
    lastUpdated: Date.now(),
    phase: "maternity",
    trimester,
    collectedData: collected,
  };
}
