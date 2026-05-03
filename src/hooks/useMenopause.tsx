import { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MenopauseStage = "perimenopause" | "menopause" | "postmenopause";

export type SymptomId =
  | 'hot_flashes' | 'night_sweats' | 'mood_swings' | 'anxiety'
  | 'sleep_issues' | 'fatigue' | 'brain_fog' | 'headache' | 'joint_pain' | 'vaginal_dryness'
  | 'muscle_stiffness' | 'weight_gain' | 'low_libido' | 'dry_skin' | 'hair_thinning' | 'palpitations';

export type Severity = 'mild' | 'moderate' | 'severe';
export type SleepQuality = 'good' | 'average' | 'poor';

export const SYMPTOM_OPTIONS: { id: SymptomId; label: string; emoji: string }[] = [
  { id: 'hot_flashes', label: 'Hot flashes', emoji: '🔥' },
  { id: 'night_sweats', label: 'Night sweats', emoji: '🌙' },
  { id: 'mood_swings', label: 'Mood swings', emoji: '🎭' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'sleep_issues', label: 'Sleep issues', emoji: '😴' },
  { id: 'fatigue', label: 'Fatigue', emoji: '🪫' },
  { id: 'brain_fog', label: 'Brain fog', emoji: '🌫️' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'joint_pain', label: 'Joint pain', emoji: '🦴' },
  { id: 'vaginal_dryness', label: 'Vaginal dryness', emoji: '💧' },
  { id: 'muscle_stiffness', label: 'Muscle stiffness', emoji: '💪' },
  { id: 'weight_gain', label: 'Weight gain', emoji: '⚖️' },
  { id: 'low_libido', label: 'Low libido', emoji: '💜' },
  { id: 'dry_skin', label: 'Dry skin', emoji: '🧴' },
  { id: 'hair_thinning', label: 'Hair thinning', emoji: '💇' },
  { id: 'palpitations', label: 'Palpitations', emoji: '💓' },
];

export interface MenopauseSymptoms {
  hotFlashes: number;   // 0–5
  nightSweats: number;
  sleep: number;
  fatigue: number;
  moodSwings: number;
  anxiety: number;
  brainFog: number;
  jointPain: number;
  headache: number;
}

export interface MenopauseProfile {
  stage: MenopauseStage;
  stillGettingPeriods: "yes" | "no" | "sometimes";
  lastPeriodDate: string;         // ISO date
  periodRegularity: "regular" | "irregular" | "unpredictable" | "stopped";
  symptoms: MenopauseSymptoms;
  diet: "veg" | "mixed" | "junk";
  conditions: string[];           // 'thyroid' | 'diabetes' | 'pcos' | 'hypertension'
  familyHistory: string[];        // 'osteoporosis' | 'heartDisease'
  onHRT: boolean;
  hrtDetails: string;
  onboardingDone: boolean;
}

export interface MenopauseLogEntry {
  date: string;                   // ISO date (YYYY-MM-DD)
  // Calendar symptom fields (0-5 unless specified)
  hotFlashCount: number;          // 0-20
  nightSweats: number;            // 0-5
  jointPain: number;              // 0-5
  headache: number;               // 0-5
  anxiety: number;                // 0-5
  vaginalDryness: number;         // 0-5
  fatigue: number;                // 0-5
  mood: number;                   // 1-5
  sleepHrs: number;               // hours
  // Guided logging fields
  symptoms: SymptomId[];          // multi-select symptoms
  severity: Severity;             // overall severity for the day
  energyLevel: number;            // 1–5
  sleepQuality: SleepQuality;     // good / average / poor
  notes: string;
  painLevel: number;              // legacy alias for jointPain
  periodOccurred: boolean;
  goalsCompleted?: number;
  goalsTotal?: number;
  // ── New menopause-specific tracking fields ──
  muscleStiffness?: number;       // 0-5
  weightGainFeeling?: number;     // 0-5
  lowLibido?: number;             // 0-5
  drySkin?: number;               // 0-5
  hairThinning?: number;          // 0-5
  palpitations?: number;          // count 0-10
  palpitationSeverity?: 'mild' | 'moderate' | 'severe';
  calciumMg?: number;             // daily calcium intake
  vitaminDTaken?: boolean;        // supplement or sun exposure
  sunExposureMin?: number;        // minutes of morning sun
  weightKg?: number;              // weight log
  bpSystolic?: number;            // blood pressure
  bpDiastolic?: number;
}

export interface ReminderSettings {
  morningTime: string;            // legacy HH:MM
  afternoonTime: string;          // legacy
  eveningTime: string;            // legacy
  blockReminders?: { morning: string; afternoon: string; evening: string };
  goalReminders?: Record<string, string>;
  notificationsEnabled: boolean;
}

export interface GoalCompletion {
  date: string;                   // YYYY-MM-DD
  completed: string[];            // list of goal IDs completed
  total: number;                  // total goals for that day
}

export interface CommunityWin {
  id: string;
  text: string;                   // max 100 chars
  date: string;                   // ISO date
}

// ─── Storage Keys ────────────────────────────────────────────────────────────

const PROFILE_KEY = "ss-menopause-profile";
const LOGS_KEY = "ss-menopause-logs";
const REMINDERS_KEY = "ss-menopause-reminders";
const WINS_KEY = "ss-menopause-wins";
const GOALS_KEY = "ss-menopause-goals";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

/** Migrate an old-format log entry to the new format */
function migrateLogEntry(entry: any): MenopauseLogEntry {
  // Already has new fields → return as-is
  if (Array.isArray(entry.symptoms)) return entry as MenopauseLogEntry;

  // Build symptom array from old fields
  const symptoms: SymptomId[] = [];
  if (entry.hotFlashCount > 0) symptoms.push('hot_flashes');
  if (entry.painLevel >= 3) symptoms.push('joint_pain');
  if (entry.mood <= 2) symptoms.push('mood_swings');
  if (entry.sleepHrs < 6) symptoms.push('sleep_issues');

  const severity: Severity =
    entry.painLevel >= 4 || entry.hotFlashCount >= 4 ? 'severe' :
    entry.painLevel >= 2 || entry.hotFlashCount >= 2 ? 'moderate' : 'mild';

  const energyLevel = entry.mood ?? 3;
  const sleepQuality: SleepQuality =
    entry.sleepHrs >= 7 ? 'good' : entry.sleepHrs >= 5 ? 'average' : 'poor';

  const jointPain = entry.jointPain ?? entry.painLevel ?? (symptoms.includes("joint_pain") ? 3 : 0);
  const headache = entry.headache ?? (symptoms.includes("headache") ? 3 : 0);
  const anxiety = entry.anxiety ?? (symptoms.includes("anxiety") ? 3 : 0);
  const nightSweats = entry.nightSweats ?? (symptoms.includes("night_sweats") ? 2 : 0);
  const vaginalDryness = entry.vaginalDryness ?? (symptoms.includes("vaginal_dryness") ? 2 : 0);
  const fatigue = entry.fatigue ?? (symptoms.includes("fatigue") ? 3 : 0);

  return {
    ...entry,
    date: entry.date,
    hotFlashCount: entry.hotFlashCount ?? (symptoms.includes("hot_flashes") ? 2 : 0),
    nightSweats,
    jointPain,
    headache,
    anxiety,
    vaginalDryness,
    fatigue,
    mood: entry.mood ?? 3,
    sleepHrs: entry.sleepHrs ?? 7,
    symptoms,
    severity,
    energyLevel,
    sleepQuality,
    notes: entry.notes ?? '',
    painLevel: entry.painLevel ?? jointPain ?? 1,
    periodOccurred: entry.periodOccurred ?? false,
    goalsCompleted: entry.goalsCompleted,
    goalsTotal: entry.goalsTotal,
  };
}

function readAndMigrateLogs(key: string): MenopauseLogEntry[] {
  const raw = readJSON<any[]>(key, []);
  return raw.map(migrateLogEntry);
}

export function classifyStage(lastPeriodDate: string): MenopauseStage {
  const last = new Date(lastPeriodDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);

  if (diffMonths < 12) return "perimenopause";
  if (diffMonths <= 24) return "menopause";
  return "postmenopause";
}

export function getStageLabel(stage: MenopauseStage): string {
  switch (stage) {
    case "perimenopause": return "Perimenopause";
    case "menopause": return "Menopause";
    case "postmenopause": return "Post-menopause";
  }
}

export function getStageDescription(stage: MenopauseStage): string {
  switch (stage) {
    case "perimenopause":
      return "Your body is beginning its natural transition. Periods may become irregular, and symptoms like hot flashes may start appearing.";
    case "menopause":
      return "You're in the heart of the transition. Your body is adjusting to new hormonal levels — this is completely natural.";
    case "postmenopause":
      return "You've moved through menopause beautifully. Focus now shifts to long-term wellness and bone & heart health.";
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMenopause() {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";

  // Suffix keys with userId for multi-user support
  const pk = `${PROFILE_KEY}-${userId}`;
  const lk = `${LOGS_KEY}-${userId}`;
  const rk = `${REMINDERS_KEY}-${userId}`;
  const wk = `${WINS_KEY}-${userId}`;
  const gk = `${GOALS_KEY}-${userId}`;

  const [profile, setProfile] = useState<MenopauseProfile | null>(() => readJSON(pk, null));
  const [logs, setLogs] = useState<MenopauseLogEntry[]>(() => readAndMigrateLogs(lk));
  const [reminderSettings, setReminderSettingsState] = useState<ReminderSettings>(() =>
    readJSON(rk, {
      morningTime: "07:00",
      afternoonTime: "13:00",
      eveningTime: "20:00",
      blockReminders: { morning: "07:00", afternoon: "13:00", evening: "20:00" },
      goalReminders: {},
      notificationsEnabled: false,
    })
  );
  const [wins, setWins] = useState<CommunityWin[]>(() => readJSON(wk, []));
  const [goalCompletions, setGoalCompletions] = useState<GoalCompletion[]>(() => readJSON(gk, []));

  // ── Profile ────────────────────────────────────────────────────────────────

  const saveMenopauseProfile = useCallback(
    (data: MenopauseProfile) => {
      setProfile(data);
      writeJSON(pk, data);
    },
    [pk]
  );

  // ── Logs ───────────────────────────────────────────────────────────────────

  const addLog = useCallback(
    (entry: MenopauseLogEntry) => {
      setLogs((prev) => {
        // Replace if same date exists, else append
        const idx = prev.findIndex((l) => l.date === entry.date);
        const next = idx >= 0 ? [...prev.slice(0, idx), entry, ...prev.slice(idx + 1)] : [...prev, entry];
        writeJSON(lk, next);
        return next;
      });
    },
    [lk]
  );

  const deleteLog = useCallback(
    (date: string) => {
      setLogs((prev) => {
        const next = prev.filter((l) => l.date !== date);
        writeJSON(lk, next);
        return next;
      });
    },
    [lk]
  );

  const getLogForDate = useCallback(
    (date: string): MenopauseLogEntry | undefined => {
      return logs.find((l) => l.date === date);
    },
    [logs]
  );

  const getLogsForMonth = useCallback(
    (year: number, month: number): MenopauseLogEntry[] => {
      const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
      return logs.filter((l) => l.date.startsWith(prefix));
    },
    [logs]
  );

  const getLogsForRange = useCallback(
    (startDate: string, endDate: string): MenopauseLogEntry[] => {
      return logs.filter((l) => l.date >= startDate && l.date <= endDate);
    },
    [logs]
  );

  const getLogsForDays = useCallback(
    (days: number): MenopauseLogEntry[] => {
      const now = new Date();
      return logs.filter((l) => {
        const diff = (now.getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
        return diff <= days;
      });
    },
    [logs]
  );

  // ── Reminders ──────────────────────────────────────────────────────────────

  const saveReminderSettings = useCallback(
    (settings: ReminderSettings) => {
      setReminderSettingsState(settings);
      writeJSON(rk, settings);
    },
    [rk]
  );

  // ── Community Wins ─────────────────────────────────────────────────────────

  const addWin = useCallback(
    (text: string) => {
      const win: CommunityWin = {
        id: Date.now().toString(36),
        text: text.slice(0, 100),
        date: new Date().toISOString().slice(0, 10),
      };
      setWins((prev) => {
        const next = [win, ...prev].slice(0, 50); // keep last 50
        writeJSON(wk, next);
        return next;
      });
    },
    [wk]
  );

  // ── Goal Completions ───────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayGoals = useMemo(
    () => goalCompletions.find((g) => g.date === todayStr) ?? { date: todayStr, completed: [], total: 0 },
    [goalCompletions, todayStr]
  );

  const toggleGoal = useCallback(
    (goalId: string, totalGoals: number) => {
      setGoalCompletions((prev) => {
        const idx = prev.findIndex((g) => g.date === todayStr);
        let entry: GoalCompletion;

        if (idx >= 0) {
          entry = { ...prev[idx], total: totalGoals };
          if (entry.completed.includes(goalId)) {
            entry.completed = entry.completed.filter((id) => id !== goalId);
          } else {
            entry.completed = [...entry.completed, goalId];
          }
        } else {
          entry = { date: todayStr, completed: [goalId], total: totalGoals };
        }

        const next = idx >= 0 ? [...prev.slice(0, idx), entry, ...prev.slice(idx + 1)] : [...prev, entry];
        writeJSON(gk, next);
        return next;
      });
    },
    [gk, todayStr]
  );

  const getWeekStreak = useCallback((): number => {
    let streak = 0;
    const today = new Date();
    // Find start of current week (Monday)
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i <= mondayOffset; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const entry = goalCompletions.find((g) => g.date === dateStr);
      if (entry && entry.total > 0 && entry.completed.length / entry.total >= 0.8) {
        streak++;
      }
    }
    return streak;
  }, [goalCompletions]);

  const getMonthCompletionMap = useCallback(
    (year: number, month: number): Record<string, number> => {
      const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
      const map: Record<string, number> = {};
      goalCompletions
        .filter((g) => g.date.startsWith(prefix))
        .forEach((g) => {
          map[g.date] = g.total > 0 ? Math.round((g.completed.length / g.total) * 100) : 0;
        });
      return map;
    },
    [goalCompletions]
  );

  return {
    profile,
    saveMenopauseProfile,
    logs,
    addLog,
    deleteLog,
    getLogForDate,
    getLogsForMonth,
    getLogsForRange,
    getLogsForDays,
    reminderSettings,
    saveReminderSettings,
    wins,
    addWin,
    todayGoals,
    toggleGoal,
    getWeekStreak,
    getMonthCompletionMap,
    goalCompletions,
  };
}
