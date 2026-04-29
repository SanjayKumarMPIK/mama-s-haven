/**
 * dietGenerator.ts
 *
 * Dynamic Indian diet chart generator for pregnancy nutrition.
 * Generates personalized meal plans based on region, diet preference,
 * trimester, and deficiency insights.
 */

export type DietPreference = "vegetarian" | "mixed";
export type Region = "north" | "south" | "east" | "west";
export type Trimester = 1 | 2 | 3;

export interface DietInput {
  trimester: Trimester;
  region: Region;
  dietPreference: DietPreference;
  deficiencies: string[];
  weight: number;
}

export interface Meal {
  time: string;
  foods: string[];
  why: string;
  nutrientFocus: string;
}

export interface DietPlan {
  profile: {
    trimester: Trimester;
    region: Region;
    dietPreference: DietPreference;
  };
  meals: Meal[];
  nutritionalHighlights: string[];
  recommendedFoods: string[];
  foodsToReduce: string[];
}

// ─── Regional Food Database ─────────────────────────────────────────────────────

const REGIONAL_FOODS = {
  north: {
    staples: ["Roti", "Paratha", "Rice"],
    proteins: ["Dal", "Rajma", "Chickpeas", "Paneer"],
    vegetables: ["Seasonal vegetables", "Spinach", "Carrots", "Peas"],
    dairy: ["Milk", "Curd", "Lassi", "Ghee"],
    snacks: ["Khichdi", "Thepla", "Sprouts"],
    breakfast: ["Paratha", "Poha", "Upma", "Thepla"],
  },
  south: {
    staples: ["Rice", "Idli", "Dosa"],
    proteins: ["Sambar", "Rasam", "Dal", "Curd"],
    vegetables: ["Coconut chutney", "Seasonal vegetables", "Drumstick", "Pumpkin"],
    dairy: ["Milk", "Curd", "Buttermilk", "Ghee"],
    snacks: ["Ragi dishes", "Curd rice", "Uttapam"],
    breakfast: ["Idli", "Dosa", "Upma", "Pongal"],
  },
  east: {
    staples: ["Rice", "Roti", "Flattened rice"],
    proteins: ["Fish curry", "Lentils", "Dal", "Soy"],
    vegetables: ["Seasonal vegetables", "Mustard greens", "Pumpkin", "Brinjal"],
    dairy: ["Milk", "Curd", "Ghee"],
    snacks: ["Puffed rice", "Lentil snacks", "Sprouts"],
    breakfast: ["Poha", "Paratha", "Luchi", "Upma"],
  },
  west: {
    staples: ["Roti", "Rice", "Khichdi"],
    proteins: ["Dal", "Sprouts", "Paneer", "Legumes"],
    vegetables: ["Seasonal vegetables", "Drumstick", "Bottle gourd", "Spinach"],
    dairy: ["Milk", "Curd", "Buttermilk", "Ghee"],
    snacks: ["Thepla", "Dhokla", "Millet dishes"],
    breakfast: ["Thepla", "Poha", "Upma", "Dhokla"],
  },
};

// ─── Deficiency-Specific Foods ───────────────────────────────────────────────────

const DEFICIENCY_FOODS = {
  iron: ["Spinach", "Dates", "Lentils", "Beetroot", "Jaggery", "Rajma"],
  protein: ["Eggs", "Paneer", "Legumes", "Chicken", "Greek yogurt", "Soy"],
  calcium: ["Milk", "Sesame seeds", "Curd", "Ragi", "Paneer", "Almonds"],
  magnesium: ["Almonds", "Pumpkin seeds", "Banana", "Dark chocolate", "Spinach"],
  b6_folate: ["Banana", "Leafy greens", "Citrus fruits", "Ginger", "Avocado"],
};

// ─── Trimester-Specific Guidelines ───────────────────────────────────────────────

const TRIMESTER_GUIDELINES = {
  1: {
    focus: "Light digestion, anti-nausea, folate-rich",
    foods: ["Ginger", "Lemon", "Citrus", "Light meals", "Small frequent meals"],
    avoid: ["Spicy foods", "Oily foods", "Strong smells"],
  },
  2: {
    focus: "Higher protein, iron-rich, calcium support",
    foods: ["Protein-rich foods", "Iron sources", "Dairy", "Nuts"],
    avoid: ["Excess caffeine", "Raw foods"],
  },
  3: {
    focus: "Energy dense, hydration, digestive support",
    foods: ["Complex carbs", "Fiber", "Hydrating foods", "Small meals"],
    avoid: ["Heavy meals at night", "Spicy foods", "Carbonated drinks"],
  },
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getRegionalFood(region: Region, category: keyof typeof REGIONAL_FOODS[Region]): string[] {
  return REGIONAL_FOODS[region][category];
}

function addDeficiencyFoods(baseFoods: string[], deficiencies: string[]): string[] {
  const foods = [...baseFoods];
  deficiencies.forEach((def) => {
    if (DEFICIENCY_FOODS[def as keyof typeof DEFICIENCY_FOODS]) {
      foods.push(...DEFICIENCY_FOODS[def as keyof typeof DEFICIENCY_FOODS]);
    }
  });
  return [...new Set(foods)]; // Remove duplicates
}

function getProteinSource(dietPreference: DietPreference, region: Region): string[] {
  const regionalProteins = getRegionalFood(region, "proteins");
  if (dietPreference === "mixed") {
    return [...regionalProteins, "Eggs", "Chicken", "Fish"];
  }
  return regionalProteins;
}

// ─── Main Generator Function ───────────────────────────────────────────────────

export function generateDiet(input: DietInput): DietPlan {
  const { trimester, region, dietPreference, deficiencies, weight } = input;
  const guidelines = TRIMESTER_GUIDELINES[trimester];
  const regionalFoods = REGIONAL_FOODS[region];
  const proteinSources = getProteinSource(dietPreference, region);

  // Generate meals based on region and trimester
  const meals: Meal[] = [];

  // Early Morning
  meals.push({
    time: "Early Morning (6:00 AM)",
    foods: ["Warm water + lemon", "Soaked almonds (5-6)", "Dates (2-3)"],
    why: "Hydrates body, provides folate and iron",
    nutrientFocus: "Hydration + Folate",
  });

  // Breakfast
  const breakfastOptions = regionalFoods.breakfast.slice(0, 2);
  meals.push({
    time: "Breakfast (8:00 AM)",
    foods: [
      ...breakfastOptions,
      "Seasonal fruit",
      dietPreference === "mixed" ? "Eggs (optional)" : "Paneer",
    ],
    why: trimester === 1 ? "Light and easy to digest, reduces nausea" : "Provides protein and energy",
    nutrientFocus: trimester === 1 ? "Folate + B6" : "Protein + Fiber",
  });

  // Mid-Morning Snack
  meals.push({
    time: "Mid-Morning Snack (10:30 AM)",
    foods: ["Coconut water", "Mixed nuts", "Seasonal fruit"],
    why: "Maintains energy, provides electrolytes",
    nutrientFocus: "Electrolytes + Healthy fats",
  });

  // Lunch
  const lunchStaple = regionalFoods.staples[0];
  const lunchProtein = proteinSources[0];
  meals.push({
    time: "Lunch (1:00 PM)",
    foods: [
      lunchStaple,
      lunchProtein,
      "Seasonal vegetables",
      "Curd/Buttermilk",
      "Salad",
    ],
    why: "Balanced meal with protein, carbs, and probiotics",
    nutrientFocus: "Protein + Fiber + Calcium",
  });

  // Evening Snack
  const eveningSnack = regionalFoods.snacks[0];
  meals.push({
    time: "Evening Snack (4:30 PM)",
    foods: [eveningSnack, "Milk/Tea (moderate)", "Sprouts", "Fruit"],
    why: "Prevents evening hunger, provides nutrients",
    nutrientFocus: "Protein + Vitamins",
  });

  // Dinner
  const dinnerStaple = regionalFoods.staples[1] || regionalFoods.staples[0];
  meals.push({
    time: "Dinner (8:00 PM)",
    foods: [
      dinnerStaple,
      "Light dal",
      "Seasonal vegetables",
      "Curd",
    ],
    why: trimester === 3 ? "Light meal for better digestion and sleep" : "Balanced nutrition",
    nutrientFocus: trimester === 3 ? "Digestive support" : "Balanced nutrition",
  });

  // Bedtime Nutrition
  meals.push({
    time: "Bedtime (10:00 PM)",
    foods: ["Warm milk with saffron", "Dates (1-2)"],
    why: "Promotes sleep, provides calcium",
    nutrientFocus: "Calcium + Sleep support",
  });

  // Add deficiency-specific foods to relevant meals
  if (deficiencies.length > 0) {
    const deficiencyFoods = addDeficiencyFoods([], deficiencies);
    // Add to lunch and dinner
    meals[3].foods.push(...deficiencyFoods.slice(0, 2));
    meals[5].foods.push(...deficiencyFoods.slice(2, 4));
  }

  // Generate nutritional highlights
  const nutritionalHighlights = [
    `Trimester ${trimester} focus: ${guidelines.focus}`,
    `Regional preference: ${region === "north" ? "North Indian" : region === "south" ? "South Indian" : region === "east" ? "East Indian" : "West Indian"}`,
    `Diet type: ${dietPreference === "vegetarian" ? "Vegetarian" : "Mixed (Veg + Non-Veg)"}`,
    deficiencies.length > 0 ? `Deficiency-aware: Includes ${deficiencies.join(", ")} support foods` : "Balanced nutrition focus",
  ];

  // Generate recommended foods
  const recommendedFoods = [
    ...regionalFoods.staples,
    ...proteinSources,
    ...regionalFoods.vegetables,
    ...regionalFoods.dairy,
  ];
  if (deficiencies.length > 0) {
    recommendedFoods.push(...addDeficiencyFoods([], deficiencies));
  }

  // Generate foods to reduce
  const foodsToReduce = [...guidelines.avoid];

  return {
    profile: {
      trimester,
      region,
      dietPreference,
    },
    meals,
    nutritionalHighlights,
    recommendedFoods: [...new Set(recommendedFoods)],
    foodsToReduce,
  };
}

// ─── Default Input Helper ─────────────────────────────────────────────────────

export function getDefaultDietInput(): DietInput {
  return {
    trimester: 2,
    region: "north",
    dietPreference: "vegetarian",
    deficiencies: [],
    weight: 65,
  };
}
