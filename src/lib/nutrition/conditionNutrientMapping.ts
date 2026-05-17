/**
 * conditionNutrientMapping.ts
 *
 * Maps medical conditions to primary deficient nutrients and food recommendations.
 * Used to inject condition-based nutrition intelligence into maternity nutrition guidance.
 *
 * CRITICAL: This system is for WELLNESS SUPPORT only, not diagnosis.
 * All recommendations use "support" language, not "treatment" language.
 *
 * Maternity phase ONLY.
 */

export interface FoodRecommendation {
  vegetarian: string[];
  mixed: string[];
}

export interface ConditionNutrientConfig {
  nutrient: string;
  nutrientId: string;
  emoji: string;
  description: string;
  foods: FoodRecommendation;
  priority: number; // 1=highest, affects weighting
}

/**
 * Maps medical condition → primary deficient nutrient
 * Used in all 4 nutrition locations for condition awareness
 */
export const CONDITION_NUTRIENT_MAP: Record<string, ConditionNutrientConfig> = {
  "Hypothyroidism": {
    nutrient: "Iodine",
    nutrientId: "iodine",
    emoji: "🧂",
    description: "Iodine supports thyroid function and hormonal balance",
    foods: {
      vegetarian: ["Iodized salt", "Dairy", "Yogurt"],
      mixed: ["Fish", "Eggs"],
    },
    priority: 1,
  },

  "Hyperthyroidism": {
    nutrient: "Calcium",
    nutrientId: "calcium",
    emoji: "🥛",
    description: "Calcium protects bone density and hormonal regulation",
    foods: {
      vegetarian: ["Ragi", "Milk", "Paneer", "Sesame seeds"],
      mixed: ["Sardines", "Salmon", "Eggs"],
    },
    priority: 1,
  },

  "PCOD": {
    nutrient: "Vitamin D",
    nutrientId: "vitamin_d",
    emoji: "☀️",
    description: "Vitamin D supports hormonal regulation and insulin sensitivity",
    foods: {
      vegetarian: ["Fortified milk", "Mushrooms"],
      mixed: ["Eggs", "Salmon"],
    },
    priority: 2,
  },

  "PCOS": {
    nutrient: "Vitamin D",
    nutrientId: "vitamin_d",
    emoji: "☀️",
    description: "Vitamin D supports hormonal regulation and insulin sensitivity",
    foods: {
      vegetarian: ["Fortified dairy", "Mushrooms"],
      mixed: ["Eggs", "Tuna", "Salmon"],
    },
    priority: 2,
  },

  "Diabetes": {
    nutrient: "Magnesium",
    nutrientId: "magnesium",
    emoji: "🌰",
    description: "Magnesium supports glucose metabolism and blood sugar regulation",
    foods: {
      vegetarian: ["Spinach", "Almonds", "Pumpkin seeds"],
      mixed: ["Fish", "Chicken"],
    },
    priority: 2,
  },

  "Anemia": {
    nutrient: "Iron",
    nutrientId: "iron",
    emoji: "🩸",
    description: "Iron supports blood production and oxygen transport during pregnancy",
    foods: {
      vegetarian: ["Spinach", "Dates", "Beetroot", "Sesame seeds"],
      mixed: ["Red meat", "Liver", "Eggs"],
    },
    priority: 1,
  },

  "Osteoporosis": {
    nutrient: "Calcium",
    nutrientId: "calcium",
    emoji: "🥛",
    description: "Calcium protects maternal and fetal bone development",
    foods: {
      vegetarian: ["Ragi", "Milk", "Paneer", "Sesame seeds"],
      mixed: ["Sardines", "Salmon", "Eggs"],
    },
    priority: 1,
  },
};

/**
 * Helper: Extract unique nutrient IDs from selected conditions
 * Deduplicates nutrients if multiple conditions map to same nutrient
 */
export function getConditionNutrientIds(conditions: string[]): string[] {
  const seen = new Set<string>();
  return conditions
    .filter((cond) => CONDITION_NUTRIENT_MAP[cond])
    .map((cond) => CONDITION_NUTRIENT_MAP[cond].nutrientId)
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

/**
 * Helper: Get all condition nutrient configs for selected conditions
 */
export function getConditionNutrientConfigs(
  conditions: string[]
): ConditionNutrientConfig[] {
  return conditions
    .filter((cond) => CONDITION_NUTRIENT_MAP[cond])
    .map((cond) => CONDITION_NUTRIENT_MAP[cond]);
}

/**
 * Helper: Get foods for a specific nutrient based on diet preference
 */
export function getConditionFoods(
  condition: string,
  dietPreference: "veg" | "non-veg" | "mixed" | "eggetarian"
): string[] {
  const config = CONDITION_NUTRIENT_MAP[condition];
  if (!config) return [];

  if (dietPreference === "veg") {
    return config.foods.vegetarian;
  } else {
    return config.foods.mixed;
  }
}

/**
 * Helper: Aggregate all foods from multiple conditions
 * Removes duplicates, respects diet preference
 */
export function aggregateConditionFoods(
  conditions: string[],
  dietPreference: "veg" | "non-veg" | "mixed" | "eggetarian"
): string[] {
  const allFoods = new Set<string>();

  conditions.forEach((condition) => {
    const foods = getConditionFoods(condition, dietPreference);
    foods.forEach((food) => allFoods.add(food));
  });

  return Array.from(allFoods);
}

/**
 * Helper: Get priority weighting for condition nutrients
 * Used to elevate condition-linked nutrients in priority scoring
 * Higher value = stronger weight boost
 */
export function getConditionNutrientModifier(
  nutrientId: string,
  conditions: string[]
): number {
  // Find if this nutrient is linked to any selected condition
  for (const condition of conditions) {
    const config = CONDITION_NUTRIENT_MAP[condition];
    if (config && config.nutrientId === nutrientId) {
      // Return modifier based on priority level
      // Priority 1 nutrients get +25 weight boost
      // Priority 2 nutrients get +15 weight boost
      return config.priority === 1 ? 25 : 15;
    }
  }
  return 0; // No condition modifier for this nutrient
}

/**
 * Helper: Check if a nutrient is condition-linked
 * Used to add "Condition Support" badge on cards
 */
export function getConditionForNutrient(
  nutrientId: string,
  conditions: string[]
): string | null {
  for (const condition of conditions) {
    const config = CONDITION_NUTRIENT_MAP[condition];
    if (config && config.nutrientId === nutrientId) {
      return condition;
    }
  }
  return null;
}
