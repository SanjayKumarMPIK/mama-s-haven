export type Nutrient = "Iron" | "Vitamin D" | "Magnesium" | "Calcium" | "Protein" | "Folate" | "B12" | "DHA" | "Fiber" | "Zinc" | "Potassium" | "Vitamin C";

export type HealthPhase = "puberty" | "maternity" | "postpartum" | "menopause" | "family-planning" | "familyPlanning";

export type Severity = "Low" | "Moderate" | "Elevated" | "High" | "Critical";

export interface NutrientRisk {
  nutrient: Nutrient;
  probability: number; // 0-100
  severity: Severity;
  matchedSymptoms: string[];
  confidenceScore: number; // 0-1
  phaseBoost: number;
  recommendations: string[];
}

export interface DeficiencyInsightInput {
  phase: HealthPhase;
  age: number;
  gender: "male" | "female";
  pregnancyWeek?: number;
  trimester?: number;
  symptoms: {
    fatigue: number;
    headaches: number;
    dizziness: number;
    hairFall: number;
    paleSkin: number;
    moodSwings: number;
    poorSleep: number;
    cramps: number;
    lowEnergy: number;
    drySkin: number;
    weakness: number;
    brainFog: number;
    cravings: number;
    brittleNails: number;
    muscleWeakness: number;
    bonePain: number;
    heavyPeriod: number;
    lowOutdoorActivity: number;
  };
}

export interface DeficiencyInsightOutput {
  overallRiskScore: number;
  overallSeverity: Severity;
  nutrientRisks: NutrientRisk[];
  topDeficiencies: NutrientRisk[];
  riskCounts: {
    high: number;
    elevated: number;
    moderate: number;
    low: number;
    good: number;
  };
  priorityNutrient: Nutrient | null;
  energyImpact: "Low" | "Medium" | "High";
}

interface NutrientSymptomMapping {
  nutrient: Nutrient;
  symptoms: (keyof DeficiencyInsightInput["symptoms"])[];
  phaseMultipliers: Partial<Record<HealthPhase, number>>;
}

const SYMPTOM_WEIGHTS: Partial<Record<keyof DeficiencyInsightInput["symptoms"], number>> = {
  fatigue: 10,
  dizziness: 13,
  paleSkin: 16,
  lowEnergy: 10,
  hairFall: 11,
  brittleNails: 12,
  weakness: 9,
  headaches: 7,
  heavyPeriod: 16,
  poorSleep: 8,
  bonePain: 12,
  moodSwings: 8,
  cramps: 9,
  muscleWeakness: 9,
  brainFog: 8,
  cravings: 6,
  drySkin: 7,
  lowOutdoorActivity: 5,
};

const FREQ_MULTIPLIERS = [
  { threshold: 0, mult: 0 },
  { threshold: 0.1, mult: 0.3 },
  { threshold: 0.2, mult: 0.5 },
  { threshold: 0.3, mult: 0.7 },
  { threshold: 0.5, mult: 0.85 },
  { threshold: 0.7, mult: 1.0 },
  { threshold: 0.9, mult: 1.1 },
];

function getFrequencyMultiplier(frequency: number): number {
  for (let i = FREQ_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (frequency >= FREQ_MULTIPLIERS[i].threshold) return FREQ_MULTIPLIERS[i].mult;
  }
  return 0;
}

function getCombinationMultiplier(symptomCount: number): number {
  if (symptomCount <= 1) return 0.7;
  if (symptomCount === 2) return 1.0;
  if (symptomCount === 3) return 1.15;
  if (symptomCount === 4) return 1.3;
  return 1.4;
}

const PHASE_MULTIPLIER_CAP = 1.35;

const NUTRIENT_MAPPINGS: NutrientSymptomMapping[] = [
  {
    nutrient: "Iron",
    symptoms: ["fatigue", "dizziness", "paleSkin", "lowEnergy", "hairFall", "brittleNails", "weakness", "headaches", "heavyPeriod"],
    phaseMultipliers: { puberty: 1.15, maternity: 1.25, postpartum: 1.2, menopause: 1.1 },
  },
  {
    nutrient: "Vitamin D",
    symptoms: ["poorSleep", "lowEnergy", "bonePain", "moodSwings", "weakness", "fatigue", "lowOutdoorActivity"],
    phaseMultipliers: { puberty: 1.15, maternity: 1.1, postpartum: 1.1, menopause: 1.2 },
  },
  {
    nutrient: "Magnesium",
    symptoms: ["cramps", "moodSwings", "poorSleep", "headaches", "fatigue", "muscleWeakness", "brainFog"],
    phaseMultipliers: { maternity: 1.1, postpartum: 1.15, menopause: 1.1 },
  },
  {
    nutrient: "Calcium",
    symptoms: ["weakness", "bonePain", "cramps", "fatigue", "brittleNails"],
    phaseMultipliers: { puberty: 1.15, maternity: 1.2, postpartum: 1.15, menopause: 1.25 },
  },
  {
    nutrient: "Protein",
    symptoms: ["lowEnergy", "fatigue", "muscleWeakness", "weakness", "hairFall", "brittleNails"],
    phaseMultipliers: { puberty: 1.1, maternity: 1.15, postpartum: 1.2 },
  },
  {
    nutrient: "Folate",
    symptoms: ["fatigue", "weakness", "headaches", "paleSkin"],
    phaseMultipliers: { maternity: 1.25, familyPlanning: 1.2 },
  },
  {
    nutrient: "B12",
    symptoms: ["fatigue", "weakness", "brainFog", "paleSkin", "moodSwings", "lowEnergy"],
    phaseMultipliers: { maternity: 1.1, postpartum: 1.15, menopause: 1.1 },
  },
  {
    nutrient: "DHA",
    symptoms: ["brainFog", "moodSwings", "lowEnergy", "weakness"],
    phaseMultipliers: { maternity: 1.2, postpartum: 1.15 },
  },
  {
    nutrient: "Fiber",
    symptoms: ["cramps", "fatigue", "lowEnergy", "weakness"],
    phaseMultipliers: {},
  },
  {
    nutrient: "Zinc",
    symptoms: ["hairFall", "brittleNails", "weakness", "fatigue", "cravings"],
    phaseMultipliers: { maternity: 1.1, postpartum: 1.05 },
  },
];

const NUTRIENT_RECOMMENDATIONS: Record<Nutrient, { general: string[]; firstTrimester?: string[]; secondTrimester?: string[]; thirdTrimester?: string[] }> = {
  Iron: {
    general: ["Spinach and dark leafy greens", "Lentils and legumes", "Dates and dried fruits", "Red meat or fortified cereals", "Pair iron-rich foods with vitamin C"],
    firstTrimester: ["Focus on folate-rich iron sources like spinach", "Consider prenatal vitamins with iron"],
    secondTrimester: ["Increase iron intake as blood volume expands", "Add iron-fortified foods to diet"],
    thirdTrimester: ["Maximize iron stores for birth", "Include red meat or plant-based iron alternatives"],
  },
  "Vitamin D": {
    general: ["Morning sunlight exposure (15-20 min)", "Fatty fish like salmon", "Fortified dairy products", "Egg yolks", "Vitamin D supplements if prescribed"],
    secondTrimester: ["Ensure adequate vitamin D for baby's bone development", "Consider supplementation if outdoor time is limited"],
    thirdTrimester: ["Maintain vitamin D levels for final bone growth"],
  },
  Magnesium: {
    general: ["Dark chocolate", "Nuts and seeds", "Whole grains", "Leafy greens", "Avocados"],
    secondTrimester: ["Increase magnesium to prevent cramps", "Add magnesium-rich snacks"],
    thirdTrimester: ["Focus on magnesium for muscle relaxation and sleep"],
  },
  Calcium: {
    general: ["Dairy products", "Sesame seeds", "Almonds", "Fortified plant milks", "Leafy greens"],
    firstTrimester: ["Start building calcium stores early", "Include calcium-rich foods daily"],
    secondTrimester: ["Increase calcium for baby's skeleton formation", "Add dairy or fortified alternatives"],
    thirdTrimester: ["Maximize calcium intake for final bone development"],
  },
  Protein: {
    general: ["Eggs", "Paneer or tofu", "Lean meats", "Legumes and pulses", "Greek yogurt"],
    firstTrimester: ["Focus on high-quality protein for early development"],
    secondTrimester: ["Increase protein for baby's rapid growth"],
    thirdTrimester: ["Maximize protein for final growth stages"],
  },
  Folate: {
    general: ["Spinach and leafy greens", "Lentils", "Citrus fruits", "Fortified cereals", "Prenatal vitamins with folic acid"],
    firstTrimester: ["Critical for neural tube development", "Focus on folate-rich foods daily"],
  },
  B12: {
    general: ["Animal products", "Fortified cereals", "Nutritional yeast", "Dairy products", "B12 supplements if vegetarian"],
    secondTrimester: ["Ensure adequate B12 for nervous system development"],
    thirdTrimester: ["Maintain B12 levels for final brain development"],
  },
  DHA: {
    general: ["Fatty fish", "Walnuts", "Flaxseeds", "Chia seeds", "DHA supplements"],
    secondTrimester: ["Increase DHA for brain and eye development"],
    thirdTrimester: ["Maximize DHA for final brain growth"],
  },
  Fiber: {
    general: ["Whole grains", "Fruits and vegetables", "Legumes", "Nuts and seeds", "Prunes"],
    secondTrimester: ["Increase fiber to prevent constipation"],
    thirdTrimester: ["Focus on fiber for digestive comfort"],
  },
  Zinc: {
    general: ["Oysters", "Beef", "Pumpkin seeds", "Lentils", "Chickpeas"],
    secondTrimester: ["Ensure zinc for immune system development"],
    thirdTrimester: ["Maintain zinc for final growth stages"],
  },
  Potassium: {
    general: ["Bananas", "Sweet potatoes", "Avocados", "White beans", "Spinach"],
    secondTrimester: ["Increase potassium to prevent cramps"],
    thirdTrimester: ["Focus on potassium for fluid balance"],
  },
  "Vitamin C": {
    general: ["Citrus fruits", "Bell peppers", "Strawberries", "Kiwi", "Broccoli"],
    firstTrimester: ["Focus on vitamin C for iron absorption"],
    secondTrimester: ["Increase vitamin C for immune support"],
    thirdTrimester: ["Maintain vitamin C for final development"],
  },
};

function getIndexWeight(symptom: keyof DeficiencyInsightInput["symptoms"]): number {
  return SYMPTOM_WEIGHTS[symptom] ?? 6;
}

function calculateSeverity(probability: number): Severity {
  if (probability >= 90) return "Critical";
  if (probability >= 75) return "High";
  if (probability >= 55) return "Elevated";
  if (probability >= 30) return "Moderate";
  return "Low";
}

function calculateConfidenceScore(
  matchedSymptoms: string[],
  inputSymptoms: DeficiencyInsightInput["symptoms"],
  totalPossibleSymptoms: number,
): number {
  if (matchedSymptoms.length === 0) return 0;

  const matchedRatio = matchedSymptoms.length / Math.max(1, totalPossibleSymptoms);

  let frequencySum = 0;
  for (const sym of matchedSymptoms) {
    frequencySum += inputSymptoms[sym as keyof typeof inputSymptoms] ?? 0;
  }
  const avgFrequency = frequencySum / matchedSymptoms.length;

  const proportionScore = Math.min(1, matchedRatio * 2.5);
  const frequencyScore = Math.min(1, avgFrequency * 1.5);
  const countScore = Math.min(1, matchedSymptoms.length / 5);

  const combined = proportionScore * 0.35 + frequencyScore * 0.35 + countScore * 0.3;
  return Number(combined.toFixed(2));
}

function calculateNutrientRisk(mapping: NutrientSymptomMapping, input: DeficiencyInsightInput): NutrientRisk {
  const rawPhaseMult = mapping.phaseMultipliers[input.phase] || 1;
  const phaseMultiplier = Math.min(rawPhaseMult, PHASE_MULTIPLIER_CAP);

  const BASE_CONTRIBUTION = 10;
  const MAX_PROBABILITY = 95;

  let weightedSum = 0;
  const matchedSymptoms: string[] = [];

  for (const symptom of mapping.symptoms) {
    const value = input.symptoms[symptom];
    if (value > 0) {
      const weight = getIndexWeight(symptom);
      const freqMult = getFrequencyMultiplier(value);
      weightedSum += weight * freqMult;
      matchedSymptoms.push(symptom);
    }
  }

  const comboMult = getCombinationMultiplier(matchedSymptoms.length);
  const phaseAdjustedMult = 1 + (phaseMultiplier - 1) * 0.6;

  let rawScore = weightedSum * comboMult * phaseAdjustedMult + BASE_CONTRIBUTION;
  const probability = Math.min(MAX_PROBABILITY, Math.round(rawScore));

  const confidenceScore = calculateConfidenceScore(matchedSymptoms, input.symptoms, mapping.symptoms.length);

  const recConfig = NUTRIENT_RECOMMENDATIONS[mapping.nutrient];
  let recommendations: string[] = [];

  if (input.phase === "maternity" && input.trimester) {
    if (input.trimester === 1 && recConfig.firstTrimester) {
      recommendations = [...recConfig.general, ...recConfig.firstTrimester];
    } else if (input.trimester === 2 && recConfig.secondTrimester) {
      recommendations = [...recConfig.general, ...recConfig.secondTrimester];
    } else if (input.trimester === 3 && recConfig.thirdTrimester) {
      recommendations = [...recConfig.general, ...recConfig.thirdTrimester];
    } else {
      recommendations = recConfig.general;
    }
  } else {
    recommendations = recConfig.general;
  }

  return {
    nutrient: mapping.nutrient,
    probability,
    severity: calculateSeverity(probability),
    matchedSymptoms,
    confidenceScore,
    phaseBoost: phaseMultiplier,
    recommendations,
  };
}

function calculateOverallRisk(risks: NutrientRisk[]): { score: number; severity: Severity } {
  if (risks.length === 0) return { score: 0, severity: "Low" };

  const avgProbability = risks.reduce((sum, r) => sum + r.probability, 0) / risks.length;
  const elevatedOrHigher = risks.filter(r =>
    r.severity === "Elevated" || r.severity === "High" || r.severity === "Critical"
  ).length;
  const moderateCount = risks.filter(r => r.severity === "Moderate").length;

  let score = avgProbability;
  score += elevatedOrHigher * 4;
  score += moderateCount * 1.5;
  score = Math.min(100, Math.round(score));

  let severity: Severity = "Low";
  if (score >= 80) severity = "Critical";
  else if (score >= 60) severity = "High";
  else if (score >= 40) severity = "Elevated";
  else if (score >= 25) severity = "Moderate";

  return { score, severity };
}

function calculateEnergyImpact(risks: NutrientRisk[]): "Low" | "Medium" | "High" {
  const highEnergyImpactNutrients = risks.filter(r =>
    r.nutrient === "Iron" || r.nutrient === "Vitamin D" || r.nutrient === "Protein"
  );

  const avgProbability = highEnergyImpactNutrients.length > 0
    ? highEnergyImpactNutrients.reduce((sum, r) => sum + r.probability, 0) / highEnergyImpactNutrients.length
    : 0;

  if (avgProbability >= 65) return "High";
  if (avgProbability >= 40) return "Medium";
  return "Low";
}

export function calculateDeficiencyInsights(input: DeficiencyInsightInput): DeficiencyInsightOutput {
  const nutrientRisks = NUTRIENT_MAPPINGS.map(mapping =>
    calculateNutrientRisk(mapping, input)
  );

  const sortedRisks = [...nutrientRisks].sort((a, b) => b.probability - a.probability);
  const topDeficiencies = sortedRisks.slice(0, 3);

  const riskCounts = {
    high: nutrientRisks.filter(r => r.severity === "High" || r.severity === "Critical").length,
    elevated: nutrientRisks.filter(r => r.severity === "Elevated").length,
    moderate: nutrientRisks.filter(r => r.severity === "Moderate").length,
    low: nutrientRisks.filter(r => r.severity === "Low").length,
    good: nutrientRisks.filter(r => r.probability < 25).length,
  };

  const { score: overallRiskScore, severity: overallSeverity } = calculateOverallRisk(nutrientRisks);
  const priorityNutrient = topDeficiencies.length > 0 ? topDeficiencies[0].nutrient : null;
  const energyImpact = calculateEnergyImpact(nutrientRisks);

  return {
    overallRiskScore,
    overallSeverity,
    nutrientRisks,
    topDeficiencies,
    riskCounts,
    priorityNutrient,
    energyImpact,
  };
}
