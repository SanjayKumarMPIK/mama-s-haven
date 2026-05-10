/**
 * pubertyDietLogic.ts
 *
 * Dynamic diet logic engine scoped to the Puberty Phase.
 * Computes puberty timing, filters by medical conditions, integrates
 * today's symptom severities, and generates dynamic meal tags/notes.
 * Fully region-aware (north/south/east/west) and diet-type-aware (veg/mixed).
 */

import type { HealthLogs, PubertyEntry } from "@/hooks/useHealthLog";
import type { ProfileData } from "@/hooks/useProfile";
import type { SeverityLabel } from "@/components/calendar/PubertySymptomCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PubertyTiming = "Early" | "Normal" | "Late";
export type Region = "north" | "south" | "east" | "west";
export type DietType = "veg" | "non-veg" | "mixed" | "eggetarian";

export interface DietTagInject {
  mealSlotKey: string;
  extraFoods: string[];
  whySuffix: string;
}

export interface PubertyDietContext {
  timing: PubertyTiming;
  timingNote: string;
  region: Region;
  dietType: DietType;
  activeConditions: string[];
  todaySymptoms: { id: string; label: string; severity: SeverityLabel | null }[];
  periodStarted: boolean;
  mealTags: DietTagInject[];
  globalNotes: string[];
  checklistItems: { title: string; reason: string; nutrient: string }[];
}

// ─── Region + Diet Food Data ──────────────────────────────────────────────────

interface RegionDietFoods {
  veg: string[];
  mixed: string[];
}

const REGION_IRON: Record<Region, RegionDietFoods> = {
  north: { veg: ["Spinach (palak) paratha", "Chana masala", "Dates with milk", "Jaggery laddu", "Beetroot sabzi"], mixed: ["Chicken liver", "Egg curry"] },
  south: { veg: ["Ragi porridge", "Sambar with spinach", "Jaggery payasam", "Beetroot poriyal", "Drumstick leaves (murungai)"], mixed: ["Fish curry (kingfish)", "Egg curry"] },
  east: { veg: ["Spinach dal (palak dal)", "Lal shak bhaji", "Chuda with gur", "Moong dal", "Beetroot bhaji"], mixed: ["Rohu fish curry", "Egg curry"] },
  west: { veg: ["Methi thepla", "Bajra roti with jaggery", "Beetroot raita", "Poha with peanuts", "Dates"], mixed: ["Egg bhurji", "Fish curry"] },
};

const REGION_PROTEIN: Record<Region, RegionDietFoods> = {
  north: { veg: ["Dal makhani", "Paneer tikka", "Rajma chawal", "Chole", "Sprouts chaat"], mixed: ["Egg bhurji", "Chicken curry"] },
  south: { veg: ["Sambar with vegetables", "Curd rice", "Sundal (chickpea)", "Paneer dosa", "Rasam"], mixed: ["Egg curry", "Fish fry"] },
  east: { veg: ["Cholar dal", "Sattu paratha", "Paneer bhapa", "Moong dal ghugni"], mixed: ["Ilish fish curry", "Egg curry"] },
  west: { veg: ["Dal dhokli", "Sprouts usal", "Paneer bhurji", "Chickpea curry"], mixed: ["Egg akuri", "Chicken curry"] },
};

const REGION_FIBER: Record<Region, RegionDietFoods> = {
  north: { veg: ["Mixed dal", "Stuffed paratha (lauki/methi)", "Oats cheela", "Daliya khichdi"], mixed: ["Mixed dal", "Stuffed paratha"] },
  south: { veg: ["Idli with sambar", "Ragi mudde", "Vegetable kootu", "Brown rice upma"], mixed: ["Idli with sambar", "Ragi mudde"] },
  east: { veg: ["Mixed vegetable dal", "Litti chokha", "Oats khichdi", "Sattu drink"], mixed: ["Mixed dal", "Oats khichdi"] },
  west: { veg: ["Bajra roti", "Undhiyu", "Mixed sprouts usal", "Jowar roti with sabzi"], mixed: ["Bajra roti", "Sprouts usal"] },
};

const REGION_OMEGA3: Record<Region, RegionDietFoods> = {
  north: { veg: ["Flaxseed paratha", "Walnut halwa", "Chia seed lassi", "Almonds"], mixed: ["Fish tikka", "Omega-3 eggs"] },
  south: { veg: ["Flaxseed chutney", "Walnuts", "Chia seed payasam", "Sesame seeds"], mixed: ["Fish curry (mackerel)", "Sardine fry"] },
  east: { veg: ["Mustard oil cooking", "Walnuts", "Flaxseed laddu", "Chia pudding"], mixed: ["Ilish fish", "Rohu curry"] },
  west: { veg: ["Flaxseed laddu", "Walnut trail mix", "Chia pudding", "Almonds"], mixed: ["Bombil fish fry", "Egg"] },
};

const REGION_MAGNESIUM: Record<Region, RegionDietFoods> = {
  north: { veg: ["Almonds", "Pumpkin seeds", "Banana", "Dark chocolate", "Spinach sabzi"], mixed: ["Almonds", "Pumpkin seeds", "Egg"] },
  south: { veg: ["Coconut chutney", "Pumpkin seeds sundal", "Banana", "Dark chocolate"], mixed: ["Pumpkin seeds", "Fish"] },
  east: { veg: ["Pumpkin seeds", "Banana", "Dark chocolate", "Spinach bhaji"], mixed: ["Pumpkin seeds", "Fish"] },
  west: { veg: ["Pumpkin seed chikki", "Banana", "Dark chocolate", "Almonds"], mixed: ["Pumpkin seeds", "Egg"] },
};

const REGION_ZINC: Record<Region, RegionDietFoods> = {
  north: { veg: ["Rajma", "Chickpea chaat", "Pumpkin seed snack", "Paneer"], mixed: ["Chicken", "Egg"] },
  south: { veg: ["Pumpkin seeds sundal", "Chickpea curry", "Sesame chutney", "Cashew rice"], mixed: ["Fish curry", "Egg"] },
  east: { veg: ["Cholar dal", "Pumpkin seeds", "Cashew curry", "Chickpea ghugni"], mixed: ["Fish", "Egg"] },
  west: { veg: ["Pumpkin seed chikki", "Chickpea usal", "Cashew nuts", "Sesame laddu"], mixed: ["Egg akuri"] },
};

const REGION_CALCIUM: Record<Region, RegionDietFoods> = {
  north: { veg: ["Paneer tikka", "Lassi", "Ragi roti", "Kheer", "Curd raita"], mixed: ["Paneer tikka", "Lassi", "Egg"] },
  south: { veg: ["Ragi dosa", "Curd rice", "Paneer curry", "Sesame chutney", "Coconut milk"], mixed: ["Curd rice", "Fish (sardine)"] },
  east: { veg: ["Mishti doi", "Paneer bhapa", "Sesame laddu", "Milk", "Curd"], mixed: ["Mishti doi", "Fish with bones"] },
  west: { veg: ["Paneer bhurji", "Shrikhand", "Ragi bhakri", "Buttermilk", "Sesame chikki"], mixed: ["Paneer bhurji", "Buttermilk"] },
};

const REGION_CARBS: Record<Region, RegionDietFoods> = {
  north: { veg: ["Oats", "Roti (whole wheat)", "Daliya", "Ragi roti"], mixed: ["Oats", "Roti", "Daliya"] },
  south: { veg: ["Ragi mudde", "Brown rice", "Idli", "Dosa (oats)"], mixed: ["Ragi mudde", "Brown rice"] },
  east: { veg: ["Oats khichdi", "Flattened rice (chira)", "Litti", "Sattu roti"], mixed: ["Oats khichdi", "Flattened rice"] },
  west: { veg: ["Bajra roti", "Jowar roti", "Khichdi", "Poha"], mixed: ["Bajra roti", "Jowar roti"] },
};

const REGION_ANTI_INFLAMMATORY: Record<Region, RegionDietFoods> = {
  north: { veg: ["Turmeric milk (haldi doodh)", "Ginger tea", "Flaxseed paratha", "Walnuts"], mixed: ["Turmeric milk", "Fish tikka"] },
  south: { veg: ["Turmeric sambar", "Ginger rasam", "Coconut curry", "Flaxseed chutney"], mixed: ["Fish curry (mackerel)", "Ginger rasam"] },
  east: { veg: ["Turmeric dal", "Ginger-mustard fish (veg alt: soya)", "Flaxseed", "Walnuts"], mixed: ["Mustard fish curry", "Turmeric dal"] },
  west: { veg: ["Turmeric sabzi", "Ginger chaas", "Flaxseed laddu", "Walnut chikki"], mixed: ["Fish curry", "Turmeric sabzi"] },
};

const REGION_HYDRATING: Record<Region, RegionDietFoods> = {
  north: { veg: ["Cucumber raita", "Melon", "Lassi", "Buttermilk", "Coconut water"], mixed: ["Cucumber raita", "Lassi", "Buttermilk"] },
  south: { veg: ["Coconut water", "Buttermilk (chaas)", "Watermelon", "Cucumber salad", "Lemon juice"], mixed: ["Coconut water", "Buttermilk"] },
  east: { veg: ["Lemon water", "Cucumber bhaja", "Melon", "Tender coconut", "Lassi"], mixed: ["Lemon water", "Cucumber"] },
  west: { veg: ["Chaas (buttermilk)", "Coconut water", "Watermelon", "Cucumber salad", "Lemon pani"], mixed: ["Chaas", "Coconut water"] },
};

function select(region: Region, dietType: DietType, map: Record<Region, RegionDietFoods>): string[] {
  const isVeg = dietType === "veg";
  return map[region]?.[isVeg ? "veg" : "mixed"] ?? map.north.veg;
}

function selectMulti(region: Region, dietType: DietType, ...maps: Array<Record<Region, RegionDietFoods>>): string[] {
  const result: string[] = [];
  for (const m of maps) result.push(...select(region, dietType, m));
  return result;
}

// ─── Timing Calculation ───────────────────────────────────────────────────────

function computePubertyTiming(profile: ProfileData): {
  timing: PubertyTiming;
  note: string;
} {
  const dobStr = profile.dob;
  const menarcheStr = profile.menarcheDate;

  if (dobStr && menarcheStr) {
    const dob = new Date(dobStr);
    const menarche = new Date(menarcheStr);
    if (!isNaN(dob.getTime()) && !isNaN(menarche.getTime())) {
      const msPerYear = 1000 * 60 * 60 * 24 * 365.25;
      const ageAtMenarche = (menarche.getTime() - dob.getTime()) / msPerYear;
      if (ageAtMenarche < 10) return { timing: "Early", note: "Early puberty: focus on hormonal balance, fiber, and omega-3s." };
      if (ageAtMenarche > 15) return { timing: "Late", note: "Late puberty: extra protein, zinc, and calorie-dense meals for growth." };
      return { timing: "Normal", note: "Normal puberty: balanced nutrition with emphasis on iron, calcium, and protein." };
    }
  }

  if (dobStr) {
    const dob = new Date(dobStr);
    if (!isNaN(dob.getTime())) {
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 11) return { timing: "Early", note: "Early puberty: support hormonal balance with fiber-rich foods." };
      if (age > 16) return { timing: "Late", note: "Late puberty: nutrient-dense meals to support growth." };
    }
  }

  return { timing: "Normal", note: "Normal puberty: maintain a balanced diet." };
}

// ─── Today's Symptom Extraction ───────────────────────────────────────────────

function getTodaySymptomSeverities(
  logs: HealthLogs,
  todayISO: string,
): { id: string; label: string; severity: SeverityLabel | null }[] {
  const entry = logs[todayISO];
  if (!entry || entry.phase !== "puberty") return [];

  const e = entry as PubertyEntry;
  const labels: Record<string, string> = {
    cramps: "Cramps", fatigue: "Fatigue", moodSwings: "Mood Swings",
    headache: "Headache", acne: "Acne", breastTenderness: "Breast Tenderness",
    bloating: "Bloating", backPain: "Back Pain", foodCravings: "Food Cravings",
    irritability: "Irritability", sleepIssues: "Sleep Issues", anxiety: "Anxiety",
  };

  const severities = e.symptomSeverityLabels ?? {};
  return Object.entries(e.symptoms ?? {})
    .filter(([, v]) => v)
    .map(([id]) => ({
      id,
      label: labels[id] ?? id,
      severity: severities[id] ?? null,
    }));
}

function checkPeriodStarted(logs: HealthLogs, todayISO: string): boolean {
  const entry = logs[todayISO];
  if (!entry || entry.phase !== "puberty") return false;
  return (entry as PubertyEntry).periodStarted === true;
}

// ─── Medical Condition Helpers ────────────────────────────────────────────────

const CONDITION_DIET_NOTES: Record<string, { note: string; tags: string[]; priority: number }> = {
  anemia: {
    note: "Anemia detected — iron-rich foods paired with vitamin C for absorption. Avoid tea/coffee with meals.",
    tags: ["Iron-rich", "Vitamin C pairing (lemon, amla)", "Jaggery"],
    priority: 1,
  },
  pcos: {
    note: "PCOS — low-GI, high-fiber meals. Reduce refined sugar and processed foods. Include omega-3 sources.",
    tags: ["Low-GI grains", "High-fiber veggies", "Omega-3 seeds"],
    priority: 2,
  },
  pcod: {
    note: "PCOD — focus on insulin balance with high-fiber and protein-rich meals. Limit sugar.",
    tags: ["High-fiber lentils", "Lean protein", "Low-GI grains"],
    priority: 2,
  },
  diabetes: {
    note: "Diabetes — controlled carbs with fiber and protein per meal. Avoid sugary drinks.",
    tags: ["Low-GI millets", "High-fiber veggies", "Lean protein", "Small frequent meals"],
    priority: 2,
  },
  hypothyroidism: {
    note: "Hypothyroidism — selenium and iodine sources. Avoid excess raw cruciferous vegetables.",
    tags: ["Selenium-rich (nuts, seeds)", "Iodine (dairy)", "Cooked cruciferous"],
    priority: 3,
  },
  hyperthyroidism: {
    note: "Hyperthyroidism — calorie-dense balanced meals. Ensure calcium and vitamin D.",
    tags: ["Calcium-rich", "Calorie-dense nuts", "Vitamin D sources"],
    priority: 3,
  },
  osteoporosis: {
    note: "Osteoporosis risk — prioritize calcium + vitamin D daily. Include weight-bearing activities.",
    tags: ["Calcium-rich", "Vitamin D (sunlight, mushrooms)", "Protein for bone health"],
    priority: 3,
  },
};

// ─── Meal Slot Key Mapping ────────────────────────────────────────────────────

const MEAL_SLOT_KEYS = [
  { key: "Early Morning", match: (t: string) => t.toLowerCase().includes("early morning") },
  { key: "Breakfast", match: (t: string) => t.toLowerCase().includes("breakfast") },
  { key: "Mid-Morning", match: (t: string) => t.toLowerCase().includes("mid-morning") || t.toLowerCase().includes("school") },
  { key: "Lunch", match: (t: string) => t.toLowerCase().includes("lunch") },
  { key: "Evening Snack", match: (t: string) => t.toLowerCase().includes("evening") },
  { key: "Dinner", match: (t: string) => t.toLowerCase().includes("dinner") },
];

// ─── Symptom → Diet Logic ─────────────────────────────────────────────────────

interface SymptomDietRule {
  getTags: (region: Region, dietType: DietType) => string[];
  whySuffix: string;
}

const SYMPTOM_DIET_MAP: Record<string, SymptomDietRule> = {
  cramps: {
    getTags: (r, d) => selectMulti(r, d, REGION_ANTI_INFLAMMATORY, REGION_MAGNESIUM),
    whySuffix: "Anti-inflammatory and magnesium-rich foods help manage cramps.",
  },
  fatigue: {
    getTags: (r, d) => selectMulti(r, d, REGION_IRON, REGION_CARBS),
    whySuffix: "Iron-rich foods and complex carbs combat fatigue.",
  },
  moodSwings: {
    getTags: (r, d) => selectMulti(r, d, REGION_MAGNESIUM, REGION_OMEGA3),
    whySuffix: "Magnesium and omega-3s help balance mood.",
  },
  headache: {
    getTags: (r, d) => selectMulti(r, d, REGION_MAGNESIUM, REGION_HYDRATING),
    whySuffix: "Magnesium-rich foods and hydration help reduce headache frequency.",
  },
  acne: {
    getTags: (r, d) => selectMulti(r, d, REGION_ZINC, REGION_OMEGA3),
    whySuffix: "Zinc and omega-3s help manage acne.",
  },
  bloating: {
    getTags: (_r, _d) => ["Ginger tea", "Digestive spices (cumin, fennel)", "Light cooked vegetables", "Herbal teas"],
    whySuffix: "Digestive-friendly foods to reduce bloating.",
  },
  anxiety: {
    getTags: (r, d) => selectMulti(r, d, REGION_MAGNESIUM, REGION_OMEGA3),
    whySuffix: "Magnesium and omega-3s support nervous system calm.",
  },
};

// ─── Main Orchestrator ────────────────────────────────────────────────────────

export function getPubertySpecificDiet(
  profile: ProfileData,
  logs: HealthLogs,
  todayISO: string,
): PubertyDietContext {
  const region: Region = profile?.region ?? "north";
  const dietType: DietType = profile?.dietType ?? "mixed";

  // 1. Puberty Timing
  const { timing, note: timingNote } = computePubertyTiming(profile);

  // 2. Medical Conditions
  const conditions = (profile.medicalConditions ?? [])
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  const activeConditions: string[] = [];
  const globalNotes: string[] = [];
  const conditionTags: string[] = [];

  for (const cond of conditions) {
    const mapping = CONDITION_DIET_NOTES[cond];
    if (mapping) {
      activeConditions.push(cond);
      globalNotes.push(mapping.note);
      conditionTags.push(...mapping.tags);
    }
  }

  // 3. Today's Symptoms
  const todaySymptoms = getTodaySymptomSeverities(logs, todayISO);
  const periodStarted = checkPeriodStarted(logs, todayISO);

  // 4. Generate meal tags per slot
  const slotTagMap: Record<string, { foods: string[]; whySuffixes: string[] }> = {};

  // Timing-based tags (region + diet aware)
  if (timing === "Early") {
    addToSlot(slotTagMap, "Breakfast", select(region, dietType, REGION_FIBER), "");
    addToSlot(slotTagMap, "Lunch", select(region, dietType, REGION_OMEGA3), "");
  }
  if (timing === "Late") {
    addToSlot(slotTagMap, "Breakfast", select(region, dietType, REGION_PROTEIN).slice(0, 3), "");
    addToSlot(slotTagMap, "Lunch", select(region, dietType, REGION_ZINC).slice(0, 3), "");
    addToSlot(slotTagMap, "Dinner", select(region, dietType, REGION_PROTEIN).slice(0, 2), "");
  }

  // Condition-based tags (spread across meals)
  if (conditionTags.length > 0) {
    addToSlot(slotTagMap, "Breakfast", conditionTags.slice(0, 2), "");
    addToSlot(slotTagMap, "Lunch", conditionTags.slice(2, 4), "");
    addToSlot(slotTagMap, "Evening Snack", conditionTags.slice(4), "");
  }

  // Condition-specific + region/diet foods
  for (const cond of activeConditions) {
    if (cond === "anemia") {
      addToSlot(slotTagMap, "Lunch", select(region, dietType, REGION_IRON).slice(0, 3), "Iron-rich foods for anemia.");
      addToSlot(slotTagMap, "Dinner", select(region, dietType, REGION_IRON).slice(3, 5), "");
    }
    if (cond === "pcos" || cond === "pcod") {
      addToSlot(slotTagMap, "Breakfast", select(region, dietType, REGION_FIBER).slice(0, 2), "High-fiber meals for hormonal balance.");
      addToSlot(slotTagMap, "Lunch", select(region, dietType, REGION_OMEGA3).slice(0, 2), "");
    }
    if (cond === "diabetes") {
      addToSlot(slotTagMap, "Breakfast", ["Low-GI: " + select(region, dietType, REGION_CARBS).slice(0, 2).join(", ")], "Low-GI meals for blood sugar control.");
    }
    if (cond === "osteoporosis") {
      addToSlot(slotTagMap, "Breakfast", select(region, dietType, REGION_CALCIUM).slice(0, 3), "Calcium-rich foods for bone health.");
      addToSlot(slotTagMap, "Dinner", select(region, dietType, REGION_CALCIUM).slice(3, 5), "");
    }
  }

  // Period-started → iron + hydration
  if (periodStarted) {
    addToSlot(slotTagMap, "Early Morning", select(region, dietType, REGION_HYDRATING).slice(0, 2), "Period started: iron-rich + hydrating foods prioritized.");
    addToSlot(slotTagMap, "Lunch", select(region, dietType, REGION_IRON).slice(0, 3), "");
    addToSlot(slotTagMap, "Dinner", select(region, dietType, REGION_IRON).slice(3, 5), "");
    globalNotes.push("Period started — iron-rich meals and hydration prioritized.");
  }

  // Symptom-based tags (region + diet aware)
  for (const sym of todaySymptoms) {
    const dietRule = SYMPTOM_DIET_MAP[sym.id];
    if (!dietRule) continue;

    const tags = dietRule.getTags(region, dietType);
    addToSlot(slotTagMap, "Breakfast", tags.slice(0, 2), dietRule.whySuffix);
    addToSlot(slotTagMap, "Lunch", tags.slice(2, 4), "");

    globalNotes.push(`${sym.label} (${sym.severity ?? "Active"}): ${dietRule.whySuffix}`);
  }

  // 5. Build meal tag injects
  const mealTags: DietTagInject[] = Object.entries(slotTagMap).map(([key, data]) => ({
    mealSlotKey: key,
    extraFoods: [...new Set(data.foods)],
    whySuffix: [...new Set(data.whySuffixes)].join(" "),
  }));

  // 6. Generate checklist items (region + diet aware)
  const checklistItems: PubertyDietContext["checklistItems"] = [];
  if (periodStarted) {
    checklistItems.push({ title: `Drink 8+ glasses of water — try ${select(region, dietType, REGION_HYDRATING).slice(0, 2).join(", ")}`, reason: "Period started — hydration supports circulation.", nutrient: "Hydration" });
    checklistItems.push({ title: `Eat iron-rich foods like ${select(region, dietType, REGION_IRON).slice(0, 2).join(", ")}`, reason: "Replenish iron lost during menstruation.", nutrient: "Iron" });
  }
  for (const sym of todaySymptoms) {
    if (sym.severity === "Severe" || sym.severity === "Moderate") {
      if (sym.id === "cramps") {
        checklistItems.push({ title: `Include anti-inflammatory foods like ${select(region, dietType, REGION_ANTI_INFLAMMATORY).slice(0, 2).join(", ")}`, reason: "Severe cramps benefit from anti-inflammatory nutrients.", nutrient: "Anti-inflammatory" });
      }
      if (sym.id === "fatigue") {
        checklistItems.push({ title: `Eat protein with every meal — ${select(region, dietType, REGION_PROTEIN).slice(0, 2).join(", ")}`, reason: "Combat fatigue with steady energy from protein.", nutrient: "Protein" });
      }
    }
  }
  if (activeConditions.includes("anemia")) {
    checklistItems.push({ title: `Pair iron foods with vitamin C (lemon, amla) — include ${select(region, dietType, REGION_IRON).slice(0, 2).join(", ")}`, reason: "Anemia: vitamin C boosts iron absorption.", nutrient: "Iron" });
  }
  if (activeConditions.includes("pcos") || activeConditions.includes("pcod")) {
    checklistItems.push({ title: `Include fiber at every meal — ${select(region, dietType, REGION_FIBER).slice(0, 2).join(", ")}`, reason: "PCOS: fiber helps regulate blood sugar and hormones.", nutrient: "Fiber" });
  }
  if (timing === "Late") {
    checklistItems.push({ title: `Eat protein-rich snacks between meals — ${select(region, dietType, REGION_PROTEIN).slice(0, 2).join(", ")}`, reason: "Late puberty: extra protein supports growth spurts.", nutrient: "Protein" });
  }
  checklistItems.push({ title: `Aim for 8-10 glasses of water — try ${select(region, dietType, REGION_HYDRATING).slice(0, 2).join(", ")}`, reason: "Hydration supports overall puberty health.", nutrient: "Hydration" });

  return {
    timing,
    timingNote,
    region,
    dietType,
    activeConditions,
    todaySymptoms,
    periodStarted,
    mealTags,
    globalNotes,
    checklistItems,
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function addToSlot(
  map: Record<string, { foods: string[]; whySuffixes: string[] }>,
  slotKey: string,
  foods: string[],
  whySuffix: string,
) {
  if (!map[slotKey]) map[slotKey] = { foods: [], whySuffixes: [] };
  map[slotKey].foods.push(...foods);
  if (whySuffix) map[slotKey].whySuffixes.push(whySuffix);
}
