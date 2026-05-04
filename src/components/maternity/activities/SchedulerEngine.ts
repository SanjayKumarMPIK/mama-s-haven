import type { ActivityItem } from "@/components/maternity/MaternityActivities";
import {
  type DatasetMaternityStage,
  type NormalizedActivity,
  type SchedulerDifficulty,
  WEEKLY_THEME_ORDER,
  THEME_COPY,
  curveSlotFromWeekIndex,
  curveDifficultyForSlot,
  curveDisplayLabel,
  difficultyRank,
  getStageIntensityCeilingRank,
  normalizeActivity,
  resolveThemeId,
  seededShuffle,
} from "./SchedulerUtils";

export const RECOVERY_DAY_ACTIVITY_ID = "__recovery_day__";

export interface ScheduledSlot {
  dayIndex: number;
  /** Monday = 0 … Sunday = 6 */
  dayLabel: string;
  isRecovery: boolean;
  activity: NormalizedActivity | null;
  /** Suggested difficulty from weekly curve (for display / soft ordering) */
  curveDifficulty: SchedulerDifficulty;
}

export interface ScheduleTotals {
  scheduledActivityCount: number;
  scheduledMinutes: number;
  scheduledCalories: number;
}

export interface RecommendationRow {
  activityId: string;
  name: string;
  rationale: string;
}

export interface GeneratedSchedule {
  themeId: string;
  themeTagline: string;
  themeClinicalNote: string;
  curveSlot: 1 | 2 | 3 | 4;
  curveLabel: string;
  weekKey: string;
  days: ScheduledSlot[];
  recommendations: RecommendationRow[];
  totals: ScheduleTotals;
  generationSeed: string;
}

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function filterByStage(pool: NormalizedActivity[], stage: DatasetMaternityStage): NormalizedActivity[] {
  return pool.filter((a) => a.stages.includes(stage));
}

function filterByCeiling(
  pool: NormalizedActivity[],
  stage: DatasetMaternityStage,
): NormalizedActivity[] {
  const maxRank = getStageIntensityCeilingRank(stage);
  return pool.filter((a) => difficultyRank(a.difficulty) <= maxRank);
}

function themePrimaryPool(stagePool: NormalizedActivity[], themeId: string): NormalizedActivity[] {
  return stagePool.filter((a) => a.themes.includes(themeId));
}

function widenPool(primary: NormalizedActivity[], stagePool: NormalizedActivity[]): NormalizedActivity[] {
  if (primary.length >= 6) return primary;
  const seen = new Set(primary.map((p) => p.id));
  const merged = [...primary];
  for (const a of stagePool) {
    if (!seen.has(a.id)) {
      merged.push(a);
      seen.add(a.id);
    }
  }
  return merged;
}

function isHighEffort(d: SchedulerDifficulty): boolean {
  return difficultyRank(d) >= 3;
}

function assignSixActivities(
  candidates: NormalizedActivity[],
  seed: string,
  curveSlot: 1 | 2 | 3 | 4,
): NormalizedActivity[] {
  const shuffled = seededShuffle(candidates, seed);
  const used = new Set<string>();
  const out: NormalizedActivity[] = [];
  let lastHigh = false;

  const curvePref = curveDifficultyForSlot(curveSlot);

  const score = (a: NormalizedActivity, dayIdx: number): number => {
    let s = 0;
    const dist = Math.abs(difficultyRank(a.difficulty) - difficultyRank(curvePref));
    s -= dist * 2;
    if (dayIdx < 3 && difficultyRank(a.difficulty) <= 2) s += 3;
    if (dayIdx >= 4 && difficultyRank(a.difficulty) >= 3) s += 1;
    return s;
  };

  for (let dayIdx = 0; dayIdx < 6; dayIdx++) {
    const usable = shuffled.filter((a) => !used.has(a.id));
    const filtered = lastHigh
      ? usable.filter((a) => !isHighEffort(a.difficulty))
      : usable;

    const pool = filtered.length ? filtered : usable;
    pool.sort((a, b) => score(b, dayIdx) - score(a, dayIdx));
    const pick = pool[0];
    if (!pick) break;
    out.push(pick);
    used.add(pick.id);
    lastHigh = isHighEffort(pick.difficulty);
  }

  if (out.length < 6) {
    const rest = shuffled.filter((a) => !used.has(a.id));
    for (const a of rest) {
      out.push(a);
      if (out.length === 6) break;
    }
  }

  return out.slice(0, 6);
}

function buildRecommendations(
  stagePool: NormalizedActivity[],
  themeId: string,
  seed: string,
): RecommendationRow[] {
  const themed = themePrimaryPool(stagePool, themeId);
  const pool = themed.length >= 4 ? themed : widenPool(themed, stagePool);
  const picks = seededShuffle(pool, `${seed}|rec`).slice(0, 4);
  return picks.map((a) => ({
    activityId: a.id,
    name: a.name,
    rationale: a.benefit,
  }));
}

export interface GenerateScheduleInput {
  activities: ActivityItem[];
  stage: DatasetMaternityStage;
  isoWeekKey: string;
  /** Manual theme rotation offset (increments on user refresh) */
  themeSpin: number;
  /** Same theme/week — new valid ordering */
  scheduleNonce: number;
  /** Week index for progression curve (e.g. gestational week or weeks since birth) */
  progressionWeekIndex: number;
}

export function generateSchedule(input: GenerateScheduleInput): GeneratedSchedule {
  const normalized = input.activities.map(normalizeActivity);
  let themeId = resolveThemeId(input.isoWeekKey, input.themeSpin);
  const stagePool = filterByCeiling(filterByStage(normalized, input.stage), input.stage);

  let primary = themePrimaryPool(stagePool, themeId);
  if (primary.length < 4) {
    const startIdx = WEEKLY_THEME_ORDER.indexOf(themeId as (typeof WEEKLY_THEME_ORDER)[number]);
    const safeStart = startIdx >= 0 ? startIdx : 0;
    for (let step = 0; step < WEEKLY_THEME_ORDER.length; step++) {
      const idx = (safeStart + 1 + step) % WEEKLY_THEME_ORDER.length;
      const nextTheme = WEEKLY_THEME_ORDER[idx];
      const tryPool = themePrimaryPool(stagePool, nextTheme);
      if (tryPool.length >= 4) {
        themeId = nextTheme;
        primary = tryPool;
        break;
      }
    }
  }

  const candidatePool = widenPool(primary.length ? primary : themePrimaryPool(stagePool, themeId), stagePool);

  const curveSlot = curveSlotFromWeekIndex(Math.max(1, input.progressionWeekIndex));
  const generationSeed = `${input.isoWeekKey}|${input.stage}|${themeId}|${input.themeSpin}|${input.scheduleNonce}|${curveSlot}`;
  const six = assignSixActivities(candidatePool, generationSeed, curveSlot);

  const days: ScheduledSlot[] = [];
  const curveDiff = curveDifficultyForSlot(curveSlot);

  for (let i = 0; i < 6; i++) {
    days.push({
      dayIndex: i,
      dayLabel: DAY_LABELS[i],
      isRecovery: false,
      activity: six[i] ?? null,
      curveDifficulty: curveDiff,
    });
  }
  days.push({
    dayIndex: 6,
    dayLabel: DAY_LABELS[6],
    isRecovery: true,
    activity: null,
    curveDifficulty: "very-low",
  });

  const scheduled = days.filter((d) => !d.isRecovery && d.activity);
  const totals: ScheduleTotals = {
    scheduledActivityCount: scheduled.length,
    scheduledMinutes: scheduled.reduce((s, d) => s + (d.activity?.durationMinutes ?? 0), 0),
    scheduledCalories: scheduled.reduce((s, d) => s + (d.activity?.caloriesBurned ?? 0), 0),
  };

  const meta = THEME_COPY[themeId] ?? THEME_COPY["Mobility Week"];

  return {
    themeId,
    themeTagline: meta.tagline,
    themeClinicalNote: meta.clinicalNote,
    curveSlot,
    curveLabel: curveDisplayLabel(curveSlot),
    weekKey: input.isoWeekKey,
    days,
    recommendations: buildRecommendations(stagePool, themeId, generationSeed),
    totals,
    generationSeed,
  };
}

export function regenerate(input: GenerateScheduleInput): GeneratedSchedule {
  return generateSchedule({ ...input, scheduleNonce: input.scheduleNonce + 1 });
}

/** Replace a day's activity while keeping schedule validity (re-check back-to-back high). */
export function replaceDayActivity(
  schedule: GeneratedSchedule,
  dayIndex: number,
  replacement: NormalizedActivity,
): GeneratedSchedule {
  if (dayIndex < 0 || dayIndex > 5) return schedule;
  const days = schedule.days.map((d) => ({ ...d, activity: d.activity ? { ...d.activity } : null }));
  const target = days[dayIndex];
  if (!target || target.isRecovery) return schedule;
  target.activity = { ...replacement };

  const scheduled = days.filter((d) => !d.isRecovery && d.activity);
  const totals: ScheduleTotals = {
    scheduledActivityCount: scheduled.length,
    scheduledMinutes: scheduled.reduce((s, d) => s + (d.activity?.durationMinutes ?? 0), 0),
    scheduledCalories: scheduled.reduce((s, d) => s + (d.activity?.caloriesBurned ?? 0), 0),
  };

  return { ...schedule, days, totals };
}

/** Picker pool: theme-first, widened to stage-safe list when the themed pool is small. */
export function activitiesForActivityPicker(
  activities: ActivityItem[],
  stage: DatasetMaternityStage,
  themeId: string,
): NormalizedActivity[] {
  const normalized = activities.map(normalizeActivity);
  const stagePool = filterByCeiling(filterByStage(normalized, stage), stage);
  const themed = themePrimaryPool(stagePool, themeId);
  return themed.length >= 3 ? themed : stagePool;
}
