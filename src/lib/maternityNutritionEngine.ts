import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";

// ─── Constants ────────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

// ─── Types ────────────────────────────────────────────────────────────

export type Confidence = "Low" | "Medium" | "High";

export interface MaternityDeficiencyPrediction {
  id: string;
  title: string;
  nutrient: string;
  reasons: string[]; // matched symptoms
  whyPredicted: string;
  whyItMatters: string;
  foods: string[];
  habits: string[];
  confidence: Confidence;
}

export interface MaternityFallbackRecommendation {
  trimester: number;
  focusTitle: string;
  whyItMatters: string;
  foods: string[];
  habits: string[];
}

export interface MaternityPredictionResult {
  hasData: boolean;
  predictions: MaternityDeficiencyPrediction[];
  fallback: MaternityFallbackRecommendation | null;
}

// ─── Rule Definitions ─────────────────────────────────────────────────

interface DeficiencyRule {
  id: string;
  nutrient: string;
  targetSymptoms: string[]; // exact keys from MaternityEntry.symptoms or "fatigue"
  priorityTrimesters: number[];
  title: string;
  whyItMatters: string;
  foods: string[];
  habits: string[];
}

const DEFICIENCY_RULES: DeficiencyRule[] = [
  {
    id: "iron",
    nutrient: "Iron",
    targetSymptoms: ["fatigue", "dizziness"],
    priorityTrimesters: [2, 3],
    title: "Possible Iron Deficiency",
    whyItMatters: "Iron supports oxygen supply to your baby and helps prevent anemia-related exhaustion.",
    foods: ["Spinach (Palak)", "Beetroot", "Lentils (Dal)", "Dates & Jaggery"],
    habits: ["Pair iron-rich foods with Vitamin C (like lemon) for better absorption.", "Avoid tea/coffee right after meals."],
  },
  {
    id: "calcium",
    nutrient: "Calcium",
    targetSymptoms: ["backPain"],
    priorityTrimesters: [2, 3],
    title: "Possible Calcium Deficiency",
    whyItMatters: "Calcium supports your baby's growing bones and helps ease muscle or back pain.",
    foods: ["Milk & Curd", "Ragi", "Sesame seeds (Til)", "Paneer"],
    habits: ["Get 15 minutes of morning sunlight for Vitamin D.", "Include a dairy serving twice a day."],
  },
  {
    id: "b6_folate",
    nutrient: "Vitamin B6 & Folate",
    targetSymptoms: ["nausea"],
    priorityTrimesters: [1],
    title: "Possible B6 / Folate Needs",
    whyItMatters: "Folate is crucial for early neural development, and B6 helps settle a nauseous stomach.",
    foods: ["Ginger", "Banana", "Leafy Greens", "Citrus Fruits"],
    habits: ["Eat small, frequent meals rather than large ones.", "Sip ginger water to ease morning sickness."],
  },
  {
    id: "hydration_potassium",
    nutrient: "Hydration & Potassium",
    targetSymptoms: ["swelling", "dizziness"],
    priorityTrimesters: [1, 2, 3],
    title: "Possible Hydration/Potassium Imbalance",
    whyItMatters: "Adequate hydration and potassium help balance fluids and reduce pregnancy swelling.",
    foods: ["Coconut Water", "Banana", "Cucumber", "Buttermilk (Chaas)"],
    habits: ["Keep your feet elevated when sitting.", "Drink at least 2.5–3 liters of water daily."],
  },
  {
    id: "magnesium",
    nutrient: "Magnesium",
    targetSymptoms: ["sleepDisturbance", "fatigue"],
    priorityTrimesters: [3],
    title: "Possible Magnesium Need",
    whyItMatters: "Magnesium relaxes the nervous system, helping improve sleep and reduce muscle tension.",
    foods: ["Almonds", "Pumpkin Seeds", "Banana", "Dark Chocolate"],
    habits: ["Have warm milk with a pinch of nutmeg before bed.", "Practice gentle stretching before sleeping."],
  },
];

const FALLBACK_RECOMMENDATIONS: Record<number, MaternityFallbackRecommendation> = {
  1: {
    trimester: 1,
    focusTitle: "Folic Acid & B6 Focus",
    whyItMatters: "The first trimester is crucial for baby's neural tube development and managing early pregnancy nausea.",
    foods: ["Lentils (Dal)", "Spinach", "Citrus Fruits", "Ginger"],
    habits: ["Keep dry crackers by your bed for morning sickness.", "Don't skip your prescribed folic acid supplements."],
  },
  2: {
    trimester: 2,
    focusTitle: "Iron & Calcium Focus",
    whyItMatters: "Your blood volume is expanding, and baby's bones are hardening, demanding higher iron and calcium.",
    foods: ["Milk & Curd", "Ragi", "Beetroot", "Dates & Jaggery"],
    habits: ["Separate calcium and iron supplements if taking both (they compete for absorption).", "Add lemon to iron-rich meals."],
  },
  3: {
    trimester: 3,
    focusTitle: "Calcium, Energy & Hydration",
    whyItMatters: "Baby is growing rapidly, requiring steady energy and bone minerals. Hydration prevents late-pregnancy swelling.",
    foods: ["Coconut Water", "Banana", "Paneer", "Nuts & Seeds"],
    habits: ["Eat small, frequent meals to avoid heartburn.", "Elevate your feet to reduce swelling."],
  },
};

// ─── Engine Function ──────────────────────────────────────────────────

export function predictMaternityDeficiencies(
  logs: HealthLogs,
  trimester: number
): MaternityPredictionResult {
  const todayISO = toISODate(new Date());
  const d7 = getDaysAgoISO(7);

  const symptomGivenLast7d = new Set<string>();
  let hasLoggedDays = false;

  // Process logs
  for (const [dateISO, entryRaw] of Object.entries(logs)) {
    if (entryRaw.phase !== "maternity") continue;
    if (dateISO > todayISO || dateISO < d7) continue;

    hasLoggedDays = true;
    const entry = entryRaw as MaternityEntry;

    if (entry.fatigueLevel === "Medium" || entry.fatigueLevel === "High") {
      symptomGivenLast7d.add("fatigue");
    }
    if (entry.sleepHours !== null && entry.sleepHours < 6) {
      symptomGivenLast7d.add("sleepDisturbance");
    }

    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([sym, isTrue]) => {
        if (isTrue) symptomGivenLast7d.add(sym);
      });
    }
  }

  // If no symptoms, return fallback
  if (!hasLoggedDays || symptomGivenLast7d.size === 0) {
    return {
      hasData: false,
      predictions: [],
      fallback: FALLBACK_RECOMMENDATIONS[trimester] || FALLBACK_RECOMMENDATIONS[2],
    };
  }

  const predictions: MaternityDeficiencyPrediction[] = [];

  // Match against rules
  DEFICIENCY_RULES.forEach((rule) => {
    // Check how many of the rule's target symptoms the user has logged
    const matchedSymptoms = rule.targetSymptoms.filter((sym) =>
      symptomGivenLast7d.has(sym)
    );

    if (matchedSymptoms.length > 0) {
      // Calculate confidence
      let score = matchedSymptoms.length;
      if (rule.priorityTrimesters.includes(trimester)) {
        score += 1;
      }

      let confidence: Confidence = "Low";
      if (score >= 3) confidence = "High";
      else if (score === 2) confidence = "Medium";

      // Format human-readable reasons (e.g., "fatigue and dizziness")
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

  // Sort by confidence (High first, then Medium, Low)
  const confidenceWeight = { High: 3, Medium: 2, Low: 1 };
  predictions.sort((a, b) => confidenceWeight[b.confidence] - confidenceWeight[a.confidence]);

  // If we had logs but no predictions matched strangely, fallback
  if (predictions.length === 0) {
    return {
      hasData: false,
      predictions: [],
      fallback: FALLBACK_RECOMMENDATIONS[trimester] || FALLBACK_RECOMMENDATIONS[2],
    };
  }

  return {
    hasData: true,
    predictions,
    fallback: null,
  };
}
