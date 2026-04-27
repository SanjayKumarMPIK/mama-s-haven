/**
 * familyPlanningNutritionEngine.ts
 *
 * Comprehensive nutrition engine for the Family Planning phase.
 * Provides:
 *   1. Symptom-based deficiency predictions (enhanced from original)
 *   2. Intent-aware nutrition recommendations (TTC / Avoid / Tracking)
 *   3. Cycle-phase nutrition plans (Menstrual / Follicular / Ovulatory / Luteal)
 *   4. Foods to avoid / reduce
 *   5. Lifestyle & metabolism insights
 *
 * All content uses suggestive, non-medical language per safety rules.
 */

import type { HealthLogs } from "@/hooks/useHealthLog";
import type { FPIntent } from "@/hooks/useFamilyPlanningProfile";

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

// ─── 1. Deficiency Predictions (preserved + enhanced) ─────────────────────────

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
  riskScore: number; // 0-100
  symptomFrequency: number; // how many days symptom appeared
  totalLogDays: number; // how many days user logged
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
  whyItMatters: (intent: FPIntent) => string;
  foods: string[];
  habits: string[];
}

const DEFICIENCY_RULES: DeficiencyRule[] = [
  {
    id: "folate",
    nutrient: "Folic Acid & Folate",
    targetSymptoms: ["irregularCycle", "fatigue"],
    title: "Possible Folate Need",
    whyItMatters: (intent) =>
      intent === "ttc"
        ? "Folate is critical when preparing for pregnancy to support early neural tube development and regulate cycles."
        : intent === "avoid"
        ? "Folate supports hormonal balance and healthy cycle regulation, which aids in accurate cycle tracking."
        : "Folate helps maintain healthy red blood cells and supports overall reproductive wellness.",
    foods: ["Spinach (Palak)", "Lentils (Dal)", "Citrus Fruits", "Beetroot", "Broccoli"],
    habits: ["Consider a daily prenatal vitamin with folic acid.", "Eat fresh, leafy greens regularly."],
  },
  {
    id: "omega3",
    nutrient: "Omega-3 Fatty Acids",
    targetSymptoms: ["moodSwings", "moodChanges", "ovulationPain"],
    title: "Possible Omega-3 Need",
    whyItMatters: (intent) =>
      intent === "ttc"
        ? "Omega-3s reduce inflammation, helping ease ovulation pain and balance hormones for better conception readiness."
        : "Omega-3s reduce inflammation, helping ease ovulation pain and balance hormones for mood stability.",
    foods: ["Walnuts (Akhrot)", "Flaxseeds (Alsi)", "Chia Seeds", "Fish (if non-veg)"],
    habits: ["Add a spoonful of flaxseeds to a morning smoothie or oats.", "Focus on healthy fats to support hormone production."],
  },
  {
    id: "iron",
    nutrient: "Iron",
    targetSymptoms: ["fatigue", "dizziness"],
    title: "Possible Iron Deficiency",
    whyItMatters: (intent) =>
      intent === "ttc"
        ? "Building healthy iron stores before pregnancy ensures better oxygen transport and prevents exhaustion."
        : "Adequate iron supports energy levels and helps prevent fatigue during your menstrual cycle.",
    foods: ["Spinach", "Dates (Khajoor)", "Jaggery (Gur)", "Lentils", "Pomegranate"],
    habits: ["Pair iron-rich foods with Vitamin C (like lemon) for absorption.", "Avoid taking tea or coffee with your meals."],
  },
  {
    id: "magnesium",
    nutrient: "Magnesium",
    targetSymptoms: ["cramps", "stress", "sleepIssues", "headache"],
    title: "Possible Magnesium Need",
    whyItMatters: () =>
      "Magnesium relaxes the nervous system, eases muscle cramping, and helps combat sleep disruptions and stress.",
    foods: ["Pumpkin Seeds", "Almonds", "Dark Chocolate", "Banana"],
    habits: ["Try a handful of almonds as a mid-day snack.", "Prioritize a calming bedtime routine."],
  },
  {
    id: "b6",
    nutrient: "Vitamin B6",
    targetSymptoms: ["moodChanges", "stress"],
    title: "Possible Vitamin B6 Need",
    whyItMatters: () =>
      "Vitamin B6 helps regulate neurotransmitters, promoting emotional balance and a healthy stress response.",
    foods: ["Banana", "Chickpeas (Chana)", "Potatoes", "Sunflower Seeds"],
    habits: ["Incorporate chickpeas into salads or curries.", "Eat regular, balanced meals to stabilize blood sugar."],
  },
  {
    id: "vitd",
    nutrient: "Vitamin D",
    targetSymptoms: ["fatigue", "moodSwings", "sleepIssues"],
    title: "Possible Vitamin D Need",
    whyItMatters: (intent) =>
      intent === "ttc"
        ? "Vitamin D supports egg quality and implantation success, and helps regulate menstrual cycle hormones."
        : "Vitamin D supports immune function, bone health, and helps regulate mood-related hormones.",
    foods: ["Fortified Milk", "Egg Yolks", "Mushrooms", "Fatty Fish (if non-veg)"],
    habits: ["Get 15 minutes of morning sunlight daily.", "Consider a Vitamin D supplement if levels are low."],
  },
  {
    id: "zinc",
    nutrient: "Zinc",
    targetSymptoms: ["acne", "irregularCycle", "fatigue"],
    title: "Possible Zinc Need",
    whyItMatters: (intent) =>
      intent === "ttc"
        ? "Zinc is essential for egg development and ovulation regulation, supporting healthy conception."
        : "Zinc supports skin health, immune function, and helps regulate menstrual cycles.",
    foods: ["Pumpkin Seeds", "Chickpeas", "Cashews", "Sesame Seeds"],
    habits: ["Add a handful of pumpkin seeds to your daily diet.", "Include legumes in at least one meal daily."],
  },
];

const FALLBACK_RECOMMENDATION: FamilyPlanningFallbackRecommendation = {
  focusTitle: "Preconception Health & Balance",
  whyItMatters: "Preparing your body starts with building a robust foundation of essential nutrients like folate and iron.",
  foods: ["Lentils (Dal)", "Leafy Greens", "Nuts & Seeds", "Fresh Fruits"],
  habits: ["Start taking a prenatal vitamin with folic acid if you haven't.", "Maintain a balanced, nutrient-dense diet."],
};

export function predictFamilyPlanningDeficiencies(
  logs: HealthLogs,
  intent: FPIntent = "tracking",
): FamilyPlanningPredictionResult {
  const todayISO = toISODate(new Date());
  const d30 = getDaysAgoISO(30);

  // Count symptom frequency over 30 days
  const symptomDayCount: Record<string, number> = {};
  let totalLogDays = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "family-planning") continue;
    if (dateISO > todayISO || dateISO < d30) continue;
    totalLogDays++;
    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([sym, isTrue]) => {
        if (isTrue) symptomDayCount[sym] = (symptomDayCount[sym] ?? 0) + 1;
      });
    }
  }

  if (totalLogDays === 0 || Object.keys(symptomDayCount).length === 0) {
    return { hasData: false, predictions: [], fallback: FALLBACK_RECOMMENDATION };
  }

  const predictions: FamilyPlanningDeficiencyPrediction[] = [];

  DEFICIENCY_RULES.forEach((rule) => {
    const matchedSymptoms = rule.targetSymptoms.filter((sym) => (symptomDayCount[sym] ?? 0) > 0);
    if (matchedSymptoms.length > 0) {
      // Frequency-based confidence
      const totalMatchFreq = matchedSymptoms.reduce((sum, sym) => sum + (symptomDayCount[sym] ?? 0), 0);
      const avgFreq = totalMatchFreq / matchedSymptoms.length;
      const freqRatio = totalLogDays > 0 ? avgFreq / totalLogDays : 0;

      let confidence: Confidence = "Low";
      if (matchedSymptoms.length >= 2 && freqRatio >= 0.3) confidence = "High";
      else if (matchedSymptoms.length >= 2 || freqRatio >= 0.4) confidence = "High";
      else if (freqRatio >= 0.2) confidence = "Medium";

      // Risk score: 0-100 based on match count * frequency
      const riskScore = Math.min(100, Math.round(
        (matchedSymptoms.length / rule.targetSymptoms.length) * 50 +
        freqRatio * 50
      ));

      const freqDetails = matchedSymptoms.map(s => `${s} (${symptomDayCount[s]}/${totalLogDays} days)`).join(", ");

      predictions.push({
        id: rule.id,
        title: rule.title,
        nutrient: rule.nutrient,
        reasons: matchedSymptoms,
        whyPredicted: `Based on ${freqDetails} over the last 30 days.`,
        whyItMatters: rule.whyItMatters(intent),
        foods: rule.foods,
        habits: rule.habits,
        confidence,
        riskScore,
        symptomFrequency: totalMatchFreq,
        totalLogDays,
      });
    }
  });

  const confidenceWeight = { High: 3, Medium: 2, Low: 1 };
  predictions.sort((a, b) => b.riskScore - a.riskScore || confidenceWeight[b.confidence] - confidenceWeight[a.confidence]);

  if (predictions.length === 0) {
    return { hasData: true, predictions: [], fallback: FALLBACK_RECOMMENDATION };
  }

  return { hasData: true, predictions, fallback: null };
}

// ─── 2. Intent-Aware Nutrition ────────────────────────────────────────────────

export interface IntentNutritionCard {
  emoji: string;
  title: string;
  description: string;
  foods: string[];
  tips: string[];
}

export interface IntentNutritionResult {
  intentLabel: string;
  intentEmoji: string;
  cards: IntentNutritionCard[];
}

export function getIntentNutrition(intent: FPIntent): IntentNutritionResult {
  if (intent === "ttc") {
    return {
      intentLabel: "Trying to Conceive",
      intentEmoji: "💕",
      cards: [
        {
          emoji: "🥬",
          title: "Folate & Fertility Boosters",
          description: "Folate is the #1 preconception nutrient. Start building stores now.",
          foods: ["Spinach", "Lentils", "Fortified Cereals", "Asparagus", "Broccoli"],
          tips: ["Begin a daily prenatal with 400mcg folic acid", "Eat 2+ servings of leafy greens daily"],
        },
        {
          emoji: "🐟",
          title: "Omega-3 & Healthy Fats",
          description: "Supports egg quality and hormonal balance for conception.",
          foods: ["Flaxseeds", "Walnuts", "Chia Seeds", "Salmon (if non-veg)", "Avocado"],
          tips: ["Add flaxseed to morning oats or smoothies", "Choose cold-pressed oils for cooking"],
        },
        {
          emoji: "🦪",
          title: "Zinc for Ovulation Support",
          description: "Zinc plays a key role in egg development and ovulation.",
          foods: ["Pumpkin Seeds", "Chickpeas", "Cashews", "Yogurt", "Sesame Seeds"],
          tips: ["Snack on pumpkin seeds daily", "Include legumes in at least one meal"],
        },
        {
          emoji: "☀️",
          title: "Vitamin D for Implantation",
          description: "Adequate Vitamin D supports egg implantation success.",
          foods: ["Fortified Milk", "Egg Yolks", "Mushrooms", "Cheese"],
          tips: ["Get 15 min of morning sunlight", "Consider a Vitamin D supplement after testing"],
        },
      ],
    };
  }

  if (intent === "avoid") {
    return {
      intentLabel: "Hormonal Balance",
      intentEmoji: "🛡️",
      cards: [
        {
          emoji: "⚖️",
          title: "Hormone Balancing Foods",
          description: "Support natural hormone regulation for predictable cycles.",
          foods: ["Flaxseeds", "Cruciferous Vegetables", "Turmeric", "Green Tea", "Whole Grains"],
          tips: ["Add ground flaxseed to daily meals for phytoestrogens", "Reduce processed sugars that spike insulin"],
        },
        {
          emoji: "🔄",
          title: "Cycle Regulation Diet",
          description: "Consistent nutrition helps keep your cycle predictable for tracking.",
          foods: ["Sweet Potatoes", "Brown Rice", "Leafy Greens", "Lentils", "Berries"],
          tips: ["Eat at regular intervals to stabilize blood sugar", "Include complex carbs for steady energy"],
        },
        {
          emoji: "🧘‍♀️",
          title: "Stress & Cortisol Management",
          description: "High cortisol disrupts cycle predictability. Nourish your calm.",
          foods: ["Almonds", "Dark Chocolate (70%+)", "Chamomile Tea", "Banana", "Oats"],
          tips: ["Practice 5 minutes of deep breathing before meals", "Limit caffeine to 1 cup/day"],
        },
      ],
    };
  }

  // tracking / neutral
  return {
    intentLabel: "General Wellness",
    intentEmoji: "📊",
    cards: [
      {
        emoji: "🌿",
        title: "Balanced Hormonal Nutrition",
        description: "Support your body's natural rhythms with nutrient-dense foods.",
        foods: ["Leafy Greens", "Nuts & Seeds", "Whole Grains", "Fresh Fruits", "Legumes"],
        tips: ["Aim for 5 servings of fruits and vegetables daily", "Stay hydrated with 8+ glasses of water"],
      },
      {
        emoji: "💪",
        title: "Energy & Vitality",
        description: "Keep energy stable throughout your cycle with the right nutrition.",
        foods: ["Oats", "Eggs", "Sweet Potatoes", "Lentils", "Bananas"],
        tips: ["Eat iron-rich foods during your period", "Pair iron with Vitamin C for absorption"],
      },
    ],
  };
}

// ─── 3. Cycle-Phase Nutrition ─────────────────────────────────────────────────

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface CyclePhaseNutrition {
  phase: CyclePhase;
  label: string;
  emoji: string;
  dayRange: string;
  description: string;
  focus: string;
  foods: string[];
  tips: string[];
  color: string;
  isCurrent: boolean;
}

export interface CycleNutritionResult {
  phases: CyclePhaseNutrition[];
  currentPhase: CyclePhase | null;
  cycleDay: number | null;
}

export function getCyclePhaseNutrition(
  lastPeriodDate: string,
  cycleLength: number,
): CycleNutritionResult {
  const safeLength = cycleLength >= 10 && cycleLength <= 60 ? cycleLength : 28;
  let cycleDay: number | null = null;
  let currentPhase: CyclePhase | null = null;

  if (lastPeriodDate) {
    const lmp = new Date(lastPeriodDate + "T12:00:00");
    if (!isNaN(lmp.getTime())) {
      const today = new Date();
      const diffMs = today.getTime() - lmp.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays >= 0) {
        cycleDay = (diffDays % safeLength) + 1;
      }
    }
  }

  const ovDay = safeLength - 14;
  if (cycleDay !== null) {
    if (cycleDay <= 5) currentPhase = "menstrual";
    else if (cycleDay <= ovDay - 2) currentPhase = "follicular";
    else if (cycleDay <= ovDay + 1) currentPhase = "ovulatory";
    else currentPhase = "luteal";
  }

  const phases: CyclePhaseNutrition[] = [
    {
      phase: "menstrual",
      label: "Menstrual Phase",
      emoji: "🩸",
      dayRange: "Days 1–5",
      description: "Your body is shedding the uterine lining. Focus on replenishing lost nutrients.",
      focus: "Iron recovery, anti-inflammatory, comfort foods",
      foods: ["Spinach", "Dates", "Jaggery", "Turmeric Milk", "Beetroot", "Ginger Tea"],
      tips: [
        "Increase iron-rich foods to compensate for blood loss",
        "Warm, cooked meals are easier on digestion",
        "Add turmeric or ginger to reduce inflammation",
      ],
      color: "rose",
      isCurrent: currentPhase === "menstrual",
    },
    {
      phase: "follicular",
      label: "Follicular Phase",
      emoji: "🌱",
      dayRange: `Days 6–${ovDay - 2}`,
      description: "Estrogen rises as your body prepares for ovulation. Energy tends to increase.",
      focus: "Light, detox-friendly, estrogen-supporting foods",
      foods: ["Sprouts", "Fermented Foods", "Citrus Fruits", "Avocado", "Pumpkin Seeds", "Green Tea"],
      tips: [
        "Eat light, fiber-rich meals to support rising estrogen",
        "Include probiotic foods for gut-hormone connection",
        "This is a good time for varied, colorful meals",
      ],
      color: "emerald",
      isCurrent: currentPhase === "follicular",
    },
    {
      phase: "ovulatory",
      label: "Ovulatory Phase",
      emoji: "✨",
      dayRange: `Days ${ovDay - 1}–${ovDay + 1}`,
      description: "Peak fertility window. Your body needs nutrient-dense fuel.",
      focus: "Antioxidant-rich, nutrient-dense, anti-inflammatory",
      foods: ["Berries", "Quinoa", "Leafy Greens", "Salmon/Walnuts", "Eggs", "Sweet Potato"],
      tips: [
        "Maximize antioxidants with colorful fruits and vegetables",
        "Include zinc-rich foods for egg quality support",
        "Stay well-hydrated — cervical mucus needs water",
      ],
      color: "violet",
      isCurrent: currentPhase === "ovulatory",
    },
    {
      phase: "luteal",
      label: "Luteal Phase",
      emoji: "🌙",
      dayRange: `Days ${ovDay + 2}–${safeLength}`,
      description: "Progesterone rises. You may crave comfort foods and feel fatigued.",
      focus: "Calming, anti-inflammatory, magnesium-rich",
      foods: ["Dark Chocolate", "Almonds", "Banana", "Brown Rice", "Chamomile Tea", "Chickpeas"],
      tips: [
        "Magnesium-rich foods help combat PMS symptoms",
        "Complex carbs help maintain serotonin levels",
        "Reduce salty foods to minimize bloating",
      ],
      color: "indigo",
      isCurrent: currentPhase === "luteal",
    },
  ];

  return { phases, currentPhase, cycleDay };
}

// ─── 4. Foods to Avoid ────────────────────────────────────────────────────────

export interface FoodToAvoid {
  emoji: string;
  category: string;
  items: string[];
  reason: string;
  severity: "high" | "moderate";
}

export function getFoodsToAvoid(intent: FPIntent): FoodToAvoid[] {
  const base: FoodToAvoid[] = [
    {
      emoji: "🚫",
      category: "Processed Foods",
      items: ["Packaged chips", "Instant noodles", "Processed meats", "Frozen ready meals"],
      reason: "Contain trans fats and preservatives that may disrupt hormonal balance.",
      severity: "high",
    },
    {
      emoji: "☕",
      category: "Excess Caffeine",
      items: ["More than 2 cups coffee/day", "Energy drinks", "Strong black tea"],
      reason: "High caffeine can affect cycle regularity and iron absorption.",
      severity: "moderate",
    },
    {
      emoji: "🍬",
      category: "Refined Sugars",
      items: ["Sugary drinks", "White bread", "Pastries", "Candy"],
      reason: "Spikes insulin levels, which can disrupt ovulation and hormonal cycles.",
      severity: "high",
    },
    {
      emoji: "🧴",
      category: "Hormone Disruptors",
      items: ["BPA plastics", "Soy in excess", "Non-organic dairy"],
      reason: "May contain xenoestrogens that interfere with natural hormone signaling.",
      severity: "moderate",
    },
  ];

  if (intent === "ttc") {
    base.push({
      emoji: "🍷",
      category: "Alcohol",
      items: ["All alcoholic beverages"],
      reason: "Alcohol can reduce fertility and affect early pregnancy outcomes.",
      severity: "high",
    });
  }

  return base;
}

// ─── 5. Lifestyle Insights ────────────────────────────────────────────────────

export interface LifestyleInsight {
  emoji: string;
  title: string;
  value: string;
  status: "good" | "attention" | "warning";
  tip: string;
}

export function getLifestyleInsights(
  bmi: number | null,
  weight: number | null,
  activityLevel: string,
  intent: FPIntent,
): LifestyleInsight[] {
  const insights: LifestyleInsight[] = [];

  // BMI
  if (bmi !== null) {
    let status: LifestyleInsight["status"] = "good";
    let tip: string;
    if (bmi < 18.5) {
      status = "warning";
      tip = intent === "ttc"
        ? "Being underweight may affect ovulation. Focus on calorie-dense, nutrient-rich meals."
        : "Being underweight can disrupt your cycle. Aim for gradual, healthy weight gain.";
    } else if (bmi < 25) {
      status = "good";
      tip = "Your BMI is in a healthy range. Continue with balanced nutrition.";
    } else if (bmi < 30) {
      status = "attention";
      tip = intent === "ttc"
        ? "Overweight may affect fertility. Focus on whole foods and regular movement."
        : "A balanced diet and regular exercise can help optimize your hormonal health.";
    } else {
      status = "warning";
      tip = "Elevated BMI can impact hormonal balance. Consider consulting a nutritionist.";
    }
    insights.push({
      emoji: "⚖️",
      title: "BMI Status",
      value: `${bmi} (${bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"})`,
      status,
      tip,
    });
  }

  // Hydration
  const hydrationGoal = weight ? Math.round(weight * 0.033 * 10) / 10 : 2.5;
  insights.push({
    emoji: "💧",
    title: "Daily Hydration Goal",
    value: `${hydrationGoal}L / day`,
    status: "good",
    tip: "Adequate water intake supports cervical mucus production and overall cell function.",
  });

  // Activity
  const activityMap: Record<string, { status: LifestyleInsight["status"]; tip: string }> = {
    sedentary: {
      status: "attention",
      tip: intent === "ttc"
        ? "Light exercise (walking, yoga) can improve blood flow to reproductive organs."
        : "Regular movement helps regulate hormones and reduce cycle-related symptoms.",
    },
    moderate: {
      status: "good",
      tip: "Moderate activity is excellent for hormonal health. Keep it up!",
    },
    active: {
      status: "good",
      tip: "Great activity level! Ensure adequate calorie and nutrient intake to match.",
    },
  };
  const activityInfo = activityMap[activityLevel] ?? activityMap.moderate;
  insights.push({
    emoji: "🏃‍♀️",
    title: "Activity Level",
    value: activityLevel.charAt(0).toUpperCase() + activityLevel.slice(1),
    status: activityInfo.status,
    tip: activityInfo.tip,
  });

  // Sleep
  insights.push({
    emoji: "😴",
    title: "Sleep Impact",
    value: "7–8 hours recommended",
    status: "good",
    tip: "Poor sleep disrupts cortisol and progesterone. Prioritize consistent sleep schedules.",
  });

  return insights;
}

// ─── 6. Symptom Frequency Analysis ────────────────────────────────────────────

export interface SymptomFrequencyItem {
  symptomId: string;
  label: string;
  count: number;
  totalDays: number;
  percentage: number;
  trend: "rising" | "falling" | "stable";
}

const SYMPTOM_LABELS: Record<string, string> = {
  irregularCycle: "Irregular Cycle",
  ovulationPain: "Ovulation Pain",
  moodChanges: "Mood Changes",
  fatigue: "Fatigue",
  stress: "Stress",
  sleepIssues: "Sleep Issues",
  cramps: "Cramps",
  headache: "Headache",
  acne: "Acne",
  dizziness: "Dizziness",
  moodSwings: "Mood Swings",
  breastTenderness: "Breast Tenderness",
};

export function analyzeSymptomFrequency(
  logs: HealthLogs,
  lookbackDays: number = 30,
): SymptomFrequencyItem[] {
  const todayISO = toISODate(new Date());
  const cutoff = getDaysAgoISO(lookbackDays);
  const midpoint = getDaysAgoISO(Math.floor(lookbackDays / 2));

  const countAll: Record<string, number> = {};
  const countFirstHalf: Record<string, number> = {};
  const countSecondHalf: Record<string, number> = {};
  let totalDays = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "family-planning") continue;
    if (dateISO > todayISO || dateISO < cutoff) continue;
    totalDays++;
    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([sym, isTrue]) => {
        if (!isTrue) return;
        countAll[sym] = (countAll[sym] ?? 0) + 1;
        if (dateISO < midpoint) {
          countFirstHalf[sym] = (countFirstHalf[sym] ?? 0) + 1;
        } else {
          countSecondHalf[sym] = (countSecondHalf[sym] ?? 0) + 1;
        }
      });
    }
  }

  return Object.entries(countAll)
    .map(([symptomId, count]) => {
      const first = countFirstHalf[symptomId] ?? 0;
      const second = countSecondHalf[symptomId] ?? 0;
      let trend: SymptomFrequencyItem["trend"] = "stable";
      if (second > first + 1) trend = "rising";
      else if (first > second + 1) trend = "falling";

      return {
        symptomId,
        label: SYMPTOM_LABELS[symptomId] ?? symptomId,
        count,
        totalDays,
        percentage: totalDays > 0 ? Math.round((count / totalDays) * 100) : 0,
        trend,
      };
    })
    .sort((a, b) => b.count - a.count);
}

// ─── 7. Overall Risk Score ────────────────────────────────────────────────────

export interface NutritionRiskResult {
  overallScore: number; // 0-100
  label: string;
  color: string;
  deficiencyCount: number;
  logConsistency: number; // 0-100 percentage
  topRisk: string | null;
}

export function computeRiskScore(
  logs: HealthLogs,
  intent: FPIntent = "tracking",
): NutritionRiskResult {
  const predictions = predictFamilyPlanningDeficiencies(logs, intent);
  const frequency = analyzeSymptomFrequency(logs, 30);

  const deficiencyCount = predictions.predictions.length;
  const avgRisk = deficiencyCount > 0
    ? predictions.predictions.reduce((s, p) => s + p.riskScore, 0) / deficiencyCount
    : 0;

  // Log consistency: how many days out of 30 they logged
  const todayISO = toISODate(new Date());
  const d30 = getDaysAgoISO(30);
  let loggedDays = 0;
  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "family-planning") continue;
    if (dateISO <= todayISO && dateISO >= d30) loggedDays++;
  }
  const logConsistency = Math.round((loggedDays / 30) * 100);

  // Symptom burden factor
  const symptomBurden = frequency.length > 0
    ? frequency.reduce((s, f) => s + f.percentage, 0) / frequency.length
    : 0;

  const overallScore = Math.min(100, Math.round(
    avgRisk * 0.5 + symptomBurden * 0.3 + (100 - logConsistency) * 0.2
  ));

  let label = "Low Risk";
  let color = "emerald";
  if (overallScore >= 70) { label = "High Risk"; color = "red"; }
  else if (overallScore >= 40) { label = "Moderate Risk"; color = "amber"; }

  return {
    overallScore,
    label,
    color,
    deficiencyCount,
    logConsistency,
    topRisk: predictions.predictions[0]?.nutrient ?? null,
  };
}

// ─── 8. Nutrition Summary for Landing Page ────────────────────────────────────

export interface NutritionSummary {
  risk: NutritionRiskResult;
  deficiencyCount: number;
  topDeficiency: string | null;
  symptomCount: number;
  topSymptom: string | null;
  loggedDays: number;
  cyclePhaseLabel: string | null;
  cycleDay: number | null;
}

export function computeNutritionSummary(
  logs: HealthLogs,
  intent: FPIntent,
  lastPeriodDate: string,
  cycleLength: number,
): NutritionSummary {
  const risk = computeRiskScore(logs, intent);
  const predictions = predictFamilyPlanningDeficiencies(logs, intent);
  const frequency = analyzeSymptomFrequency(logs, 30);
  const cycleData = getCyclePhaseNutrition(lastPeriodDate, cycleLength);

  return {
    risk,
    deficiencyCount: predictions.predictions.length,
    topDeficiency: predictions.predictions[0]?.nutrient ?? null,
    symptomCount: frequency.length,
    topSymptom: frequency[0]?.label ?? null,
    loggedDays: risk.logConsistency > 0 ? Math.round(risk.logConsistency * 0.3) : 0,
    cyclePhaseLabel: cycleData.phases.find(p => p.isCurrent)?.label ?? null,
    cycleDay: cycleData.cycleDay,
  };
}

// ─── 9. Sleep Analysis from Real Logs ─────────────────────────────────────────

export interface SleepAnalysis {
  avgHours: number | null;
  poorSleepDays: number;
  totalTrackedDays: number;
  quality: "good" | "fair" | "poor" | "unknown";
}

export function analyzeSleep(logs: HealthLogs, lookbackDays: number = 30): SleepAnalysis {
  const todayISO = toISODate(new Date());
  const cutoff = getDaysAgoISO(lookbackDays);
  const hours: number[] = [];
  let poorDays = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "family-planning") continue;
    if (dateISO > todayISO || dateISO < cutoff) continue;
    if (entry.sleepHours !== null && entry.sleepHours !== undefined) {
      hours.push(entry.sleepHours);
      if (entry.sleepHours < 6) poorDays++;
    }
  }

  if (hours.length === 0) return { avgHours: null, poorSleepDays: 0, totalTrackedDays: 0, quality: "unknown" };

  const avg = Math.round((hours.reduce((s, h) => s + h, 0) / hours.length) * 10) / 10;
  let quality: SleepAnalysis["quality"] = "good";
  if (avg < 6) quality = "poor";
  else if (avg < 7) quality = "fair";

  return { avgHours: avg, poorSleepDays: poorDays, totalTrackedDays: hours.length, quality };
}
