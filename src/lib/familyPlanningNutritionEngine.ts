import type { HealthLogs } from "@/hooks/useHealthLog";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

export type Confidence = "Low" | "Medium" | "High";

export interface FamilyPlanningDeficiencyPrediction {
  id: string;
  title: string;
  nutrient: string;
  reasons: string[];
  whyPredicted: string;
  whyItMatters: string;
  foods: string[];
  habits: string[];
  confidence: Confidence;
}

export interface FamilyPlanningFallbackRecommendation {
  focusTitle: string;
  whyItMatters: string;
  foods: string[];
  habits: string[];
}

export interface FamilyPlanningPredictionResult {
  hasData: boolean;
  predictions: FamilyPlanningDeficiencyPrediction[];
  fallback: FamilyPlanningFallbackRecommendation | null;
}

interface DeficiencyRule {
  id: string;
  nutrient: string;
  targetSymptoms: string[];
  title: string;
  whyItMatters: string;
  foods: string[];
  habits: string[];
}

const DEFICIENCY_RULES: DeficiencyRule[] = [
  {
    id: "folate",
    nutrient: "Folic Acid & Folate",
    targetSymptoms: ["irregularCycle", "fatigue"],
    title: "Possible Folate Need",
    whyItMatters: "Folate is critical when preparing for pregnancy to support early neural tube development and regulate cycles.",
    foods: ["Spinach (Palak)", "Lentils (Dal)", "Citrus Fruits", "Beetroot", "Broccoli"],
    habits: ["Consider a daily prenatal vitamin with folic acid.", "Eat fresh, leafy greens regularly."],
  },
  {
    id: "omega3",
    nutrient: "Omega-3 Fatty Acids",
    targetSymptoms: ["moodSwings", "moodChanges", "ovulationPain"],
    title: "Possible Omega-3 Need",
    whyItMatters: "Omega-3s reduce inflammation, helping ease ovulation pain and balance hormones for mood stability.",
    foods: ["Walnuts (Akhrot)", "Flaxseeds (Alsi)", "Chia Seeds", "Fish (if non-veg)"],
    habits: ["Add a spoonful of flaxseeds to a morning smoothie or oats.", "Focus on healthy fats to support hormone production."],
  },
  {
    id: "iron",
    nutrient: "Iron",
    targetSymptoms: ["fatigue", "dizziness"],
    title: "Possible Iron Deficiency",
    whyItMatters: "Building healthy iron stores before pregnancy ensures better oxygen transport and prevents exhaustion.",
    foods: ["Spinach", "Dates (Khajoor)", "Jaggery (Gur)", "Lentils", "Pomegranate"],
    habits: ["Pair iron-rich foods with Vitamin C (like lemon) for absorption.", "Avoid taking tea or coffee with your meals."],
  },
  {
    id: "magnesium",
    nutrient: "Magnesium",
    targetSymptoms: ["cramps", "stress", "sleepIssues", "headache"],
    title: "Possible Magnesium Need",
    whyItMatters: "Magnesium relaxes the nervous system, eases muscle cramping, and helps combat sleep disruptions and stress.",
    foods: ["Pumpkin Seeds", "Almonds", "Dark Chocolate", "Banana"],
    habits: ["Try a handful of almonds as a mid-day snack.", "Prioritize a calming bedtime routine."],
  },
  {
    id: "b6",
    nutrient: "Vitamin B6",
    targetSymptoms: ["moodChanges", "stress"],
    title: "Possible Vitamin B6 Need",
    whyItMatters: "Vitamin B6 helps regulate neurotransmitters, promoting emotional balance and a healthy stress response.",
    foods: ["Banana", "Chickpeas (Chana)", "Potatoes", "Sunflower Seeds"],
    habits: ["Incorporate chickpeas into salads or curries.", "Eat regular, balanced meals to stabilize blood sugar."],
  }
];

const FALLBACK_RECOMMENDATION: FamilyPlanningFallbackRecommendation = {
  focusTitle: "Preconception Health & Balance",
  whyItMatters: "Preparing your body for pregnancy starts with building a robust foundation of essential nutrients like folate and iron.",
  foods: ["Lentils (Dal)", "Leafy Greens", "Nuts & Seeds", "Fresh Fruits"],
  habits: ["Start taking a prenatal vitamin with folic acid if you haven't.", "Maintain a balanced, nutrient-dense diet."],
};

export function predictFamilyPlanningDeficiencies(
  logs: HealthLogs
): FamilyPlanningPredictionResult {
  const todayISO = toISODate(new Date());
  const d14 = getDaysAgoISO(14); // Look back slightly longer for cycle variations

  const symptomGivenLast14d = new Set<string>();
  let hasLoggedDays = false;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "family-planning") continue;
    if (dateISO > todayISO || dateISO < d14) continue;

    hasLoggedDays = true;

    // In family planning, symptoms might be mapped slightly differently, but usually they are flat booleans
    // or string-based properties. Let's assume standard 'symptoms' object
    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([sym, isTrue]) => {
        if (isTrue) symptomGivenLast14d.add(sym);
      });
    }
  }

  if (!hasLoggedDays || symptomGivenLast14d.size === 0) {
    return {
      hasData: false,
      predictions: [],
      fallback: FALLBACK_RECOMMENDATION,
    };
  }

  const predictions: FamilyPlanningDeficiencyPrediction[] = [];

  DEFICIENCY_RULES.forEach((rule) => {
    const matchedSymptoms = rule.targetSymptoms.filter((sym) =>
      symptomGivenLast14d.has(sym)
    );

    if (matchedSymptoms.length > 0) {
      let confidence: Confidence = "Low";
      if (matchedSymptoms.length >= 2) confidence = "High";
      else if (matchedSymptoms.length === 1) confidence = "Medium";

      const formattedReasons = matchedSymptoms.join(" and ");

      predictions.push({
        id: rule.id,
        title: rule.title,
        nutrient: rule.nutrient,
        reasons: matchedSymptoms,
        whyPredicted: `Based on ${formattedReasons} logged in your calendar recently.`,
        whyItMatters: rule.whyItMatters,
        foods: rule.foods,
        habits: rule.habits,
        confidence,
      });
    }
  });

  const confidenceWeight = { High: 3, Medium: 2, Low: 1 };
  predictions.sort((a, b) => confidenceWeight[b.confidence] - confidenceWeight[a.confidence]);

  if (predictions.length === 0) {
    return {
      hasData: true, // They logged data but matched nothing
      predictions: [],
      fallback: FALLBACK_RECOMMENDATION,
    };
  }

  return {
    hasData: true,
    predictions,
    fallback: null,
  };
}
