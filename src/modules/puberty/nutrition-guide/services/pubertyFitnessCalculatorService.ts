import { calculateBodyMetrics, type BiologicalSex } from "@/services/bodyMetricsService";
import { calculateWaterRequirement } from "@/services/hydrationCalculator";

export type FitnessActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type GoalPreference = "maintain" | "lose-weight" | "gain-muscle" | "stay-healthy";

export interface FitnessCalculationInput {
  age: number;
  heightCm: number;
  weightKg: number;
  sex: BiologicalSex;
  activityLevel: FitnessActivityLevel;
  goalPreference: GoalPreference;
  phase: "puberty" | "maternity" | "postpartum" | "menopause" | "family-planning";
  climate: "cool" | "temperate" | "hot-humid";
  weightTrend: "down" | "stable" | "up";
  healthSignals: {
    avgSleepHours: number | null;
    poorSleepFrequency: number;
    fatigueFrequency: number;
    headacheFrequency: number;
    hydrationLowFrequency: number;
    lowEnergyFrequency: number;
    stressFrequency: number;
    activitySignal: number; // 0..1
    recoveryDemand: number; // 0..1
  };
}

export interface FitnessCalculationResult {
  caloriesNeeded: number;
  tdee: {
    maintenance: number;
    weightLoss: number;
    muscleGain: number;
  };
  proteinNeededG: number;
  waterNeeded: {
    liters: number;
    ml: number;
    status: "Low" | "Moderate" | "Good";
  };
  bmi: {
    score: number;
    category: "Underweight" | "Healthy" | "Overweight" | "High";
  };
  metabolism: {
    score: number;
    label: "Needs support" | "Moderate" | "Good";
    estimatedBurn: number;
  };
  activity: {
    level: FitnessActivityLevel;
    score: number;
  };
}

const ACTIVITY_MULTIPLIER: Record<FitnessActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

function mifflinStJeorBmr(input: Pick<FitnessCalculationInput, "age" | "heightCm" | "weightKg" | "sex">): number {
  const sexFactor = input.sex === "male" ? 5 : -161;
  return 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + sexFactor;
}

function getGoalCalorieOffset(goal: GoalPreference): number {
  if (goal === "lose-weight") return -350;
  if (goal === "gain-muscle") return 250;
  return 0;
}

function getPhaseCalorieOffset(phase: FitnessCalculationInput["phase"]): number {
  if (phase === "maternity") return 340;
  if (phase === "postpartum") return 220;
  if (phase === "menopause") return -50;
  return 0;
}

function proteinMultiplier(input: FitnessCalculationInput): number {
  const base: Record<FitnessActivityLevel, number> = {
    sedentary: 0.8,
    light: 1.0,
    moderate: 1.2,
    active: 1.6,
  };
  let multiplier = base[input.activityLevel];
  if (input.goalPreference === "gain-muscle") multiplier = 2.0;
  if (input.phase === "maternity" || input.phase === "postpartum") multiplier += 0.15;
  multiplier += input.healthSignals.recoveryDemand * 0.25;
  return Number(Math.min(2.2, Math.max(0.8, multiplier)).toFixed(2));
}

export function calculateFitnessRequirements(input: FitnessCalculationInput): FitnessCalculationResult {
  const bmr = mifflinStJeorBmr(input);
  const baseTdee = bmr * ACTIVITY_MULTIPLIER[input.activityLevel];
  const maintenance = Math.round(baseTdee + getPhaseCalorieOffset(input.phase));
  const caloriesNeeded = Math.round(maintenance + getGoalCalorieOffset(input.goalPreference));
  const tdee = {
    maintenance,
    weightLoss: Math.max(1200, maintenance - 350),
    muscleGain: maintenance + 250,
  };

  const proteinNeededG = Math.round(input.weightKg * proteinMultiplier(input));
  const hydration = calculateWaterRequirement({
    weightKg: input.weightKg,
    activityLevel: input.activityLevel,
    climate: input.climate,
    phase: input.phase,
    signals: {
      fatigueFrequency: input.healthSignals.fatigueFrequency,
      headacheFrequency: input.healthSignals.headacheFrequency,
      hydrationLowFrequency: input.healthSignals.hydrationLowFrequency,
    },
  });

  const body = calculateBodyMetrics({
    age: input.age,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    sex: input.sex,
    tdee: maintenance,
    activityLevel: input.activityLevel,
    weightTrend: input.weightTrend,
  });

  const activityScore = Number(
    (
      (input.activityLevel === "active" ? 8.2 : input.activityLevel === "moderate" ? 6.2 : input.activityLevel === "light" ? 4.6 : 3.1) *
      (0.85 + input.healthSignals.activitySignal * 0.2)
    ).toFixed(1),
  );

  return {
    caloriesNeeded,
    tdee,
    proteinNeededG,
    waterNeeded: {
      liters: hydration.dailyWaterLiters,
      ml: hydration.dailyWaterMl,
      status: hydration.hydrationStatus,
    },
    bmi: {
      score: body.bmi,
      category: body.bmiCategory,
    },
    metabolism: {
      score: body.metabolismScore.value,
      label: body.metabolismScore.label,
      estimatedBurn: Math.round(bmr),
    },
    activity: {
      level: input.activityLevel,
      score: activityScore,
    },
  };
}
