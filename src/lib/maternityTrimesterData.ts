/**
 * maternityTrimesterData.ts
 *
 * Trimester-aware symptom and nutrition data for the Maternity calendar.
 * Each trimester has exactly 6 symptoms and 4 nutrition tips.
 *
 * ⚠️  Scoped ONLY to: Maternity phase → Calendar → Symptom logging
 * Do NOT import in Puberty, Family Planning, or Menopause modules.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Trimester = "T1" | "T2" | "T3";
export type Severity = "mild" | "moderate" | "severe";

export interface TrimesterSymptom {
  id: string;
  label: string;
  emoji: string;
}

export interface NutritionTip {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

// ─── Symptom Definitions (6 per trimester) ────────────────────────────────────

const T1_SYMPTOMS: TrimesterSymptom[] = [
  { id: "nausea", label: "Nausea / Vomiting", emoji: "🤢" },
  { id: "fatigue", label: "Fatigue", emoji: "😴" },
  { id: "breastTenderness", label: "Breast Tenderness", emoji: "💗" },
  { id: "frequentUrination", label: "Frequent Urination", emoji: "🚻" },
  { id: "moodSwings", label: "Mood Swings", emoji: "🎭" },
  { id: "foodAversions", label: "Food Aversions", emoji: "🚫" },
];

const T2_SYMPTOMS: TrimesterSymptom[] = [
  { id: "increasedAppetite", label: "Increased Appetite", emoji: "🍽️" },
  { id: "babyBumpGrowth", label: "Baby Bump Growth", emoji: "🤰" },
  { id: "fetalMovement", label: "Fetal Movement", emoji: "👶" },
  { id: "backPain", label: "Back Pain", emoji: "🦴" },
  { id: "skinChanges", label: "Skin Changes", emoji: "✨" },
  { id: "mildSwelling", label: "Mild Swelling", emoji: "💧" },
];

const T3_SYMPTOMS: TrimesterSymptom[] = [
  { id: "shortnessOfBreath", label: "Shortness of Breath", emoji: "😮‍💨" },
  { id: "frequentUrination", label: "Frequent Urination", emoji: "🚻" },
  { id: "practiceContractions", label: "Practice Contractions", emoji: "⚡" },
  { id: "sleepDifficulty", label: "Sleep Difficulty", emoji: "🌙" },
  { id: "heartburn", label: "Heartburn", emoji: "🔥" },
  { id: "swelling", label: "Swelling", emoji: "💧" },
];

const SYMPTOMS_BY_TRIMESTER: Record<Trimester, TrimesterSymptom[]> = {
  T1: T1_SYMPTOMS,
  T2: T2_SYMPTOMS,
  T3: T3_SYMPTOMS,
};

// ─── Nutrition Definitions (4 tips per trimester) ─────────────────────────────

const T1_NUTRITION: NutritionTip[] = [
  {
    id: "lightMeals",
    label: "Light, Frequent Meals",
    emoji: "🍽️",
    description: "Eat small meals every 2-3 hours to manage nausea and maintain energy.",
  },
  {
    id: "highProtein",
    label: "High Protein",
    emoji: "🥩",
    description: "Include eggs, dal, paneer, or nuts for essential amino acids and tissue growth.",
  },
  {
    id: "hydration",
    label: "Stay Hydrated",
    emoji: "💧",
    description: "Aim for 8-10 glasses of water daily. Coconut water and buttermilk are excellent.",
  },
  {
    id: "antiNausea",
    label: "Anti-Nausea Foods",
    emoji: "🫚",
    description: "Ginger tea, dry crackers, lemon water, and mint can help reduce morning sickness.",
  },
];

const T2_NUTRITION: NutritionTip[] = [
  {
    id: "increasedCalories",
    label: "Increased Calorie Intake",
    emoji: "⚡",
    description: "Add ~300 extra calories per day with nutrient-dense food, not junk food.",
  },
  {
    id: "ironRich",
    label: "Iron-Rich Foods",
    emoji: "🩸",
    description: "Spinach, dates, pomegranate, and fortified cereals help prevent anemia.",
  },
  {
    id: "calcium",
    label: "Calcium Intake",
    emoji: "🥛",
    description: "Milk, curd, ragi, and sesame seeds support baby's bone development.",
  },
  {
    id: "balancedMacros",
    label: "Balanced Macros",
    emoji: "🥗",
    description: "Balance carbs, protein, and healthy fats across meals for sustained energy.",
  },
];

const T3_NUTRITION: NutritionTip[] = [
  {
    id: "energyDense",
    label: "Energy-Dense Foods",
    emoji: "🔋",
    description: "Dates, nuts, ghee, and whole grains provide the energy needed for labor preparation.",
  },
  {
    id: "fiber",
    label: "Fiber Intake",
    emoji: "🥦",
    description: "Oats, fruits with skin, and vegetables help prevent constipation, common in T3.",
  },
  {
    id: "hydration",
    label: "Hydration",
    emoji: "💧",
    description: "Drink plenty of fluids to reduce swelling and support amniotic fluid levels.",
  },
  {
    id: "smallFrequentMeals",
    label: "Small Frequent Meals",
    emoji: "🍱",
    description: "Eat smaller, more frequent meals to manage heartburn and breathlessness.",
  },
];

const NUTRITION_BY_TRIMESTER: Record<Trimester, NutritionTip[]> = {
  T1: T1_NUTRITION,
  T2: T2_NUTRITION,
  T3: T3_NUTRITION,
};

// ─── Exported Functions ───────────────────────────────────────────────────────

/** Get the 6 symptoms for a given trimester */
export function getSymptomsForTrimester(trimester: Trimester): TrimesterSymptom[] {
  return SYMPTOMS_BY_TRIMESTER[trimester];
}

/** Get the 4 nutrition tips for a given trimester */
export function getNutritionForTrimester(trimester: Trimester): NutritionTip[] {
  return NUTRITION_BY_TRIMESTER[trimester];
}

/** Convert pregnancy week number to Trimester enum */
export function weekToTrimester(week: number): Trimester {
  if (week <= 12) return "T1";
  if (week <= 27) return "T2";
  return "T3";
}

/** Human-readable trimester label */
export function getTrimesterLabel(trimester: Trimester): string {
  switch (trimester) {
    case "T1": return "1st Trimester";
    case "T2": return "2nd Trimester";
    case "T3": return "3rd Trimester";
  }
}

/** Week range for a trimester */
export function getTrimesterWeekRange(trimester: Trimester): string {
  switch (trimester) {
    case "T1": return "Week 1–12";
    case "T2": return "Week 13–27";
    case "T3": return "Week 28–Birth";
  }
}

/** Severity label with color */
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "mild": return "#22c55e";     // green
    case "moderate": return "#f59e0b"; // amber
    case "severe": return "#ef4444";   // red
  }
}

/** Severity emoji */
export function getSeverityEmoji(severity: Severity): string {
  switch (severity) {
    case "mild": return "🟢";
    case "moderate": return "🟡";
    case "severe": return "🔴";
  }
}

// ─── Smart Warning Logic ──────────────────────────────────────────────────────

export interface SevereWarning {
  symptomId: string;
  symptomLabel: string;
  consecutiveDays: number;
}

/**
 * Check for symptoms marked "severe" on 2+ consecutive days.
 * Takes recent maternity logs (sorted by date desc) and returns warnings.
 */
export function checkConsecutiveSevereSymptoms(
  recentLogs: Array<{
    date: string;
    symptoms: Record<string, boolean>;
    symptomSeverities?: Record<string, Severity>;
  }>
): SevereWarning[] {
  if (recentLogs.length < 2) return [];

  const warnings: SevereWarning[] = [];
  const sorted = [...recentLogs].sort((a, b) => b.date.localeCompare(a.date));

  // Get all symptom IDs from the latest entry that are severe
  const latest = sorted[0];
  if (!latest.symptomSeverities) return [];

  const allTrimesterSymptoms = [
    ...T1_SYMPTOMS,
    ...T2_SYMPTOMS,
    ...T3_SYMPTOMS,
  ];

  for (const [symptomId, severity] of Object.entries(latest.symptomSeverities)) {
    if (severity !== "severe") continue;
    if (!latest.symptoms[symptomId]) continue;

    // Check previous days
    let consecutiveDays = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i];
      // Check date is consecutive (within 1 day gap)
      const latestDate = new Date(sorted[i - 1].date + "T12:00:00");
      const prevDate = new Date(prev.date + "T12:00:00");
      const dayGap = Math.round(
        (latestDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayGap !== 1) break;
      if (!prev.symptoms[symptomId]) break;
      if (prev.symptomSeverities?.[symptomId] !== "severe") break;

      consecutiveDays++;
    }

    if (consecutiveDays >= 2) {
      const symptomDef = allTrimesterSymptoms.find((s) => s.id === symptomId);
      warnings.push({
        symptomId,
        symptomLabel: symptomDef?.label ?? symptomId,
        consecutiveDays,
      });
    }
  }

  return warnings;
}
