import type { Nutrient } from "./deficiencyInsightEngine";

export interface NutritionSignalInput {
  hydration: number; // 0-1, how well hydrated
  sleepQuality: number; // 0-1
  stressLevel: number; // 0-1
  activityConsistency: number; // 0-1
  dietaryVariety: number; // 0-1, based on food logs
}

export interface NutritionSignalOutput {
  overallNutritionScore: number; // 0-100
  absorptionCapacity: number; // 0-100
  metabolicEfficiency: number; // 0-100
  recommendedNutrients: Nutrient[];
  absorptionWarnings: string[];
}

export function calculateNutritionSignals(input: NutritionSignalInput): NutritionSignalOutput {
  const hydrationImpact = input.hydration * 15;
  const sleepImpact = input.sleepQuality * 20;
  const stressPenalty = (1 - input.stressLevel) * 10;
  const activityBoost = input.activityConsistency * 15;
  const dietaryBoost = input.dietaryVariety * 20;

  const overallNutritionScore = Math.min(100, Math.round(
    hydrationImpact + sleepImpact + stressPenalty + activityBoost + dietaryBoost
  ));

  const absorptionCapacity = Math.min(100, Math.round(
    (input.hydration * 40) + (input.sleepQuality * 30) + (input.stressLevel * 30)
  ));

  const metabolicEfficiency = Math.min(100, Math.round(
    (input.activityConsistency * 40) + (input.sleepQuality * 35) + (input.dietaryVariety * 25)
  ));

  const recommendedNutrients: Nutrient[] = [];
  const absorptionWarnings: string[] = [];

  if (input.hydration < 0.6) {
    recommendedNutrients.push("Magnesium", "Potassium");
    absorptionWarnings.push("Low hydration may reduce nutrient absorption");
  }

  if (input.sleepQuality < 0.5) {
    recommendedNutrients.push("Magnesium", "Vitamin D");
    absorptionWarnings.push("Poor sleep affects metabolism and nutrient processing");
  }

  if (input.stressLevel > 0.7) {
    recommendedNutrients.push("B12", "Magnesium", "Vitamin C");
    absorptionWarnings.push("High stress depletes B vitamins and magnesium");
  }

  if (input.dietaryVariety < 0.5) {
    recommendedNutrients.push("Iron", "Calcium", "Protein", "Fiber");
    absorptionWarnings.push("Limited diet variety may cause micronutrient gaps");
  }

  if (input.activityConsistency < 0.4) {
    recommendedNutrients.push("Protein", "Calcium", "Vitamin D");
    absorptionWarnings.push("Low activity may reduce bone density and muscle maintenance");
  }

  return {
    overallNutritionScore,
    absorptionCapacity,
    metabolicEfficiency,
    recommendedNutrients: [...new Set(recommendedNutrients)],
    absorptionWarnings,
  };
}
