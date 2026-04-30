/**
 * healthCalculator.ts
 *
 * Calculates personalized daily health intake suggestions for women.
 * Uses Mifflin-St Jeor equation for BMR, pregnancy-specific adjustments,
 * and standard nutrition recommendations.
 */

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Trimester = 1 | 2 | 3;

export interface UserProfile {
  age: number; // years
  height: number; // cm
  weight: number; // kg
  trimester?: Trimester;
  activityLevel?: ActivityLevel;
  healthConditions?: string[];
}

export interface HealthCalculationResult {
  calories: {
    dailyCalories: number;
    bmr: number;
    pregnancyAdjustment: number;
    explanation: string;
    formula: string;
  };
  protein: {
    dailyProtein: number;
    explanation: string;
    formula: string;
  };
  water: {
    dailyWaterMl: number;
    dailyWaterLiters: number;
    pregnancyAdjustment: number;
    explanation: string;
    formula: string;
  };
}

// ─── Activity Multipliers ─────────────────────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

// ─── Pregnancy Calorie Adjustments ─────────────────────────────────────────────

const PREGNANCY_CALORIE_ADDITION: Record<Trimester, { min: number; max: number }> = {
  1: { min: 0, max: 100 },
  2: { min: 340, max: 340 },
  3: { min: 450, max: 450 },
};

// ─── Pregnancy Water Adjustments ───────────────────────────────────────────────

const PREGNANCY_WATER_ADDITION: Record<Trimester, number> = {
  1: 300,
  2: 500,
  3: 700,
};

// ─── BMR Calculation (Mifflin-St Jeor for Women) ─────────────────────────────

function calculateBMR(profile: UserProfile): number {
  const { weight, height, age } = profile;
  // BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// ─── Calorie Calculation ───────────────────────────────────────────────────────

function calculateCalories(profile: UserProfile): HealthCalculationResult["calories"] {
  const bmr = calculateBMR(profile);
  const activityMultiplier = profile.activityLevel
    ? ACTIVITY_MULTIPLIERS[profile.activityLevel]
    : ACTIVITY_MULTIPLIERS.sedentary;

  let tdee = bmr * activityMultiplier;
  let pregnancyAdjustment = 0;

  // Apply pregnancy adjustment if in pregnancy phase
  if (profile.trimester) {
    const adjustment = PREGNANCY_CALORIE_ADDITION[profile.trimester];
    pregnancyAdjustment = adjustment.max; // Use max for recommendation
    tdee += pregnancyAdjustment;
  }

  const dailyCalories = Math.round(tdee);

  return {
    dailyCalories,
    bmr: Math.round(bmr),
    pregnancyAdjustment,
    explanation: profile.trimester
      ? `Based on your BMR of ${Math.round(bmr)} kcal, multiplied by ${activityMultiplier} for ${profile.activityLevel || 'sedentary'} activity, plus ${pregnancyAdjustment} kcal for trimester ${profile.trimester} pregnancy needs.`
      : `Based on your BMR of ${Math.round(bmr)} kcal, multiplied by ${activityMultiplier} for ${profile.activityLevel || 'sedentary'} activity level.`,
    formula: "BMR = (10 × weight kg) + (6.25 × height cm) − (5 × age) − 161",
  };
}

// ─── Protein Calculation ───────────────────────────────────────────────────────

function calculateProtein(profile: UserProfile): HealthCalculationResult["protein"] {
  const { weight, trimester } = profile;
  
  // Use 1.1g/kg for normal/early pregnancy, 1.3g/kg for later stages
  const proteinMultiplier = trimester && trimester >= 2 ? 1.3 : 1.1;
  const dailyProtein = Math.round(weight * proteinMultiplier);

  return {
    dailyProtein,
    explanation: trimester && trimester >= 2
      ? `For ${weight}kg body weight in trimester ${trimester}, you need ${dailyProtein}g protein daily to support baby's growth and tissue repair.`
      : `For ${weight}kg body weight, you need ${dailyProtein}g protein daily to support overall health and pregnancy maintenance.`,
    formula: `Protein = weight × ${proteinMultiplier}g/kg`,
  };
}

// ─── Water Calculation ─────────────────────────────────────────────────────────

function calculateWater(profile: UserProfile): HealthCalculationResult["water"] {
  const { weight, trimester } = profile;
  
  // Base hydration: 35ml per kg
  const baseWater = weight * 35;
  let pregnancyAdjustment = 0;

  // Add pregnancy hydration needs
  if (profile.trimester) {
    pregnancyAdjustment = PREGNANCY_WATER_ADDITION[profile.trimester];
  }

  const dailyWaterMl = Math.round(baseWater + pregnancyAdjustment);
  const dailyWaterLiters = (dailyWaterMl / 1000).toFixed(1);

  return {
    dailyWaterMl,
    dailyWaterLiters: parseFloat(dailyWaterLiters),
    pregnancyAdjustment,
    explanation: trimester
      ? `Base hydration of ${baseWater}ml (${(baseWater/1000).toFixed(1)}L) for ${weight}kg, plus ${pregnancyAdjustment}ml for trimester ${trimester} pregnancy needs.`
      : `Base hydration of ${baseWater}ml (${(baseWater/1000).toFixed(1)}L) for ${weight}kg body weight.`,
    formula: "Water = 35ml × body weight (kg) + pregnancy adjustment",
  };
}

// ─── Main Calculator Function ─────────────────────────────────────────────────

export function calculateHealthMetrics(profile: UserProfile): HealthCalculationResult {
  const calories = calculateCalories(profile);
  const protein = calculateProtein(profile);
  const water = calculateWater(profile);

  return {
    calories,
    protein,
    water,
  };
}

// ─── Default Profile Helper ───────────────────────────────────────────────────

export function getDefaultProfile(): UserProfile {
  return {
    age: 28,
    height: 160,
    weight: 65,
    trimester: 2,
    activityLevel: "moderate",
  };
}
