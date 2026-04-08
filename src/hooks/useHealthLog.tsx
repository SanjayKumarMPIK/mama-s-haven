import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Phase } from "@/hooks/usePhase";
import type { KeySymptomId } from "@/lib/symptomAnalysis";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MoodType = "Good" | "Okay" | "Low";
export type FlowIntensity = "Light" | "Medium" | "Heavy";
export type FatigueLevel = "Low" | "Medium" | "High";
export type SleepQuality = "Good" | "Okay" | "Poor";

export interface PubertyEntry {
  phase: "puberty";
  periodStarted: boolean;
  periodEnded: boolean;
  flowIntensity: FlowIntensity | null;
  symptoms: {
    cramps: boolean;
    fatigue: boolean;
    moodSwings: boolean;
    headache: boolean;
    acne: boolean;
    breastTenderness: boolean;
  };
  mood: MoodType | null;
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  notes?: string;
}

export interface MaternityEntry {
  phase: "maternity";
  fatigueLevel: FatigueLevel | null;
  hydrationGlasses: number | null;
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  symptoms: {
    nausea: boolean;
    dizziness: boolean;
    swelling: boolean;
    backPain: boolean;
    sleepDisturbance: boolean;
  };
  mood: MoodType | null;
  notes?: string;
}

export interface FamilyPlanningEntry {
  phase: "family-planning";
  lastPeriodDate: string; // ISO date string
  cycleLength: number | null;
  symptoms: {
    irregularCycle: boolean;
    ovulationPain: boolean;
    moodChanges: boolean;
    fatigue: boolean;
    stress: boolean;
    sleepIssues: boolean;
  };
  mood: MoodType | null;
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  notes?: string;
}

export interface MenopauseEntry {
  phase: "menopause";
  symptoms: {
    hotFlashes: boolean;
    nightSweats: boolean;
    moodSwings: boolean;
    jointPain: boolean;
    sleepDisturbance: boolean;
    fatigue: boolean;
  };
  sleepHours: number | null;
  sleepQuality: SleepQuality | null;
  mood: MoodType | null;
  notes?: string;
}

export type HealthLogEntry =
  | PubertyEntry
  | MaternityEntry
  | FamilyPlanningEntry
  | MenopauseEntry;

export type HealthLogs = Record<string, HealthLogEntry>; // key = "YYYY-MM-DD"

// ─── Derived helpers ──────────────────────────────────────────────────────────

/**
 * Given a last period date (ISO string) and cycle length in days,
 * return the predicted ovulation date and fertile window [start, end] as ISO strings.
 */
export function calcFertileWindow(
  lastPeriodISO: string,
  cycleLength: number
): { ovulation: string; fertileStart: string; fertileEnd: string } | null {
  if (!lastPeriodISO || cycleLength < 10 || cycleLength > 60) return null;
  const last = new Date(lastPeriodISO);
  if (isNaN(last.getTime())) return null;

  const ovulationOffset = cycleLength - 14;
  const ovulation = new Date(last);
  ovulation.setDate(ovulation.getDate() + ovulationOffset);

  const fertileStart = new Date(ovulation);
  fertileStart.setDate(fertileStart.getDate() - 5);
  const fertileEnd = new Date(ovulation);
  fertileEnd.setDate(fertileEnd.getDate() + 1);

  return {
    ovulation: ovulation.toISOString().slice(0, 10),
    fertileStart: fertileStart.toISOString().slice(0, 10),
    fertileEnd: fertileEnd.toISOString().slice(0, 10),
  };
}

/**
 * From an array of Puberty entries with period start dates,
 * derive the average cycle length.
 */
export function calcAverageCycleLength(logs: HealthLogs): number | null {
  const dates = Object.entries(logs)
    .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
    .map(([dateStr]) => new Date(dateStr))
    .sort((a, b) => a.getTime() - b.getTime());

  if (dates.length < 2) return null;
  const diffs: number[] = [];
  for (let i = 1; i < dates.length; i++) {
    const diff = Math.round(
      (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 0 && diff < 100) diffs.push(diff);
  }
  if (diffs.length === 0) return null;
  return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
}

/**
 * For menopause logs, count symptom frequency over all entries.
 * Returns sorted list of {symptom, count}.
 */
export function detectFrequentSymptoms(
  logs: HealthLogs
): { symptom: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const entry of Object.values(logs)) {
    if (entry.phase !== "menopause") continue;
    const s = (entry as MenopauseEntry).symptoms;
    if (s.hotFlashes) counts["Hot Flashes"] = (counts["Hot Flashes"] || 0) + 1;
    if (s.nightSweats) counts["Night Sweats"] = (counts["Night Sweats"] || 0) + 1;
    if (s.moodSwings) counts["Mood Swings"] = (counts["Mood Swings"] || 0) + 1;
    if (s.jointPain) counts["Joint Pain"] = (counts["Joint Pain"] || 0) + 1;
    if (s.sleepDisturbance) counts["Sleep Disturbance"] = (counts["Sleep Disturbance"] || 0) + 1;
    if (s.fatigue) counts["Fatigue"] = (counts["Fatigue"] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * For maternity, flag entries with low sleep (<6h) or low hydration (<6 glasses).
 */
export function detectMaternityAlerts(
  logs: HealthLogs
): { date: string; reason: string }[] {
  const alerts: { date: string; reason: string }[] = [];
  for (const [date, entry] of Object.entries(logs)) {
    if (entry.phase !== "maternity") continue;
    const e = entry as MaternityEntry;
    if (e.sleepHours !== null && e.sleepHours < 6) {
      alerts.push({ date, reason: "Low sleep (<6 hrs)" });
    }
    if (e.hydrationGlasses !== null && e.hydrationGlasses < 6) {
      alerts.push({ date, reason: "Low hydration (<6 glasses)" });
    }
  }
  return alerts.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
}

// ─── Maternity Weekly Tracking ────────────────────────────────────────────

export interface MaternityWeeklySummary {
  week: number;
  weekStartISO: string;
  weekEndISO: string;
  totalLoggedDays: number;
  avgHydrationGlasses: number | null;
  avgSleepHours: number | null;
  lowHydrationDays: number;
  lowSleepDays: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function safeParseISODate(dateISO: string): Date | null {
  const d = new Date(dateISO + "T12:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Convert a log date into a pregnancy week number relative to `dueDate`.
 * Week numbering is approximate (prototype), clamped into [1, 40].
 */
export function getMaternityWeekForDate(dueDateISO: string, dateISO: string): number | null {
  const due = safeParseISODate(dueDateISO);
  const now = safeParseISODate(dateISO);
  if (!due || !now) return null;

  const totalDays = 280; // 40 weeks
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / MS_PER_DAY);
  const daysPassed = totalDays - daysLeft;
  const week = Math.max(1, Math.min(40, Math.ceil(daysPassed / 7)));
  return week;
}

export function summarizeMaternityByWeek(
  logs: HealthLogs,
  dueDateISO: string,
  weeksToShow: number = 4
): MaternityWeeklySummary[] {
  const due = safeParseISODate(dueDateISO);
  if (!due) return [];

  // Pregnancy week 1 starts at dueDate - 280 days (approx).
  const pregnancyStart = new Date(due.getTime() - MS_PER_DAY * 280);

  type Acc = {
    hydration: number[];
    sleep: number[];
    lowHydrationDays: number;
    lowSleepDays: number;
    totalLoggedDays: number;
  };

  const accByWeek = new Map<number, Acc>();

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "maternity") continue;
    const week = getMaternityWeekForDate(dueDateISO, dateISO);
    if (!week) continue;

    const curr = accByWeek.get(week) ?? {
      hydration: [],
      sleep: [],
      lowHydrationDays: 0,
      lowSleepDays: 0,
      totalLoggedDays: 0,
    };

    const e = entry as MaternityEntry;
    curr.totalLoggedDays += 1;
    if (e.hydrationGlasses !== null) {
      curr.hydration.push(e.hydrationGlasses);
      if (e.hydrationGlasses < 6) curr.lowHydrationDays += 1;
    }
    if (e.sleepHours !== null) {
      curr.sleep.push(e.sleepHours);
      if (e.sleepHours < 6) curr.lowSleepDays += 1;
    }

    accByWeek.set(week, curr);
  }

  const summaries: MaternityWeeklySummary[] = Array.from(accByWeek.entries()).map(([week, a]) => {
    const weekStart = new Date(pregnancyStart.getTime() + MS_PER_DAY * (week - 1) * 7);
    const weekEnd = new Date(weekStart.getTime() + MS_PER_DAY * 6);
    const avgHydrationGlasses = a.hydration.length
      ? a.hydration.reduce((s, n) => s + n, 0) / a.hydration.length
      : null;
    const avgSleepHours = a.sleep.length ? a.sleep.reduce((s, n) => s + n, 0) / a.sleep.length : null;
    return {
      week,
      weekStartISO: toISODate(weekStart),
      weekEndISO: toISODate(weekEnd),
      totalLoggedDays: a.totalLoggedDays,
      avgHydrationGlasses: avgHydrationGlasses ? Math.round(avgHydrationGlasses * 10) / 10 : null,
      avgSleepHours: avgSleepHours ? Math.round(avgSleepHours * 10) / 10 : null,
      lowHydrationDays: a.lowHydrationDays,
      lowSleepDays: a.lowSleepDays,
    };
  });

  // Sort by week descending (recent first).
  summaries.sort((a, b) => b.week - a.week);
  return summaries.slice(0, Math.max(1, weeksToShow));
}

// ─── Family Planning Cycle Consistency ────────────────────────────────────

export type CycleConsistencyLevel = "Low" | "Moderate" | "High";

export interface CycleConsistencySummary {
  sampleSize: number;
  averageCycleLength: number | null;
  rangeDays: number | null;
  variabilityLevel: CycleConsistencyLevel | null;
}

export function calcCycleConsistency(logs: HealthLogs): CycleConsistencySummary {
  const cycleLengths = Object.values(logs)
    .filter((e) => e.phase === "family-planning" && (e as FamilyPlanningEntry).cycleLength != null)
    .map((e) => (e as FamilyPlanningEntry).cycleLength as number);

  const sampleSize = cycleLengths.length;
  if (sampleSize === 0) {
    return {
      sampleSize: 0,
      averageCycleLength: null,
      rangeDays: null,
      variabilityLevel: null,
    };
  }

  const avg = cycleLengths.reduce((s, n) => s + n, 0) / sampleSize;
  const min = Math.min(...cycleLengths);
  const max = Math.max(...cycleLengths);
  const rangeDays = max - min;

  let variabilityLevel: CycleConsistencyLevel;
  if (rangeDays <= 2) variabilityLevel = "Low";
  else if (rangeDays <= 5) variabilityLevel = "Moderate";
  else variabilityLevel = "High";

  return {
    sampleSize,
    averageCycleLength: Math.round(avg),
    rangeDays: Math.round(rangeDays),
    variabilityLevel,
  };
}

// ─── Menopause Weekly Summaries ────────────────────────────────────────────

export interface MenopauseWeeklySummary {
  weekStartISO: string;
  weekEndISO: string;
  totalLoggedDays: number;
  avgSleepHours: number | null;
  topSymptoms: { symptom: string; count: number }[];
}

function getWeekStartISO(dateISO: string): string | null {
  const d = safeParseISODate(dateISO);
  if (!d) return null;
  // Convert so Monday is start-of-week (Mon=0..Sun=6)
  const day = d.getDay(); // Sun=0..Sat=6
  const diffToMonday = (day + 6) % 7;
  const start = new Date(d.getTime() - diffToMonday * MS_PER_DAY);
  return toISODate(start);
}

export function summarizeMenopauseByWeek(
  logs: HealthLogs,
  weeksToShow: number = 4
): MenopauseWeeklySummary[] {
  type Acc = {
    sleepHours: number[];
    symptomCounts: Record<string, number>;
    totalLoggedDays: number;
  };

  const accByWeekStart = new Map<string, Acc>();

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "menopause") continue;
    const weekStartISO = getWeekStartISO(dateISO);
    if (!weekStartISO) continue;

    const curr = accByWeekStart.get(weekStartISO) ?? {
      sleepHours: [],
      symptomCounts: {},
      totalLoggedDays: 0,
    };

    const e = entry as MenopauseEntry;
    curr.totalLoggedDays += 1;

    if (e.sleepHours !== null) curr.sleepHours.push(e.sleepHours);
    if (e.symptoms.hotFlashes) curr.symptomCounts["Hot Flashes"] = (curr.symptomCounts["Hot Flashes"] || 0) + 1;
    if (e.symptoms.nightSweats) curr.symptomCounts["Night Sweats"] = (curr.symptomCounts["Night Sweats"] || 0) + 1;
    if (e.symptoms.moodSwings) curr.symptomCounts["Mood Swings"] = (curr.symptomCounts["Mood Swings"] || 0) + 1;
    if (e.symptoms.jointPain) curr.symptomCounts["Joint Pain"] = (curr.symptomCounts["Joint Pain"] || 0) + 1;
    if (e.symptoms.sleepDisturbance) {
      curr.symptomCounts["Sleep Disturbance"] = (curr.symptomCounts["Sleep Disturbance"] || 0) + 1;
    }

    accByWeekStart.set(weekStartISO, curr);
  }

  const summaries: MenopauseWeeklySummary[] = Array.from(accByWeekStart.entries())
    .map(([weekStartISO, a]) => {
      const start = safeParseISODate(weekStartISO);
      const weekEndISO = start ? toISODate(new Date(start.getTime() + MS_PER_DAY * 6)) : weekStartISO;
      const avgSleepHours = a.sleepHours.length ? a.sleepHours.reduce((s, n) => s + n, 0) / a.sleepHours.length : null;
      const topSymptoms = Object.entries(a.symptomCounts)
        .map(([symptom, count]) => ({ symptom, count }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 3);

      return {
        weekStartISO,
        weekEndISO,
        totalLoggedDays: a.totalLoggedDays,
        avgSleepHours: avgSleepHours !== null ? Math.round(avgSleepHours * 10) / 10 : null,
        topSymptoms,
      };
    })
    // Most recent weeks first
    .sort((a, b) => b.weekStartISO.localeCompare(a.weekStartISO))
    .slice(0, Math.max(1, weeksToShow));

  return summaries;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LS_KEY = "ss-health-logs";

function readLS(): HealthLogs {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as HealthLogs) : {};
  } catch {
    return {};
  }
}

function writeLS(logs: HealthLogs) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(logs));
  } catch {}
}

interface HealthLogContextType {
  logs: HealthLogs;
  getLog: (dateISO: string) => HealthLogEntry | undefined;
  saveLog: (dateISO: string, entry: HealthLogEntry) => void;
  saveBulkLogs: (entries: Record<string, HealthLogEntry>) => void;
  deleteLog: (dateISO: string) => void;
  clearAllLogs: () => void;
  logKeySymptom: (dateISO: string, phase: Phase, symptomId: KeySymptomId) => void;
}

const HealthLogContext = createContext<HealthLogContextType>({
  logs: {},
  getLog: () => undefined,
  saveLog: () => {},
  saveBulkLogs: () => {},
  deleteLog: () => {},
  clearAllLogs: () => {},
  logKeySymptom: () => {},
});

export function HealthLogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<HealthLogs>(() => readLS());

  const getLog = useCallback(
    (dateISO: string) => logs[dateISO],
    [logs]
  );

  const saveLog = useCallback((dateISO: string, entry: HealthLogEntry) => {
    setLogs((prev) => {
      const next = { ...prev, [dateISO]: entry };
      writeLS(next);
      return next;
    });
  }, []);

  const saveBulkLogs = useCallback((entries: Record<string, HealthLogEntry>) => {
    setLogs((prev) => {
      const next = { ...prev, ...entries };
      writeLS(next);
      return next;
    });
  }, []);

  const deleteLog = useCallback((dateISO: string) => {
    setLogs((prev) => {
      const next = { ...prev };
      delete next[dateISO];
      writeLS(next);
      return next;
    });
  }, []);

  const clearAllLogs = useCallback(() => {
    setLogs({});
    writeLS({});
  }, []);

  const logKeySymptom = useCallback((dateISO: string, phase: Phase, symptomId: KeySymptomId) => {
    setLogs((prev) => {
      const existing = prev[dateISO];

      const baseForPhase = (): HealthLogEntry => {
        if (phase === "puberty") {
          return {
            phase: "puberty",
            periodStarted: false,
            periodEnded: false,
            flowIntensity: null,
            symptoms: {
              cramps: false,
              fatigue: false,
              moodSwings: false,
              headache: false,
              acne: false,
              breastTenderness: false,
            },
            mood: null,
            sleepHours: null,
            sleepQuality: null,
          };
        }
        if (phase === "maternity") {
          return {
            phase: "maternity",
            fatigueLevel: null,
            hydrationGlasses: null,
            sleepHours: null,
            symptoms: {
              nausea: false,
              dizziness: false,
              swelling: false,
              backPain: false,
              sleepDisturbance: false,
            },
            mood: null,
            sleepQuality: null,
          };
        }
        if (phase === "family-planning") {
          return {
            phase: "family-planning",
            lastPeriodDate: "",
            cycleLength: null,
            symptoms: {
              irregularCycle: false,
              ovulationPain: false,
              moodChanges: false,
              fatigue: false,
              stress: false,
              sleepIssues: false,
            },
            mood: null,
            sleepHours: null,
            sleepQuality: null,
          };
        }
        return {
          phase: "menopause",
          symptoms: {
            hotFlashes: false,
            nightSweats: false,
            moodSwings: false,
            jointPain: false,
            sleepDisturbance: false,
            fatigue: false,
          },
          sleepHours: null,
          sleepQuality: null,
          mood: null,
        };
      };

      const target = existing && existing.phase === phase ? { ...existing } as any : baseForPhase() as any;
      const s = target.symptoms ?? {};
      const setTrue = (key: string) => {
        if (key in s) s[key] = true;
      };
      setTrue(symptomId);
      // Cross-phase aliases for common terms
      if (symptomId === "moodChanges") setTrue("moodSwings");
      if (symptomId === "moodSwings") setTrue("moodChanges");
      if (symptomId === "sleepIssues") setTrue("sleepDisturbance");
      if (symptomId === "sleepDisturbance") setTrue("sleepIssues");

      if (phase === "maternity" && symptomId === "fatigue" && target.fatigueLevel === null) {
        target.fatigueLevel = "Medium";
      }

      target.symptoms = s;
      const next = { ...prev, [dateISO]: target as HealthLogEntry };
      writeLS(next);
      return next;
    });
  }, []);

  return (
    <HealthLogContext.Provider value={{ logs, getLog, saveLog, saveBulkLogs, deleteLog, clearAllLogs, logKeySymptom }}>
      {children}
    </HealthLogContext.Provider>
  );
}

export function useHealthLog() {
  return useContext(HealthLogContext);
}
