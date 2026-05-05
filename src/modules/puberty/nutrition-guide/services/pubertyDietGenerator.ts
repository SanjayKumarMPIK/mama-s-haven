/**
 * pubertyDietGenerator.ts
 *
 * Dynamic Indian diet chart generator for puberty nutrition.
 * Generates personalized meal plans based on region, diet preference,
 * and deficiency insights.
 */

export type DietPreference = "vegetarian" | "mixed";
export type Region = "north" | "south" | "east" | "west";

export interface PubertyDietInput {
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

export interface PubertyDietPlan {
  profile: {
    region: Region;
    dietPreference: DietPreference;
  };
  meals: Meal[];
  nutritionalHighlights: string[];
  recommendedFoods: string[];
  foodsToReduce: string[];
}

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

const DEFICIENCY_FOODS = {
  iron: ["Spinach", "Dates", "Lentils", "Beetroot", "Jaggery", "Rajma"],
  protein: ["Eggs", "Paneer", "Legumes", "Chicken", "Greek yogurt", "Soy"],
  calcium: ["Milk", "Sesame seeds", "Curd", "Ragi", "Paneer", "Almonds"],
  magnesium: ["Almonds", "Pumpkin seeds", "Banana", "Dark chocolate", "Spinach"],
  b6_folate: ["Banana", "Leafy greens", "Citrus fruits", "Ginger", "Avocado"],
};

const PUBERTY_GUIDELINES = {
  focus: "Bone growth, hormonal balance, sustained energy",
  foods: ["Calcium-rich foods", "Iron sources", "Protein", "Nuts", "Healthy fats"],
  avoid: ["Excess sugary drinks", "Highly processed snacks"],
};

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
  return [...new Set(foods)];
}

function getProteinSource(dietPreference: DietPreference, region: Region): string[] {
  const regionalProteins = getRegionalFood(region, "proteins");
  if (dietPreference === "mixed") {
    return [...regionalProteins, "Eggs", "Chicken", "Fish"];
  }
  return regionalProteins;
}

export function generatePubertyDiet(input: PubertyDietInput): PubertyDietPlan {
  const { region, dietPreference, deficiencies } = input;
  const guidelines = PUBERTY_GUIDELINES;
  const regionalFoods = REGIONAL_FOODS[region];
  const proteinSources = getProteinSource(dietPreference, region);

  const meals: Meal[] = [];

  meals.push({
    time: "Early Morning (7:00 AM)",
    foods: ["Warm water", "Soaked almonds (5-6)", "Walnuts"],
    why: "Kickstarts metabolism and provides omega-3s for brain development",
    nutrientFocus: "Hydration + Healthy Fats",
  });

  const breakfastOptions = regionalFoods.breakfast.slice(0, 2);
  meals.push({
    time: "Breakfast (8:30 AM)",
    foods: [
      ...breakfastOptions,
      "Milk or Yogurt",
      dietPreference === "mixed" ? "Eggs (optional)" : "Paneer/Sprouts",
    ],
    why: "Energy and calcium for bone growth",
    nutrientFocus: "Calcium + Protein",
  });

  meals.push({
    time: "School/Mid-Morning Snack (11:00 AM)",
    foods: ["Seasonal fruit", "Roasted chana or seeds"],
    why: "Maintains focus and energy levels",
    nutrientFocus: "Vitamins + Fiber",
  });

  const lunchStaple = regionalFoods.staples[0];
  const lunchProtein = proteinSources[0];
  meals.push({
    time: "Lunch (1:30 PM)",
    foods: [
      lunchStaple,
      lunchProtein,
      "Seasonal vegetables",
      "Curd",
      "Salad",
    ],
    why: "Balanced meal with protein, carbs, and probiotics for growth",
    nutrientFocus: "Protein + Fiber + Calcium",
  });

  const eveningSnack = regionalFoods.snacks[0];
  meals.push({
    time: "Evening Snack (5:00 PM)",
    foods: [eveningSnack, "Milk", "Fruit"],
    why: "Prevents evening hunger and aids recovery from activities",
    nutrientFocus: "Protein + Vitamins",
  });

  const dinnerStaple = regionalFoods.staples[1] || regionalFoods.staples[0];
  meals.push({
    time: "Dinner (8:00 PM)",
    foods: [
      dinnerStaple,
      "Light dal or protein",
      "Seasonal vegetables",
    ],
    why: "Balanced nutrition for overnight recovery and hormone production",
    nutrientFocus: "Balanced nutrition",
  });

  if (deficiencies.length > 0) {
    const deficiencyFoods = addDeficiencyFoods([], deficiencies);
    meals[3].foods.push(...deficiencyFoods.slice(0, 2));
    meals[5].foods.push(...deficiencyFoods.slice(2, 4));
  }

  const nutritionalHighlights = [
    `Puberty focus: ${guidelines.focus}`,
    `Regional preference: ${region === "north" ? "North Indian" : region === "south" ? "South Indian" : region === "east" ? "East Indian" : "West Indian"}`,
    `Diet type: ${dietPreference === "vegetarian" ? "Vegetarian" : "Mixed (Veg + Non-Veg)"}`,
    deficiencies.length > 0 ? `Deficiency-aware: Includes ${deficiencies.join(", ")} support foods` : "Balanced nutrition focus",
  ];

  const recommendedFoods = [
    ...regionalFoods.staples,
    ...proteinSources,
    ...regionalFoods.vegetables,
    ...regionalFoods.dairy,
  ];
  if (deficiencies.length > 0) {
    recommendedFoods.push(...addDeficiencyFoods([], deficiencies));
  }

  return {
    profile: {
      region,
      dietPreference,
    },
    meals,
    nutritionalHighlights,
    recommendedFoods: [...new Set(recommendedFoods)],
    foodsToReduce: [...guidelines.avoid],
  };
}

export function getDefaultPubertyDietInput(): PubertyDietInput {
  return {
    region: "north",
    dietPreference: "vegetarian",
    deficiencies: [],
    weight: 45,
  };
}
