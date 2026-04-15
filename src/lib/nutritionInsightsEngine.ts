/**
 * nutritionInsightsEngine.ts
 *
 * Maps health-log symptom data → nutrient needs → food suggestions.
 * Phase-aware, computes daily from calendar logs. No meal plans, no calories —
 * only targeted nutrient guidance and actionable food suggestions.
 */

import type { Phase } from "@/hooks/usePhase";
import type { HealthLogs } from "@/hooks/useHealthLog";
import { KEY_SYMPTOMS_BY_PHASE } from "@/lib/symptomAnalysis";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnergyTrend = "low" | "stable" | "high";
export type RecoveryNeed = "low" | "medium" | "high";

export interface NutrientNeed {
  name: string;
  emoji: string;
  reason: string;
  foods: string[];
  priority: "high" | "medium";
}

export interface SmartSuggestion {
  emoji: string;
  text: string;
}

export interface QuickTip {
  emoji: string;
  text: string;
}

export interface NutritionState {
  dominantSymptoms: string[];
  energyTrend: EnergyTrend;
  recoveryNeed: RecoveryNeed;
  deficiencies: string[];
  avgSleep7d: number | null;
  avgMood7d: number | null;
  loggedDays: number;
}

export interface NutritionInsightsData {
  hasData: boolean;
  state: NutritionState;
  focus: string;
  focusEmoji: string;
  nutrients: NutrientNeed[];
  suggestions: SmartSuggestion[];
  tips: QuickTip[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MOOD_SCORE: Record<string, number> = { Good: 3, Okay: 2, Low: 1 };

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

// ─── Symptom → Nutrient Mapping ──────────────────────────────────────────────

interface NutrientMap {
  nutrient: string;
  emoji: string;
  reasonTemplate: string;    // {symptom} will be replaced
  foods: string[];
}

const SYMPTOM_NUTRIENT_MAP: Record<string, NutrientMap[]> = {
  fatigue: [
    {
      nutrient: "Iron",
      emoji: "🩸",
      reasonTemplate: "Fatigue detected → Iron supports oxygen transport and energy levels",
      foods: ["Spinach (palak)", "Lentils (dal)", "Dates (khajoor)", "Jaggery (gur)", "Ragi"],
    },
    {
      nutrient: "Vitamin B12",
      emoji: "⚡",
      reasonTemplate: "Fatigue detected → B12 helps convert food into sustained energy",
      foods: ["Milk & curd", "Eggs", "Paneer", "Fortified cereals"],
    },
  ],
  cramps: [
    {
      nutrient: "Magnesium",
      emoji: "💎",
      reasonTemplate: "Cramps detected → Magnesium relaxes muscles and eases cramping",
      foods: ["Banana", "Pumpkin seeds", "Dark chocolate", "Cashews", "Whole grains"],
    },
    {
      nutrient: "Potassium",
      emoji: "🍌",
      reasonTemplate: "Cramps detected → Potassium prevents muscle spasms",
      foods: ["Banana", "Coconut water", "Sweet potato", "Spinach", "Curd"],
    },
  ],
  moodSwings: [
    {
      nutrient: "Omega-3",
      emoji: "🧠",
      reasonTemplate: "Mood swings detected → Omega-3 supports brain chemistry and mood stability",
      foods: ["Walnuts (akhrot)", "Flaxseeds (alsi)", "Chia seeds", "Fish (if non-veg)"],
    },
    {
      nutrient: "Magnesium",
      emoji: "💎",
      reasonTemplate: "Mood changes detected → Magnesium calms the nervous system",
      foods: ["Banana", "Almonds", "Dark chocolate", "Pumpkin seeds"],
    },
  ],
  moodChanges: [
    {
      nutrient: "Omega-3",
      emoji: "🧠",
      reasonTemplate: "Mood changes detected → Omega-3 supports emotional balance",
      foods: ["Walnuts", "Flaxseeds", "Chia seeds", "Almonds"],
    },
    {
      nutrient: "Vitamin B6",
      emoji: "🌿",
      reasonTemplate: "Mood changes detected → B6 helps regulate neurotransmitters",
      foods: ["Banana", "Chickpeas (chana)", "Potatoes", "Sunflower seeds"],
    },
  ],
  acne: [
    {
      nutrient: "Zinc",
      emoji: "🛡️",
      reasonTemplate: "Acne detected → Zinc has anti-inflammatory and skin-healing properties",
      foods: ["Pumpkin seeds", "Chickpeas", "Sesame seeds (til)", "Cashews"],
    },
    {
      nutrient: "Antioxidants",
      emoji: "🫐",
      reasonTemplate: "Acne detected → Antioxidants reduce skin inflammation",
      foods: ["Amla (gooseberry)", "Tomatoes", "Papaya", "Green tea", "Turmeric (haldi)"],
    },
  ],
  headache: [
    {
      nutrient: "Magnesium",
      emoji: "💎",
      reasonTemplate: "Headaches detected → Magnesium deficiency is a common headache trigger",
      foods: ["Almonds", "Spinach", "Banana", "Dark chocolate"],
    },
    {
      nutrient: "Hydration",
      emoji: "💧",
      reasonTemplate: "Headaches detected → Dehydration is a leading cause of headaches",
      foods: ["Water (2-3L daily)", "Coconut water", "Buttermilk (chaas)", "Cucumber"],
    },
  ],
  breastTenderness: [
    {
      nutrient: "Vitamin E",
      emoji: "🌻",
      reasonTemplate: "Breast tenderness detected → Vitamin E may ease tissue discomfort",
      foods: ["Sunflower seeds", "Almonds", "Spinach", "Peanuts"],
    },
  ],
  nausea: [
    {
      nutrient: "Ginger & B6",
      emoji: "🫚",
      reasonTemplate: "Nausea detected → Ginger and B6 are natural anti-nausea remedies",
      foods: ["Fresh ginger (adrak)", "Banana", "Jeera water", "Dry crackers", "Lemon water"],
    },
  ],
  dizziness: [
    {
      nutrient: "Iron",
      emoji: "🩸",
      reasonTemplate: "Dizziness detected → Low iron can cause lightheadedness",
      foods: ["Spinach", "Beetroot", "Pomegranate", "Dates", "Jaggery"],
    },
    {
      nutrient: "Hydration",
      emoji: "💧",
      reasonTemplate: "Dizziness detected → Adequate fluids maintain blood pressure",
      foods: ["Water regularly", "Coconut water", "ORS if needed", "Buttermilk"],
    },
  ],
  backPain: [
    {
      nutrient: "Calcium",
      emoji: "🦴",
      reasonTemplate: "Back pain detected → Calcium strengthens bones and reduces pain",
      foods: ["Milk & curd", "Ragi (nachni)", "Sesame seeds", "Paneer", "Almonds"],
    },
    {
      nutrient: "Vitamin D",
      emoji: "☀️",
      reasonTemplate: "Back pain detected → Vitamin D helps calcium absorption for bone health",
      foods: ["Morning sunlight (15 min)", "Eggs", "Fortified milk", "Mushrooms"],
    },
  ],
  swelling: [
    {
      nutrient: "Potassium",
      emoji: "🍌",
      reasonTemplate: "Swelling detected → Potassium balances fluids and reduces water retention",
      foods: ["Banana", "Coconut water", "Sweet potato", "Spinach"],
    },
  ],
  sleepDisturbance: [
    {
      nutrient: "Magnesium",
      emoji: "💎",
      reasonTemplate: "Sleep issues detected → Magnesium promotes relaxation and better sleep",
      foods: ["Almonds", "Banana", "Warm milk", "Pumpkin seeds"],
    },
    {
      nutrient: "Tryptophan",
      emoji: "🌙",
      reasonTemplate: "Sleep issues detected → Tryptophan helps produce melatonin for sleep",
      foods: ["Warm milk", "Banana", "Nuts", "Seeds", "Curd"],
    },
  ],
  sleepIssues: [
    {
      nutrient: "Magnesium",
      emoji: "💎",
      reasonTemplate: "Sleep issues detected → Magnesium calms your nervous system for rest",
      foods: ["Almonds", "Cashews", "Banana", "Warm milk with nutmeg"],
    },
  ],
  hotFlashes: [
    {
      nutrient: "Phytoestrogens",
      emoji: "🌱",
      reasonTemplate: "Hot flashes detected → Plant estrogens may ease hormonal symptoms",
      foods: ["Soy milk/tofu", "Flaxseeds", "Sesame seeds", "Chickpeas"],
    },
    {
      nutrient: "Hydration",
      emoji: "💧",
      reasonTemplate: "Hot flashes detected → Staying cool and hydrated reduces episodes",
      foods: ["Cold water", "Cucumber", "Coconut water", "Mint tea"],
    },
  ],
  nightSweats: [
    {
      nutrient: "Hydration + Electrolytes",
      emoji: "💧",
      reasonTemplate: "Night sweats detected → Replace lost fluids and minerals",
      foods: ["Water throughout day", "Coconut water", "Buttermilk", "Watermelon"],
    },
  ],
  jointPain: [
    {
      nutrient: "Calcium",
      emoji: "🦴",
      reasonTemplate: "Joint pain detected → Calcium supports bone and joint health",
      foods: ["Ragi", "Milk & curd", "Sesame seeds", "Almonds"],
    },
    {
      nutrient: "Anti-inflammatory foods",
      emoji: "🔥",
      reasonTemplate: "Joint pain detected → Anti-inflammatory foods reduce pain and swelling",
      foods: ["Turmeric (haldi)", "Ginger (adrak)", "Garlic", "Walnuts", "Fish oil"],
    },
  ],
  irregularCycle: [
    {
      nutrient: "Iron + Folate",
      emoji: "🩸",
      reasonTemplate: "Irregular cycle detected → Iron and folate support reproductive health",
      foods: ["Spinach", "Lentils", "Citrus fruits", "Beetroot", "Green leafy vegetables"],
    },
  ],
  ovulationPain: [
    {
      nutrient: "Omega-3",
      emoji: "🧠",
      reasonTemplate: "Ovulation pain detected → Omega-3 fats reduce inflammation",
      foods: ["Flaxseeds", "Walnuts", "Chia seeds", "Fish (if non-veg)"],
    },
  ],
  stress: [
    {
      nutrient: "B-Complex Vitamins",
      emoji: "⚡",
      reasonTemplate: "Stress detected → B vitamins support nervous system under stress",
      foods: ["Whole grains", "Eggs", "Nuts", "Leafy greens", "Curd"],
    },
    {
      nutrient: "Magnesium",
      emoji: "💎",
      reasonTemplate: "Stress detected → Magnesium is a natural stress reliever",
      foods: ["Almonds", "Dark chocolate", "Banana", "Pumpkin seeds"],
    },
  ],
};

// ─── Focus Messages ──────────────────────────────────────────────────────────

function generateFocus(
  dominant: string[],
  energyTrend: EnergyTrend,
  recoveryNeed: RecoveryNeed,
  phase: Phase,
): { focus: string; emoji: string } {
  // Symptom-driven
  if (dominant.includes("fatigue") && dominant.includes("cramps")) {
    return { focus: "Support energy and ease cramps with iron, magnesium, and hydrating foods", emoji: "🔥" };
  }
  if (dominant.includes("fatigue") && energyTrend === "low") {
    return { focus: "Boost energy with iron-rich foods and steady complex carbs", emoji: "⚡" };
  }
  if (dominant.includes("cramps")) {
    return { focus: "Ease cramps with magnesium-rich and anti-inflammatory foods", emoji: "💎" };
  }
  if (dominant.includes("moodSwings") || dominant.includes("moodChanges")) {
    return { focus: "Balance your mood with omega-3 fats and calming nutrients", emoji: "🧠" };
  }
  if (dominant.includes("acne")) {
    return { focus: "Support clear skin with zinc-rich and antioxidant foods", emoji: "🛡️" };
  }
  if (dominant.includes("headache")) {
    return { focus: "Prevent headaches with hydration and magnesium-rich foods", emoji: "💧" };
  }
  if (dominant.includes("nausea")) {
    return { focus: "Settle your stomach with ginger, light foods, and small portions", emoji: "🫚" };
  }
  if (dominant.includes("hotFlashes") || dominant.includes("nightSweats")) {
    return { focus: "Stay cool and hydrated with cooling foods and phytoestrogens", emoji: "❄️" };
  }
  if (dominant.includes("sleepDisturbance") || dominant.includes("sleepIssues")) {
    return { focus: "Improve sleep quality with magnesium and tryptophan-rich foods", emoji: "🌙" };
  }
  if (dominant.includes("stress")) {
    return { focus: "Support your nervous system with B vitamins and calming nutrients", emoji: "🧘" };
  }

  // Recovery-driven
  if (recoveryNeed === "high") {
    return { focus: "Focus on recovery with gentle, nutrient-dense, easy-to-digest foods", emoji: "🌿" };
  }

  // Energy-driven
  if (energyTrend === "high") {
    return { focus: "Maintain your great energy with balanced nutrition and hydration", emoji: "✨" };
  }

  // Phase fallbacks
  if (phase === "maternity") {
    return { focus: "Nourish yourself and your baby with iron, calcium, and protein-rich foods", emoji: "🤰" };
  }
  if (phase === "menopause") {
    return { focus: "Focus on calcium, vitamin D, and anti-inflammatory nutrition today", emoji: "🦴" };
  }

  return { focus: "Fuel your day with balanced, iron-rich, and hydrating foods", emoji: "🍎" };
}

// ─── Smart Suggestions Generator ─────────────────────────────────────────────

function generateSuggestions(
  dominant: string[],
  nutrients: NutrientNeed[],
  energyTrend: EnergyTrend,
  avgSleep: number | null,
): SmartSuggestion[] {
  const sugs: SmartSuggestion[] = [];
  const seen = new Set<string>();

  const add = (emoji: string, text: string) => {
    if (!seen.has(text)) { sugs.push({ emoji, text }); seen.add(text); }
  };

  // Nutrient-specific suggestions
  const nutrientNames = new Set(nutrients.map((n) => n.name));

  if (nutrientNames.has("Iron")) {
    add("🥬", "Add spinach or dal to your lunch for an iron boost");
    add("🍋", "Pair iron foods with vitamin C — squeeze lemon on dal or salads");
  }
  if (nutrientNames.has("Magnesium")) {
    add("🍌", "Eat a banana or a handful of almonds as a mid-day snack");
  }
  if (nutrientNames.has("Omega-3")) {
    add("🥜", "Add a spoonful of flaxseeds or walnuts to your breakfast");
  }
  if (nutrientNames.has("Calcium")) {
    add("🥛", "Include a glass of milk or a bowl of curd with meals");
  }
  if (nutrientNames.has("Zinc")) {
    add("🎃", "Snack on pumpkin seeds or add sesame seeds to your food");
  }
  if (nutrientNames.has("Hydration") || nutrientNames.has("Hydration + Electrolytes")) {
    add("💧", "Drink water every 2 hours — keep a bottle nearby");
  }
  if (nutrientNames.has("Ginger & B6")) {
    add("🫚", "Sip warm ginger water or jeera water between meals");
  }

  // Energy-driven
  if (energyTrend === "low") {
    add("🍯", "Replace sugar with jaggery — provides iron and sustained energy");
    add("🥗", "Eat small, frequent meals to avoid energy crashes");
  }

  // Sleep-driven
  if (avgSleep !== null && avgSleep < 6) {
    add("🥛", "Have warm milk with a pinch of nutmeg before bedtime");
  }

  // General
  add("💧", "Stay hydrated throughout the day — aim for 2-3 liters");

  return sugs.slice(0, 6);
}

// ─── Quick Tips Generator ────────────────────────────────────────────────────

function generateTips(
  dominant: string[],
  phase: Phase,
  avgSleep: number | null,
): QuickTip[] {
  const tips: QuickTip[] = [];
  const seen = new Set<string>();

  const add = (emoji: string, text: string) => {
    if (!seen.has(text)) { tips.push({ emoji, text }); seen.add(text); }
  };

  // Iron-related
  if (dominant.includes("fatigue") || dominant.includes("dizziness")) {
    add("☕", "Avoid tea or coffee immediately after meals — it reduces iron absorption by up to 60%");
    add("🍊", "Eat amla, lemon, or tomato with meals to boost iron absorption");
  }

  // Cramps
  if (dominant.includes("cramps")) {
    add("🔥", "Prefer warm, easy-to-digest foods during cramps — try khichdi or dal rice");
    add("🚫", "Avoid cold drinks and raw salads when experiencing cramps");
  }

  // Mood
  if (dominant.includes("moodSwings") || dominant.includes("moodChanges") || dominant.includes("stress")) {
    add("🍫", "A small piece of dark chocolate can boost mood-lifting serotonin");
    add("🧘", "Eat at regular intervals — skipping meals worsens mood swings");
  }

  // Acne
  if (dominant.includes("acne")) {
    add("🚫", "Cut back on fried snacks and sugary foods — they worsen acne");
    add("🥤", "Drink warm haldi (turmeric) water in the morning for anti-inflammatory benefits");
  }

  // Sleep
  if (avgSleep !== null && avgSleep < 6.5) {
    add("🌙", "Avoid heavy meals close to bedtime — eat dinner 2-3 hours before sleep");
    add("☕", "No caffeine after 3 PM — it disrupts melatonin production");
  }

  // Nausea
  if (dominant.includes("nausea")) {
    add("🫚", "Keep dry biscuits or makhana by your bedside for morning nausea");
    add("🚫", "Avoid strong-smelling or greasy foods when feeling nauseous");
  }

  // Hot flashes
  if (dominant.includes("hotFlashes")) {
    add("🌶️", "Avoid spicy foods, hot beverages, and alcohol — they trigger hot flashes");
    add("🧊", "Keep cold cucumber slices or mint water handy during the day");
  }

  // Phase-specific
  if (phase === "maternity") {
    add("🥚", "Ensure well-cooked eggs and meat — avoid raw or undercooked proteins");
  }
  if (phase === "puberty") {
    add("💪", "Your body is growing — don't skip proteins (dal, eggs, milk, paneer)");
  }

  // General fallback
  if (tips.length < 3) {
    add("🕐", "Eat meals at regular times to keep your metabolism steady");
    add("🚶", "Take a short walk after meals to aid digestion");
  }

  return tips.slice(0, 5);
}

// ─── Main Computation ─────────────────────────────────────────────────────────

export function computeNutritionInsights(
  logs: HealthLogs,
  phase: Phase,
): NutritionInsightsData {
  const todayISO = toISODate(new Date());
  const d7 = getDaysAgoISO(7);
  const d14 = getDaysAgoISO(14);

  // Collect phase entries in 7d and prev 7d
  const entries7d: [string, any][] = [];
  const entriesPrev7d: [string, any][] = [];

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== phase || dateISO > todayISO) continue;
    if (dateISO >= d7) entries7d.push([dateISO, entry]);
    else if (dateISO >= d14) entriesPrev7d.push([dateISO, entry]);
  }

  if (entries7d.length === 0) {
    return emptyResult();
  }

  // ── Count symptoms ──
  const symptomCounts: Record<string, number> = {};
  let moodSum = 0, moodN = 0;
  let sleepSum = 0, sleepN = 0;
  let totalSymptoms = 0;

  for (const [, entry] of entries7d) {
    if (entry.symptoms) {
      for (const [k, v] of Object.entries(entry.symptoms)) {
        if (v) { symptomCounts[k] = (symptomCounts[k] || 0) + 1; totalSymptoms++; }
      }
    }
    const mood = MOOD_SCORE[entry.mood ?? ""] ?? null;
    if (mood !== null) { moodSum += mood; moodN++; }
    const sleep = entry.sleepHours ?? null;
    if (sleep !== null) { sleepSum += sleep; sleepN++; }
  }

  // Dominant symptoms (sorted by frequency, top 4)
  const sortedSymptoms = Object.entries(symptomCounts)
    .sort(([, a], [, b]) => b - a);
  const dominant = sortedSymptoms.slice(0, 4).map(([k]) => k);

  // Energy trend
  const hasFatigue = !!symptomCounts["fatigue"];
  const hasSleepIssue = !!symptomCounts["sleepDisturbance"] || !!symptomCounts["sleepIssues"];
  const avgSleep = sleepN > 0 ? sleepSum / sleepN : null;
  const avgMood = moodN > 0 ? moodSum / moodN : null;

  let energyTrend: EnergyTrend = "stable";
  if (hasFatigue || (avgSleep !== null && avgSleep < 6)) energyTrend = "low";
  else if (!hasFatigue && !hasSleepIssue && (avgMood === null || avgMood >= 2.5)) energyTrend = "high";

  // Recovery need
  let recoveryNeed: RecoveryNeed = "low";
  if (totalSymptoms >= 8 || (hasFatigue && (symptomCounts["cramps"] || 0) >= 2)) recoveryNeed = "high";
  else if (totalSymptoms >= 4) recoveryNeed = "medium";

  // Inferred deficiencies
  const deficiencies: string[] = [];
  const defSeen = new Set<string>();
  for (const sym of dominant) {
    const maps = SYMPTOM_NUTRIENT_MAP[sym];
    if (maps) {
      for (const m of maps) {
        if (!defSeen.has(m.nutrient)) { deficiencies.push(m.nutrient); defSeen.add(m.nutrient); }
      }
    }
  }

  const state: NutritionState = {
    dominantSymptoms: dominant,
    energyTrend,
    recoveryNeed,
    deficiencies: deficiencies.slice(0, 4),
    avgSleep7d: avgSleep !== null ? Math.round(avgSleep * 10) / 10 : null,
    avgMood7d: avgMood !== null ? Math.round(avgMood * 10) / 10 : null,
    loggedDays: entries7d.length,
  };

  // ── Build nutrient needs ──
  const nutrientMap = new Map<string, NutrientNeed>();

  for (const sym of dominant) {
    const maps = SYMPTOM_NUTRIENT_MAP[sym];
    if (!maps) continue;
    for (const m of maps) {
      if (!nutrientMap.has(m.nutrient)) {
        nutrientMap.set(m.nutrient, {
          name: m.nutrient,
          emoji: m.emoji,
          reason: m.reasonTemplate,
          foods: m.foods,
          priority: dominant.indexOf(sym) < 2 ? "high" : "medium",
        });
      }
    }
  }

  // Add low-sleep nutrient if applicable
  if (avgSleep !== null && avgSleep < 6 && !nutrientMap.has("Magnesium")) {
    nutrientMap.set("Magnesium", {
      name: "Magnesium",
      emoji: "💎",
      reason: "Low sleep detected → Magnesium promotes relaxation and deeper sleep",
      foods: ["Almonds", "Banana", "Warm milk", "Pumpkin seeds"],
      priority: "medium",
    });
  }

  const nutrients = Array.from(nutrientMap.values())
    .sort((a, b) => (a.priority === "high" ? 0 : 1) - (b.priority === "high" ? 0 : 1))
    .slice(0, 5);

  // ── Focus ──
  const { focus, emoji: focusEmoji } = generateFocus(dominant, energyTrend, recoveryNeed, phase);

  // ── Suggestions ──
  const suggestions = generateSuggestions(dominant, nutrients, energyTrend, avgSleep);

  // ── Tips ──
  const tips = generateTips(dominant, phase, avgSleep);

  return {
    hasData: true,
    state,
    focus,
    focusEmoji,
    nutrients,
    suggestions,
    tips,
  };
}

// ─── Empty result ─────────────────────────────────────────────────────────────

function emptyResult(): NutritionInsightsData {
  return {
    hasData: false,
    state: {
      dominantSymptoms: [],
      energyTrend: "stable",
      recoveryNeed: "low",
      deficiencies: [],
      avgSleep7d: null,
      avgMood7d: null,
      loggedDays: 0,
    },
    focus: "",
    focusEmoji: "",
    nutrients: [],
    suggestions: [],
    tips: [],
  };
}
