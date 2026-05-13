/**
 * nutrientSymptomWeights.ts
 *
 * Curated symptom → nutrient deficiency weight tables for maternity.
 * These are wellness-indicator weights, NOT medical diagnosis scores.
 *
 * Each nutrient has a map of symptom IDs to point contributions.
 * A single symptom should NEVER produce a high-confidence result alone.
 * Confidence grows when MULTIPLE correlated symptoms appear together.
 */

// ─── Nutrient Weight Tables ─────────────────────────────────────────────────

export interface NutrientWeightTable {
  nutrientId: string;
  label: string;
  emoji: string;
  /** symptomCanonicalId → base points (before modifiers) */
  symptomWeights: Record<string, number>;
  /** Max possible raw score (sum of all weights) — used for normalization */
  maxRaw: number;
  /** Recommended foods */
  foods: { name: string; emoji: string }[];
  /** Lifestyle tips */
  lifestyleTips: string[];
}

export const NUTRIENT_WEIGHT_TABLES: NutrientWeightTable[] = [
  {
    nutrientId: "iron",
    label: "Iron",
    emoji: "🔴",
    symptomWeights: {
      fatigue: 25,
      weakness: 20,
      dizziness: 25,
      breathlessness: 20,
      headache: 15,
      brainFog: 15,
      lowEnergy: 20,
    },
    maxRaw: 140,
    foods: [
      { name: "Spinach", emoji: "🥬" },
      { name: "Lentils", emoji: "🫘" },
      { name: "Beetroot", emoji: "🫒" },
      { name: "Dates", emoji: "🌴" },
      { name: "Jaggery", emoji: "🧱" },
      { name: "Pomegranate", emoji: "🍎" },
    ],
    lifestyleTips: [
      "Pair iron-rich foods with Vitamin C for better absorption",
      "Avoid tea/coffee within 1 hour of iron-rich meals",
      "Cook in iron vessels when possible",
    ],
  },
  {
    nutrientId: "vitD",
    label: "Vitamin D",
    emoji: "☀️",
    symptomWeights: {
      bodyAche: 25,
      anxiety: 20,
      fatigue: 15,
      sleepIssues: 15,
      backPain: 20,
      cramps: 20,
    },
    maxRaw: 115,
    foods: [
      { name: "Sunlight (15 min)", emoji: "☀️" },
      { name: "Eggs", emoji: "🥚" },
      { name: "Mushrooms", emoji: "🍄" },
      { name: "Fortified milk", emoji: "🥛" },
    ],
    lifestyleTips: [
      "Get 15–20 minutes of morning sunlight daily",
      "Consider fortified foods if sunlight exposure is limited",
    ],
  },
  {
    nutrientId: "calcium",
    label: "Calcium",
    emoji: "🦴",
    symptomWeights: {
      cramps: 25,
      backPain: 20,
      bodyAche: 20,
      swelling: 10,
      breastPain: 10,
    },
    maxRaw: 85,
    foods: [
      { name: "Curd/Yogurt", emoji: "🥛" },
      { name: "Ragi", emoji: "🌾" },
      { name: "Sesame seeds", emoji: "🫘" },
      { name: "Milk", emoji: "🥛" },
      { name: "Paneer", emoji: "🧀" },
    ],
    lifestyleTips: [
      "Ensure adequate Vitamin D for calcium absorption",
      "Space calcium intake throughout the day",
    ],
  },
  {
    nutrientId: "b12",
    label: "Vitamin B12",
    emoji: "💊",
    symptomWeights: {
      brainFog: 25,
      fatigue: 20,
      weakness: 20,
      dizziness: 20,
      moodSwings: 15,
    },
    maxRaw: 100,
    foods: [
      { name: "Curd", emoji: "🥛" },
      { name: "Eggs", emoji: "🥚" },
      { name: "Paneer", emoji: "🧀" },
      { name: "Fortified cereals", emoji: "🥣" },
    ],
    lifestyleTips: [
      "Vegetarians may need B12 supplementation — consult your doctor",
      "B12 is found mainly in animal products and fortified foods",
    ],
  },
  {
    nutrientId: "folate",
    label: "Folate",
    emoji: "🥦",
    symptomWeights: {
      fatigue: 15,
      brainFog: 15,
      irritability: 10,
      appetiteChanges: 10,
      weakness: 15,
    },
    maxRaw: 65,
    foods: [
      { name: "Green leafy vegetables", emoji: "🥬" },
      { name: "Lentils", emoji: "🫘" },
      { name: "Oranges", emoji: "🍊" },
      { name: "Avocado", emoji: "🥑" },
      { name: "Chickpeas", emoji: "🫘" },
    ],
    lifestyleTips: [
      "Folate is especially critical in the 1st trimester for neural tube development",
      "Eat folate-rich foods daily, not just occasionally",
    ],
  },
  {
    nutrientId: "protein",
    label: "Protein",
    emoji: "💪",
    symptomWeights: {
      lowEnergy: 20,
      increasedAppetite: 15,
      weakness: 20,
      bodyAche: 15,
      backPain: 20,
    },
    maxRaw: 90,
    foods: [
      { name: "Dal/Lentils", emoji: "🫘" },
      { name: "Eggs", emoji: "🥚" },
      { name: "Paneer", emoji: "🧀" },
      { name: "Nuts", emoji: "🥜" },
      { name: "Sprouts", emoji: "🌱" },
    ],
    lifestyleTips: [
      "Include a protein source in every meal",
      "Combine legumes with grains for complete protein",
    ],
  },
  {
    nutrientId: "magnesium",
    label: "Magnesium",
    emoji: "🟢",
    symptomWeights: {
      sleepDifficulty: 20,
      sleepIssues: 20,
      anxiety: 20,
      stress: 20,
      cramps: 25,
      headache: 15,
      irritability: 15,
    },
    maxRaw: 135,
    foods: [
      { name: "Bananas", emoji: "🍌" },
      { name: "Almonds", emoji: "🥜" },
      { name: "Dark chocolate", emoji: "🍫" },
      { name: "Whole grains", emoji: "🌾" },
      { name: "Pumpkin seeds", emoji: "🎃" },
    ],
    lifestyleTips: [
      "Magnesium-rich foods before bed may improve sleep quality",
      "Stay well hydrated — dehydration depletes magnesium",
    ],
  },
  {
    nutrientId: "omega3",
    label: "Omega-3",
    emoji: "🐟",
    symptomWeights: {
      brainFog: 20,
      moodSwings: 20,
      anxiety: 15,
      stress: 15,
      irritability: 15,
      sleepIssues: 10,
    },
    maxRaw: 95,
    foods: [
      { name: "Flaxseeds", emoji: "🌻" },
      { name: "Walnuts", emoji: "🥜" },
      { name: "Chia seeds", emoji: "🫘" },
      { name: "Fish (if non-veg)", emoji: "🐟" },
    ],
    lifestyleTips: [
      "Omega-3 supports baby's brain development",
      "Add ground flaxseeds to smoothies or yogurt",
    ],
  },
  {
    nutrientId: "zinc",
    label: "Zinc",
    emoji: "🔷",
    symptomWeights: {
      appetiteChanges: 15,
      skinChanges: 20,
      weakness: 15,
      bodyAche: 15,
    },
    maxRaw: 65,
    foods: [
      { name: "Pumpkin seeds", emoji: "🎃" },
      { name: "Chickpeas", emoji: "🫘" },
      { name: "Cashews", emoji: "🥜" },
      { name: "Whole grains", emoji: "🌾" },
    ],
    lifestyleTips: [
      "Zinc supports immune function and wound healing",
      "Soaking legumes improves zinc absorption",
    ],
  },
  {
    nutrientId: "potassium",
    label: "Potassium",
    emoji: "🍌",
    symptomWeights: {
      cramps: 25,
      weakness: 20,
      frequentUrination: 15,
      fatigue: 15,
      dizziness: 15,
    },
    maxRaw: 90,
    foods: [
      { name: "Bananas", emoji: "🍌" },
      { name: "Coconut water", emoji: "🥥" },
      { name: "Sweet potatoes", emoji: "🍠" },
      { name: "Oranges", emoji: "🍊" },
    ],
    lifestyleTips: [
      "Potassium helps regulate fluid balance and blood pressure",
      "Coconut water is a natural potassium source",
    ],
  },
];

// ─── Pregnancy Phase Modifiers ──────────────────────────────────────────────
// Percentage boost applied AFTER base scoring to reflect trimester-specific demands.

export const PREGNANCY_MODIFIERS: Record<string, Record<string, number>> = {
  trimester1: {
    folate: 0.30,
    b12: 0.15,
  },
  trimester2: {
    iron: 0.15,
    protein: 0.10,
  },
  trimester3: {
    iron: 0.20,
    calcium: 0.20,
    magnesium: 0.15,
  },
  postpartum: {
    protein: 0.20,
    calcium: 0.15,
    iron: 0.15,
  },
};

// ─── Lifestyle Modifiers (future extensibility) ─────────────────────────────

export const LIFESTYLE_MODIFIERS: Record<string, Record<string, number>> = {
  vegetarian: { b12: 0.20, iron: 0.10 },
  poorSleep: { magnesium: 0.10, omega3: 0.10 },
  lowSunlight: { vitD: 0.25 },
  lowWater: { magnesium: 0.10, potassium: 0.10 },
};

// ─── Severity Multipliers ───────────────────────────────────────────────────

export const SEVERITY_MULTIPLIERS: Record<string, number> = {
  mild: 1.0,
  moderate: 1.3,
  severe: 1.6,
};

// ─── Frequency Multipliers ──────────────────────────────────────────────────
// Based on how often symptom appears out of logged days

export function getFrequencyMultiplier(frequency: number, totalLoggedDays: number): number {
  if (totalLoggedDays <= 0 || frequency <= 0) return 1.0;
  const ratio = frequency / totalLoggedDays;
  if (ratio >= 0.7) return 1.5;  // daily
  if (ratio >= 0.3) return 1.2;  // weekly
  return 1.0;                     // occasional
}
