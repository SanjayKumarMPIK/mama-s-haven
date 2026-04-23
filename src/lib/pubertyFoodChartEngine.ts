import type { HealthLogs, PubertyEntry } from "@/hooks/useHealthLog";
import type { ProfileData } from "@/hooks/useProfile";
import type { OnboardingConfig } from "@/hooks/useOnboarding";

export type PubertyStatus = "Early Puberty" | "Normal" | "Late Puberty";
export type DietType = "veg" | "non-veg" | "mixed" | "eggetarian";

export type PubertySymptom =
  | "Cramps"
  | "Fatigue"
  | "Acne"
  | "Mood swings"
  | "Heavy bleeding";

export type MealSlot =
  | "Morning (Breakfast)"
  | "Mid-morning Snack"
  | "Lunch"
  | "Evening Snack"
  | "Dinner";

export interface FoodOption {
  id: string;
  label: string;
  why: string[];
  tags: string[];
  allowedDiets: DietType[];
}

export interface MealSlotPlan {
  slot: MealSlot;
  selectedOptionId: string;
  options: FoodOption[];
  slotWhy: string[];
}

export interface PubertyDailyFoodChart {
  pubertyStatus: PubertyStatus;
  dietType: DietType;
  detectedSymptoms: PubertySymptom[];
  medicalConditions: string[];
  meals: Record<MealSlot, MealSlotPlan>;
  avoidOrLimit: string[];
  notes: string[];
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

function normalizeDietType(raw: unknown): DietType {
  if (raw === "veg" || raw === "non-veg" || raw === "mixed" || raw === "eggetarian") return raw;
  // Backwards compatible: treat missing/unknown as "mixed"
  return "mixed";
}

function getPubertyStatus(onboarding: OnboardingConfig | null): PubertyStatus {
  const cat = onboarding?.pubertyData?.menarche_category;
  if (cat === "Early Puberty" || cat === "Late Puberty" || cat === "Normal") return cat;
  return "Normal";
}

function extractPubertySymptoms(logs: HealthLogs, lookbackDays: number = 14): Set<PubertySymptom> {
  const todayISO = toISODate(new Date());
  const fromISO = getDaysAgoISO(lookbackDays);
  const out = new Set<PubertySymptom>();

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (dateISO > todayISO || dateISO < fromISO) continue;
    if (entry.phase !== "puberty") continue;
    const e = entry as PubertyEntry;

    if (e.symptoms?.cramps) out.add("Cramps");
    if (e.symptoms?.fatigue) out.add("Fatigue");
    if (e.symptoms?.acne) out.add("Acne");
    if (e.symptoms?.moodSwings) out.add("Mood swings");

    if (e.flowIntensity === "Heavy") out.add("Heavy bleeding");
  }

  return out;
}

function allowedDietsForOption(args: { hasEgg: boolean; hasMeatOrFish: boolean }): DietType[] {
  const { hasEgg, hasMeatOrFish } = args;

  const diets: DietType[] = ["mixed", "non-veg"];
  if (!hasMeatOrFish) diets.push("eggetarian");
  if (!hasEgg && !hasMeatOrFish) diets.push("veg");
  return diets;
}

function dietOk(diet: DietType, opt: FoodOption): boolean {
  return opt.allowedDiets.includes(diet);
}

function conditionKey(cond: string): string {
  const c = cond.trim().toLowerCase();
  if (c === "pcod" || c === "pcos") return "pcos";
  if (c === "hyperthyroidism") return "hyperthyroidism";
  if (c === "hypothyroidism") return "hypothyroidism";
  if (c === "diabetes") return "diabetes";
  if (c === "anemia") return "anemia";
  if (c === "osteoporosis") return "osteoporosis";
  return c;
}

function baseAvoids(status: PubertyStatus): string[] {
  const common = [
    "Junk food / fast food",
    "Sugary drinks and excess sweets",
    "Highly processed foods",
  ];
  if (status === "Early Puberty") {
    return [
      ...common,
      "Hormone-injected meat (if possible avoid)",
    ];
  }
  if (status === "Late Puberty") {
    return [
      ...common,
      "Skipping meals",
      "Crash dieting",
    ];
  }
  return common;
}

function buildOption(id: string, label: string, why: string[], tags: string[], hasEgg = false, hasMeatOrFish = false): FoodOption {
  return {
    id,
    label,
    why,
    tags,
    allowedDiets: allowedDietsForOption({ hasEgg, hasMeatOrFish }),
  };
}

function uniqueById(options: FoodOption[]): FoodOption[] {
  const map = new Map<string, FoodOption>();
  for (const o of options) map.set(o.id, o);
  return Array.from(map.values());
}

export function generatePubertyDailyFoodChart(args: {
  logs: HealthLogs;
  profile: ProfileData | null;
  onboarding: OnboardingConfig | null;
}): PubertyDailyFoodChart {
  const { logs, profile, onboarding } = args;

  const status = getPubertyStatus(onboarding);
  const dietType = normalizeDietType(profile?.dietType ?? (profile as any)?.dietType);
  const medicalConditions = (profile?.medicalConditions ?? []).filter(Boolean);
  const symptoms = extractPubertySymptoms(logs, 14);

  // ─── Base layer (puberty) ───────────────────────────────────────────────
  const baseFocusWhy: string[] = [];
  const baseTags: string[] = [];

  if (status === "Early Puberty") {
    baseFocusWhy.push("Early puberty focus: balanced meals, high fiber, and whole foods to support hormone balance.");
    baseTags.push("whole foods", "high fiber", "balanced meals", "hydration");
  } else if (status === "Late Puberty") {
    baseFocusWhy.push("Late puberty focus: protein + healthy fats + iron/zinc to support growth and hormone production.");
    baseTags.push("protein", "healthy fats", "iron", "zinc", "calcium");
  } else {
    baseFocusWhy.push("Normal puberty focus: balanced meals with protein, fiber, and hydration for steady energy.");
    baseTags.push("balanced meals", "protein", "fiber", "hydration");
  }

  // ─── Symptom add-ons ───────────────────────────────────────────────────
  const symptomWhy: string[] = [];
  if (symptoms.has("Cramps")) symptomWhy.push("Cramps: magnesium + potassium-rich foods (banana, nuts, seeds) can help.");
  if (symptoms.has("Fatigue")) symptomWhy.push("Fatigue: iron + protein sources (spinach, dates, eggs/lentils) support energy.");
  if (symptoms.has("Acne")) symptomWhy.push("Acne: low sugar + hydration; prefer fresh foods and reduce oily/processed items.");
  if (symptoms.has("Mood swings")) symptomWhy.push("Mood swings: omega-3 + steady snacks can support mood (nuts/seeds).");
  if (symptoms.has("Heavy bleeding")) symptomWhy.push("Heavy bleeding: iron + vitamin C pairing supports recovery (leafy greens + citrus).");

  // ─── Condition overrides (high priority) ───────────────────────────────
  const conditionWhy: string[] = [];
  const avoidExtra: string[] = [];
  const conditionTags: string[] = [];
  const condKeys = new Set(medicalConditions.map(conditionKey));

  if (condKeys.has("anemia")) {
    conditionWhy.push("Anemia: prioritize iron-rich foods (spinach, beetroot, dates) and pair with vitamin C.");
    conditionTags.push("iron");
  }
  if (condKeys.has("pcos")) {
    conditionWhy.push("PCOS/PCOD: focus on low-GI, high-fiber meals with adequate protein.");
    conditionTags.push("low GI", "high fiber", "protein");
    avoidExtra.push("High sugar snacks and refined carbs (white bread, sweets)");
  }
  if (condKeys.has("hypothyroidism")) {
    conditionWhy.push("Hypothyroidism: include selenium/iodine sources in controlled amounts (e.g., nuts, dairy).");
    conditionTags.push("selenium", "iodine (controlled)");
  }
  if (condKeys.has("hyperthyroidism")) {
    conditionWhy.push("Hyperthyroidism: calorie-dense balanced meals; avoid excess iodine.");
    conditionTags.push("energy-dense", "avoid excess iodine");
  }
  if (condKeys.has("diabetes")) {
    conditionWhy.push("Diabetes: low sugar, controlled carbs, and more fiber/protein per meal.");
    conditionTags.push("low sugar", "controlled carbs", "fiber");
    avoidExtra.push("Sugary drinks and sweets");
  }
  if (condKeys.has("osteoporosis")) {
    conditionWhy.push("Osteoporosis: calcium + vitamin D focus (milk/curd/paneer, sunlight, ragi).");
    conditionTags.push("calcium", "vitamin D");
  }

  // ─── Food option bank (Indian examples; swap-friendly) ──────────────────
  const options: Record<MealSlot, FoodOption[]> = {
    "Morning (Breakfast)": [
      buildOption("bf_upma", "Vegetable upma + curd", ["Whole grains + probiotics for gut + hormone balance."], ["whole foods", "fiber"]),
      buildOption("bf_poha", "Poha with peanuts + lemon", ["Light, iron-friendly meal; lemon supports absorption."], ["energy", "vitamin C"]),
      buildOption("bf_ragi", "Ragi porridge with milk + nuts", ["Calcium + iron support; good for growth."], ["calcium", "iron"]),
      buildOption("bf_daliya", "Daliya (broken wheat) with veggies", ["High fiber to support hormone balance."], ["fiber"]),
      buildOption("bf_egg", "Boiled eggs + whole wheat toast", ["Protein supports growth and hormone production."], ["protein"], true, false),
      buildOption("bf_omelette", "Veg omelette + fruit", ["Protein + micronutrients for steady energy."], ["protein"], true, false),
      buildOption("bf_chicken", "Chicken sandwich (whole wheat) + cucumber", ["High protein; supports late puberty growth needs."], ["protein"], false, true),
    ],
    "Mid-morning Snack": [
      buildOption("sn_banana", "Banana", ["Magnesium + potassium support cramps and muscle recovery."], ["magnesium", "potassium"]),
      buildOption("sn_dates", "Dates (2–4) + water", ["Iron support for fatigue/heavy flow days."], ["iron"]),
      buildOption("sn_fruit", "Seasonal fruit bowl", ["Hydration + antioxidants support skin and energy."], ["hydration", "antioxidants"]),
      buildOption("sn_nuts", "Nuts + seeds mix (almonds, flax)", ["Healthy fats + omega-3 support mood and hormones."], ["omega-3", "healthy fats"]),
      buildOption("sn_chaas", "Buttermilk (chaas)", ["Hydration + probiotics; lighter than packaged drinks."], ["hydration", "probiotics"]),
    ],
    Lunch: [
      buildOption("ln_dal_rice", "Dal + brown rice/roti + leafy sabzi", ["Balanced carbs + protein + fiber; iron support from greens."], ["balanced meals", "fiber", "iron"]),
      buildOption("ln_khichdi", "Moong dal khichdi + curd", ["Easy to digest; good during cramps."], ["gentle", "protein"]),
      buildOption("ln_paneer", "Paneer + roti + salad", ["Protein + calcium support growth."], ["protein", "calcium"]),
      buildOption("ln_egg_curry", "Egg curry + rice + salad", ["Protein + iron/B12 support fatigue."], ["protein", "iron"], true, false),
      buildOption("ln_fish", "Fish curry + rice + vegetables", ["Omega-3 + protein support mood and inflammation."], ["omega-3", "protein"], false, true),
      buildOption("ln_chicken", "Chicken curry + roti + sabzi", ["High-quality protein supports growth."], ["protein"], false, true),
    ],
    "Evening Snack": [
      buildOption("ev_makhana", "Roasted makhana", ["Light snack; helps avoid sugary cravings."], ["low sugar"]),
      buildOption("ev_sprouts", "Sprouts / chana chaat (lemon)", ["Protein + fiber; supports low-GI needs."], ["protein", "fiber", "low GI"]),
      buildOption("ev_dark_choc", "Small piece of dark chocolate + nuts", ["Magnesium + mood support."], ["magnesium", "mood"]),
      buildOption("ev_egg", "Boiled egg + cucumber", ["Protein for steady evening energy."], ["protein"], true, false),
      buildOption("ev_yogurt", "Curd with flaxseeds", ["Probiotics + omega-3 support."], ["probiotics", "omega-3"]),
    ],
    Dinner: [
      buildOption("dn_roti_sabzi", "Roti + seasonal sabzi + dal", ["Balanced dinner for stable energy and recovery."], ["balanced meals"]),
      buildOption("dn_soup", "Vegetable soup + roti", ["Light dinner; good when cramps/fatigue present."], ["gentle"]),
      buildOption("dn_palak_paneer", "Palak paneer + roti", ["Iron + calcium support (great for anemia/osteoporosis focus)."], ["iron", "calcium"]),
      buildOption("dn_egg", "Egg bhurji + roti + salad", ["Protein + B12 support fatigue recovery."], ["protein"], true, false),
      buildOption("dn_fish", "Grilled fish + veggies + rice", ["Omega-3 + protein support mood and inflammation."], ["omega-3", "protein"], false, true),
      buildOption("dn_chicken", "Chicken + veggies + roti", ["Protein-rich dinner supports late puberty growth."], ["protein"], false, true),
    ],
  };

  // ─── Filtering + prioritization ─────────────────────────────────────────
  const detectedSymptoms = Array.from(symptoms.values());

  const slotWhyBase = [...baseFocusWhy, ...conditionWhy, ...symptomWhy].slice(0, 4);

  const filteredMeals: Record<MealSlot, MealSlotPlan> = {} as any;
  (Object.keys(options) as MealSlot[]).forEach((slot) => {
    let slotOptions = options[slot].filter((o) => dietOk(dietType, o));

    // If diet filtering removes everything (shouldn't), fall back to unfiltered.
    if (slotOptions.length === 0) slotOptions = options[slot];

    // Soft-prioritize some tags based on conditions/symptoms.
    const wantedTags = new Set<string>([
      ...baseTags,
      ...conditionTags,
      ...(symptoms.has("Cramps") ? ["magnesium", "gentle"] : []),
      ...(symptoms.has("Fatigue") ? ["iron", "protein"] : []),
      ...(symptoms.has("Acne") ? ["low sugar", "hydration"] : []),
      ...(symptoms.has("Mood swings") ? ["omega-3", "mood"] : []),
      ...(symptoms.has("Heavy bleeding") ? ["iron", "vitamin C"] : []),
    ]);

    slotOptions = uniqueById(slotOptions).sort((a, b) => {
      const aScore = a.tags.reduce((acc, t) => acc + (wantedTags.has(t) ? 1 : 0), 0);
      const bScore = b.tags.reduce((acc, t) => acc + (wantedTags.has(t) ? 1 : 0), 0);
      return bScore - aScore;
    });

    const selectedOptionId = slotOptions[0]?.id ?? options[slot][0].id;
    filteredMeals[slot] = {
      slot,
      selectedOptionId,
      options: slotOptions,
      slotWhy: slotWhyBase,
    };
  });

  return {
    pubertyStatus: status,
    dietType,
    detectedSymptoms,
    medicalConditions,
    meals: filteredMeals,
    avoidOrLimit: uniqueById([...baseAvoids(status), ...avoidExtra].map((x) =>
      buildOption(`avoid_${x}`, x, [], [], false, false),
    )).map((o) => o.label),
    notes: [
      "Recommendations update automatically as you log new symptoms in the Calendar.",
      "If you have a medical condition, condition-based guidance takes priority over symptom add-ons.",
    ],
  };
}

