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

export type SymptomSeverity = "Low" | "Medium" | "High";
export type DeficiencyPriority = "High" | "Medium" | "Low";

export interface NutritionDeficiencyItem {
  deficiency: string;
  priority: DeficiencyPriority;
  nutrients: string[];
  foods: string[];
  frequency: "2-3 times/day" | "daily" | "alternate days";
  basedOn: string[];
}

export interface PubertyDeficiencyPlan {
  pubertyStatus: PubertyStatus;
  symptoms: { symptom: PubertySymptom; severity: SymptomSeverity }[];
  deficiencies: NutritionDeficiencyItem[];
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

function maxSeverity(prev: SymptomSeverity, next: SymptomSeverity): SymptomSeverity {
  const weight: Record<SymptomSeverity, number> = { Low: 1, Medium: 2, High: 3 };
  return weight[next] > weight[prev] ? next : prev;
}

function scoreToSeverity(score: number): SymptomSeverity {
  if (score >= 7) return "High";
  if (score >= 4) return "Medium";
  return "Low";
}

function frequencyToSeverity(count: number): SymptomSeverity {
  if (count >= 4) return "High";
  if (count >= 2) return "Medium";
  return "Low";
}

function priorityFromSeverity(sev: SymptomSeverity): DeficiencyPriority {
  if (sev === "High") return "High";
  if (sev === "Medium") return "Medium";
  return "Low";
}

function frequencyFromPriority(priority: DeficiencyPriority): "2-3 times/day" | "daily" | "alternate days" {
  if (priority === "High") return "2-3 times/day";
  if (priority === "Medium") return "daily";
  return "alternate days";
}

function extractSymptomSeverity(logs: HealthLogs, lookbackDays: number = 14): Map<PubertySymptom, SymptomSeverity> {
  const todayISO = toISODate(new Date());
  const fromISO = getDaysAgoISO(lookbackDays);
  const symptomIntensity = new Map<PubertySymptom, number[]>();
  const symptomCount = new Map<PubertySymptom, number>();

  const addCount = (symptom: PubertySymptom) => {
    symptomCount.set(symptom, (symptomCount.get(symptom) ?? 0) + 1);
  };
  const addIntensity = (symptom: PubertySymptom, score?: number) => {
    if (typeof score !== "number" || Number.isNaN(score)) return;
    if (!symptomIntensity.has(symptom)) symptomIntensity.set(symptom, []);
    symptomIntensity.get(symptom)!.push(score);
  };

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (dateISO > todayISO || dateISO < fromISO) continue;
    if (entry.phase !== "puberty") continue;
    const e = entry as PubertyEntry;
    const intensities = (e as any).symptomIntensities as Record<string, number> | undefined;

    if (e.symptoms?.cramps) {
      addCount("Cramps");
      addIntensity("Cramps", intensities?.cramps);
    }
    if (e.symptoms?.fatigue) {
      addCount("Fatigue");
      addIntensity("Fatigue", intensities?.fatigue);
    }
    if (e.symptoms?.acne) {
      addCount("Acne");
      addIntensity("Acne", intensities?.acne);
    }
    if (e.symptoms?.moodSwings) {
      addCount("Mood swings");
      addIntensity("Mood swings", intensities?.moodSwings);
    }
    if (e.flowIntensity === "Heavy") {
      addCount("Heavy bleeding");
      // Heavy flow itself implies severe signal; score near upper bound.
      addIntensity("Heavy bleeding", 8);
    }
  }

  const out = new Map<PubertySymptom, SymptomSeverity>();
  for (const [symptom, count] of symptomCount.entries()) {
    const scores = symptomIntensity.get(symptom) ?? [];
    const severityFromIntensity = scores.length > 0 ? scoreToSeverity(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)) : null;
    const severityFromFrequency = frequencyToSeverity(count);
    out.set(symptom, severityFromIntensity ? maxSeverity(severityFromFrequency, severityFromIntensity) : severityFromFrequency);
  }
  return out;
}

function mergeDeficiency(
  map: Map<string, NutritionDeficiencyItem>,
  deficiency: string,
  symptom: string,
  severity: SymptomSeverity,
  nutrients: string[],
  foods: string[],
) {
  const existing = map.get(deficiency);
  const incomingPriority = priorityFromSeverity(severity);
  if (!existing) {
    map.set(deficiency, {
      deficiency,
      priority: incomingPriority,
      nutrients,
      foods,
      frequency: frequencyFromPriority(incomingPriority),
      basedOn: [symptom],
    });
    return;
  }

  const priorityWeight: Record<DeficiencyPriority, number> = { Low: 1, Medium: 2, High: 3 };
  const mergedPriority = priorityWeight[incomingPriority] > priorityWeight[existing.priority] ? incomingPriority : existing.priority;
  existing.priority = mergedPriority;
  existing.frequency = frequencyFromPriority(mergedPriority);
  existing.basedOn = Array.from(new Set([...existing.basedOn, symptom]));
  existing.nutrients = Array.from(new Set([...existing.nutrients, ...nutrients]));
  existing.foods = Array.from(new Set([...existing.foods, ...foods]));
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

export function generatePubertyDeficiencyPlan(args: {
  logs: HealthLogs;
  profile: ProfileData | null;
  onboarding: OnboardingConfig | null;
}): PubertyDeficiencyPlan {
  const { logs, profile, onboarding } = args;
  const pubertyStatus = getPubertyStatus(onboarding);
  const condKeys = new Set((profile?.medicalConditions ?? []).map(conditionKey));

  const symptomSeverity = extractSymptomSeverity(logs, 14);
  const deficiencies = new Map<string, NutritionDeficiencyItem>();

  // Symptom → deficiency mapping
  for (const [symptom, severity] of symptomSeverity.entries()) {
    if (symptom === "Cramps") {
      mergeDeficiency(deficiencies, "Magnesium deficiency risk", symptom, severity, ["Magnesium", "Potassium"], ["Banana", "Nuts", "Seeds"]);
    }
    if (symptom === "Fatigue") {
      mergeDeficiency(deficiencies, "Iron deficiency risk", symptom, severity, ["Iron", "Protein"], ["Spinach", "Dates", "Lentils/Eggs"]);
      mergeDeficiency(deficiencies, "Vitamin B12 deficiency risk", symptom, severity, ["Vitamin B12"], ["Eggs", "Milk", "Curd"]);
    }
    if (symptom === "Acne") {
      mergeDeficiency(deficiencies, "Zinc and antioxidant support need", symptom, severity, ["Zinc", "Antioxidants"], ["Pumpkin seeds", "Chickpeas", "Amla"]);
    }
    if (symptom === "Mood swings") {
      mergeDeficiency(deficiencies, "Omega-3 support need", symptom, severity, ["Omega-3", "Magnesium"], ["Walnuts", "Flaxseeds", "Dark chocolate"]);
    }
    if (symptom === "Heavy bleeding") {
      mergeDeficiency(deficiencies, "Iron deficiency risk", symptom, "High", ["Iron", "Vitamin C"], ["Beetroot", "Citrus fruits", "Leafy greens"]);
    }
  }

  // Condition-based overrides (high priority)
  const forceHigh = (
    deficiency: string,
    nutrients: string[],
    foods: string[],
    basedOn: string,
  ) => {
    mergeDeficiency(deficiencies, deficiency, basedOn, "High", nutrients, foods);
  };

  if (condKeys.has("anemia")) {
    forceHigh("Iron deficiency risk", ["Iron", "Vitamin C"], ["Spinach", "Beetroot", "Dates", "Jaggery"], "Anemia");
  }
  if (condKeys.has("pcos")) {
    forceHigh("Insulin balance support need", ["Low-GI carbs", "Fiber", "Protein"], ["Millets", "Chana", "Paneer/Eggs"], "PCOS/PCOD");
  }
  if (condKeys.has("hypothyroidism")) {
    forceHigh("Thyroid nutrient support need", ["Selenium", "Iodine (controlled)"], ["Nuts", "Milk", "Curd"], "Hypothyroidism");
  }
  if (condKeys.has("hyperthyroidism")) {
    forceHigh("Energy density support need", ["Protein", "Healthy fats"], ["Paneer", "Nuts", "Dal"], "Hyperthyroidism");
  }
  if (condKeys.has("diabetes")) {
    forceHigh("Blood sugar control support need", ["Fiber", "Protein", "Controlled carbs"], ["Whole grains", "Lentils", "Vegetable salads"], "Diabetes");
  }
  if (condKeys.has("osteoporosis")) {
    forceHigh("Calcium deficiency risk", ["Calcium", "Vitamin D"], ["Milk", "Curd", "Ragi", "Sesame"], "Osteoporosis");
  }

  // Puberty-stage context adjustment
  if (pubertyStatus === "Late Puberty") {
    mergeDeficiency(deficiencies, "Growth protein support need", "Late Puberty", "Medium", ["Protein", "Healthy fats", "Zinc"], ["Eggs", "Paneer", "Lentils", "Pumpkin seeds"]);
  }
  if (pubertyStatus === "Early Puberty") {
    mergeDeficiency(deficiencies, "Hormonal balance support need", "Early Puberty", "Medium", ["Fiber", "Omega-3", "Hydration"], ["Whole grains", "Flaxseeds", "Leafy greens"]);
  }

  const result = Array.from(deficiencies.values()).sort((a, b) => {
    const w: Record<DeficiencyPriority, number> = { High: 3, Medium: 2, Low: 1 };
    return w[b.priority] - w[a.priority];
  });

  const symptoms = Array.from(symptomSeverity.entries()).map(([symptom, severity]) => ({ symptom, severity }));

  return {
    pubertyStatus,
    symptoms,
    deficiencies: result,
  };
}

