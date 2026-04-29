export type BiologicalSex = "female" | "male";

export interface BodyMetricsInput {
  age: number;
  heightCm: number;
  weightKg: number;
  sex: BiologicalSex;
  tdee: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active";
  weightTrend: "down" | "stable" | "up";
}

export interface BodyMetricsResult {
  bmi: number;
  bmiCategory: "Underweight" | "Healthy" | "Overweight" | "High";
  idealWeightRangeKg: { min: number; max: number };
  leanBodyMassKg: number;
  muscleWeightKg: number;
  estimatedFatMassKg: number;
  metabolismScore: {
    value: number;
    label: "Needs support" | "Moderate" | "Good";
  };
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const h = Math.max(1, heightCm) / 100;
  return Number((weightKg / (h * h)).toFixed(1));
}

export function getBMICategory(bmi: number): BodyMetricsResult["bmiCategory"] {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "High";
}

export function getIdealWeightRange(heightCm: number): { min: number; max: number } {
  const h = Math.max(1, heightCm) / 100;
  return {
    min: Number((18.5 * h * h).toFixed(0)),
    max: Number((24.9 * h * h).toFixed(0)),
  };
}

export function getLeanBodyMass(weightKg: number, heightCm: number, sex: BiologicalSex): number {
  // Boer formula
  const lbm =
    sex === "male"
      ? 0.407 * weightKg + 0.267 * heightCm - 19.2
      : 0.252 * weightKg + 0.473 * heightCm - 48.3;
  return Number(Math.max(20, lbm).toFixed(1));
}

export function calculateMetabolismScore(input: BodyMetricsInput, bmi: number): BodyMetricsResult["metabolismScore"] {
  const activityBoost: Record<BodyMetricsInput["activityLevel"], number> = {
    sedentary: -8,
    light: -2,
    moderate: 5,
    active: 10,
  };
  const agePenalty = Math.max(0, (input.age - 30) * 0.35);
  const bmiPenalty = bmi >= 30 ? 6 : bmi >= 25 ? 3 : 0;
  const trendBoost = input.weightTrend === "stable" ? 4 : input.weightTrend === "down" ? 2 : -1;
  const tdeeBoost = input.tdee >= 2200 ? 6 : input.tdee >= 1800 ? 3 : 0;

  const value = Math.max(
    35,
    Math.min(95, Math.round(62 + activityBoost[input.activityLevel] + trendBoost + tdeeBoost - agePenalty - bmiPenalty)),
  );

  return {
    value,
    label: value >= 72 ? "Good" : value >= 58 ? "Moderate" : "Needs support",
  };
}

export function calculateBodyMetrics(input: BodyMetricsInput): BodyMetricsResult {
  const bmi = calculateBMI(input.weightKg, input.heightCm);
  const leanBodyMassKg = getLeanBodyMass(input.weightKg, input.heightCm, input.sex);
  const estimatedFatMassKg = Number(Math.max(0, input.weightKg - leanBodyMassKg).toFixed(1));
  const muscleWeightKg = Number((leanBodyMassKg * 0.52).toFixed(1));

  return {
    bmi,
    bmiCategory: getBMICategory(bmi),
    idealWeightRangeKg: getIdealWeightRange(input.heightCm),
    leanBodyMassKg,
    muscleWeightKg,
    estimatedFatMassKg,
    metabolismScore: calculateMetabolismScore(input, bmi),
  };
}
