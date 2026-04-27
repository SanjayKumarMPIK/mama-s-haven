export type Nutrient = "Iron" | "Vitamin D" | "Magnesium" | "Calcium" | "Protein" | "Folate" | "B12" | "DHA" | "Fiber" | "Zinc" | "Potassium" | "Vitamin C";

export type HealthPhase = "puberty" | "maternity" | "postpartum" | "menopause" | "family-planning" | "familyPlanning";

export type Severity = "Low" | "Moderate" | "High" | "Critical";

export interface NutrientRisk {
  nutrient: Nutrient;
  probability: number; // 0-100
  severity: Severity;
  matchedSymptoms: string[];
  confidenceScore: number; // 0-1
  phaseBoost: number;
  recommendations: string[]; // Dynamic recommendations
}

export interface DeficiencyInsightInput {
  phase: HealthPhase;
  age: number;
  gender: "male" | "female";
  pregnancyWeek?: number; // For maternity phase
  trimester?: number; // For maternity phase
  symptoms: {
    fatigue: number; // 0-1 frequency
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
  overallRiskScore: number; // 0-100
  overallSeverity: Severity;
  nutrientRisks: NutrientRisk[];
  topDeficiencies: NutrientRisk[];
  riskCounts: {
    high: number;
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
  baseScore: number;
  phaseMultipliers: Partial<Record<HealthPhase, number>>;
}

const NUTRIENT_MAPPINGS: NutrientSymptomMapping[] = [
  {
    nutrient: "Iron",
    symptoms: ["fatigue", "dizziness", "paleSkin", "lowEnergy", "hairFall", "brittleNails", "weakness", "headaches", "heavyPeriod"],
    baseScore: 30,
    phaseMultipliers: { puberty: 1.2, maternity: 1.5, postpartum: 1.4, menopause: 1.1 },
  },
  {
    nutrient: "Vitamin D",
    symptoms: ["poorSleep", "lowEnergy", "bonePain", "moodSwings", "weakness", "fatigue", "lowOutdoorActivity"],
    baseScore: 25,
    phaseMultipliers: { puberty: 1.3, maternity: 1.2, postpartum: 1.1, menopause: 1.4 },
  },
  {
    nutrient: "Magnesium",
    symptoms: ["cramps", "moodSwings", "poorSleep", "headaches", "fatigue", "muscleWeakness", "brainFog"],
    baseScore: 25,
    phaseMultipliers: { maternity: 1.2, postpartum: 1.3, menopause: 1.2 },
  },
  {
    nutrient: "Calcium",
    symptoms: ["weakness", "bonePain", "cramps", "fatigue", "brittleNails"],
    baseScore: 25,
    phaseMultipliers: { puberty: 1.3, maternity: 1.4, postpartum: 1.3, menopause: 1.5 },
  },
  {
    nutrient: "Protein",
    symptoms: ["lowEnergy", "fatigue", "muscleWeakness", "weakness", "hairFall", "brittleNails"],
    baseScore: 20,
    phaseMultipliers: { puberty: 1.2, maternity: 1.3, postpartum: 1.4 },
  },
  {
    nutrient: "Folate",
    symptoms: ["fatigue", "weakness", "headaches", "paleSkin"],
    baseScore: 20,
    phaseMultipliers: { maternity: 1.6, familyPlanning: 1.5 },
  },
  {
    nutrient: "B12",
    symptoms: ["fatigue", "weakness", "brainFog", "paleSkin", "moodSwings", "lowEnergy"],
    baseScore: 20,
    phaseMultipliers: { maternity: 1.2, postpartum: 1.3, menopause: 1.2 },
  },
  {
    nutrient: "DHA",
    symptoms: ["brainFog", "moodSwings", "lowEnergy", "weakness"],
    baseScore: 15,
    phaseMultipliers: { maternity: 1.5, postpartum: 1.4 },
  },
  {
    nutrient: "Fiber",
    symptoms: ["cramps", "fatigue", "lowEnergy", "weakness"],
    baseScore: 15,
    phaseMultipliers: {},
  },
  {
    nutrient: "Zinc",
    symptoms: ["hairFall", "brittleNails", "weakness", "fatigue", "cravings"],
    baseScore: 15,
    phaseMultipliers: { maternity: 1.2, postpartum: 1.1 },
  },
];

// Dynamic recommendations for each nutrient based on pregnancy stage
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

function calculateSeverity(probability: number): Severity {
  if (probability >= 75) return "Critical";
  if (probability >= 60) return "High";
  if (probability >= 40) return "Moderate";
  if (probability >= 25) return "Low";
  return "Low";
}

function calculateNutrientRisk(mapping: NutrientSymptomMapping, input: DeficiencyInsightInput): NutrientRisk {
  const phaseMultiplier = mapping.phaseMultipliers[input.phase] || 1;

  let symptomScore = 0;
  const matchedSymptoms: string[] = [];

  for (const symptom of mapping.symptoms) {
    const value = input.symptoms[symptom];
    if (value > 0) {
      symptomScore += value * 10;
      matchedSymptoms.push(symptom);
    }
  }

  const baseProbability = Math.min(95, mapping.baseScore + symptomScore);
  const adjustedProbability = Math.min(95, baseProbability * phaseMultiplier);
  const probability = Math.round(adjustedProbability);

  const matchedCount = mapping.symptoms.filter(s => input.symptoms[s] > 0).length;
  const totalSymptoms = mapping.symptoms.length;
  const confidenceScore = Math.min(1, matchedCount / Math.max(1, totalSymptoms * 0.5));

  // Generate dynamic recommendations based on trimester
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
    confidenceScore: Number(confidenceScore.toFixed(2)),
    phaseBoost: phaseMultiplier,
    recommendations,
  };
}

function calculateOverallRisk(risks: NutrientRisk[]): { score: number; severity: Severity } {
  if (risks.length === 0) return { score: 0, severity: "Low" };
  
  const avgProbability = risks.reduce((sum, r) => sum + r.probability, 0) / risks.length;
  const highRiskCount = risks.filter(r => r.severity === "High" || r.severity === "Critical").length;
  const moderateRiskCount = risks.filter(r => r.severity === "Moderate").length;
  
  let score = avgProbability;
  score += highRiskCount * 5;
  score += moderateRiskCount * 2;
  score = Math.min(100, Math.round(score));
  
  let severity: Severity = "Low";
  if (score >= 70) severity = "Critical";
  else if (score >= 55) severity = "High";
  else if (score >= 40) severity = "Moderate";
  
  return { score, severity };
}

function calculateEnergyImpact(risks: NutrientRisk[]): "Low" | "Medium" | "High" {
  const highEnergyImpactNutrients = risks.filter(r => 
    r.nutrient === "Iron" || r.nutrient === "Vitamin D" || r.nutrient === "Protein"
  );
  
  const avgProbability = highEnergyImpactNutrients.length > 0
    ? highEnergyImpactNutrients.reduce((sum, r) => sum + r.probability, 0) / highEnergyImpactNutrients.length
    : 0;
  
  if (avgProbability >= 60) return "High";
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
