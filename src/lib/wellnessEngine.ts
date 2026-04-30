/**
 * wellnessEngine.ts
 *
 * Pure (non-React) module that generates personalized daily wellness
 * recommendations from user profile data, health logs, and life-stage context.
 */

import type { Phase } from "@/hooks/usePhase";
import type { HealthLogs, PubertyEntry, FamilyPlanningEntry } from "@/hooks/useHealthLog";
import type { Region } from "@/lib/nutritionData";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WellnessProfile {
  weight: number;   // kg
  height: number;   // cm
  region: Region;
}

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export interface BMIResult {
  value: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
}

export interface NutrientTarget {
  name: string;
  target: string;
  foods: string;
  icon: string;
}

export interface WellnessRecommendation {
  bmi: BMIResult;
  cyclePhase: CyclePhase | null;
  cyclePhaseLabel: string | null;
  todayFocus: string;
  diet: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  nutrition: {
    dailyCalories: number;
    nutrients: NutrientTarget[];
  };
  waterIntake: {
    liters: number;
    display: string;
  };
  sleep: {
    hours: string;
    tip: string;
  };
  activity: {
    suggestion: string;
    intensity: "rest" | "light" | "moderate";
  };
  specialAlert: string | null;
  dominantSymptoms: string[];
  dataFreshness: string;
}

// ─── BMI ──────────────────────────────────────────────────────────────────────

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  const heightM = heightCm / 100;
  const value = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  let category: BMIResult["category"];
  if (value < 18.5) category = "Underweight";
  else if (value < 25) category = "Normal";
  else if (value < 30) category = "Overweight";
  else category = "Obese";
  return { value, category };
}

// ─── Cycle Phase Detection ────────────────────────────────────────────────────

const CYCLE_PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual Phase",
  follicular: "Follicular Phase",
  ovulation: "Ovulation",
  luteal: "Luteal Phase",
};

function detectCyclePhase(
  phase: Phase,
  logs: HealthLogs,
): CyclePhase | null {
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  if (phase === "puberty") {
    // Find most recent period start
    const periodStarts = Object.entries(logs)
      .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
      .map(([d]) => d)
      .sort();

    if (periodStarts.length === 0) return null;
    const lastStart = periodStarts[periodStarts.length - 1];
    const lastStartDate = new Date(lastStart + "T12:00:00");

    // Estimate average cycle length
    let avgCycle = 28;
    if (periodStarts.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < periodStarts.length; i++) {
        const prev = new Date(periodStarts[i - 1] + "T12:00:00");
        const curr = new Date(periodStarts[i] + "T12:00:00");
        const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diff > 0 && diff < 100) diffs.push(diff);
      }
      if (diffs.length > 0) {
        avgCycle = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }
    }

    const daysSinceStart = Math.max(0, Math.round(
      (today.getTime() - lastStartDate.getTime()) / (1000 * 60 * 60 * 24)
    ));

    const dayInCycle = daysSinceStart % avgCycle;

    if (dayInCycle <= 5) return "menstrual";
    if (dayInCycle <= 13) return "follicular";
    if (dayInCycle <= 16) return "ovulation";
    return "luteal";
  }

  if (phase === "family-planning") {
    const latest = Object.entries(logs)
      .filter(([, e]) => e.phase === "family-planning")
      .sort(([a], [b]) => b.localeCompare(a))[0]?.[1] as FamilyPlanningEntry | undefined;

    if (!latest?.lastPeriodDate) return null;
    const cycleLength = latest.cycleLength ?? 28;
    const lastPeriod = new Date(latest.lastPeriodDate + "T12:00:00");
    const daysSince = Math.max(0, Math.round(
      (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
    ));
    const dayInCycle = daysSince % cycleLength;

    if (dayInCycle <= 5) return "menstrual";
    if (dayInCycle <= 13) return "follicular";
    if (dayInCycle <= 16) return "ovulation";
    return "luteal";
  }

  // Maternity / Menopause — no cycle phase
  return null;
}

// ─── Symptom Aggregation (Last 7 Days) ────────────────────────────────────────

interface SymptomSummary {
  dominant: string[];
  hasFatigue: boolean;
  hasCramps: boolean;
  hasMoodIssues: boolean;
  hasPain: boolean;
  hasLowEnergy: boolean;
  hasSleepIssues: boolean;
  severeCount: number;
  totalCount: number;
}

function aggregateRecentSymptoms(logs: HealthLogs, phase: Phase): SymptomSummary {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startISO = sevenDaysAgo.toISOString().slice(0, 10);
  const endISO = today.toISOString().slice(0, 10);

  const counts: Record<string, number> = {};
  let severeCount = 0;
  let totalCount = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (dateISO < startISO || dateISO > endISO) continue;
    if (entry.phase !== phase) continue;
    if (!entry.symptoms) continue;

    for (const [key, val] of Object.entries(entry.symptoms)) {
      if (val) {
        counts[key] = (counts[key] || 0) + 1;
        totalCount++;
      }
    }

    // Count severe entries
    const sympCount = Object.values(entry.symptoms).filter(Boolean).length;
    if (sympCount >= 4) severeCount++;
    if (phase === "maternity" && (entry as any).fatigueLevel === "High") severeCount++;
  }

  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  const dominant = sorted.slice(0, 3).map(([k]) => formatSymptomName(k));

  return {
    dominant,
    hasFatigue: !!counts["fatigue"],
    hasCramps: !!counts["cramps"],
    hasMoodIssues: !!counts["moodSwings"] || !!counts["moodChanges"],
    hasPain: !!counts["backPain"] || !!counts["cramps"] || !!counts["jointPain"] || !!counts["ovulationPain"],
    hasLowEnergy: !!counts["fatigue"] || !!counts["sleepDisturbance"] || !!counts["sleepIssues"],
    hasSleepIssues: !!counts["sleepDisturbance"] || !!counts["sleepIssues"] || !!counts["nightSweats"],
    severeCount,
    totalCount,
  };
}

function formatSymptomName(key: string): string {
  const map: Record<string, string> = {
    cramps: "Cramps",
    fatigue: "Fatigue",
    moodSwings: "Mood swings",
    moodChanges: "Mood changes",
    headache: "Headache",
    acne: "Acne",
    breastTenderness: "Breast tenderness",
    nausea: "Nausea",
    dizziness: "Dizziness",
    swelling: "Swelling",
    backPain: "Back pain",
    sleepDisturbance: "Sleep issues",
    sleepIssues: "Sleep issues",
    hotFlashes: "Hot flashes",
    nightSweats: "Night sweats",
    jointPain: "Joint pain",
    irregularCycle: "Irregular cycle",
    ovulationPain: "Ovulation pain",
    stress: "Stress",
  };
  return map[key] || key.replace(/([A-Z])/g, " $1").trim();
}

// ─── Today's Focus ────────────────────────────────────────────────────────────

function generateTodayFocus(
  symptoms: SymptomSummary,
  cyclePhase: CyclePhase | null,
  phase: Phase,
): string {
  // Symptom-driven focus takes priority
  if (symptoms.hasCramps && symptoms.hasFatigue)
    return "Rest well today — warm foods, hydration, and gentle care 🌿";
  if (symptoms.hasCramps)
    return "Focus on anti-inflammatory foods and gentle warmth today 🌸";
  if (symptoms.hasFatigue && symptoms.hasLowEnergy)
    return "Prioritize iron-rich foods and extra rest today 💪";
  if (symptoms.hasMoodIssues)
    return "Balanced meals and calming activities to support your mood today 🧘";
  if (symptoms.hasSleepIssues)
    return "Wind down early tonight — warm milk, less screen time 🌙";
  if (symptoms.hasPain)
    return "Take it easy — light stretches and anti-inflammatory foods today 🍃";

  // Cycle-phase-driven focus
  if (cyclePhase === "menstrual")
    return "Focus on iron-rich foods and hydration during your period 🩸";
  if (cyclePhase === "follicular")
    return "Your energy is rising — nourish with proteins and fresh greens 🌱";
  if (cyclePhase === "ovulation")
    return "Peak energy phase! Stay hydrated and eat balanced meals ✨";
  if (cyclePhase === "luteal")
    return "Support your body with complex carbs and magnesium-rich foods 🌾";

  // Life-stage fallback
  if (phase === "maternity")
    return "Nourish yourself and your baby with balanced, iron-rich meals today 🤰";
  if (phase === "menopause")
    return "Focus on calcium, staying cool, and gentle movement today ✨";

  return "Start your day with a balanced breakfast and stay hydrated 💧";
}

// ─── Diet Recommendations ─────────────────────────────────────────────────────

const WELLNESS_MEALS: Record<Region, Record<Phase, {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}>> = {
  south: {
    puberty: {
      breakfast: ["Ragi dosa with coconut chutney", "Idli with sambar and spinach poriyal", "Pesarattu (moong dosa) with ginger chutney"],
      lunch: ["Rice, rasam, spinach kootu, drumstick poriyal", "Sambar rice with beetroot poriyal and buttermilk", "Curd rice with carrot kosambari"],
      dinner: ["Chapati with palak dal", "Ragi mudde with soppu saaru", "Idiappam with vegetable stew"],
      snacks: ["Sundal (chickpea salad)", "Banana and coconut water", "Ragi laddu with jaggery"],
    },
    maternity: {
      breakfast: ["Idli with sambar and chutney", "Ragi porridge with jaggery and milk", "Pongal with coconut chutney"],
      lunch: ["Rice, rasam, kootu, poriyal, buttermilk", "Drumstick sambar with rice and papad", "Bisi bele bath with raita"],
      dinner: ["Ragi mudde with soppu saaru", "Chapati with kurma", "Idiappam with stew"],
      snacks: ["Tender coconut water", "Dry fruit laddu", "Dates with warm milk"],
    },
    "family-planning": {
      breakfast: ["Pesarattu with ginger chutney", "Rava idli with mint chutney", "Adai with coconut chutney"],
      lunch: ["Rice, sambar, rasam, green poriyal", "Bisibele bath with boondi raita", "Curd rice with pickle"],
      dinner: ["Chapati with mixed vegetable avial", "Ragi dosa with chutney", "Rice with molagootal"],
      snacks: ["Sundal (chickpeas/black chana)", "Coconut water and fruit", "Sesame-jaggery laddu"],
    },
    menopause: {
      breakfast: ["Ragi porridge with almonds and dates", "Set dosa with coconut chutney", "Oats pongal with vegetables"],
      lunch: ["Rice, rasam, drumstick sambar, poriyal", "Curd rice with cucumber raita", "Millets rice with kootu"],
      dinner: ["Chapati with palak paneer (light)", "Idiyappam with vegetable stew", "Ragi mudde with light dal"],
      snacks: ["Warm milk with turmeric", "Dry fruits and walnuts", "Ellu (sesame) chutney with banana"],
    },
  },
  north: {
    puberty: {
      breakfast: ["Poha with vegetables and peanuts", "Besan chilla with mint chutney", "Daliya porridge with milk"],
      lunch: ["Dal, roti, palak sabzi, salad", "Rajma chawal with raita", "Chole chapati with cucumber"],
      dinner: ["Light moong dal khichdi with ghee", "Roti with palak paneer", "Vegetable soup with bread"],
      snacks: ["Roasted makhana", "Fruit chaat", "Dry fruits mix (almonds, walnuts)"],
    },
    maternity: {
      breakfast: ["Paneer paratha with curd", "Stuffed paratha with butter", "Oats upma with vegetables"],
      lunch: ["Dal makhani (light), roti, sabzi", "Kadhi pakora with jeera rice", "Mixed dal with roti and salad"],
      dinner: ["Palak dal with chapati", "Moong dal khichdi", "Dalia with vegetables"],
      snacks: ["Sattu drink (protein-rich)", "Fruit smoothie with dry fruits", "Dates and warm milk"],
    },
    "family-planning": {
      breakfast: ["Methi paratha with curd", "Sprout salad with lemon", "Besan chilla with vegetables"],
      lunch: ["Mixed dal, roti, seasonal sabzi", "Chana masala with chapati", "Palak paneer with rice"],
      dinner: ["Moong dal with chapati and salad", "Light khichdi with ghee", "Vegetable stew with bread"],
      snacks: ["Roasted chana", "Mixed nuts and seeds", "Lassi (sweet or salted)"],
    },
    menopause: {
      breakfast: ["Ragi porridge with jaggery", "Methi paratha with curd", "Daliya khichdi with vegetables"],
      lunch: ["Dal, roti, lauki sabzi, salad", "Paneer bhurji with chapati", "Seasonal vegetable pulao with raita"],
      dinner: ["Moong dal khichdi (easy to digest)", "Light vegetable stew with chapati", "Tomato soup with bread"],
      snacks: ["Warm milk with turmeric", "Almonds and walnuts", "Apple with peanut butter"],
    },
  },
  east: {
    puberty: {
      breakfast: ["Chirer pulao (flattened rice) with vegetables", "Roti with egg bhurji", "Muri mix with peanuts"],
      lunch: ["Rice, dal, spinach sabzi, fish curry", "Khichuri with egg", "Rice with cholar dal and sabzi"],
      dinner: ["Chapati with mixed vegetable", "Moong dal with rice", "Light fish stew with rice"],
      snacks: ["Coconut naru (laddu)", "Seasonal fruits", "Ghugni (dried peas curry)"],
    },
    maternity: {
      breakfast: ["Vegetable paratha with curd", "Poha with peanuts", "Daliya with milk and nuts"],
      lunch: ["Bengali thali — rice, dal, shukto, fish", "Khichuri with vegetables", "Panch mishali tarkari with roti"],
      dinner: ["Light khichuri", "Roti with mixed sabzi", "Moong dal soup with bread"],
      snacks: ["Sattu sherbet", "Banana with jaggery", "Dates and dry fruits"],
    },
    "family-planning": {
      breakfast: ["Suji upma with vegetables", "Bread with egg bhurji", "Poha with peanuts and lemon"],
      lunch: ["Rice, dal, sabzi with fish curry", "Dhokar dalna with rice", "Dal-bhaat with mixed sabzi"],
      dinner: ["Roti with paneer", "Light khichuri with ghee", "Vegetable soup with bread"],
      snacks: ["Jhal muri", "Mixed fruits", "Ghugni with bread"],
    },
    menopause: {
      breakfast: ["Ragi porridge with dry fruits", "Oats with banana and nuts", "Moong sprout chaat"],
      lunch: ["Light dal, rice, and poriyal", "Khichuri with vegetables", "Simple dal-bhaat with sabzi"],
      dinner: ["Soup with bread", "Light khichuri with ghee", "Chapati with paneer"],
      snacks: ["Warm milk with haldi", "Dates and dry fruits", "Fresh coconut water"],
    },
  },
  west: {
    puberty: {
      breakfast: ["Poha with onions and peanuts", "Thepla with curd", "Besan chilla with green chutney"],
      lunch: ["Gujarati dal, rice, roti, shaak", "Pav bhaji (home-made, less oil)", "Dal rice with sabzi and salad"],
      dinner: ["Bhakri with pitla (besan curry)", "Dal and roti", "Vegetable khichdi"],
      snacks: ["Dhokla", "Fruit plate", "Chana jor garam"],
    },
    maternity: {
      breakfast: ["Thalipeeth with butter", "Methi thepla with curd", "Vegetable uttapam"],
      lunch: ["Varan-bhaat, bhaji, chapati", "Bharli vangi with jowar bhakri", "Gujarati kadhi with rice"],
      dinner: ["Jowar bhakri with zunka", "Chapati with mixed dal", "Rice with amti dal"],
      snacks: ["Khandvi", "Sprouted moong salad", "Dry fruit laddu"],
    },
    "family-planning": {
      breakfast: ["Thalipeeth with green chutney", "Poha with lemon and peanuts", "Sabudana khichdi (light)"],
      lunch: ["Dal, roti, seasonal sabzi", "Bharli vangi with bhakri", "Gujarati thali (balanced)"],
      dinner: ["Chapati with mixed dal", "Vegetable khichdi", "Pav with light usal"],
      snacks: ["Dhokla", "Sprouted moong salad", "Mixed fruits"],
    },
    menopause: {
      breakfast: ["Nachni (ragi) porridge", "Besan chilla with vegetables", "Oats with dry fruits"],
      lunch: ["Simple dal-chawal", "Jowar roti with palak sabzi", "Light pithla bhakri"],
      dinner: ["Soup with bread", "Light dal with chapati", "Vegetable pulao"],
      snacks: ["Warm milk with saffron", "Seasonal fruits", "Dates and almonds"],
    },
  },
};

// Symptom-specific add-on foods
const SYMPTOM_FOOD_BOOSTS: Record<string, string[]> = {
  cramps: ["Add turmeric milk before bed", "Include ginger in your meals", "Try warm methi (fenugreek) water"],
  fatigue: ["Add iron-rich spinach/palak to lunch", "Include dates and jaggery snacks", "Try amla (gooseberry) for vitamin C"],
  moodSwings: ["Include nuts and seeds for omega-3", "Try banana and dark chocolate", "Add curd/buttermilk for probiotics"],
  moodChanges: ["Include nuts and seeds for omega-3", "Try banana and dark chocolate", "Add curd/buttermilk for probiotics"],
  sleepDisturbance: ["Warm milk with nutmeg before bed", "Avoid caffeine after 3 PM", "Try chamomile or tulsi tea"],
  sleepIssues: ["Warm milk with nutmeg before bed", "Avoid caffeine after 3 PM", "Try chamomile or tulsi tea"],
  hotFlashes: ["Increase cooling foods — cucumber, coconut water", "Avoid spicy and hot beverages", "Include soy-based foods"],
  jointPain: ["Include turmeric in cooking", "Add sesame seeds to meals", "Try warm ginger water"],
  nausea: ["Sip ginger water or jeera water", "Eat small frequent meals", "Try dry crackers or makhana"],
  backPain: ["Include calcium-rich foods (milk, ragi)", "Add sesame seeds and almonds", "Try warm turmeric milk"],
};

function getDietRecommendation(
  region: Region,
  phase: Phase,
  symptoms: SymptomSummary,
): WellnessRecommendation["diet"] {
  const meals = WELLNESS_MEALS[region][phase];
  return {
    breakfast: meals.breakfast,
    lunch: meals.lunch,
    dinner: meals.dinner,
    snacks: meals.snacks,
  };
}

// ─── Calorie & Nutrition ──────────────────────────────────────────────────────

function estimateDailyCalories(
  weightKg: number,
  heightCm: number,
  age: number,
  phase: Phase,
): number {
  // Simplified Mifflin-St Jeor for females
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  // Activity factor: 1.4 (light activity) for most
  let activityMultiplier = 1.4;

  // Life-stage adjustments
  if (phase === "maternity") activityMultiplier = 1.5; // +300 cal roughly
  if (phase === "puberty") activityMultiplier = 1.5;   // growing bodies
  if (phase === "menopause") activityMultiplier = 1.35; // slightly lower

  return Math.round(bmr * activityMultiplier);
}

function getNutrientTargets(phase: Phase, symptoms: SymptomSummary): NutrientTarget[] {
  const nutrients: NutrientTarget[] = [
    {
      name: "Iron",
      target: phase === "maternity" ? "27 mg/day" : "18 mg/day",
      foods: "Spinach, lentils (dal), dates, jaggery, ragi",
      icon: "🩸",
    },
    {
      name: "Calcium",
      target: phase === "menopause" ? "1200 mg/day" : "1000 mg/day",
      foods: "Milk, curd, sesame seeds, ragi, paneer",
      icon: "🦴",
    },
    {
      name: "Protein",
      target: phase === "maternity" ? "75 g/day" : "55 g/day",
      foods: "Dal, chana, paneer, eggs, sattu, sprouts",
      icon: "💪",
    },
    {
      name: "Folic Acid",
      target: phase === "maternity" || phase === "family-planning" ? "600 μg/day" : "400 μg/day",
      foods: "Green leafy vegetables, citrus fruits, fortified cereals",
      icon: "🌿",
    },
  ];

  // Boost iron messaging if fatigue/cramps detected
  if (symptoms.hasFatigue || symptoms.hasCramps) {
    nutrients[0].foods = "🔹 Priority: Spinach, lentils, dates, jaggery, amla for vitamin C absorption";
  }

  return nutrients;
}

// ─── Water Intake ─────────────────────────────────────────────────────────────

function calculateWaterIntake(weightKg: number, phase: Phase): { liters: number; display: string } {
  // Base: 35ml per kg
  let mlPerDay = weightKg * 35;

  // Adjustments
  if (phase === "maternity") mlPerDay += 500;       // extra for pregnancy
  if (phase === "menopause") mlPerDay += 200;       // hot flashes

  const liters = Math.round(mlPerDay / 100) / 10;   // round to 1 decimal
  const display = liters >= 3
    ? `Drink ${liters} liters of water today`
    : `Drink ${liters}–${(liters + 0.5).toFixed(1)} liters of water today`;

  return { liters, display };
}

// ─── Sleep & Activity ─────────────────────────────────────────────────────────

function getSleepRecommendation(
  phase: Phase,
  symptoms: SymptomSummary,
  age: number,
): { hours: string; tip: string } {
  let hours = "7–8 hours";
  let tip = "Maintain a consistent sleep schedule for best results";

  if (age < 18) {
    hours = "8–10 hours";
    tip = "Growing bodies need extra rest — aim for early bedtime";
  }

  if (phase === "maternity") {
    hours = "8–9 hours";
    tip = "Rest when you can — naps during the day are okay";
  }

  if (symptoms.hasFatigue || symptoms.hasSleepIssues) {
    hours = "8–9 hours";
    tip = "You've been experiencing fatigue — prioritize rest and avoid screens 1 hour before bed";
  }

  return { hours, tip };
}

function getActivityRecommendation(
  phase: Phase,
  symptoms: SymptomSummary,
  cyclePhase: CyclePhase | null,
): { suggestion: string; intensity: "rest" | "light" | "moderate" } {
  if (symptoms.hasCramps || (symptoms.hasFatigue && symptoms.hasPain)) {
    return {
      suggestion: "Rest today. Gentle stretching if comfortable. Listen to your body.",
      intensity: "rest",
    };
  }

  if (symptoms.hasFatigue || symptoms.hasSleepIssues) {
    return {
      suggestion: "Light walking for 15–20 minutes. Avoid strenuous exercise.",
      intensity: "light",
    };
  }

  if (cyclePhase === "menstrual") {
    return {
      suggestion: "Light yoga or gentle walking. Rest if you feel discomfort.",
      intensity: "light",
    };
  }

  if (cyclePhase === "ovulation" || cyclePhase === "follicular") {
    return {
      suggestion: "Good energy levels! Try 30 minutes of brisk walking or yoga.",
      intensity: "moderate",
    };
  }

  if (phase === "maternity") {
    return {
      suggestion: "Gentle prenatal yoga or short walks. Stay hydrated.",
      intensity: "light",
    };
  }

  if (phase === "menopause") {
    return {
      suggestion: "30 minutes of walking or light yoga. Include weight-bearing exercises for bone health.",
      intensity: "moderate",
    };
  }

  return {
    suggestion: "Stay active with 30 minutes of walking, yoga, or light exercise.",
    intensity: "moderate",
  };
}

// ─── Special Care Alerts ──────────────────────────────────────────────────────

function getSpecialAlert(symptoms: SymptomSummary): string | null {
  if (symptoms.severeCount >= 3) {
    return "You've had multiple days with strong symptoms this week. Consider visiting your nearest PHC if symptoms persist.";
  }
  if (symptoms.totalCount >= 15) {
    return "High symptom frequency detected this week. Please consult a healthcare worker if you feel unwell.";
  }
  return null;
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generateWellnessRecommendation(
  profile: WellnessProfile,
  age: number,
  phase: Phase,
  logs: HealthLogs,
): WellnessRecommendation {
  const bmi = calculateBMI(profile.weight, profile.height);
  const cyclePhase = detectCyclePhase(phase, logs);
  const symptoms = aggregateRecentSymptoms(logs, phase);
  const todayFocus = generateTodayFocus(symptoms, cyclePhase, phase);
  const diet = getDietRecommendation(profile.region, phase, symptoms);
  const dailyCalories = estimateDailyCalories(profile.weight, profile.height, age, phase);
  const nutrients = getNutrientTargets(phase, symptoms);
  const waterIntake = calculateWaterIntake(profile.weight, phase);
  const sleep = getSleepRecommendation(phase, symptoms, age);
  const activity = getActivityRecommendation(phase, symptoms, cyclePhase);
  const specialAlert = getSpecialAlert(symptoms);

  return {
    bmi,
    cyclePhase,
    cyclePhaseLabel: cyclePhase ? CYCLE_PHASE_LABELS[cyclePhase] : null,
    todayFocus,
    diet,
    nutrition: { dailyCalories, nutrients },
    waterIntake,
    sleep,
    activity,
    specialAlert,
    dominantSymptoms: symptoms.dominant,
    dataFreshness: symptoms.totalCount > 0
      ? "Updated based on your recent data"
      : "Log symptoms in the Calendar for personalized insights",
  };
}

export { SYMPTOM_FOOD_BOOSTS, CYCLE_PHASE_LABELS };
