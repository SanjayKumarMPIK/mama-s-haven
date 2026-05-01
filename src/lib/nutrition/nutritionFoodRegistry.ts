import type { Phase } from "@/hooks/usePhase";
import type { NutrientFoodEntry, PhaseConfig } from "./nutritionTypes";

// ─── Nutrient → Food Mapping ─────────────────────────────────────────────
export const NUTRIENT_FOOD_MAP: Record<string, { label: string; emoji: string; foods: NutrientFoodEntry[] }> = {
  iron: {
    label: "Iron", emoji: "🔴",
    foods: [
      { name: "Spinach", emoji: "🥬", nutrients: ["Iron", "Folate"], whyItHelps: "Dark leafy greens are rich in non-heme iron" },
      { name: "Lentils (Dal)", emoji: "🫘", nutrients: ["Iron", "Protein", "Fiber"], whyItHelps: "Lentils provide plant-based iron and protein" },
      { name: "Jaggery", emoji: "🟤", nutrients: ["Iron"], whyItHelps: "Traditional iron-rich sweetener, better than refined sugar" },
      { name: "Pomegranate", emoji: "🍎", nutrients: ["Iron", "Vitamin C"], whyItHelps: "Pomegranate boosts hemoglobin naturally" },
      { name: "Beetroot", emoji: "🟣", nutrients: ["Iron", "Folate"], whyItHelps: "Beetroot supports blood health" },
      { name: "Dates", emoji: "🌴", nutrients: ["Iron", "Fiber"], whyItHelps: "Dates are a convenient iron-rich snack" },
    ],
  },
  b12: {
    label: "Vitamin B12", emoji: "💊",
    foods: [
      { name: "Milk", emoji: "🥛", nutrients: ["B12", "Calcium"], whyItHelps: "Dairy is a reliable source of B12" },
      { name: "Curd (Yogurt)", emoji: "🥣", nutrients: ["B12", "Probiotics"], whyItHelps: "Fermented dairy provides B12 and gut health benefits" },
      { name: "Eggs", emoji: "🥚", nutrients: ["B12", "Protein"], whyItHelps: "Eggs are an affordable B12 source" },
      { name: "Paneer", emoji: "🧀", nutrients: ["B12", "Protein", "Calcium"], whyItHelps: "Paneer provides B12 for vegetarians" },
    ],
  },
  vitD: {
    label: "Vitamin D", emoji: "☀️",
    foods: [
      { name: "Sunlight (15 min)", emoji: "🌞", nutrients: ["Vitamin D"], whyItHelps: "Morning sun exposure helps your body produce vitamin D" },
      { name: "Eggs", emoji: "🥚", nutrients: ["Vitamin D", "Protein"], whyItHelps: "Egg yolks contain vitamin D" },
      { name: "Mushrooms", emoji: "🍄", nutrients: ["Vitamin D", "Fiber"], whyItHelps: "Sun-exposed mushrooms are one of few plant D sources" },
      { name: "Fortified Milk", emoji: "🥛", nutrients: ["Vitamin D", "Calcium"], whyItHelps: "Fortified dairy provides both D and calcium" },
    ],
  },
  magnesium: {
    label: "Magnesium", emoji: "🟢",
    foods: [
      { name: "Bananas", emoji: "🍌", nutrients: ["Magnesium", "Potassium"], whyItHelps: "Bananas are an easy magnesium source" },
      { name: "Pumpkin Seeds", emoji: "🎃", nutrients: ["Magnesium", "Zinc"], whyItHelps: "Seeds are magnesium powerhouses" },
      { name: "Dark Chocolate", emoji: "🍫", nutrients: ["Magnesium", "Iron"], whyItHelps: "Dark chocolate provides magnesium and antioxidants" },
      { name: "Almonds", emoji: "🌰", nutrients: ["Magnesium", "Vitamin E"], whyItHelps: "A handful of almonds meets a significant magnesium need" },
      { name: "Ragi (Finger Millet)", emoji: "🌾", nutrients: ["Magnesium", "Calcium"], whyItHelps: "Traditional grain rich in magnesium and calcium" },
    ],
  },
  calcium: {
    label: "Calcium", emoji: "🦴",
    foods: [
      { name: "Milk", emoji: "🥛", nutrients: ["Calcium", "Protein"], whyItHelps: "Milk is one of the best calcium sources" },
      { name: "Ragi", emoji: "🌾", nutrients: ["Calcium", "Iron"], whyItHelps: "Ragi has more calcium than most grains" },
      { name: "Sesame Seeds", emoji: "⚪", nutrients: ["Calcium", "Iron"], whyItHelps: "Til (sesame) seeds are calcium-dense" },
      { name: "Curd", emoji: "🥣", nutrients: ["Calcium", "Probiotics"], whyItHelps: "Curd provides easily absorbed calcium" },
      { name: "Broccoli", emoji: "🥦", nutrients: ["Calcium", "Vitamin C"], whyItHelps: "Non-dairy calcium source with added vitamins" },
    ],
  },
  protein: {
    label: "Protein", emoji: "💪",
    foods: [
      { name: "Dal (Lentils)", emoji: "🫘", nutrients: ["Protein", "Iron", "Fiber"], whyItHelps: "Indian staple rich in plant protein" },
      { name: "Eggs", emoji: "🥚", nutrients: ["Protein", "B12"], whyItHelps: "Complete protein with all essential amino acids" },
      { name: "Chickpeas", emoji: "🫘", nutrients: ["Protein", "Fiber"], whyItHelps: "Versatile legume high in protein" },
      { name: "Paneer", emoji: "🧀", nutrients: ["Protein", "Calcium"], whyItHelps: "High-quality dairy protein" },
      { name: "Peanuts", emoji: "🥜", nutrients: ["Protein", "Healthy Fats"], whyItHelps: "Affordable protein-rich snack" },
    ],
  },
  omega3: {
    label: "Omega-3 (DHA)", emoji: "🐟",
    foods: [
      { name: "Flaxseeds", emoji: "🌱", nutrients: ["Omega-3", "Fiber"], whyItHelps: "Best plant-based omega-3 source" },
      { name: "Walnuts", emoji: "🌰", nutrients: ["Omega-3", "Protein"], whyItHelps: "Walnuts support brain health" },
      { name: "Chia Seeds", emoji: "🌱", nutrients: ["Omega-3", "Fiber", "Calcium"], whyItHelps: "Chia seeds are an omega-3 superfood" },
      { name: "Fish", emoji: "🐟", nutrients: ["Omega-3", "Protein", "Vitamin D"], whyItHelps: "Fish provides DHA directly" },
    ],
  },
  zinc: {
    label: "Zinc", emoji: "🔷",
    foods: [
      { name: "Pumpkin Seeds", emoji: "🎃", nutrients: ["Zinc", "Magnesium"], whyItHelps: "Pumpkin seeds are zinc powerhouses" },
      { name: "Chickpeas", emoji: "🫘", nutrients: ["Zinc", "Protein"], whyItHelps: "Legumes provide plant-based zinc" },
      { name: "Cashews", emoji: "🥜", nutrients: ["Zinc", "Healthy Fats"], whyItHelps: "Cashews are tasty zinc-rich nuts" },
    ],
  },
  fiber: {
    label: "Fiber", emoji: "🌾",
    foods: [
      { name: "Oats", emoji: "🥣", nutrients: ["Fiber", "Iron"], whyItHelps: "Oats provide soluble fiber for digestive health" },
      { name: "Guava", emoji: "🍈", nutrients: ["Fiber", "Vitamin C"], whyItHelps: "Guava is one of the most fiber-rich fruits" },
      { name: "Whole Wheat Roti", emoji: "🫓", nutrients: ["Fiber", "B Vitamins"], whyItHelps: "Whole grains provide sustained fiber intake" },
      { name: "Rajma (Kidney Beans)", emoji: "🫘", nutrients: ["Fiber", "Protein", "Iron"], whyItHelps: "Rajma is both fiber and protein rich" },
    ],
  },
  potassium: {
    label: "Potassium", emoji: "🍌",
    foods: [
      { name: "Bananas", emoji: "🍌", nutrients: ["Potassium", "Magnesium"], whyItHelps: "Classic potassium source" },
      { name: "Coconut Water", emoji: "🥥", nutrients: ["Potassium", "Electrolytes"], whyItHelps: "Natural electrolyte drink" },
      { name: "Sweet Potato", emoji: "🍠", nutrients: ["Potassium", "Vitamin A"], whyItHelps: "Sweet potatoes are potassium-rich" },
    ],
  },
  vitC: {
    label: "Vitamin C", emoji: "🍊",
    foods: [
      { name: "Amla (Indian Gooseberry)", emoji: "🟢", nutrients: ["Vitamin C", "Iron Enhancer"], whyItHelps: "Amla has 20x more vitamin C than oranges" },
      { name: "Orange", emoji: "🍊", nutrients: ["Vitamin C"], whyItHelps: "Classic vitamin C source" },
      { name: "Guava", emoji: "🍈", nutrients: ["Vitamin C", "Fiber"], whyItHelps: "Guava is one of the richest C sources" },
      { name: "Lemon", emoji: "🍋", nutrients: ["Vitamin C"], whyItHelps: "Add lemon to meals to boost iron absorption" },
    ],
  },
  vitE: {
    label: "Vitamin E", emoji: "🌻",
    foods: [
      { name: "Almonds", emoji: "🌰", nutrients: ["Vitamin E", "Magnesium"], whyItHelps: "Almonds are the best food source of vitamin E" },
      { name: "Sunflower Seeds", emoji: "🌻", nutrients: ["Vitamin E", "Selenium"], whyItHelps: "Seeds are vitamin E-rich snacks" },
      { name: "Peanuts", emoji: "🥜", nutrients: ["Vitamin E", "Protein"], whyItHelps: "Affordable vitamin E source" },
    ],
  },
  b6: {
    label: "Vitamin B6", emoji: "💛",
    foods: [
      { name: "Bananas", emoji: "🍌", nutrients: ["B6", "Potassium"], whyItHelps: "Bananas are a natural B6 source" },
      { name: "Chickpeas", emoji: "🫘", nutrients: ["B6", "Protein"], whyItHelps: "Chickpeas are one of the best B6 sources" },
      { name: "Potatoes", emoji: "🥔", nutrients: ["B6", "Potassium"], whyItHelps: "Potatoes provide B6 for anti-nausea support" },
    ],
  },
  vitA: {
    label: "Vitamin A", emoji: "🥕",
    foods: [
      { name: "Carrots", emoji: "🥕", nutrients: ["Vitamin A", "Fiber"], whyItHelps: "Carrots are rich in beta-carotene (precursor to Vitamin A)" },
      { name: "Sweet Potato", emoji: "🍠", nutrients: ["Vitamin A", "Potassium"], whyItHelps: "Sweet potatoes are vitamin A superstars" },
      { name: "Papaya", emoji: "🧡", nutrients: ["Vitamin A", "Vitamin C"], whyItHelps: "Papaya supports skin health" },
    ],
  },
  folate: {
    label: "Folate", emoji: "🥦",
    foods: [
      { name: "Spinach", emoji: "🥬", nutrients: ["Folate", "Iron"], whyItHelps: "Leafy greens are folate-rich" },
      { name: "Beetroot", emoji: "🟣", nutrients: ["Folate", "Iron"], whyItHelps: "Beetroot provides natural folate" },
      { name: "Moong Dal", emoji: "🫘", nutrients: ["Folate", "Protein"], whyItHelps: "Sprouted moong is an excellent folate source" },
    ],
  },
};

// ─── Phase Configurations ─────────────────────────────────────────────────
export const PHASE_CONFIGS: Record<Phase, PhaseConfig> = {
  puberty: {
    symptoms: ["fatigue", "dizziness", "weakness", "moodSwings", "anxiety", "brainFog", "sleepIssues", "backPain", "headache", "bloating", "constipation", "cramps", "acne", "breastTenderness", "heavyPeriod", "irregularCycle", "growthPain", "hairChanges"],
    nutrientPriorities: { iron: 1.4, calcium: 1.3, protein: 1.2, zinc: 1.2, vitD: 1.1 },
    title: "Puberty Nutrition Intelligence",
    emoji: "🌸",
    gradient: "from-pink-500 to-rose-400",
  },
  maternity: {
    symptoms: [
      "fatigue", "dizziness", "weakness", "moodSwings", "anxiety", "brainFog", "sleepIssues", "backPain", "headache", "bloating", "constipation", "swelling",
      // maternity-specific
      "nausea", "vomiting", "legCramps", "heartburn", "spotting", "breathlessness", "cravings", "skinChanges",
      "breastTenderness", "foodAversions", "fetalMovement", "babyBumpGrowth", "increasedAppetite",
      "practiceContractions", "sleepDifficulty", "frequentUrination", "pelvicPressure", "appetiteChanges", "irritability",
      // postpartum / lactation
      "breastPain", "nipplePain", "lowMilkSupply", "lowEnergy", "sleepDeprivation", "bodyAche",
    ],
    nutrientPriorities: { iron: 1.5, folate: 1.5, calcium: 1.4, protein: 1.3, omega3: 1.3, b6: 1.2, magnesium: 1.1, potassium: 1.1 },
    title: "Maternity Nutrition Intelligence",
    emoji: "🤰",
    gradient: "from-purple-500 to-violet-400",
  },
  "family-planning": {
    symptoms: ["fatigue", "dizziness", "weakness", "moodSwings", "anxiety", "brainFog", "sleepIssues", "backPain", "headache", "bloating", "constipation", "ovulationPain", "irregularCycle", "moodChanges", "stress"],
    nutrientPriorities: { iron: 1.3, folate: 1.3, omega3: 1.2, zinc: 1.2, magnesium: 1.1 },
    title: "Family Planning Nutrition Intelligence",
    emoji: "🌿",
    gradient: "from-teal-500 to-emerald-400",
  },
  menopause: {
    symptoms: ["fatigue", "dizziness", "weakness", "moodSwings", "anxiety", "brainFog", "sleepIssues", "backPain", "headache", "bloating", "constipation", "swelling", "hotFlashes", "nightSweats", "jointPain", "dryness", "weightGain", "memoryIssues", "irritability", "heartPalpitations", "bonePain", "hairThinning", "urinaryIssues", "lowLibido"],
    nutrientPriorities: { calcium: 1.5, vitD: 1.5, vitE: 1.3, omega3: 1.3, magnesium: 1.2, iron: 1.1 },
    title: "Menopause Nutrition Intelligence",
    emoji: "✨",
    gradient: "from-amber-500 to-orange-400",
  },
};

// ─── Critical Symptoms (trigger safety warnings) ──────────────────────────
export const CRITICAL_SYMPTOMS: Record<string, { phases: Phase[]; message: string; severity: "amber" | "red" }> = {
  spotting: { phases: ["maternity"], message: "Spotting during pregnancy needs medical attention. Please consult your healthcare provider.", severity: "red" },
  vomiting: { phases: ["maternity"], message: "Persistent vomiting may lead to dehydration. Please consult your doctor if it continues.", severity: "amber" },
  breathlessness: { phases: ["maternity", "menopause"], message: "Breathlessness may need medical evaluation. Please consult your healthcare provider.", severity: "amber" },
  heartPalpitations: { phases: ["menopause"], message: "Heart palpitations should be evaluated by a healthcare professional.", severity: "amber" },
  heavyPeriod: { phases: ["puberty", "family-planning"], message: "Very heavy periods may indicate a condition that needs attention. Consider consulting a doctor.", severity: "amber" },
  dizziness: { phases: ["maternity"], message: "Frequent dizziness during pregnancy should be discussed with your doctor.", severity: "amber" },
  swelling: { phases: ["maternity"], message: "Sudden or severe swelling during pregnancy may need urgent evaluation.", severity: "amber" },
};

// ─── Nutrient Phase Priorities (boost scores) ─────────────────────────────
export const PHASE_NUTRIENT_PRIORITIES: Record<Phase, Record<string, number>> = PHASE_CONFIGS.puberty.nutrientPriorities
  ? {
      puberty: PHASE_CONFIGS.puberty.nutrientPriorities,
      maternity: PHASE_CONFIGS.maternity.nutrientPriorities,
      "family-planning": PHASE_CONFIGS["family-planning"].nutrientPriorities,
      menopause: PHASE_CONFIGS.menopause.nutrientPriorities,
    }
  : { puberty: {}, maternity: {}, "family-planning": {}, menopause: {} };
