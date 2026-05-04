// ─── Smart Maternal Test Recommendation Reminder System ──────────────────────
// Reusable hook that powers the recommendation engine, reminder scheduling,
// and state persistence for maternal tests/scans.

import { useState, useEffect, useCallback, useMemo } from "react";
import { MATERNAL_TESTS, type MaternalTest } from "@/lib/maternalTestsData";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { usePhase } from "@/hooks/usePhase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MaternalTestReminder {
  id: string;
  testId: string;
  reminderDate: string; // YYYY-MM-DD
  ignored: boolean;
  completed: boolean;
  snoozedUntil?: string; // YYYY-MM-DD
  createdAt: string; // YYYY-MM-DD
}

export interface MaternalTestReminderState {
  ignoredTests: string[];
  reminders: MaternalTestReminder[];
  completedTests: string[];
  popupHistory: Record<string, string>; // testId -> last shown ISO date
  dismissedRecommendations: string[]; // testId[] — permanently dismissed
}

export type TestReminderStatus =
  | "recommended"
  | "reminder-set"
  | "ignored"
  | "completed"
  | "due-soon"
  | "due-today"
  | "upcoming"
  | "past";

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "mh-maternal-test-reminders";
const SNOOZE_DAYS = 5;

// High-priority tests that appear stronger visually
export const HIGH_PRIORITY_TESTS = [
  "gtt",
  "anomaly-scan",
  "nt-scan",
  "dating-scan",
  "growth-scan",
  "growth-scan-doppler",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysToISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Calculate the actual date range for a test window based on LMP */
export function getTestDateRange(
  lmp: string,
  weekStart: number,
  weekEnd: number
): { startDate: string; endDate: string } {
  const startDate = addDaysToISO(lmp, weekStart * 7);
  const endDate = addDaysToISO(lmp, weekEnd * 7 + 6); // end of the week
  return { startDate, endDate };
}

/** Get category icon emoji */
export function getTestCategoryEmoji(category: string): string {
  switch (category) {
    case "Blood Test":
      return "🩸";
    case "Scan":
      return "📷";
    case "Vaccine":
      return "💉";
    case "Genetic Screening":
      return "🧬";
    case "Monitoring":
      return "📊";
    default:
      return "🏥";
  }
}

// ─── Storage ─────────────────────────────────────────────────────────────────

const DEFAULT_STATE: MaternalTestReminderState = {
  ignoredTests: [],
  reminders: [],
  completedTests: [],
  popupHistory: {},
  dismissedRecommendations: [],
};

function loadState(): MaternalTestReminderState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ignoredTests: Array.isArray(parsed.ignoredTests) ? parsed.ignoredTests : [],
        reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
        completedTests: Array.isArray(parsed.completedTests) ? parsed.completedTests : [],
        popupHistory: parsed.popupHistory && typeof parsed.popupHistory === "object" ? parsed.popupHistory : {},
        dismissedRecommendations: Array.isArray(parsed.dismissedRecommendations)
          ? parsed.dismissedRecommendations
          : [],
      };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_STATE };
}

function saveState(state: MaternalTestReminderState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// ─── Recommendation Engine ───────────────────────────────────────────────────

/**
 * Determines if a recommendation popup should be shown for a given test.
 */
function shouldShowRecommendation(
  currentWeek: number,
  test: MaternalTest,
  state: MaternalTestReminderState,
  today: string
): boolean {
  // Test is not yet in window
  if (currentWeek < test.weekStart) return false;

  // Test window has passed
  if (currentWeek > test.weekEnd + 2) return false;

  // Already permanently dismissed / ignored
  if (state.ignoredTests.includes(test.id)) return false;
  if (state.dismissedRecommendations.includes(test.id)) return false;

  // Already completed
  if (state.completedTests.includes(test.id)) return false;

  // Has a scheduled reminder
  const reminder = state.reminders.find((r) => r.testId === test.id && !r.completed && !r.ignored);
  if (reminder) {
    // Only show if the reminder date is today
    return reminder.reminderDate === today;
  }

  // Check snooze
  const snoozedReminder = state.reminders.find(
    (r) => r.testId === test.id && r.snoozedUntil && !r.completed && !r.ignored
  );
  if (snoozedReminder && snoozedReminder.snoozedUntil) {
    return today >= snoozedReminder.snoozedUntil;
  }

  // Already shown today?
  const lastShown = state.popupHistory[test.id];
  if (lastShown === today) return false;

  // In window and not handled — show it
  return currentWeek >= test.weekStart;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMaternalTestReminders() {
  const { phase } = usePhase();
  const { profile, gestationalWeek, activeEDD, mode } = usePregnancyProfile();
  const [state, setState] = useState<MaternalTestReminderState>(loadState);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  const today = useMemo(() => todayISO(), []);
  const lmp = profile.lmp;

  // ─── Active recommendation (first eligible test to show popup for) ─────
  const activeRecommendation = useMemo<MaternalTest | null>(() => {
    if (phase !== "maternity" || !profile.isSetup || !lmp || mode !== "pregnancy") return null;

    // Sort by priority (high priority first, then by weekStart)
    const sorted = [...MATERNAL_TESTS].sort((a, b) => {
      const aPriority = HIGH_PRIORITY_TESTS.includes(a.id) ? 0 : 1;
      const bPriority = HIGH_PRIORITY_TESTS.includes(b.id) ? 0 : 1;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return a.weekStart - b.weekStart;
    });

    for (const test of sorted) {
      if (shouldShowRecommendation(gestationalWeek, test, state, today)) {
        return test;
      }
    }
    return null;
  }, [phase, profile.isSetup, lmp, mode, gestationalWeek, state, today]);

  // ─── Scheduled reminder that's due today ───────────────────────────────
  const dueReminder = useMemo<MaternalTestReminder | null>(() => {
    if (phase !== "maternity" || !profile.isSetup) return null;
    return (
      state.reminders.find(
        (r) =>
          r.reminderDate === today &&
          !r.completed &&
          !r.ignored &&
          !state.completedTests.includes(r.testId) &&
          !state.ignoredTests.includes(r.testId)
      ) || null
    );
  }, [phase, profile.isSetup, state.reminders, state.completedTests, state.ignoredTests, today]);

  // ─── Get the test for a reminder ───────────────────────────────────────
  const getTestForReminder = useCallback((reminder: MaternalTestReminder): MaternalTest | undefined => {
    return MATERNAL_TESTS.find((t) => t.id === reminder.testId);
  }, []);

  // ─── Get test date range ───────────────────────────────────────────────
  const getDateRange = useCallback(
    (test: MaternalTest): { startDate: string; endDate: string } | null => {
      if (!lmp) return null;
      return getTestDateRange(lmp, test.weekStart, test.weekEnd);
    },
    [lmp]
  );

  // ─── Actions ───────────────────────────────────────────────────────────

  /** Permanently ignore a test recommendation */
  const ignoreTest = useCallback((testId: string) => {
    setState((prev) => ({
      ...prev,
      ignoredTests: [...new Set([...prev.ignoredTests, testId])],
      dismissedRecommendations: [...new Set([...prev.dismissedRecommendations, testId])],
      popupHistory: { ...prev.popupHistory, [testId]: todayISO() },
    }));
  }, []);

  /** Snooze a test recommendation (remind later in 5 days) */
  const remindLater = useCallback((testId: string) => {
    const now = todayISO();
    const snoozedUntil = addDaysToISO(now, SNOOZE_DAYS);
    setState((prev) => {
      // Remove any existing non-completed reminder for this test
      const filtered = prev.reminders.filter((r) => r.testId !== testId || r.completed);
      return {
        ...prev,
        reminders: [
          ...filtered,
          {
            id: `${testId}-snooze-${Date.now()}`,
            testId,
            reminderDate: snoozedUntil,
            ignored: false,
            completed: false,
            snoozedUntil,
            createdAt: now,
          },
        ],
        popupHistory: { ...prev.popupHistory, [testId]: now },
      };
    });
  }, []);

  /** Schedule a reminder on a specific date */
  const scheduleReminder = useCallback((testId: string, date: string) => {
    const now = todayISO();
    setState((prev) => {
      // Remove any existing non-completed reminder for this test
      const filtered = prev.reminders.filter((r) => r.testId !== testId || r.completed);
      return {
        ...prev,
        reminders: [
          ...filtered,
          {
            id: `${testId}-reminder-${Date.now()}`,
            testId,
            reminderDate: date,
            ignored: false,
            completed: false,
            createdAt: now,
          },
        ],
        popupHistory: { ...prev.popupHistory, [testId]: now },
      };
    });
  }, []);

  /** Mark a test as completed */
  const completeTest = useCallback((testId: string) => {
    setState((prev) => ({
      ...prev,
      completedTests: [...new Set([...prev.completedTests, testId])],
      reminders: prev.reminders.map((r) => (r.testId === testId ? { ...r, completed: true } : r)),
      popupHistory: { ...prev.popupHistory, [testId]: todayISO() },
    }));
  }, []);

  /** Reschedule an existing reminder */
  const rescheduleReminder = useCallback((testId: string, newDate: string) => {
    setState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.testId === testId && !r.completed
          ? { ...r, reminderDate: newDate, snoozedUntil: undefined }
          : r
      ),
    }));
  }, []);

  /** Mark popup as shown today for a test */
  const markPopupShown = useCallback((testId: string) => {
    setState((prev) => ({
      ...prev,
      popupHistory: { ...prev.popupHistory, [testId]: todayISO() },
    }));
  }, []);

  /** Mark ALL currently eligible tests as shown today — prevents cascading popups */
  const markAllEligibleShown = useCallback(() => {
    if (mode !== "pregnancy") return;
    const now = todayISO();
    setState((prev) => {
      const updatedHistory = { ...prev.popupHistory };
      for (const test of MATERNAL_TESTS) {
        if (
          gestationalWeek >= test.weekStart &&
          gestationalWeek <= test.weekEnd + 2 &&
          !prev.ignoredTests.includes(test.id) &&
          !prev.completedTests.includes(test.id) &&
          !prev.dismissedRecommendations.includes(test.id)
        ) {
          updatedHistory[test.id] = now;
        }
      }
      return { ...prev, popupHistory: updatedHistory };
    });
  }, [gestationalWeek, mode]);

  // ─── Status for each test ──────────────────────────────────────────────

  const getTestStatus = useCallback(
    (test: MaternalTest): TestReminderStatus => {
      if (state.completedTests.includes(test.id)) return "completed";
      if (state.ignoredTests.includes(test.id)) return "ignored";

      const reminder = state.reminders.find((r) => r.testId === test.id && !r.completed && !r.ignored);
      if (reminder) {
        if (reminder.reminderDate === today) return "due-today";
        if (reminder.reminderDate <= addDaysToISO(today, 3)) return "due-soon";
        return "reminder-set";
      }

      if (mode !== "pregnancy") return "past";

      if (gestationalWeek >= test.weekStart && gestationalWeek <= test.weekEnd) return "recommended";
      if (gestationalWeek > test.weekEnd) return "past";
      return "upcoming";
    },
    [state, today, gestationalWeek, mode],
  );

  // ─── Get reminder for a specific test ──────────────────────────────────

  const getReminderForTest = useCallback(
    (testId: string): MaternalTestReminder | undefined => {
      return state.reminders.find((r) => r.testId === testId && !r.completed && !r.ignored);
    },
    [state.reminders]
  );

  // ─── Get all reminders for calendar display ────────────────────────────

  const calendarReminders = useMemo(() => {
    return state.reminders.filter((r) => !r.completed && !r.ignored);
  }, [state.reminders]);

  // ─── Get all tests with their statuses ─────────────────────────────────

  const testsWithStatus = useMemo(() => {
    return MATERNAL_TESTS.map((test) => ({
      ...test,
      status: getTestStatus(test),
      reminder: getReminderForTest(test.id),
      isHighPriority: HIGH_PRIORITY_TESTS.includes(test.id),
    }));
  }, [getTestStatus, getReminderForTest]);

  return {
    // State
    state,
    activeRecommendation,
    dueReminder,
    calendarReminders,
    testsWithStatus,

    // Actions
    ignoreTest,
    remindLater,
    scheduleReminder,
    completeTest,
    rescheduleReminder,
    markPopupShown,
    markAllEligibleShown,
    getTestForReminder,
    getDateRange,
    getTestStatus,
    getReminderForTest,

    // Context (gestational week for antenatal test windows)
    currentWeek: gestationalWeek,
    lmp,
    today,
    isMaternity: phase === "maternity" && profile.isSetup,
  };
}
