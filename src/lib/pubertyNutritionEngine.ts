/**
 * pubertyNutritionEngine.ts
 *
 * Centralized, reusable rule-based deficiency inference engine for puberty.
 * Consumes health logs + profile + onboarding data → deficiency predictions
 * with confidence scoring and age-segmented Indian food recommendations.
 *
 * ⚠️  This is NOT a diagnostic tool. All language uses probability framing.
 */

import type { HealthLogs, PubertyEntry, FlowIntensity } from "@/hooks/useHealthLog";
import type { ProfileData } from "@/hooks/useProfile";
import type { OnboardingConfig, PubertyOnboardingData } from "@/hooks/useOnboarding";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Confidence = "Low" | "Medium" | "High";

export interface PubertyDeficiencyPrediction {
  id: string;
  nutrient: string;
  emoji: string;
  confidence: Confidence;
  explanation: string;
  triggers: string[];
  foods: string[];
  habits: string[];
  dailyTip: string;
  whyThisSuggestion: string;
}

export interface PubertyAgeGroup {
  label: string;
  range: [number, number];
  key: "early" | "mid" | "late";
}

export interface PubertyNutritionResult {
  hasData: boolean;
  ageGroup: PubertyAgeGroup;
  deficiencies: PubertyDeficiencyPrediction[];
  generalTips: string[];
  disclaimer: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DISCLAIMER =
  "These are general wellness suggestions based on your logged data. They are not a medical diagnosis. Please consult a healthcare professional for personalized medical advice.";

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

// ─── Age Group ────────────────────────────────────────────────────────────────

const AGE_GROUPS: PubertyAgeGroup[] = [
  { label: "Early Puberty (10–13)", range: [10, 13], key: "early" },
  { label: "Mid Puberty (14–16)", range: [14, 16], key: "mid" },
  { label: "Late Puberty (17–19)", range: [17, 19], key: "late" },
];

function getAgeGroup(age: number): PubertyAgeGroup {
  for (const g of AGE_GROUPS) {
    if (age >= g.range[0] && age <= g.range[1]) return g;
  }
  // Fallback for out-of-range ages
  if (age < 10) return AGE_GROUPS[0];
  return AGE_GROUPS[2];
}

// ─── Data Extraction ──────────────────────────────────────────────────────────

interface ExtractedPubertyData {
  loggedDays: number;
  symptomCounts: Record<string, number>;
  heavyFlowDays: number;
  totalFlowDays: number;
  avgSleep: number | null;
  avgMood: number | null; // 1=Low 2=Okay 3=Good
  lowMoodDays: number;
  hasPeriodData: boolean;
}

const MOOD_SCORE: Record<string, number> = { Good: 3, Okay: 2, Low: 1 };

function extractPubertyData(logs: HealthLogs): ExtractedPubertyData {
  const todayISO = toISODate(new Date());
  const d7 = getDaysAgoISO(7);

  const symptomCounts: Record<string, number> = {};
  let heavyFlowDays = 0;
  let totalFlowDays = 0;
  let sleepSum = 0;
  let sleepN = 0;
  let moodSum = 0;
  let moodN = 0;
  let lowMoodDays = 0;
  let loggedDays = 0;
  let hasPeriodData = false;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "puberty" || dateISO > todayISO || dateISO < d7) continue;

    loggedDays++;
    const e = entry as PubertyEntry;

    // Symptoms
    if (e.symptoms) {
      for (const [k, v] of Object.entries(e.symptoms)) {
        if (v) symptomCounts[k] = (symptomCounts[k] || 0) + 1;
      }
    }

    // Flow
    if (e.periodStarted || e.flowIntensity) {
      hasPeriodData = true;
      if (e.flowIntensity) {
        totalFlowDays++;
        if (e.flowIntensity === "Heavy") heavyFlowDays++;
      }
    }

    // Sleep
    if (e.sleepHours != null) {
      sleepSum += e.sleepHours;
      sleepN++;
    }

    // Mood
    const ms = MOOD_SCORE[e.mood ?? ""] ?? null;
    if (ms !== null) {
      moodSum += ms;
      moodN++;
      if (ms === 1) lowMoodDays++;
    }
  }

  return {
    loggedDays,
    symptomCounts,
    heavyFlowDays,
    totalFlowDays,
    avgSleep: sleepN > 0 ? sleepSum / sleepN : null,
    avgMood: moodN > 0 ? moodSum / moodN : null,
    lowMoodDays,
    hasPeriodData,
  };
}

// ─── Onboarding Signal Extraction ─────────────────────────────────────────────

interface OnboardingSignals {
  reportsFatigue: boolean;
  reportsMoodSwings: boolean;
  reportsCramps: boolean;
  reportsAcne: boolean;
  reportsLowSleep: boolean;
  hasStartedPeriods: boolean;
}

function extractOnboardingSignals(data?: PubertyOnboardingData): OnboardingSignals {
  if (!data) {
    return {
      reportsFatigue: false,
      reportsMoodSwings: false,
      reportsCramps: false,
      reportsAcne: false,
      reportsLowSleep: false,
      hasStartedPeriods: false,
    };
  }
  return {
    reportsFatigue: data.fatigue === "Often" || data.fatigue === "Sometimes",
    reportsMoodSwings: data.mood_swings === "Yes, a lot" || data.mood_swings === "Sometimes",
    reportsCramps: data.cramps === "Yes",
    reportsAcne: data.acne === "Yes" || data.acne === "Sometimes",
    reportsLowSleep: data.sleep_hours === "Less than 5 hours" || data.sleep_hours === "5–7 hours",
    hasStartedPeriods: data.has_started_periods === true,
  };
}

// ─── Deficiency Rules ─────────────────────────────────────────────────────────

interface DeficiencyRule {
  id: string;
  nutrient: string;
  emoji: string;
  evaluate: (ctx: RuleContext) => { score: number; triggers: string[] } | null;
  explanation: string;
  whyThisSuggestion: string;
  foodsByAge: Record<"early" | "mid" | "late", string[]>;
  habitsByAge: Record<"early" | "mid" | "late", string[]>;
  dailyTipByAge: Record<"early" | "mid" | "late", string>;
}

interface RuleContext {
  data: ExtractedPubertyData;
  onboarding: OnboardingSignals;
  age: number;
  ageKey: "early" | "mid" | "late";
  haemoglobin: number | null;
  bmiCategory: string;
}

const RULES: DeficiencyRule[] = [
  // ── 🩸 Iron Deficiency ────────────────────────────────────────────────
  {
    id: "iron",
    nutrient: "Iron",
    emoji: "🩸",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      if (ctx.data.heavyFlowDays >= 1) { score += 2; triggers.push("Heavy menstrual flow"); }
      if (ctx.data.symptomCounts["fatigue"] >= 1) { score += 2; triggers.push("Fatigue"); }
      if (ctx.data.symptomCounts["dizziness"] >= 1) { score += 2; triggers.push("Dizziness"); }
      if (ctx.data.symptomCounts["headache"] >= 1) { score += 1; triggers.push("Headache"); }
      if (ctx.onboarding.reportsFatigue) { score += 1; triggers.push("Fatigue reported during onboarding"); }
      if (ctx.haemoglobin !== null && ctx.haemoglobin < 11) { score += 2; triggers.push("Low haemoglobin level"); }
      if (ctx.ageKey === "mid") score += 1; // peak menstrual iron loss age

      if (score < 2) return null;
      return { score, triggers };
    },
    explanation:
      "You may be experiencing signs associated with low iron levels. During puberty, iron needs increase — especially with menstruation.",
    whyThisSuggestion:
      "Iron is essential for carrying oxygen in your blood. During puberty, menstrual blood loss and rapid growth increase your body's need for iron. Low iron can cause tiredness, dizziness, and difficulty concentrating.",
    foodsByAge: {
      early: ["Spinach (palak)", "Dates (khajoor)", "Jaggery (gur)", "Ragi porridge", "Moong dal"],
      mid: ["Spinach (palak)", "Beetroot", "Lentils (dal)", "Dates (khajoor)", "Jaggery (gur)", "Pomegranate"],
      late: ["Spinach (palak)", "Beetroot", "Lentils (dal)", "Dates", "Dark leafy greens", "Sesame seeds (til)"],
    },
    habitsByAge: {
      early: ["Eat citrus fruits (amla, orange) with meals to help your body absorb iron", "Avoid drinking tea/milk right after meals"],
      mid: ["Pair iron-rich foods with Vitamin C (lemon on dal or salads)", "Avoid tea or coffee immediately after meals — it reduces iron absorption"],
      late: ["Include one iron-rich food in every main meal", "Squeeze lemon on iron-rich foods for better absorption", "Consider fortified breakfast cereals"],
    },
    dailyTipByAge: {
      early: "Add a small piece of jaggery or a few dates to your snack time",
      mid: "Include spinach or beetroot in your lunch at least 3 times a week",
      late: "Have a glass of lemon water with your iron-rich meals for better absorption",
    },
  },

  // ── ☀️ Vitamin D Deficiency ───────────────────────────────────────────
  {
    id: "vitamin_d",
    nutrient: "Vitamin D",
    emoji: "☀️",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      // Proxy for low sunlight/indoor lifestyle: low activity + fatigue + low sleep
      if (ctx.data.avgSleep !== null && ctx.data.avgSleep < 7) { score += 1; triggers.push("Low sleep hours"); }
      if (ctx.data.symptomCounts["fatigue"] >= 1) { score += 1; triggers.push("Fatigue"); }
      if (ctx.data.lowMoodDays >= 2) { score += 1; triggers.push("Low mood days"); }
      if (ctx.data.symptomCounts["acne"] >= 1) { score += 1; triggers.push("Acne breakouts"); }
      if (ctx.onboarding.reportsLowSleep) { score += 1; triggers.push("Low sleep reported during onboarding"); }
      if (ctx.ageKey === "early") score += 1; // growing bones need more Vitamin D

      if (score < 2) return null;
      return { score, triggers };
    },
    explanation:
      "You may not be getting enough Vitamin D. An indoor lifestyle and limited sunlight exposure can contribute to this during puberty.",
    whyThisSuggestion:
      "Vitamin D helps your body absorb calcium for strong bones and supports your immune system. During puberty, when your body is growing rapidly, adequate Vitamin D is especially important. Most of our Vitamin D comes from sunlight.",
    foodsByAge: {
      early: ["Milk", "Curd (dahi)", "Eggs", "Mushrooms", "Fortified cereals"],
      mid: ["Milk", "Eggs", "Paneer", "Fortified milk", "Mushrooms"],
      late: ["Eggs", "Fortified milk", "Paneer", "Fish (if non-veg)", "Mushrooms"],
    },
    habitsByAge: {
      early: ["Play outside for 15–20 minutes in morning sunlight", "Drink a glass of milk daily"],
      mid: ["Spend 15–20 minutes in morning sunlight (before 10 AM)", "Take a short walk outdoors during breaks"],
      late: ["Get 15–20 minutes of morning sunlight daily", "Include outdoor activities like walking or stretching in your routine"],
    },
    dailyTipByAge: {
      early: "Step outside and play in the sun for 15 minutes every morning!",
      mid: "Spend 15 minutes in sunlight before 10 AM — your bones will thank you",
      late: "Start your day with 15 minutes of sunlight — a simple habit for stronger bones",
    },
  },

  // ── 🦴 Calcium Deficiency ────────────────────────────────────────────
  {
    id: "calcium",
    nutrient: "Calcium",
    emoji: "🦴",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      if (ctx.data.symptomCounts["cramps"] >= 2) { score += 2; triggers.push("Frequent cramps"); }
      if (ctx.data.symptomCounts["cramps"] === 1) { score += 1; triggers.push("Cramps"); }
      if (ctx.ageKey === "early" || ctx.ageKey === "mid") { score += 1; triggers.push("Active growth phase"); }
      if (ctx.bmiCategory === "Underweight") { score += 1; triggers.push("Underweight BMI"); }
      if (ctx.onboarding.reportsCramps) { score += 1; triggers.push("Cramps reported during onboarding"); }

      if (score < 2) return null;
      return { score, triggers };
    },
    explanation:
      "You may benefit from more calcium in your diet. During puberty, your bones are growing rapidly and need extra calcium support.",
    whyThisSuggestion:
      "About 40% of your adult bone mass is built during puberty. Calcium is the main mineral that strengthens bones and teeth. Getting enough now helps prevent bone problems later in life. Cramps can also be a sign your muscles need more calcium.",
    foodsByAge: {
      early: ["Milk", "Curd (dahi)", "Paneer", "Ragi porridge", "Sesame seeds (til)"],
      mid: ["Milk & curd", "Ragi (nachni)", "Paneer", "Sesame seeds (til)", "Almonds"],
      late: ["Milk & curd", "Ragi", "Paneer", "Sesame seeds", "Almonds", "Broccoli"],
    },
    habitsByAge: {
      early: ["Drink a glass of milk in the morning and evening", "Eat ragi-based snacks or porridge"],
      mid: ["Include a dairy serving twice a day (curd, milk, paneer)", "Try ragi dosa or ragi laddu as snacks"],
      late: ["Include calcium-rich foods in every meal", "Pair calcium with Vitamin D (sunlight) for better absorption"],
    },
    dailyTipByAge: {
      early: "Have a glass of milk with your breakfast every day",
      mid: "Add a bowl of curd to your lunch — it's an easy calcium boost",
      late: "Include ragi, curd, or paneer in at least one meal every day",
    },
  },

  // ── ⚡ Energy/Nutrition Deficit ──────────────────────────────────────
  {
    id: "energy",
    nutrient: "Energy & Nutrition",
    emoji: "⚡",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      if (ctx.data.avgSleep !== null && ctx.data.avgSleep < 6) { score += 2; triggers.push("Very low sleep (under 6 hours)"); }
      else if (ctx.data.avgSleep !== null && ctx.data.avgSleep < 7) { score += 1; triggers.push("Low sleep (under 7 hours)"); }
      if (ctx.data.symptomCounts["fatigue"] >= 2) { score += 2; triggers.push("Frequent fatigue"); }
      else if (ctx.data.symptomCounts["fatigue"] >= 1) { score += 1; triggers.push("Fatigue"); }
      if (ctx.data.avgMood !== null && ctx.data.avgMood < 2) { score += 1; triggers.push("Low mood trend"); }
      if (ctx.onboarding.reportsLowSleep && ctx.onboarding.reportsFatigue) { score += 1; triggers.push("Low sleep + fatigue reported during onboarding"); }

      if (score < 3) return null;
      return { score, triggers };
    },
    explanation:
      "Your body may not be getting enough energy from food and rest. Low sleep combined with fatigue suggests your energy balance needs attention.",
    whyThisSuggestion:
      "During puberty, your body needs extra energy for growth, studying, and physical activity. When sleep is poor and tiredness builds up, your body struggles to recover. Eating energy-rich foods and improving sleep habits can make a real difference.",
    foodsByAge: {
      early: ["Banana", "Dates (khajoor)", "Warm milk with honey", "Peanut butter on roti", "Chana (chickpeas)"],
      mid: ["Banana", "Nuts & dry fruits", "Warm milk", "Sattu drink", "Whole wheat roti with ghee"],
      late: ["Nuts & seeds mix", "Banana shake", "Oats with dry fruits", "Sattu drink", "Whole grain chapati with ghee"],
    },
    habitsByAge: {
      early: ["Try to sleep by 9:30 PM every night", "Eat 3 proper meals and 2 small snacks each day", "Avoid skipping breakfast"],
      mid: ["Set a regular bedtime and stick to it", "Eat small, frequent meals instead of skipping food", "Limit screen time 1 hour before bed"],
      late: ["Prioritize 7-8 hours of sleep even during exams", "Don't skip meals — eat every 3-4 hours", "Reduce caffeine (tea, coffee) after 3 PM"],
    },
    dailyTipByAge: {
      early: "Never skip breakfast — it gives your body the fuel to start the day",
      mid: "Keep a handful of nuts or a banana in your school bag for quick energy",
      late: "Eat a balanced breakfast with protein (eggs, dal, paneer) to sustain energy all morning",
    },
  },

  // ── 🧂 Electrolyte Imbalance ─────────────────────────────────────────
  {
    id: "electrolyte",
    nutrient: "Electrolyte Balance",
    emoji: "💧",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      if (ctx.data.symptomCounts["fatigue"] >= 1) { score += 1; triggers.push("Fatigue"); }
      if (ctx.data.symptomCounts["headache"] >= 1) { score += 1; triggers.push("Headache"); }
      if (ctx.data.heavyFlowDays >= 1) { score += 1; triggers.push("Heavy menstrual flow"); }
      // dizziness is not a tracked puberty symptom but headache + fatigue proxy
      if (ctx.data.symptomCounts["headache"] >= 2 && ctx.data.symptomCounts["fatigue"] >= 1) {
        score += 1;
        triggers.push("Recurring headache with fatigue");
      }

      if (score < 3) return null;
      return { score, triggers };
    },
    explanation:
      "You may be losing electrolytes through activity or menstruation. Staying hydrated with the right fluids can help.",
    whyThisSuggestion:
      "Electrolytes (like sodium, potassium, and magnesium) help your muscles work properly and keep you hydrated. During menstruation and physical activity, you lose electrolytes through sweat and blood. Replenishing them prevents headaches, tiredness, and muscle cramps.",
    foodsByAge: {
      early: ["Coconut water", "Nimbu pani (lemon water with salt)", "Banana", "Buttermilk (chaas)", "Watermelon"],
      mid: ["Coconut water", "Nimbu pani", "Banana", "Buttermilk (chaas)", "Cucumber", "Orange"],
      late: ["Coconut water", "Lemon water with rock salt", "Banana", "Buttermilk", "Watermelon", "ORS if needed"],
    },
    habitsByAge: {
      early: ["Drink water every 2 hours — keep a water bottle with you", "Have coconut water or nimbu pani after playing"],
      mid: ["Carry a water bottle everywhere and drink regularly", "Have buttermilk or coconut water instead of packaged drinks"],
      late: ["Drink 2–3 liters of water daily", "Replace sugary drinks with coconut water or buttermilk", "Add a pinch of salt & sugar to lemon water after exercise"],
    },
    dailyTipByAge: {
      early: "Drink a glass of nimbu pani (lemon water) every afternoon",
      mid: "Replace any packaged juice with coconut water or fresh buttermilk",
      late: "Keep a water bottle handy and drink at least 8 glasses of water daily",
    },
  },

  // ── 🧠 Omega-3 ───────────────────────────────────────────────────────
  {
    id: "omega3",
    nutrient: "Omega-3 Fatty Acids",
    emoji: "🧠",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      if (ctx.data.symptomCounts["moodSwings"] >= 1) { score += 2; triggers.push("Mood swings"); }
      if (ctx.data.symptomCounts["acne"] >= 1) { score += 1; triggers.push("Acne breakouts"); }
      if (ctx.data.lowMoodDays >= 2) { score += 1; triggers.push("Multiple low mood days"); }
      if (ctx.onboarding.reportsMoodSwings) { score += 1; triggers.push("Mood swings reported during onboarding"); }
      if (ctx.onboarding.reportsAcne) { score += 1; triggers.push("Acne reported during onboarding"); }

      if (score < 2) return null;
      return { score, triggers };
    },
    explanation:
      "You may benefit from more Omega-3 fats. They support brain health and may help stabilize mood during puberty.",
    whyThisSuggestion:
      "Omega-3 fatty acids are essential fats that your body cannot make on its own. They play a key role in brain development and emotional regulation. During puberty, when mood swings are common, Omega-3s can help support emotional balance and also reduce skin inflammation.",
    foodsByAge: {
      early: ["Walnuts (akhrot)", "Flaxseeds (alsi) in milk", "Almonds", "Chia seeds in curd"],
      mid: ["Walnuts (akhrot)", "Flaxseeds (alsi)", "Chia seeds", "Fish (if non-veg)", "Almonds"],
      late: ["Walnuts", "Flaxseeds", "Chia seeds", "Fish (if non-veg)", "Avocado (if available)"],
    },
    habitsByAge: {
      early: ["Add crushed walnuts to your milk or porridge", "Eat a few almonds as a daily snack"],
      mid: ["Add a spoonful of flaxseeds to your breakfast or smoothie", "Snack on walnuts instead of chips"],
      late: ["Include nuts and seeds in your daily diet", "Try adding flaxseed powder to rotis or paratha dough"],
    },
    dailyTipByAge: {
      early: "Eat 3–4 walnuts every day as an after-school snack",
      mid: "Mix a spoonful of flaxseed powder into your morning milk or curd",
      late: "Include walnuts, flaxseeds, or chia seeds in at least one meal daily",
    },
  },

  // ── 💊 Vitamin B12 ───────────────────────────────────────────────────
  {
    id: "b12",
    nutrient: "Vitamin B12",
    emoji: "💊",
    evaluate(ctx) {
      const triggers: string[] = [];
      let score = 0;

      if (ctx.data.symptomCounts["fatigue"] >= 2) { score += 2; triggers.push("Frequent fatigue"); }
      else if (ctx.data.symptomCounts["fatigue"] >= 1) { score += 1; triggers.push("Fatigue"); }
      if (ctx.data.lowMoodDays >= 2) { score += 1; triggers.push("Low mood pattern"); }
      if (ctx.data.symptomCounts["headache"] >= 1) { score += 1; triggers.push("Headache"); }
      if (ctx.onboarding.reportsFatigue) { score += 1; triggers.push("Fatigue reported during onboarding"); }

      if (score < 3) return null;
      return { score, triggers };
    },
    explanation:
      "You may have signs associated with low Vitamin B12 levels. B12 helps convert food into energy and supports nerve function.",
    whyThisSuggestion:
      "Vitamin B12 is essential for energy production, red blood cell formation, and brain health. Persistent tiredness and low mood can sometimes indicate that your body needs more B12. This is especially relevant if your diet is low in dairy and eggs.",
    foodsByAge: {
      early: ["Milk & curd", "Eggs", "Paneer", "Fortified cereals"],
      mid: ["Milk & curd", "Eggs", "Paneer", "Fortified cereals", "Cheese"],
      late: ["Eggs", "Milk & curd", "Paneer", "Fortified cereals", "Fish (if non-veg)"],
    },
    habitsByAge: {
      early: ["Drink a glass of milk daily", "Have eggs for breakfast if possible"],
      mid: ["Include dairy products in at least 2 meals", "Have eggs or paneer regularly"],
      late: ["Include B12-rich foods daily — especially if vegetarian", "Consider fortified foods if you don't eat eggs or dairy"],
    },
    dailyTipByAge: {
      early: "Have a boiled egg or a glass of milk every morning",
      mid: "Include curd, paneer, or eggs in your daily diet for steady energy",
      late: "Ensure at least one B12-rich food (milk, eggs, paneer) in every main meal",
    },
  },
];

// ─── Score → Confidence ───────────────────────────────────────────────────────

function scoreToConfidence(score: number): Confidence {
  if (score >= 5) return "High";
  if (score >= 3) return "Medium";
  return "Low";
}

// ─── General Tips by Age ──────────────────────────────────────────────────────

function getGeneralTips(ageKey: "early" | "mid" | "late"): string[] {
  const base = [
    "Drink at least 6–8 glasses of water every day",
    "Eat a variety of colourful fruits and vegetables",
    "Never skip meals — especially breakfast",
  ];

  if (ageKey === "early") {
    return [...base, "Include milk or curd every day for growing bones", "Play outdoors for at least 30 minutes daily"];
  }
  if (ageKey === "mid") {
    return [...base, "Include iron-rich food at least once daily during your period", "Limit packaged snacks and sugary drinks"];
  }
  return [...base, "Balance study schedules with physical activity", "Manage stress with simple breathing exercises or short walks"];
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export function predictPubertyDeficiencies(
  logs: HealthLogs,
  profile: ProfileData | null,
  onboardingConfig: OnboardingConfig | null,
): PubertyNutritionResult {
  // ── Extract data ──
  const data = extractPubertyData(logs);
  const onboarding = extractOnboardingSignals(onboardingConfig?.pubertyData);

  const age = profile?.age ?? onboardingConfig?.age ?? 14;
  const ageGroup = getAgeGroup(age);

  // Parse haemoglobin
  let haemoglobin: number | null = null;
  if (profile?.haemoglobin) {
    const parsed = parseFloat(profile.haemoglobin);
    if (!isNaN(parsed) && parsed > 0) haemoglobin = parsed;
  }

  const bmiCategory = profile?.bmiCategory ?? "N/A";

  // ── No data state ──
  const hasAnySignals = data.loggedDays > 0 || onboarding.reportsFatigue || onboarding.reportsMoodSwings || onboarding.reportsCramps;

  if (!hasAnySignals) {
    return {
      hasData: false,
      ageGroup,
      deficiencies: [],
      generalTips: getGeneralTips(ageGroup.key),
      disclaimer: DISCLAIMER,
    };
  }

  // ── Evaluate rules ──
  const ctx: RuleContext = {
    data,
    onboarding,
    age,
    ageKey: ageGroup.key,
    haemoglobin,
    bmiCategory,
  };

  const deficiencies: PubertyDeficiencyPrediction[] = [];

  for (const rule of RULES) {
    const result = rule.evaluate(ctx);
    if (!result) continue;

    deficiencies.push({
      id: rule.id,
      nutrient: rule.nutrient,
      emoji: rule.emoji,
      confidence: scoreToConfidence(result.score),
      explanation: rule.explanation,
      triggers: result.triggers,
      foods: rule.foodsByAge[ageGroup.key],
      habits: rule.habitsByAge[ageGroup.key],
      dailyTip: rule.dailyTipByAge[ageGroup.key],
      whyThisSuggestion: rule.whyThisSuggestion,
    });
  }

  // Sort: High → Medium → Low
  const confWeight: Record<Confidence, number> = { High: 3, Medium: 2, Low: 1 };
  deficiencies.sort((a, b) => confWeight[b.confidence] - confWeight[a.confidence]);

  return {
    hasData: true,
    ageGroup,
    deficiencies,
    generalTips: getGeneralTips(ageGroup.key),
    disclaimer: DISCLAIMER,
  };
}
