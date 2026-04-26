/**
 * pubertyIntelligentNutritionEngine.ts
 *
 * Intelligent nutrition assistant for puberty phase.
 * Analyzes symptoms + medical conditions + puberty timing + diet + region
 * to produce prioritized nutrient recommendations with frequency guidance.
 *
 * ⚠️ NOT a diagnostic tool. Focus on nutrition guidance only.
 */

import type { HealthLogs, PubertyEntry } from "@/hooks/useHealthLog";
import type { ProfileData } from "@/hooks/useProfile";
import type { OnboardingConfig } from "@/hooks/useOnboarding";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NutrientPriority = "High" | "Medium" | "Low";

export interface IntelligentNutrientRecommendation {
  id: string;
  nutrient: string;
  emoji: string;
  priority: NutrientPriority;
  reason: string;
  sources: string[];
  frequency: string;
  severityLabel: string;
}

export interface IntelligentSpecialNote {
  type: "medical" | "puberty_timing";
  icon: string;
  title: string;
  advice: string;
}

export interface IntelligentDeficiency {
  nutrient: string;
  emoji: string;
  priority: NutrientPriority;
  reason: string;
}

export interface IntelligentNutritionResult {
  hasData: boolean;
  analyzedDays: number;
  pubertyTiming: "Early" | "Normal" | "Late";
  dietPreference: string;
  regionLabel: string;
  deficiencyList: IntelligentDeficiency[];
  nutrientRecommendations: IntelligentNutrientRecommendation[];
  specialNotes: IntelligentSpecialNote[];
  // ── New intelligent modules ──
  hydration: HydrationResult | null;
  foodRestrictions: FoodRestriction[];
  calories: CalorieResult | null;
  protein: ProteinResult | null;
}

// ─── Hydration Types ──────────────────────────────────────────────────────────

export interface HydrationSlot {
  slot: string;
  amount: string;
  tip: string;
}

export interface HydrationAlert {
  emoji: string;
  text: string;
}

export interface HydrationResult {
  dailyGoalLiters: number;
  baseMl: number;
  climateAddMl: number;
  activityAddMl: number;
  distribution: HydrationSlot[];
  alerts: HydrationAlert[];
}

// ─── Food Restriction Types ───────────────────────────────────────────────────

export interface FoodRestriction {
  food: string;
  category: "avoid" | "reduce";
  reason: string;
}

// ─── Calorie Types ────────────────────────────────────────────────────────────

export interface CalorieResult {
  dailyKcal: number;
  range: [number, number];
  activityLabel: string;
  adjustmentNote: string | null;
}

// ─── Protein Types ────────────────────────────────────────────────────────────

export interface ProteinSource {
  name: string;
  grams: string;
}

export interface ProteinResult {
  dailyGrams: number;
  range: [number, number];
  tier: "normal" | "fitness";
  sources: ProteinSource[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISODate(d: Date): string { return d.toISOString().slice(0, 10); }
function getDaysAgoISO(days: number): string {
  const d = new Date(); d.setDate(d.getDate() - days); return toISODate(d);
}

const REGION_LABELS: Record<string, string> = {
  south: "South Indian", north: "North Indian", east: "East Indian", west: "West Indian",
};

const DIET_LABELS: Record<string, string> = {
  veg: "Vegetarian", "non-veg": "Non-Vegetarian", mixed: "Mixed", eggetarian: "Eggetarian",
};

// ─── 30-Day Symptom Extraction ────────────────────────────────────────────────

interface SymptomAnalysis {
  counts: Record<string, number>;
  maxSeverity: Record<string, number>;
  weightedScore: Record<string, number>;
  totalDays: number;
  heavyFlowDays: number;
  lowMoodDays: number;
  avgSleep: number | null;
}

function analyze30DaySymptoms(logs: HealthLogs): SymptomAnalysis {
  const today = toISODate(new Date());
  const from = getDaysAgoISO(30);
  const counts: Record<string, number> = {};
  const maxSev: Record<string, number> = {};
  const weighted: Record<string, number> = {};
  let days = 0, heavyFlow = 0, lowMood = 0, sleepSum = 0, sleepN = 0;

  for (const [iso, entry] of Object.entries(logs)) {
    if (entry.phase !== "puberty" || iso > today || iso < from) continue;
    days++;
    const e = entry as PubertyEntry;
    if (e.symptoms) {
      for (const [k, v] of Object.entries(e.symptoms)) {
        if (!v) continue;
        counts[k] = (counts[k] || 0) + 1;
        const intensity = e.symptomIntensities?.[k] ?? 5;
        maxSev[k] = Math.max(maxSev[k] || 0, intensity);
        const w = intensity >= 7 ? 3 : intensity >= 4 ? 2 : 1;
        weighted[k] = (weighted[k] || 0) + w;
      }
    }
    if (e.flowIntensity === "Heavy") heavyFlow++;
    if (e.mood === "Low") lowMood++;
    if (e.sleepHours != null) { sleepSum += e.sleepHours; sleepN++; }
  }

  return {
    counts, maxSeverity: maxSev, weightedScore: weighted, totalDays: days,
    heavyFlowDays: heavyFlow, lowMoodDays: lowMood,
    avgSleep: sleepN > 0 ? sleepSum / sleepN : null,
  };
}

// ─── Nutrient Deficiency Rules ────────────────────────────────────────────────

interface NutrientRule {
  id: string;
  nutrient: string;
  emoji: string;
  /** Symptom keys that suggest this deficiency */
  symptomTriggers: string[];
  /** Medical conditions that strongly suggest this deficiency */
  conditionTriggers: string[];
  /** Base reason text */
  reason: string;
  /** Region-specific food sources */
  foodsByRegion: Record<string, string[]>;
  /** Veg-only food sources */
  vegFoods: string[];
  /** Mixed/non-veg food sources (added on top of veg) */
  mixedFoods: string[];
}

const NUTRIENT_RULES: NutrientRule[] = [
  {
    id: "iron",
    nutrient: "Iron",
    emoji: "🩸",
    symptomTriggers: ["fatigue", "headache", "cramps"],
    conditionTriggers: ["anemia"],
    reason: "Iron supports oxygen transport in blood. Menstruation and rapid growth increase iron needs.",
    foodsByRegion: {
      south: ["Ragi porridge", "Drumstick leaves (murungai)", "Sambar with spinach", "Jaggery payasam", "Beetroot poriyal"],
      north: ["Spinach (palak) paratha", "Sarson ka saag", "Dates with milk", "Chana masala", "Jaggery laddu"],
      east: ["Spinach dal (palak dal)", "Kolmi shak", "Lal shak bhaji", "Chuda with gur", "Moong dal"],
      west: ["Methi thepla", "Bajra roti with jaggery", "Beetroot raita", "Poha with peanuts", "Dates"],
    },
    vegFoods: ["Spinach (palak)", "Beetroot", "Dates (khajoor)", "Jaggery (gur)", "Lentils (dal)", "Pomegranate", "Ragi"],
    mixedFoods: ["Chicken liver", "Egg yolk", "Mutton"],
  },
  {
    id: "calcium",
    nutrient: "Calcium",
    emoji: "🦴",
    symptomTriggers: ["cramps", "fatigue"],
    conditionTriggers: ["osteoporosis"],
    reason: "~40% of adult bone mass builds during puberty. Calcium strengthens bones and reduces cramps.",
    foodsByRegion: {
      south: ["Ragi dosa", "Curd rice", "Paneer curry", "Sesame chutney", "Coconut milk"],
      north: ["Paneer tikka", "Lassi", "Curd raita", "Ragi roti", "Kheer"],
      east: ["Mishti doi", "Paneer bhapa", "Sesame laddu", "Curd", "Milk"],
      west: ["Paneer bhurji", "Shrikhand", "Ragi bhakri", "Buttermilk", "Sesame chikki"],
    },
    vegFoods: ["Milk & curd", "Paneer", "Ragi (nachni)", "Sesame seeds (til)", "Almonds", "Broccoli"],
    mixedFoods: ["Sardines (with bones)", "Egg"],
  },
  {
    id: "vitamin_d",
    nutrient: "Vitamin D",
    emoji: "☀️",
    symptomTriggers: ["fatigue", "acne"],
    conditionTriggers: ["osteoporosis"],
    reason: "Vitamin D helps absorb calcium for strong bones and supports immune function during growth.",
    foodsByRegion: {
      south: ["Mushroom curry", "Egg dosa", "Fortified milk", "Curd"],
      north: ["Mushroom matar", "Egg bhurji", "Fortified milk", "Paneer"],
      east: ["Mushroom jhol", "Egg curry", "Fortified milk", "Fish"],
      west: ["Mushroom sabzi", "Egg paratha", "Fortified milk", "Curd"],
    },
    vegFoods: ["Fortified milk", "Mushrooms", "Fortified cereals", "Curd (dahi)"],
    mixedFoods: ["Eggs", "Fish (rohu, sardine)", "Cod liver oil"],
  },
  {
    id: "omega3",
    nutrient: "Omega-3 Fatty Acids",
    emoji: "🧠",
    symptomTriggers: ["moodSwings", "acne"],
    conditionTriggers: ["pcos", "pcod"],
    reason: "Omega-3s support brain development, emotional balance, and reduce skin inflammation.",
    foodsByRegion: {
      south: ["Flaxseed chutney", "Walnuts", "Chia seed payasam", "Fish curry (if non-veg)"],
      north: ["Flaxseed paratha", "Walnut halwa", "Chia seed lassi", "Fish tikka (if non-veg)"],
      east: ["Mustard oil cooking", "Walnuts", "Flaxseed", "Ilish fish (if non-veg)"],
      west: ["Flaxseed laddu", "Walnuts in trail mix", "Chia pudding", "Bombil fish (if non-veg)"],
    },
    vegFoods: ["Walnuts (akhrot)", "Flaxseeds (alsi)", "Chia seeds", "Almonds"],
    mixedFoods: ["Fish (salmon, mackerel)", "Eggs (omega-3 enriched)"],
  },
  {
    id: "b12",
    nutrient: "Vitamin B12",
    emoji: "💊",
    symptomTriggers: ["fatigue", "headache"],
    conditionTriggers: [],
    reason: "B12 is essential for energy production, nerve function, and red blood cell formation.",
    foodsByRegion: {
      south: ["Curd rice", "Egg appam", "Paneer dosa", "Fortified cereal"],
      north: ["Paneer paratha", "Egg curry", "Curd raita", "Milk"],
      east: ["Egg curry", "Paneer bhapa", "Curd", "Fortified cereal"],
      west: ["Paneer bhurji", "Egg akuri", "Buttermilk", "Fortified cereal"],
    },
    vegFoods: ["Milk & curd", "Paneer", "Fortified cereals", "Cheese"],
    mixedFoods: ["Eggs", "Chicken", "Fish"],
  },
  {
    id: "zinc",
    nutrient: "Zinc",
    emoji: "⚡",
    symptomTriggers: ["acne", "fatigue"],
    conditionTriggers: [],
    reason: "Zinc supports immune function, skin health, and growth during puberty.",
    foodsByRegion: {
      south: ["Pumpkin seeds sundal", "Chickpea curry", "Sesame chutney", "Cashew rice"],
      north: ["Rajma", "Chickpea chaat", "Pumpkin seed snack", "Paneer"],
      east: ["Cholar dal", "Pumpkin seeds", "Cashew curry", "Chickpea ghugni"],
      west: ["Pumpkin seed chikki", "Chickpea usal", "Cashew", "Sesame laddu"],
    },
    vegFoods: ["Pumpkin seeds", "Chickpeas (chana)", "Cashews", "Sesame seeds", "Lentils"],
    mixedFoods: ["Chicken", "Mutton", "Eggs"],
  },
  {
    id: "fiber",
    nutrient: "Fiber",
    emoji: "🌾",
    symptomTriggers: ["acne", "fatigue"],
    conditionTriggers: ["pcos", "pcod", "diabetes"],
    reason: "Fiber supports hormonal balance, blood sugar control, and gut health during puberty.",
    foodsByRegion: {
      south: ["Idli with sambar", "Ragi mudde", "Vegetable kootu", "Brown rice upma"],
      north: ["Daliya khichdi", "Mixed dal", "Stuffed paratha (lauki/methi)", "Oats cheela"],
      east: ["Mixed vegetable dal", "Litti chokha", "Oats khichdi", "Sattu drink"],
      west: ["Bajra roti", "Undhiyu", "Mixed sprouts usal", "Jowar roti with sabzi"],
    },
    vegFoods: ["Whole grains (ragi, bajra, jowar)", "Lentils", "Vegetables", "Fruits with skin", "Oats"],
    mixedFoods: [],
  },
  {
    id: "protein",
    nutrient: "Protein",
    emoji: "💪",
    symptomTriggers: ["fatigue"],
    conditionTriggers: [],
    reason: "Protein is essential for growth, muscle development, and hormone production during puberty.",
    foodsByRegion: {
      south: ["Dal sambar", "Paneer dosa", "Egg curry", "Sundal (chickpea)", "Curd rice"],
      north: ["Dal makhani", "Paneer tikka", "Egg bhurji", "Rajma chawal", "Chole"],
      east: ["Cholar dal", "Egg curry", "Paneer bhapa", "Fish curry", "Sattu paratha"],
      west: ["Dal dhokli", "Paneer bhurji", "Sprouts usal", "Egg akuri", "Thepla"],
    },
    vegFoods: ["Lentils (dal)", "Paneer", "Chickpeas", "Soy chunks", "Milk & curd", "Nuts"],
    mixedFoods: ["Eggs", "Chicken", "Fish"],
  },
];

// ─── Medical Condition Mapping ────────────────────────────────────────────────

const CONDITION_NUTRIENT_MAP: Record<string, { nutrients: string[]; note: string }> = {
  anemia:          { nutrients: ["iron", "b12", "vitamin_d"], note: "Anemia detected: prioritize iron-rich foods with vitamin C pairing for better absorption. Avoid tea/coffee with meals." },
  pcos:            { nutrients: ["fiber", "omega3", "zinc"], note: "PCOS/PCOD: focus on low-GI, high-fiber meals. Reduce refined sugar and processed foods. Include omega-3 sources." },
  pcod:            { nutrients: ["fiber", "omega3", "zinc"], note: "PCOS/PCOD: focus on low-GI, high-fiber meals. Reduce refined sugar and processed foods. Include omega-3 sources." },
  diabetes:        { nutrients: ["fiber", "zinc", "protein"], note: "Diabetes: controlled carbs with high fiber and protein per meal. Avoid sugary drinks and sweets. Eat at regular intervals." },
  hypothyroidism:  { nutrients: ["zinc", "protein", "vitamin_d"], note: "Hypothyroidism: include selenium and iodine sources (nuts, dairy). Avoid excess cruciferous vegetables raw. Ensure adequate protein." },
  hyperthyroidism: { nutrients: ["calcium", "protein", "vitamin_d"], note: "Hyperthyroidism: calorie-dense balanced meals. Ensure calcium and vitamin D. Avoid excess iodine." },
  osteoporosis:    { nutrients: ["calcium", "vitamin_d", "protein"], note: "Osteoporosis risk: prioritize calcium + vitamin D daily. Include weight-bearing activities. Get morning sunlight." },
};

function normalizeCondition(c: string): string {
  const lc = c.trim().toLowerCase();
  if (lc === "pcod") return "pcos";
  return lc;
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export function computeIntelligentNutrition(
  logs: HealthLogs,
  profile: ProfileData | null,
  onboardingConfig: OnboardingConfig | null,
): IntelligentNutritionResult {
  const analysis = analyze30DaySymptoms(logs);
  const region = profile?.region ?? "south";
  const regionLabel = REGION_LABELS[region] ?? "South Indian";
  const dietType = profile?.dietType ?? "mixed";
  const dietLabel = DIET_LABELS[dietType] ?? "Mixed";
  const conditions = (profile?.medicalConditions ?? []).map(normalizeCondition).filter(Boolean);
  const menarcheCategory = onboardingConfig?.pubertyData?.menarche_category;
  const pubertyTiming: "Early" | "Normal" | "Late" =
    menarcheCategory === "Early Puberty" ? "Early" :
    menarcheCategory === "Late Puberty" ? "Late" : "Normal";

  const hasSignals = analysis.totalDays > 0 || conditions.length > 0;
  if (!hasSignals) {
    return {
      hasData: false, analyzedDays: 0, pubertyTiming, dietPreference: dietLabel,
      regionLabel, deficiencyList: [], nutrientRecommendations: [], specialNotes: [],
      hydration: null, foodRestrictions: [], calories: null, protein: null,
    };
  }

  // ─── Score each nutrient ─────────────────────────────────────────────
  const nutrientScores: Record<string, { score: number; reasons: string[] }> = {};

  for (const rule of NUTRIENT_RULES) {
    let score = 0;
    const reasons: string[] = [];

    // Symptom-based scoring (from 30-day data)
    for (const sym of rule.symptomTriggers) {
      const count = analysis.counts[sym] ?? 0;
      const maxSev = analysis.maxSeverity[sym] ?? 0;
      const weighted = analysis.weightedScore[sym] ?? 0;

      if (count >= 5) { score += 4; reasons.push(`Frequent ${sym} (${count} days in 30d)`); }
      else if (count >= 2) { score += 2; reasons.push(`${sym} logged ${count} times`); }
      else if (count >= 1) { score += 1; reasons.push(`${sym} reported`); }

      if (maxSev >= 7) { score += 2; reasons.push(`Severe ${sym} (intensity ${maxSev}/10)`); }
      else if (maxSev >= 4 && count >= 2) { score += 1; }
    }

    // Condition-based scoring (highest weight)
    for (const cond of conditions) {
      const mapping = CONDITION_NUTRIENT_MAP[cond];
      if (mapping && mapping.nutrients.includes(rule.id)) {
        score += 5;
        reasons.push(`Medical condition: ${cond}`);
      }
    }

    // Puberty timing modifiers
    if (pubertyTiming === "Early" && ["fiber", "omega3"].includes(rule.id)) {
      score += 2; reasons.push("Early puberty: hormonal balance support");
    }
    if (pubertyTiming === "Late" && ["protein", "zinc", "iron"].includes(rule.id)) {
      score += 2; reasons.push("Late puberty: growth support");
    }

    // Heavy flow → iron boost
    if (rule.id === "iron" && analysis.heavyFlowDays >= 2) {
      score += 3; reasons.push(`Heavy menstrual flow (${analysis.heavyFlowDays} days)`);
    }

    // Low mood → omega-3 boost
    if (rule.id === "omega3" && analysis.lowMoodDays >= 3) {
      score += 2; reasons.push(`Low mood pattern (${analysis.lowMoodDays} days)`);
    }

    // Poor sleep → energy nutrients
    if (["iron", "b12", "protein"].includes(rule.id) && analysis.avgSleep !== null && analysis.avgSleep < 6.5) {
      score += 1; reasons.push("Low average sleep");
    }

    if (score > 0) {
      nutrientScores[rule.id] = { score, reasons };
    }
  }

  // ─── Classify priority ──────────────────────────────────────────────
  function getPriority(score: number): NutrientPriority {
    if (score >= 6) return "High";
    if (score >= 3) return "Medium";
    return "Low";
  }

  function getFrequency(priority: NutrientPriority): string {
    if (priority === "High") return "2–3 times per day";
    if (priority === "Medium") return "Daily";
    return "Alternate days";
  }

  function getSeverityLabel(priority: NutrientPriority): string {
    if (priority === "High") return "Severe or frequent — needs immediate attention";
    if (priority === "Medium") return "Moderate or occasional";
    return "Mild or rare";
  }

  // ─── Build food sources (diet + region filtered) ────────────────────
  function getFoodSources(rule: NutrientRule): string[] {
    const regional = rule.foodsByRegion[region] ?? rule.foodsByRegion.south ?? [];
    const base = dietType === "veg" ? rule.vegFoods : [...rule.vegFoods, ...rule.mixedFoods];
    // Merge: regional first (up to 4), then fill from base (unique)
    const seen = new Set<string>();
    const result: string[] = [];
    for (const f of regional) {
      if (dietType === "veg" && rule.mixedFoods.some(mf => f.toLowerCase().includes(mf.toLowerCase().split(" ")[0]))) continue;
      if (!seen.has(f)) { seen.add(f); result.push(f); }
      if (result.length >= 4) break;
    }
    for (const f of base) {
      if (!seen.has(f)) { seen.add(f); result.push(f); }
      if (result.length >= 7) break;
    }
    return result;
  }

  // ─── Build output ───────────────────────────────────────────────────
  const sorted = Object.entries(nutrientScores).sort((a, b) => b[1].score - a[1].score);

  const deficiencyList: IntelligentDeficiency[] = sorted.map(([id, { score, reasons }]) => {
    const rule = NUTRIENT_RULES.find(r => r.id === id)!;
    const priority = getPriority(score);
    return { nutrient: rule.nutrient, emoji: rule.emoji, priority, reason: reasons[0] ?? rule.reason };
  });

  const nutrientRecommendations: IntelligentNutrientRecommendation[] = sorted.map(([id, { score, reasons }]) => {
    const rule = NUTRIENT_RULES.find(r => r.id === id)!;
    const priority = getPriority(score);
    return {
      id: rule.id,
      nutrient: rule.nutrient,
      emoji: rule.emoji,
      priority,
      reason: reasons.join(". "),
      sources: getFoodSources(rule),
      frequency: getFrequency(priority),
      severityLabel: getSeverityLabel(priority),
    };
  });

  // ─── Special Notes ──────────────────────────────────────────────────
  const specialNotes: IntelligentSpecialNote[] = [];

  // Medical condition notes
  for (const cond of conditions) {
    const mapping = CONDITION_NUTRIENT_MAP[cond];
    if (mapping) {
      specialNotes.push({
        type: "medical",
        icon: "🏥",
        title: `Based on ${cond.charAt(0).toUpperCase() + cond.slice(1)}`,
        advice: mapping.note,
      });
    }
  }

  // Puberty timing notes
  if (pubertyTiming === "Early") {
    specialNotes.push({
      type: "puberty_timing",
      icon: "🌱",
      title: "Early Puberty Guidance",
      advice: "Focus on hormonal balance: reduce sugar intake, increase fiber and omega-3 fatty acids. Prefer whole foods over processed snacks. Ensure adequate sleep (8–10 hours).",
    });
  } else if (pubertyTiming === "Late") {
    specialNotes.push({
      type: "puberty_timing",
      icon: "🌿",
      title: "Late Puberty Support",
      advice: "Support growth with extra protein, zinc, and healthy fats. Ensure calorie-adequate meals — never skip meals. Include weight-bearing exercise and adequate sleep.",
    });
  } else {
    specialNotes.push({
      type: "puberty_timing",
      icon: "🌸",
      title: "Normal Puberty",
      advice: "Maintain a balanced diet with adequate iron, calcium, and protein. Stay hydrated, get regular exercise, and aim for 8–9 hours of sleep.",
    });
  }

  // ─── Hydration Module ───────────────────────────────────────────────
  const activityLevel = profile?.activityLevel ?? "moderate";
  const climate = profile?.climate ?? "hot";
  const weight = profile?.weight ?? null;

  let hydration: HydrationResult | null = null;
  if (weight !== null && weight > 0) {
    const baseMl = Math.round(35 * weight);
    const climateAddMl = climate === "hot" ? 750 : climate === "cold" ? 0 : 300;
    const activityAddMl = activityLevel === "active" ? 600 : activityLevel === "moderate" ? 400 : 0;
    const totalMl = baseMl + climateAddMl + activityAddMl;
    const dailyGoalLiters = Math.round((totalMl / 1000) * 10) / 10;

    // Distribute across day
    const morningMl = Math.round(totalMl * 0.3);
    const afternoonMl = Math.round(totalMl * 0.4);
    const eveningMl = totalMl - morningMl - afternoonMl;

    const distribution: HydrationSlot[] = [
      { slot: "🌅 Morning (6 AM – 11 AM)", amount: `${Math.round(morningMl / 250)} glasses (~${morningMl} ml)`, tip: "Start with 1–2 glasses on waking up. Have a glass before breakfast." },
      { slot: "☀️ Afternoon (11 AM – 4 PM)", amount: `${Math.round(afternoonMl / 250)} glasses (~${afternoonMl} ml)`, tip: "Sip water between meals. Coconut water or buttermilk count too." },
      { slot: "🌙 Evening (4 PM – 10 PM)", amount: `${Math.round(eveningMl / 250)} glasses (~${eveningMl} ml)`, tip: "Avoid heavy water 1 hour before sleep. A warm glass of milk is fine." },
    ];

    // Smart alerts based on symptoms
    const alerts: HydrationAlert[] = [];
    const hasHeadache = (analysis.counts["headache"] ?? 0) > 0;
    const hasFatigue = (analysis.counts["fatigue"] ?? 0) > 0;
    if (hasHeadache || hasFatigue) {
      alerts.push({ emoji: "⚠️", text: "Headache or fatigue detected — this could be a sign of dehydration. Increase water intake and monitor." });
    }
    if (climate === "hot") {
      alerts.push({ emoji: "🌡️", text: "Hot climate: you lose more water through sweat. Add lemon water, buttermilk (chaas), or coconut water for electrolytes." });
    }
    if (activityLevel === "active") {
      alerts.push({ emoji: "🏃", text: "Active lifestyle: drink 200 ml water before exercise and sip regularly during activity." });
    }
    alerts.push({ emoji: "💧", text: "Dark urine? Increase your water intake immediately. Pale yellow urine indicates good hydration." });

    hydration = { dailyGoalLiters, baseMl, climateAddMl, activityAddMl, distribution, alerts };
  }

  // ─── Foods to Avoid / Reduce Module ─────────────────────────────────
  const foodRestrictions: FoodRestriction[] = [];
  const addedFoods = new Set<string>();

  function addRestriction(food: string, category: "avoid" | "reduce", reason: string) {
    const key = `${food}::${category}`;
    if (!addedFoods.has(key)) {
      addedFoods.add(key);
      foodRestrictions.push({ food, category, reason });
    }
  }

  // Condition-based rules
  for (const cond of conditions) {
    switch (cond) {
      case "anemia":
        addRestriction("Tea / Coffee with meals", "reduce", "Tannins in tea/coffee block iron absorption. Drink 1 hour before or after meals.");
        addRestriction("Excess milk with iron-rich food", "reduce", "Calcium can inhibit iron absorption when consumed together.");
        break;
      case "pcos":
      case "pcod":
        addRestriction("Refined sugar (sweets, mithai)", "avoid", "Sugar spikes insulin, worsening hormonal imbalance in PCOS/PCOD.");
        addRestriction("Refined carbs (maida, white bread)", "reduce", "Refined carbs cause rapid blood sugar spikes. Prefer whole grains.");
        addRestriction("Processed / packaged snacks", "reduce", "High in trans-fats and hidden sugars that worsen PCOS symptoms.");
        addRestriction("Sugary drinks (cold drinks, packaged juice)", "avoid", "Liquid sugar causes sharp insulin spikes. Choose water, buttermilk or nimbu pani.");
        break;
      case "diabetes":
        addRestriction("Sugary drinks & sweets", "avoid", "Direct sugar intake causes rapid blood glucose spikes.");
        addRestriction("White rice (large portions)", "reduce", "High glycemic index. Prefer brown rice or millets in smaller portions.");
        addRestriction("Refined flour (maida) products", "avoid", "Maida has high GI and minimal fiber. Choose atta or millet flour.");
        break;
      case "hypothyroidism":
        addRestriction("Raw cruciferous vegetables (excess)", "reduce", "Raw cabbage, cauliflower in excess may interfere with thyroid function. Cooking is fine.");
        addRestriction("Soy products (excess)", "reduce", "Excessive soy may interfere with thyroid hormone absorption.");
        break;
      case "hyperthyroidism":
        addRestriction("Excess iodine (iodized salt overuse)", "reduce", "Too much iodine can worsen hyperthyroid symptoms.");
        addRestriction("Caffeine", "reduce", "Caffeine can increase heart rate and anxiety, worsening hyperthyroid symptoms.");
        break;
      case "osteoporosis":
        addRestriction("Excess caffeine", "reduce", "Caffeine may reduce calcium absorption. Limit to 1–2 cups/day.");
        addRestriction("Excess salt", "reduce", "High sodium increases calcium loss through urine.");
        break;
    }
  }

  // Symptom-based rules
  const hasAcne = (analysis.counts["acne"] ?? 0) >= 2;
  const hasBloating = (analysis.counts["bloating"] ?? 0) >= 1;
  const hasCramps = (analysis.counts["cramps"] ?? 0) >= 2;

  if (hasAcne) {
    addRestriction("Fried / oily foods", "reduce", "Excess oil can trigger acne flare-ups. Choose steamed, baked, or air-fried options.");
    addRestriction("Dairy (if acne persists)", "reduce", "Some individuals find dairy worsens acne. Monitor and reduce if needed.");
  }
  if (hasBloating) {
    addRestriction("Carbonated drinks", "reduce", "Fizzy drinks increase gas and bloating. Choose still water or herbal tea.");
    addRestriction("Beans / lentils (soak before cooking)", "reduce", "Soaking reduces gas-causing compounds. Don't eliminate — they're nutritious.");
  }
  if (hasCramps) {
    addRestriction("Excess caffeine during periods", "reduce", "Caffeine constricts blood vessels and may worsen cramps.");
  }

  // ─── Calorie Intake Module ──────────────────────────────────────────
  let calories: CalorieResult | null = null;
  if (weight !== null && weight > 0) {
    let low: number, high: number;
    let actLabel: string;
    if (activityLevel === "sedentary") {
      low = weight * 25; high = weight * 30; actLabel = "Sedentary";
    } else if (activityLevel === "active") {
      low = weight * 35; high = weight * 40; actLabel = "Active";
    } else {
      low = weight * 30; high = weight * 35; actLabel = "Moderate";
    }

    const midKcal = Math.round((low + high) / 2);
    let adjustmentNote: string | null = null;
    const bmiCat = profile?.bmiCategory ?? "Normal";
    let adjustedKcal = midKcal;

    if (bmiCat === "Underweight") {
      adjustedKcal = midKcal + 400;
      adjustmentNote = "BMI indicates underweight — added +400 kcal to support healthy weight gain. Focus on calorie-dense, nutritious foods.";
    } else if (bmiCat === "Overweight" || bmiCat === "Obese") {
      adjustedKcal = midKcal - 400;
      adjustmentNote = "BMI indicates overweight — reduced by 400 kcal. Focus on nutrient-dense foods, avoid empty calories. Never go below 1200 kcal/day.";
      adjustedKcal = Math.max(1200, adjustedKcal);
    }

    // Puberty needs: don't let teens go too low
    adjustedKcal = Math.max(1400, adjustedKcal);

    calories = {
      dailyKcal: adjustedKcal,
      range: [Math.round(low), Math.round(high)],
      activityLabel: actLabel,
      adjustmentNote,
    };
  }

  // ─── Protein Intake Module ──────────────────────────────────────────
  let protein: ProteinResult | null = null;
  if (weight !== null && weight > 0) {
    const tier = activityLevel === "active" ? "fitness" : "normal";
    const lowG = tier === "fitness" ? weight * 1.2 : weight * 0.8;
    const highG = tier === "fitness" ? weight * 1.5 : weight * 1.0;
    const dailyGrams = Math.round((lowG + highG) / 2);

    const vegSources: ProteinSource[] = [
      { name: "Paneer (100g)", grams: "18g" },
      { name: "Dal / Lentils (1 bowl)", grams: "9g" },
      { name: "Curd / Yogurt (1 cup)", grams: "11g" },
      { name: "Soy chunks (50g)", grams: "26g" },
      { name: "Chickpeas / Chana (1 cup)", grams: "15g" },
      { name: "Milk (1 glass)", grams: "8g" },
      { name: "Peanuts (30g)", grams: "7g" },
      { name: "Sprouts (1 cup)", grams: "13g" },
    ];
    const mixedSources: ProteinSource[] = [
      { name: "Egg (1 whole)", grams: "6g" },
      { name: "Chicken breast (100g)", grams: "31g" },
      { name: "Fish / Rohu (100g)", grams: "20g" },
      { name: "Egg whites (3)", grams: "11g" },
    ];

    const isVeg = dietType === "veg";
    const sources = isVeg ? vegSources : [...vegSources.slice(0, 5), ...mixedSources];

    protein = {
      dailyGrams,
      range: [Math.round(lowG), Math.round(highG)],
      tier,
      sources,
    };
  }

  return {
    hasData: true,
    analyzedDays: analysis.totalDays,
    pubertyTiming,
    dietPreference: dietLabel,
    regionLabel,
    deficiencyList,
    nutrientRecommendations,
    specialNotes,
    hydration,
    foodRestrictions,
    calories,
    protein,
  };
}
