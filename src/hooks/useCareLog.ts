/**
 * useCareLog.ts
 *
 * React hook for managing Care Log data in the Family Planning phase.
 * Stores care profile, daily logs, checklists, and weekly check-ins in localStorage.
 * Completely separate from normal symptom/health logs.
 */

import { useState, useCallback, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProcedureType =
  | "hysterectomy"
  | "tubal-ligation"
  | "other-surgery"
  | "prefer-not-to-say";

export type RecoveryStage = "first-week" | "2-6-weeks" | "6-weeks-plus";

export type ConcernId =
  | "pain"
  | "bleeding"
  | "fatigue"
  | "fever"
  | "wound"
  | "swelling"
  | "mood"
  | "sleep"
  | "none";

export interface CareProfile {
  procedureType: ProcedureType;
  procedureDate: string; // YYYY-MM-DD
  concerns: ConcernId[];
  onboardedAt: string; // ISO timestamp
}

export type PainLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface CareLogEntry {
  date: string;
  painLevel: PainLevel;
  bleeding: boolean;
  fever: boolean;
  woundDiscomfort: boolean;
  fatigue: boolean;
  moodChanges: boolean;
  chills: boolean;
  heavyBleeding: boolean;
  severePain: boolean;
  worseningSwelling: boolean;
  foulDischarge: boolean;
  dizziness: boolean;
  notes: string;
  savedAt: string;
}

export interface CareChecklist {
  date: string;
  medicineTaken: boolean;
  hydration: boolean;
  rest: boolean;
  avoidedHeavyLifting: boolean;
  woundChecked: boolean;
  followupDone: boolean;
  savedAt: string;
}

export interface WeeklyCheckIn {
  weekNumber: number;
  date: string;
  painImproving: boolean | null;
  energyImproving: boolean | null;
  unusualSymptoms: boolean | null;
  attendedFollowup: boolean | null;
  emotionallyOkay: boolean | null;
  savedAt: string;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
  profile: "swasthyasakhi_care_profile",
  logs: "swasthyasakhi_care_logs",
  checklists: "swasthyasakhi_care_checklists",
  weeklyCheckIns: "swasthyasakhi_care_weekly",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function computeRecoveryStage(procedureDate: string): RecoveryStage {
  const proc = new Date(procedureDate + "T12:00:00");
  const now = new Date();
  const diffMs = now.getTime() - proc.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "first-week";
  if (diffDays <= 42) return "2-6-weeks";
  return "6-weeks-plus";
}

export function computeDaysSince(procedureDate: string): number {
  const proc = new Date(procedureDate + "T12:00:00");
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - proc.getTime()) / (1000 * 60 * 60 * 24)));
}

const RED_FLAG_FIELDS: (keyof CareLogEntry)[] = [
  "fever",
  "chills",
  "heavyBleeding",
  "severePain",
  "worseningSwelling",
  "foulDischarge",
  "dizziness",
];

export function detectRedFlags(entry: CareLogEntry | null): string[] {
  if (!entry) return [];
  const flags: string[] = [];
  if (entry.fever) flags.push("Fever");
  if (entry.chills) flags.push("Chills");
  if (entry.heavyBleeding) flags.push("Heavy bleeding");
  if (entry.severePain) flags.push("Severe pain");
  if (entry.worseningSwelling) flags.push("Worsening swelling");
  if (entry.foulDischarge) flags.push("Foul-smelling discharge");
  if (entry.dizziness) flags.push("Dizziness or fainting");
  return flags;
}

// ─── Default Entries ──────────────────────────────────────────────────────────

function emptyLogEntry(date: string): CareLogEntry {
  return {
    date,
    painLevel: 0,
    bleeding: false,
    fever: false,
    woundDiscomfort: false,
    fatigue: false,
    moodChanges: false,
    chills: false,
    heavyBleeding: false,
    severePain: false,
    worseningSwelling: false,
    foulDischarge: false,
    dizziness: false,
    notes: "",
    savedAt: "",
  };
}

function emptyChecklist(date: string): CareChecklist {
  return {
    date,
    medicineTaken: false,
    hydration: false,
    rest: false,
    avoidedHeavyLifting: false,
    woundChecked: false,
    followupDone: false,
    savedAt: "",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCareLog() {
  const [profile, setProfile] = useState<CareProfile | null>(
    () => loadJSON<CareProfile | null>(KEYS.profile, null)
  );
  const [logs, setLogs] = useState<Record<string, CareLogEntry>>(
    () => loadJSON(KEYS.logs, {})
  );
  const [checklists, setChecklists] = useState<Record<string, CareChecklist>>(
    () => loadJSON(KEYS.checklists, {})
  );
  const [weeklyCheckIns, setWeeklyCheckIns] = useState<WeeklyCheckIn[]>(
    () => loadJSON(KEYS.weeklyCheckIns, [])
  );

  const isOnboarded = profile !== null;

  // ─── Onboarding ───────────────────────────────────────────────────────

  const completeOnboarding = useCallback(
    (data: Omit<CareProfile, "onboardedAt">) => {
      const newProfile: CareProfile = {
        ...data,
        onboardedAt: new Date().toISOString(),
      };
      setProfile(newProfile);
      saveJSON(KEYS.profile, newProfile);
    },
    []
  );

  const resetProfile = useCallback(() => {
    setProfile(null);
    localStorage.removeItem(KEYS.profile);
  }, []);

  // ─── Recovery info ────────────────────────────────────────────────────

  const recoveryStage = useMemo<RecoveryStage>(
    () => (profile ? computeRecoveryStage(profile.procedureDate) : "first-week"),
    [profile]
  );

  const daysSinceProcedure = useMemo(
    () => (profile ? computeDaysSince(profile.procedureDate) : 0),
    [profile]
  );

  // ─── Daily Log ────────────────────────────────────────────────────────

  const getLog = useCallback(
    (date: string): CareLogEntry => logs[date] ?? emptyLogEntry(date),
    [logs]
  );

  const todayLog = useMemo(() => getLog(todayISO()), [getLog]);

  const saveLog = useCallback(
    (entry: CareLogEntry) => {
      const updated = {
        ...logs,
        [entry.date]: { ...entry, savedAt: new Date().toISOString() },
      };
      setLogs(updated);
      saveJSON(KEYS.logs, updated);
    },
    [logs]
  );

  // ─── Daily Checklist ──────────────────────────────────────────────────

  const getChecklist = useCallback(
    (date: string): CareChecklist => checklists[date] ?? emptyChecklist(date),
    [checklists]
  );

  const todayChecklist = useMemo(() => getChecklist(todayISO()), [getChecklist]);

  const saveChecklist = useCallback(
    (entry: CareChecklist) => {
      const updated = {
        ...checklists,
        [entry.date]: { ...entry, savedAt: new Date().toISOString() },
      };
      setChecklists(updated);
      saveJSON(KEYS.checklists, updated);
    },
    [checklists]
  );

  // ─── Weekly Check-in ──────────────────────────────────────────────────

  const currentWeekNumber = useMemo(
    () => Math.max(1, Math.ceil((daysSinceProcedure + 1) / 7)),
    [daysSinceProcedure]
  );

  const currentWeeklyCheckIn = useMemo(
    () => weeklyCheckIns.find((w) => w.weekNumber === currentWeekNumber) ?? null,
    [weeklyCheckIns, currentWeekNumber]
  );

  const saveWeeklyCheckIn = useCallback(
    (entry: WeeklyCheckIn) => {
      const filtered = weeklyCheckIns.filter(
        (w) => w.weekNumber !== entry.weekNumber
      );
      const updated = [
        ...filtered,
        { ...entry, savedAt: new Date().toISOString() },
      ];
      setWeeklyCheckIns(updated);
      saveJSON(KEYS.weeklyCheckIns, updated);
    },
    [weeklyCheckIns]
  );

  // ─── Red flags ────────────────────────────────────────────────────────

  const hasRedFlags = useMemo(() => detectRedFlags(todayLog).length > 0, [todayLog]);

  return {
    // Profile
    profile,
    isOnboarded,
    completeOnboarding,
    resetProfile,
    // Recovery
    recoveryStage,
    daysSinceProcedure,
    // Daily log
    todayLog,
    getLog,
    saveLog,
    allLogs: logs,
    // Daily checklist
    todayChecklist,
    getChecklist,
    saveChecklist,
    allChecklists: checklists,
    // Weekly
    currentWeekNumber,
    currentWeeklyCheckIn,
    saveWeeklyCheckIn,
    weeklyCheckIns,
    // Alerts
    hasRedFlags,
  };
}
