import type { Phase } from "@/hooks/usePhase";
import type { AggregatedSymptom, NutrientRisk, ComputedDeficiencyInsights } from "./types";
import { SYMPTOM_NUTRIENT_MAP } from "@/lib/nutrition/nutritionSymptomRegistry";
import { PHASE_CONFIGS, NUTRIENT_FOOD_MAP } from "@/lib/nutrition/nutritionFoodRegistry";
import { getSymptomMeta } from "./symptomAggregator";

const NUTRIENT_META: Record<string, { label: string; emoji: string }> = {
  iron: { label: "Iron", emoji: "🔴" },
  b12: { label: "Vitamin B12", emoji: "💊" },
  vitD: { label: "Vitamin D", emoji: "☀️" },
  magnesium: { label: "Magnesium", emoji: "🟢" },
  calcium: { label: "Calcium", emoji: "🦴" },
  protein: { label: "Protein", emoji: "💪" },
  omega3: { label: "Omega-3 (DHA)", emoji: "🐟" },
  zinc: { label: "Zinc", emoji: "🔷" },
  fiber: { label: "Fiber", emoji: "🌾" },
  potassium: { label: "Potassium", emoji: "🍌" },
  vitC: { label: "Vitamin C", emoji: "🍊" },
  vitE: { label: "Vitamin E", emoji: "🌻" },
  b6: { label: "Vitamin B6", emoji: "💛" },
  vitA: { label: "Vitamin A", emoji: "🥕" },
  folate: { label: "Folate", emoji: "🥦" },
};

const SYMPTOM_BASE_WEIGHTS: Record<string, number> = {
  fatigue: 10,
  dizziness: 13,
  weakness: 9,
  moodSwings: 8,
  anxiety: 8,
  brainFog: 8,
  sleepIssues: 8,
  backPain: 8,
  headache: 7,
  appetiteChanges: 6,
  bloating: 5,
  constipation: 6,
  swelling: 7,
  cramps: 9,
  acne: 7,
  breastTenderness: 7,
  heavyPeriod: 16,
  irregularCycle: 8,
  hairThinning: 10,
  nausea: 8,
  vomiting: 10,
  legCramps: 8,
  heartburn: 5,
  spotting: 12,
  breathlessness: 12,
  pelvicPressure: 6,
  frequentUrination: 4,
  skinChanges: 5,
  cravings: 6,
  foodAversions: 7,
  fetalMovement: 4,
  babyBumpGrowth: 4,
  practiceContractions: 6,
  sleepDifficulty: 8,
  irritability: 7,
  breastPain: 8,
  nipplePain: 7,
  lowMilkSupply: 9,
  lowEnergy: 10,
  sleepDeprivation: 9,
  bodyAche: 7,
  hotFlashes: 8,
  nightSweats: 8,
  jointPain: 8,
  bonePain: 10,
  weightGain: 5,
  memoryIssues: 7,
  heartPalpitations: 9,
  stress: 7,
  ovulationPain: 6,
  lowLibido: 5,
  urinaryIssues: 5,
  dryness: 5,
  paleSkin: 14,
  hairFall: 11,
  brittleNails: 12,
  drySkin: 7,
  muscleWeakness: 9,
  lowOutdoorActivity: 5,
};

const FREQ_BREAKPOINTS = [
  { max: 0, mult: 0 },
  { max: 0.1, mult: 0.25 },
  { max: 0.2, mult: 0.45 },
  { max: 0.3, mult: 0.65 },
  { max: 0.5, mult: 0.8 },
  { max: 0.7, mult: 1.0 },
  { max: 0.9, mult: 1.1 },
  { max: Infinity, mult: 1.15 },
];

function getFrequencyMultiplier(ratio: number): number {
  for (let i = FREQ_BREAKPOINTS.length - 1; i >= 0; i--) {
    if (ratio > FREQ_BREAKPOINTS[i].max) continue;
    return FREQ_BREAKPOINTS[i].mult;
  }
  return FREQ_BREAKPOINTS[0].mult;
}

function getCombinationMultiplier(count: number): number {
  if (count <= 1) return 0.7;
  if (count === 2) return 1.0;
  if (count === 3) return 1.2;
  if (count === 4) return 1.35;
  return 1.5;
}

const MAX_PROBABILITY = 95;
const BASE_CONTRIBUTION = 10;

function getSeverityLabel(score: number): "good" | "low" | "moderate" | "high" {
  if (score >= 75) return "high";
  if (score >= 50) return "moderate";
  if (score >= 25) return "low";
  return "good";
}

function getOverallSeverity(score: number): "Critical" | "High" | "Moderate" | "Mild" | "Good" {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Mild";
  return "Good";
}

function getPhaseMapped(phase: Phase): Phase {
  if (phase === "postpartum") return "maternity";
  return phase;
}

export function computeDeficiencyInsights(
  aggregatedSymptoms: AggregatedSymptom[],
  phase: Phase,
  sleepHours: number | null,
  mood: number | null,
  loggedDays: number
): ComputedDeficiencyInsights {
  const now = new Date().toISOString();
  const mappedPhase = getPhaseMapped(phase);
  const phaseConfig = PHASE_CONFIGS[mappedPhase];
  const phasePriorities = phaseConfig?.nutrientPriorities ?? {};

  if (aggregatedSymptoms.length === 0) {
    return {
      hasData: false,
      lastUpdated: now,
      overallScore: 0,
      overallSeverity: "Good",
      riskCounts: { high: 0, moderate: 0, low: 0, good: 0 },
      deficiencies: [],
      topDeficiencies: [],
      priorityNutrient: null,
      recommendations: [],
      summary: {
        activeSymptoms: [],
        frequentSymptoms: [],
        loggedDays,
        avgSleepHours: sleepHours,
        avgMoodScore: mood,
      },
      charts: {
        nutrientProbabilities: [],
        riskDistribution: [],
      },
      _debug: {
        lastUpdated: now,
        activeSymptoms: [],
        normalizedCount: 0,
      },
    };
  }

  const activeCount = aggregatedSymptoms.length;
  const totalLogDays = aggregatedSymptoms.reduce((sum, s) => sum + s.frequency, 0);

  const rawScores: Record<string, {
    weightedSum: number;
    symptomCount: number;
    reasons: string[];
    symptomSources: string[];
  }> = {};

  for (const symptom of aggregatedSymptoms) {
    const mappings = SYMPTOM_NUTRIENT_MAP[symptom.canonicalId];
    if (!mappings) continue;

    const frequencyRatio = totalLogDays > 0
      ? symptom.frequency / Math.max(totalLogDays, 1)
      : 0;
    const freqMult = getFrequencyMultiplier(frequencyRatio);
    const baseWeight = SYMPTOM_BASE_WEIGHTS[symptom.canonicalId] ?? 6;
    const sevFactor = symptom.severityScore;

    const symptomContribution = baseWeight * freqMult * sevFactor;

    for (const mapping of mappings) {
      if (!rawScores[mapping.nutrientId]) {
        rawScores[mapping.nutrientId] = { weightedSum: 0, symptomCount: 0, reasons: [], symptomSources: [] };
      }

      const weightFactor = mapping.weight;
      rawScores[mapping.nutrientId].weightedSum += symptomContribution * weightFactor;
      rawScores[mapping.nutrientId].symptomCount += 1;

      const reasonText = mapping.reason[phase] ?? mapping.reason.default;
      if (!rawScores[mapping.nutrientId].reasons.includes(reasonText)) {
        rawScores[mapping.nutrientId].reasons.push(reasonText);
      }
      if (!rawScores[mapping.nutrientId].symptomSources.includes(symptom.label)) {
        rawScores[mapping.nutrientId].symptomSources.push(symptom.label);
      }
    }
  }

  const nutrientRisks: NutrientRisk[] = Object.entries(rawScores)
    .map(([nutrientId, data]) => {
      const comboMult = getCombinationMultiplier(data.symptomCount);
      const phaseBoost = phasePriorities[nutrientId] ?? 1;
      const phaseFactor = 1 + (phaseBoost - 1) * 0.5;

      let rawScore = data.weightedSum * comboMult * phaseFactor + BASE_CONTRIBUTION;
      rawScore = Math.min(rawScore, MAX_PROBABILITY);

      const meta = NUTRIENT_META[nutrientId] ?? { label: nutrientId, emoji: "❓" };
      const foodData = NUTRIENT_FOOD_MAP[nutrientId];

      return {
        nutrientId,
        label: meta.label,
        emoji: meta.emoji,
        score: Math.round(rawScore),
        severity: getSeverityLabel(rawScore),
        isPriority: phasePriorities[nutrientId] != null,
        reasons: data.reasons,
        symptomSources: data.symptomSources,
        recommendedFoods: foodData?.foods ?? [],
      };
    })
    .sort((a, b) => b.score - a.score);

  const riskCounts = {
    high: nutrientRisks.filter((r) => r.severity === "high").length,
    moderate: nutrientRisks.filter((r) => r.severity === "moderate").length,
    low: nutrientRisks.filter((r) => r.severity === "low").length,
    good: nutrientRisks.filter((r) => r.severity === "good").length,
  };

  const overallScore = nutrientRisks.length > 0
    ? Math.round(nutrientRisks.reduce((s, r) => s + r.score, 0) / nutrientRisks.length)
    : 0;

  const topDeficiencies = nutrientRisks.filter((r) => r.severity === "high" || r.severity === "moderate").slice(0, 5);
  const priorityNutrient = nutrientRisks.length > 0 ? nutrientRisks[0] : null;

  const recommendations = topDeficiencies.slice(0, 3).map((d) => {
    const topFood = d.recommendedFoods[0];
    if (topFood) {
      return `Increase ${d.label} intake — try ${topFood.emoji} ${topFood.name}`;
    }
    return `Consider increasing ${d.label}-rich foods in your diet`;
  });

  const frequentSymptoms = aggregatedSymptoms.slice(0, 5).map((s) => ({
    symptom: s.label,
    count: s.frequency,
    emoji: s.emoji,
  }));

  return {
    hasData: true,
    lastUpdated: now,
    overallScore,
    overallSeverity: getOverallSeverity(overallScore),
    riskCounts,
    deficiencies: nutrientRisks,
    topDeficiencies,
    priorityNutrient,
    recommendations,
    summary: {
      activeSymptoms: aggregatedSymptoms,
      frequentSymptoms,
      loggedDays,
      avgSleepHours: sleepHours,
      avgMoodScore: mood,
    },
    charts: {
      nutrientProbabilities: nutrientRisks.slice(0, 8).map((r) => ({
        name: r.nutrientId,
        value: r.score,
        label: r.label,
        emoji: r.emoji,
      })),
      riskDistribution: [
        { name: "High", count: riskCounts.high },
        { name: "Moderate", count: riskCounts.moderate },
        { name: "Low", count: riskCounts.low },
        { name: "Good", count: riskCounts.good },
      ],
    },
    _debug: {
      lastUpdated: now,
      activeSymptoms: aggregatedSymptoms.map((s) => s.canonicalId),
      normalizedCount: aggregatedSymptoms.reduce((s, a) => s + a.frequency, 0),
    },
  };
}
