import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MaternityMode, PregnancyProfile } from "@/hooks/usePregnancyProfile";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { maternityActivitiesData } from "@/components/maternity/MaternityActivities";
import { generateSchedule, replaceDayActivity, type GeneratedSchedule } from "./SchedulerEngine";
import {
  type DatasetMaternityStage,
  type DayCompletionStatus,
  getIsoWeekKey,
  normalizeActivity,
  weeksSinceBirth,
} from "./SchedulerUtils";
import { useExercisePhaseResolver } from "./useExercisePhaseResolver";

function storageKey(weekKey: string, stage: DatasetMaternityStage, seed: string) {
  return `mh-exercise-scheduler-v1|${weekKey}|${stage}|${seed}`;
}

interface PersistShape {
  statuses: DayCompletionStatus[];
  activityIds: (string | null)[];
}

function loadPersist(key: string): PersistShape | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PersistShape;
  } catch {
    return null;
  }
}

function savePersist(key: string, data: PersistShape) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function loadFromSupabase(
  userId: string,
  weekKey: string,
  stage: string,
  generationSeed: string,
): Promise<PersistShape | null> {
  try {
    const { data, error } = await supabase
      .from("maternity_exercise_logs")
      .select("statuses, activity_ids, generation_seed")
      .eq("user_id", userId)
      .eq("week_key", weekKey)
      .eq("stage", stage)
      .maybeSingle();
    if (error || !data) return null;
    // If the seed changed (user shuffled on another device), treat as stale
    if (data.generation_seed !== generationSeed) return null;
    return {
      statuses: data.statuses as DayCompletionStatus[],
      activityIds: data.activity_ids as (string | null)[],
    };
  } catch {
    return null;
  }
}

async function saveToSupabase(
  userId: string,
  weekKey: string,
  stage: string,
  generationSeed: string,
  data: PersistShape,
) {
  try {
    await supabase.from("maternity_exercise_logs").upsert(
      {
        user_id: userId,
        week_key: weekKey,
        stage,
        generation_seed: generationSeed,
        statuses: data.statuses as any,
        activity_ids: data.activityIds as any,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,week_key,stage" },
    );
  } catch {
    /* silent – localStorage is the fallback */
  }
}

function initialStatuses(): DayCompletionStatus[] {
  return Array.from({ length: 7 }, (_, i) => (i === 6 ? "recovery" : "pending"));
}

function buildPersistFromSchedule(
  schedule: GeneratedSchedule,
  prev: PersistShape | null,
): PersistShape {
  const ids = schedule.days.map((d) => (d.isRecovery ? null : d.activity?.id ?? null));
  const base = initialStatuses();
  if (!prev?.statuses?.length) {
    return { statuses: base, activityIds: ids };
  }
  const merged = [...base];
  for (let i = 0; i < 7; i++) {
    if (i === 6) {
      merged[i] = "recovery";
      continue;
    }
    if (prev.activityIds && prev.activityIds[i] === ids[i] && prev.statuses[i]) {
      const st = prev.statuses[i];
      if (st === "completed" || st === "skipped" || st === "pending") merged[i] = st;
    }
  }
  return { statuses: merged, activityIds: ids };
}

export function useWeeklyScheduler() {
  const { mode, trimester, currentWeek, profile } = usePregnancyProfile();
  const { user } = useAuth();
  const stage = useExercisePhaseResolver();

  const progressionWeekIndex = useMemo(
    () => resolveProgressionWeekIndex(mode, profile, currentWeek),
    [mode, profile, currentWeek],
  );

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const weekKey = useMemo(() => getIsoWeekKey(new Date()), [tick]);

  const [themeSpin, setThemeSpin] = useState(0);
  const [scheduleNonce, setScheduleNonce] = useState(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [pickerDayIndex, setPickerDayIndex] = useState<number | null>(null);
  const [replacements, setReplacements] = useState<Record<number, string>>({});
  const lastStageRef = useRef(stage);

  const baseSchedule = useMemo(
    () =>
      generateSchedule({
        activities: maternityActivitiesData,
        stage,
        isoWeekKey: weekKey,
        themeSpin,
        scheduleNonce,
        progressionWeekIndex,
      }),
    [stage, weekKey, themeSpin, scheduleNonce, progressionWeekIndex],
  );

  const schedule = useMemo(() => {
    let s = baseSchedule;
    for (const [k, id] of Object.entries(replacements)) {
      const idx = Number(k);
      if (idx === 6 || Number.isNaN(idx)) continue;
      const raw = maternityActivitiesData.find((a) => a.id === id);
      if (raw) s = replaceDayActivity(s, idx, normalizeActivity(raw));
    }
    return s;
  }, [baseSchedule, replacements]);

  useEffect(() => {
    setReplacements({});
  }, [weekKey, stage, themeSpin, scheduleNonce]);

  const persistKey = useMemo(
    () => storageKey(weekKey, stage, baseSchedule.generationSeed),
    [weekKey, stage, baseSchedule.generationSeed],
  );

  const [statuses, setStatuses] = useState<DayCompletionStatus[]>(() => initialStatuses());

  // Load from Supabase on mount / key change, then fall back to localStorage
  useEffect(() => {
    const stageChanged = lastStageRef.current !== stage;
    lastStageRef.current = stage;

    // Start with localStorage for instant render
    const persisted = loadPersist(persistKey);
    const next = buildPersistFromSchedule(schedule, persisted);
    setStatuses(next.statuses);
    savePersist(persistKey, {
      statuses: next.statuses,
      activityIds: schedule.days.map((d) => (d.isRecovery ? null : d.activity?.id ?? null)),
    });

    // Then try Supabase for cross-device sync
    if (user?.id) {
      loadFromSupabase(user.id, schedule.weekKey, stage, baseSchedule.generationSeed).then(
        (cloud) => {
          if (cloud) {
            const merged = buildPersistFromSchedule(schedule, cloud);
            setStatuses(merged.statuses);
            savePersist(persistKey, {
              statuses: merged.statuses,
              activityIds: schedule.days.map((d) => (d.isRecovery ? null : d.activity?.id ?? null)),
            });
          }
        },
      );
    }

    if (stageChanged) {
      setThemeSpin(0);
      setScheduleNonce(0);
      setExpandedDay(null);
    }
  }, [persistKey, schedule, stage, user?.id]);

  // Save to both localStorage and Supabase on status changes
  useEffect(() => {
    const persistData: PersistShape = {
      statuses,
      activityIds: schedule.days.map((d) => (d.isRecovery ? null : d.activity?.id ?? null)),
    };
    savePersist(persistKey, persistData);

    if (user?.id) {
      saveToSupabase(user.id, schedule.weekKey, stage, baseSchedule.generationSeed, persistData);
    }
  }, [statuses, persistKey, schedule.days, user?.id]);

  const setStatus = useCallback((dayIndex: number, status: DayCompletionStatus) => {
    if (dayIndex === 6) return;
    setStatuses((prev) => {
      const n = [...prev];
      n[dayIndex] = status;
      return n;
    });
    setExpandedDay(null);
  }, []);

  const replaceActivity = useCallback((dayIndex: number, activityId: string) => {
    if (dayIndex === 6) return;
    const raw = maternityActivitiesData.find((a) => a.id === activityId);
    if (!raw) return;
    setReplacements((prev) => ({ ...prev, [dayIndex]: activityId }));
    setStatuses((prev) => {
      const n = [...prev];
      if (n[dayIndex] === "completed") n[dayIndex] = "pending";
      return n;
    });
    setPickerDayIndex(null);
  }, []);

  const refreshTheme = useCallback(() => {
    setThemeSpin((s) => s + 1);
    setScheduleNonce(0);
    setStatuses(initialStatuses());
    setExpandedDay(null);
  }, []);

  const reshuffleWeek = useCallback(() => {
    setScheduleNonce((n) => n + 1);
    setStatuses(initialStatuses());
    setExpandedDay(null);
  }, []);

  const openPicker = useCallback((dayIndex: number) => {
    if (dayIndex === 6) return;
    setPickerDayIndex(dayIndex);
  }, []);

  const closePicker = useCallback(() => setPickerDayIndex(null), []);

  const stats = useMemo(() => computeWeeklyStats(schedule, statuses), [schedule, statuses]);

  return {
    stage,
    mode,
    trimester,
    schedule,
    statuses,
    setStatus,
    replaceActivity,
    expandedDay,
    setExpandedDay,
    pickerDayIndex,
    openPicker,
    closePicker,
    refreshTheme,
    reshuffleWeek,
    stats,
    progressionWeekIndex,
  };
}

function resolveProgressionWeekIndex(
  mode: MaternityMode,
  profile: PregnancyProfile,
  currentWeek: number,
): number {
  if (mode === "postpartum" || mode === "premature") {
    return weeksSinceBirth(profile.delivery?.birthDate);
  }
  return Math.max(1, currentWeek || 1);
}

export interface WeeklySchedulerStats {
  completed: number;
  skipped: number;
  pending: number;
  scheduledTotal: number;
  completedMinutes: number;
  completedCalories: number;
  scheduledMinutes: number;
  scheduledCalories: number;
  completionPercent: number;
  consistencyPercent: number;
  goalLabel: "On Track" | "Behind" | "Complete";
}

function computeWeeklyStats(
  schedule: GeneratedSchedule,
  statuses: DayCompletionStatus[],
): WeeklySchedulerStats {
  const nonRecoveryIdx = schedule.days.map((_, i) => i).filter((i) => i !== 6);
  const scheduledTotal = nonRecoveryIdx.length;
  let completed = 0;
  let skipped = 0;
  let pending = 0;
  let completedMinutes = 0;
  let completedCalories = 0;

  for (const i of nonRecoveryIdx) {
    const st = statuses[i] ?? "pending";
    const act = schedule.days[i]?.activity;
    if (st === "completed") {
      completed++;
      completedMinutes += act?.durationMinutes ?? 0;
      completedCalories += act?.caloriesBurned ?? 0;
    } else if (st === "skipped") skipped++;
    else pending++;
  }

  const completionPercent = scheduledTotal ? Math.round((completed / scheduledTotal) * 100) : 0;
  const nonRecoveryNonSkipped = nonRecoveryIdx.filter((i) => statuses[i] !== "skipped").length;
  const consistencyDenominator = nonRecoveryNonSkipped || 1;
  const consistencyPercent = Math.round((completed / consistencyDenominator) * 100);

  let goalLabel: WeeklySchedulerStats["goalLabel"] = "On Track";
  if (completionPercent === 100) goalLabel = "Complete";
  else if (completionPercent < 40 && pending > completed) goalLabel = "Behind";

  return {
    completed,
    skipped,
    pending,
    scheduledTotal,
    completedMinutes,
    completedCalories,
    scheduledMinutes: schedule.totals.scheduledMinutes,
    scheduledCalories: schedule.totals.scheduledCalories,
    completionPercent,
    consistencyPercent,
    goalLabel,
  };
}
