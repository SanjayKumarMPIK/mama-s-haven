import type { MaternityMode } from "@/hooks/usePregnancyProfile";
import type { ActivityItem } from "@/components/maternity/MaternityActivities";

/** Dataset stage labels — must match `stages` on each activity row */
export type DatasetMaternityStage =
  | "Trimester 1"
  | "Trimester 2"
  | "Trimester 3"
  | "Premature Stage"
  | "Postpartum";

export type SchedulerDifficulty = "very-low" | "low" | "moderate" | "high";

export type DayCompletionStatus = "completed" | "pending" | "skipped" | "recovery";

export const WEEKLY_THEME_ORDER = [
  "Mobility Week",
  "Relaxation Week",
  "Pelvic Health Week",
  "Recovery Week",
  "Posture Improvement",
  "Strength & Stability Week",
  "Cardio Wellness Week",
  "Labor Prep Week",
  "Energy Boost Week",
] as const;

export type WeeklyThemeId = (typeof WEEKLY_THEME_ORDER)[number];

export const THEME_COPY: Record<
  string,
  { tagline: string; clinicalNote: string }
> = {
  "Mobility Week": {
    tagline: "Gentle range-of-motion to support circulation and comfort.",
    clinicalNote:
      "Mobility-focused sessions stay low-impact while supporting joint health appropriate to your stage.",
  },
  "Relaxation Week": {
    tagline: "Nervous-system friendly movement and breath-led release.",
    clinicalNote:
      "Relaxation themes prioritize breath, down-regulation, and short sessions to reduce overload.",
  },
  "Pelvic Health Week": {
    tagline: "Pelvic floor awareness and hip-friendly patterns.",
    clinicalNote:
      "Pelvic health selections emphasize control, support, and positions cleared for your trimester.",
  },
  "Recovery Week": {
    tagline: "Micro-doses of movement with emphasis on restoration.",
    clinicalNote:
      "Recovery pacing favors very light effort, frequent breaks, and medical follow-up as advised.",
  },
  "Posture Improvement": {
    tagline: "Stacking alignment habits for neck, ribcage, and pelvis.",
    clinicalNote:
      "Posture blocks use supported positions and avoid prolonged supine work after first trimester.",
  },
  "Strength & Stability Week": {
    tagline: "Controlled loading for balance and everyday strength.",
    clinicalNote:
      "Strength selections stay within stage intensity ceilings and avoid breath-holding or valsalva.",
  },
  "Cardio Wellness Week": {
    tagline: "Sustainable cardio that respects pelvic comfort.",
    clinicalNote:
      "Cardio picks favor conversational pace and heat/hydration awareness for pregnancy.",
  },
  "Labor Prep Week": {
    tagline: "Positions and breathing patterns that complement birth education.",
    clinicalNote:
      "Labor prep content supports comfort and practice — it does not replace provider-led birth planning.",
  },
  "Energy Boost Week": {
    tagline: "Short, uplifting sessions when fatigue is lighter.",
    clinicalNote:
      "Energy sessions remain stage-capped and stop-on-symptom (dizziness, pain, bleeding, contractions).",
  },
};

/** Max difficulty rank (1=very-low … 4=high) allowed for generated schedules */
export function getStageIntensityCeilingRank(stage: DatasetMaternityStage): number {
  switch (stage) {
    case "Premature Stage":
      return 2; // low and below in practice; moderate filtered at pool level
    case "Trimester 1":
      return 3; // moderate allowed sparingly by engine rules
    case "Trimester 2":
    case "Trimester 3":
      return 3;
    case "Postpartum":
      return 3;
    default:
      return 2;
  }
}

export function profileToDatasetStage(
  mode: MaternityMode,
  trimester: number,
): DatasetMaternityStage {
  if (mode === "premature") return "Premature Stage";
  if (mode === "postpartum") return "Postpartum";
  if (trimester === 1) return "Trimester 1";
  if (trimester === 2) return "Trimester 2";
  return "Trimester 3";
}

export function getIsoWeekKey(d = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export function difficultyRank(d: SchedulerDifficulty): number {
  switch (d) {
    case "very-low":
      return 1;
    case "low":
      return 2;
    case "moderate":
      return 3;
    case "high":
      return 4;
    default:
      return 1;
  }
}

export function intensityLabelToDifficulty(
  intensity: ActivityItem["intensity"],
): SchedulerDifficulty {
  switch (intensity) {
    case "Very Low":
      return "very-low";
    case "Low":
      return "low";
    case "Moderate":
      return "moderate";
    default:
      return "low";
  }
}

export function formatDifficultyLabel(d: SchedulerDifficulty): string {
  switch (d) {
    case "very-low":
      return "Very Low";
    case "low":
      return "Low";
    case "moderate":
      return "Moderate";
    case "high":
      return "High";
    default:
      return d;
  }
}

const CATEGORY_DEFAULTS: Record<
  string,
  { safetyTip: string; description: string }
> = {
  default: {
    safetyTip:
      "Stop if you feel pain, bleeding, leaking fluid, regular contractions, dizziness, or shortness of breath. Confirm changes with your clinician.",
    description:
      "A maternity-aware movement session chosen for your current stage. Move at a conversational effort unless your provider advises otherwise.",
  },
};

function categoryDefaults(category: string) {
  return CATEGORY_DEFAULTS[category] ?? CATEGORY_DEFAULTS.default;
}

export function parseDurationMinutes(duration: string): number {
  const m = duration.match(/(\d+)\s*min/i);
  if (m) return Math.max(5, parseInt(m[1], 10));
  return 15;
}

export function parseCaloriesMid(caloriesBurned: string): number {
  const nums = caloriesBurned.match(/\d+/g);
  if (!nums?.length) return 40;
  const values = nums.map((n) => parseInt(n, 10));
  if (values.length === 1) return values[0];
  return Math.round((values[0] + values[1]) / 2);
}

export function splitTargetAreas(targetArea: string): string[] {
  return targetArea
    .split(/[,/&]| and /i)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface NormalizedActivity {
  id: string;
  name: string;
  durationMinutes: number;
  difficulty: SchedulerDifficulty;
  category: string;
  benefit: string;
  targetAreas: string[];
  caloriesBurned: number;
  themes: string[];
  stages: string[];
  safetyTip: string;
  description: string;
  icon?: string;
}

export function normalizeActivity(raw: ActivityItem): NormalizedActivity {
  const defaults = categoryDefaults(raw.category);
  return {
    id: raw.id,
    name: raw.activity,
    durationMinutes: parseDurationMinutes(raw.duration),
    difficulty: intensityLabelToDifficulty(raw.intensity),
    category: raw.category,
    benefit: raw.benefit,
    targetAreas: splitTargetAreas(raw.targetArea),
    caloriesBurned: parseCaloriesMid(raw.caloriesBurned),
    themes: raw.themes,
    stages: raw.stages,
    safetyTip: raw.safetyTip ?? defaults.safetyTip,
    description: raw.description ?? defaults.description,
    icon: raw.icon,
  };
}

export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) + 1;
}

export function seededShuffle<T>(items: T[], seedStr: string): T[] {
  const a = [...items];
  let seed = hashSeed(seedStr);
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 1–4 micro-cycle position for UI curve (resets when stage changes in hook) */
export function curveSlotFromWeekIndex(weekIndex: number): 1 | 2 | 3 | 4 {
  const m = ((weekIndex - 1) % 4) + 1;
  return m as 1 | 2 | 3 | 4;
}

export function curveDifficultyForSlot(slot: 1 | 2 | 3 | 4): SchedulerDifficulty {
  if (slot === 1) return "very-low";
  if (slot === 2) return "low";
  if (slot === 3) return "low"; // “low–moderate” band — keep pick as low unless stage allows moderate picks
  return "moderate";
}

export function curveDisplayLabel(slot: 1 | 2 | 3 | 4): string {
  if (slot === 1) return "Very Low";
  if (slot === 2) return "Low";
  if (slot === 3) return "Low → Moderate";
  return "Moderate";
}

export function pickThemeIndex(
  isoWeekKey: string,
  themeSpin: number,
): number {
  const base = hashSeed(isoWeekKey) % WEEKLY_THEME_ORDER.length;
  return (base + themeSpin) % WEEKLY_THEME_ORDER.length;
}

export function resolveThemeId(
  isoWeekKey: string,
  themeSpin: number,
): WeeklyThemeId {
  return WEEKLY_THEME_ORDER[pickThemeIndex(isoWeekKey, themeSpin)];
}

export function weeksSinceBirth(birthDateIso: string | undefined): number {
  if (!birthDateIso) return 1;
  const b = new Date(birthDateIso + "T12:00:00").getTime();
  if (Number.isNaN(b)) return 1;
  return Math.max(1, Math.floor((Date.now() - b) / (7 * 86400000)) + 1);
}
