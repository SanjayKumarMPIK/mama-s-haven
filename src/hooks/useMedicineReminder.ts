import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  scheduledTimes: string[]; // HH:mm
  notes: string;
  createdAt: string;
  isActive: boolean;
}

export type DoseStatus = "scheduled" | "pending" | "taken" | "missed" | "snoozed";

export interface DoseLog {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;   // HH:mm
  scheduledDate: string;   // YYYY-MM-DD
  status: DoseStatus;
  actionTimestamp: string | null;
  snoozeUntil: string | null;
  snoozeCount: number;
}

export interface TodayStats {
  taken: number;
  missed: number;
  snoozed: number;
  pending: number;
  scheduled: number;
  total: number;
}

export interface NextDoseInfo {
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  minutesUntil: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const MEDICINES_KEY = "maternity-medicines";
const DOSE_LOGS_KEY = "maternity-dose-logs";
const CHECK_INTERVAL_MS = 15_000;   // check every 15 seconds (more responsive)
const MISSED_WINDOW_MIN = 60;       // auto-miss after 60 minutes
const MAX_SNOOZE_COUNT = 3;
const TRIGGER_WINDOW_MIN = 1;       // activate 1 min before scheduled time

// ─── Helpers ────────────────────────────────────────────────────────────────────

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* quota errors — degrade gracefully */ }
}

function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Notification helpers ───────────────────────────────────────────────────────

function canNotify(): boolean {
  return "Notification" in window && Notification.permission === "granted";
}

function fireNotification(title: string, body: string): void {
  if (!canNotify()) return;
  try {
    new Notification(title, {
      body,
      icon: "💊",
      badge: "💊",
      tag: `med-${Date.now()}`,
      requireInteraction: true,
    });
  } catch { /* mobile / restricted environments */ }
}

// ─── In-App Alert Sound ─────────────────────────────────────────────────────────

function playReminderSound(): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15); // G5
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.3); // B5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* audio not available */ }
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useMedicineReminder() {
  const [medicines, setMedicines] = useState<Medicine[]>(() => loadJson(MEDICINES_KEY, []));
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>(() => loadJson(DOSE_LOGS_KEY, []));
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  // In-app alert state - the most recent dose that just became due
  const [activeAlert, setActiveAlert] = useState<DoseLog | null>(null);

  // Refs to avoid stale closures in setInterval
  const medsRef = useRef(medicines);
  const logsRef = useRef(doseLogs);
  // Track which notifications we already fired in this session to prevent duplicates
  const firedRef = useRef<Set<string>>(new Set());
  // Track last day we generated logs for
  const lastDayRef = useRef<string>("");

  useEffect(() => { medsRef.current = medicines; }, [medicines]);
  useEffect(() => { logsRef.current = doseLogs; }, [doseLogs]);

  // Persist on change
  useEffect(() => { saveJson(MEDICINES_KEY, medicines); }, [medicines]);
  useEffect(() => { saveJson(DOSE_LOGS_KEY, doseLogs); }, [doseLogs]);

  // ── Notification permission ─────────────────────────────────────────────────
  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationPermission(perm);
  }, []);

  // ── Generate today's dose logs upfront ──────────────────────────────────────
  const ensureTodayLogs = useCallback(() => {
    const today = todayStr();
    const currentMeds = medsRef.current.filter((m) => m.isActive);
    let currentLogs = [...logsRef.current];
    let changed = false;

    for (const med of currentMeds) {
      for (const time of med.scheduledTimes) {
        const exists = currentLogs.find(
          (l) => l.medicineId === med.id && l.scheduledDate === today && l.scheduledTime === time
        );
        if (!exists) {
          currentLogs.push({
            id: uid(),
            medicineId: med.id,
            medicineName: med.name,
            dosage: med.dosage,
            scheduledTime: time,
            scheduledDate: today,
            status: "scheduled",
            actionTimestamp: null,
            snoozeUntil: null,
            snoozeCount: 0,
          });
          changed = true;
        }
      }
    }

    if (changed) {
      setDoseLogs(currentLogs);
    }
  }, []);

  // ── Medicine CRUD ───────────────────────────────────────────────────────────
  const addMedicine = useCallback((med: Omit<Medicine, "id" | "createdAt" | "isActive">) => {
    const newMed: Medicine = {
      ...med,
      id: uid(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    setMedicines((prev) => [...prev, newMed]);

    // Immediately create today's logs for this new medicine
    const today = todayStr();
    const newLogs: DoseLog[] = med.scheduledTimes.map((time) => ({
      id: uid(),
      medicineId: newMed.id,
      medicineName: newMed.name,
      dosage: newMed.dosage,
      scheduledTime: time,
      scheduledDate: today,
      status: "scheduled" as const,
      actionTimestamp: null,
      snoozeUntil: null,
      snoozeCount: 0,
    }));
    setDoseLogs((prev) => [...prev, ...newLogs]);

    return newMed;
  }, []);

  const editMedicine = useCallback((id: string, updates: { name?: string; dosage?: string; scheduledTimes?: string[]; notes?: string }) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    // Update today's pending/scheduled logs to reflect name/dosage changes
    const today = todayStr();
    if (updates.name || updates.dosage) {
      setDoseLogs((prev) =>
        prev.map((l) => {
          if (l.medicineId === id && l.scheduledDate === today && (l.status === "scheduled" || l.status === "pending")) {
            return {
              ...l,
              ...(updates.name ? { medicineName: updates.name } : {}),
              ...(updates.dosage ? { dosage: updates.dosage } : {}),
            };
          }
          return l;
        })
      );
    }

    // If scheduled times changed, reconstruct today's logs for this medicine
    if (updates.scheduledTimes) {
      setDoseLogs((prev) => {
        const withoutOldScheduled = prev.filter(
          (l) => !(l.medicineId === id && l.scheduledDate === today && (l.status === "scheduled" || l.status === "pending"))
        );
        const med = medsRef.current.find((m) => m.id === id);
        const newLogs = updates.scheduledTimes!.map((time) => ({
          id: uid(),
          medicineId: id,
          medicineName: updates.name || med?.name || "",
          dosage: updates.dosage || med?.dosage || "",
          scheduledTime: time,
          scheduledDate: today,
          status: "scheduled" as const,
          actionTimestamp: null as string | null,
          snoozeUntil: null as string | null,
          snoozeCount: 0,
        }));
        return [...withoutOldScheduled, ...newLogs];
      });
    }
  }, []);

  const toggleMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setMedicines((prev) => prev.filter((m) => m.id !== id));
    // Remove future pending/scheduled logs for this medicine
    setDoseLogs((prev) =>
      prev.filter((l) => !(l.medicineId === id && (l.status === "pending" || l.status === "scheduled") && l.scheduledDate >= todayStr()))
    );
  }, []);

  // ── Dose actions ────────────────────────────────────────────────────────────
  const markAsTaken = useCallback((logId: string) => {
    setDoseLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, status: "taken" as const, actionTimestamp: new Date().toISOString(), snoozeUntil: null }
          : l
      )
    );
    // Clear alert if it was for this dose
    setActiveAlert((prev) => (prev?.id === logId ? null : prev));
  }, []);

  const snoozeDose = useCallback((logId: string, minutes: number) => {
    setDoseLogs((prev) =>
      prev.map((l) => {
        if (l.id !== logId) return l;
        if (l.snoozeCount >= MAX_SNOOZE_COUNT) return { ...l, status: "missed" as const, actionTimestamp: new Date().toISOString() };
        const until = new Date(Date.now() + minutes * 60_000).toISOString();
        return {
          ...l,
          status: "snoozed" as const,
          snoozeUntil: until,
          snoozeCount: l.snoozeCount + 1,
          actionTimestamp: new Date().toISOString(),
        };
      })
    );
    setActiveAlert((prev) => (prev?.id === logId ? null : prev));
  }, []);

  const markAsMissed = useCallback((logId: string) => {
    setDoseLogs((prev) =>
      prev.map((l) =>
        l.id === logId
          ? { ...l, status: "missed" as const, actionTimestamp: new Date().toISOString(), snoozeUntil: null }
          : l
      )
    );
    setActiveAlert((prev) => (prev?.id === logId ? null : prev));
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  // ── Scheduler ───────────────────────────────────────────────────────────────
  const runScheduleCheck = useCallback(() => {
    const today = todayStr();
    const now = nowHHMM();
    const nowMinutes = hhmmToMinutes(now);
    let currentLogs = [...logsRef.current];
    let changed = false;

    // Day rollover: regenerate today's logs if new day
    if (lastDayRef.current !== today) {
      lastDayRef.current = today;
      firedRef.current.clear();
      // ensureTodayLogs will be called separately
    }

    for (const log of currentLogs) {
      if (log.scheduledDate !== today) continue;

      const scheduledMinutes = hhmmToMinutes(log.scheduledTime);
      const diff = nowMinutes - scheduledMinutes; // positive = past due

      // Activate: scheduled → pending when time arrives (within 1 min before)
      if (log.status === "scheduled" && diff >= -TRIGGER_WINDOW_MIN) {
        const logKey = `${log.medicineId}_${today}_${log.scheduledTime}`;
        currentLogs = currentLogs.map((l) =>
          l.id === log.id ? { ...l, status: "pending" as const } : l
        );
        changed = true;

        // Fire notification (deduplicated)
        if (!firedRef.current.has(logKey)) {
          firedRef.current.add(logKey);
          fireNotification(
            `💊 Time for ${log.medicineName}`,
            `Take ${log.dosage} of ${log.medicineName} (scheduled ${log.scheduledTime})`
          );
          playReminderSound();
          // Set in-app alert
          setActiveAlert({ ...log, status: "pending" });
        }
      }

      // Re-fire notification for snoozed doses whose snooze expired
      if (log.status === "snoozed" && log.snoozeUntil) {
        const snoozeEnd = new Date(log.snoozeUntil).getTime();
        const snoozeKey = `${log.medicineId}_${today}_${log.scheduledTime}_snooze_${log.snoozeCount}`;
        if (Date.now() >= snoozeEnd && !firedRef.current.has(snoozeKey)) {
          firedRef.current.add(snoozeKey);
          currentLogs = currentLogs.map((l) =>
            l.id === log.id ? { ...l, status: "pending" as const, snoozeUntil: null } : l
          );
          changed = true;
          fireNotification(
            `⏰ Reminder: ${log.medicineName}`,
            `Snooze ended — take ${log.dosage} of ${log.medicineName} now`
          );
          playReminderSound();
          setActiveAlert({ ...log, status: "pending", snoozeUntil: null });
        }
      }

      // Auto-miss if pending and past the missed window
      if (log.status === "pending" && diff > MISSED_WINDOW_MIN) {
        currentLogs = currentLogs.map((l) =>
          l.id === log.id
            ? { ...l, status: "missed" as const, actionTimestamp: new Date().toISOString(), snoozeUntil: null }
            : l
        );
        changed = true;
      }

      // Auto-miss scheduled doses that were never activated (far past)
      if (log.status === "scheduled" && diff > MISSED_WINDOW_MIN) {
        currentLogs = currentLogs.map((l) =>
          l.id === log.id
            ? { ...l, status: "missed" as const, actionTimestamp: new Date().toISOString() }
            : l
        );
        changed = true;
      }
    }

    if (changed) {
      setDoseLogs(currentLogs);
    }
  }, []);

  // Run scheduler on mount + interval; also generate today's logs
  useEffect(() => {
    ensureTodayLogs();
    runScheduleCheck();
    const id = setInterval(runScheduleCheck, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [runScheduleCheck, ensureTodayLogs]);

  // Re-create logs when medicines change
  useEffect(() => {
    ensureTodayLogs();
  }, [medicines, ensureTodayLogs]);

  // ── Query helpers ───────────────────────────────────────────────────────────
  const getTodayLogs = useCallback((): DoseLog[] => {
    const today = todayStr();
    return doseLogs
      .filter((l) => l.scheduledDate === today)
      .sort((a, b) => hhmmToMinutes(a.scheduledTime) - hhmmToMinutes(b.scheduledTime));
  }, [doseLogs]);

  const getTodayStats = useCallback((): TodayStats => {
    const logs = getTodayLogs();
    return {
      taken: logs.filter((l) => l.status === "taken").length,
      missed: logs.filter((l) => l.status === "missed").length,
      snoozed: logs.filter((l) => l.status === "snoozed").length,
      pending: logs.filter((l) => l.status === "pending").length,
      scheduled: logs.filter((l) => l.status === "scheduled").length,
      total: logs.length,
    };
  }, [getTodayLogs]);

  const getNextDose = useCallback((): NextDoseInfo | null => {
    const today = todayStr();
    const nowMin = hhmmToMinutes(nowHHMM());
    const upcomingLogs = doseLogs
      .filter((l) => l.scheduledDate === today && (l.status === "scheduled" || l.status === "pending"))
      .sort((a, b) => hhmmToMinutes(a.scheduledTime) - hhmmToMinutes(b.scheduledTime));

    for (const log of upcomingLogs) {
      const mins = hhmmToMinutes(log.scheduledTime);
      if (mins >= nowMin || log.status === "pending") {
        return {
          medicineName: log.medicineName,
          dosage: log.dosage,
          scheduledTime: log.scheduledTime,
          minutesUntil: Math.max(0, mins - nowMin),
        };
      }
    }
    return null;
  }, [doseLogs]);

  const getHistory = useCallback((days: number = 7): DoseLog[] => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return doseLogs
      .filter((l) => l.scheduledDate >= cutoffStr && l.status !== "scheduled")
      .sort((a, b) => {
        const dateCompare = b.scheduledDate.localeCompare(a.scheduledDate);
        if (dateCompare !== 0) return dateCompare;
        return hhmmToMinutes(b.scheduledTime) - hhmmToMinutes(a.scheduledTime);
      });
  }, [doseLogs]);

  const getAdherenceRate = useCallback((days: number = 7): number => {
    const history = getHistory(days);
    const completed = history.filter((l) => l.status === "taken" || l.status === "missed");
    if (completed.length === 0) return 100;
    const taken = completed.filter((l) => l.status === "taken").length;
    return Math.round((taken / completed.length) * 100);
  }, [getHistory]);

  return {
    // State
    medicines,
    doseLogs,
    notificationPermission,
    activeAlert,
    // Medicine CRUD
    addMedicine,
    editMedicine,
    toggleMedicine,
    deleteMedicine,
    // Dose actions
    markAsTaken,
    snoozeDose,
    markAsMissed,
    dismissAlert,
    // Queries
    getTodayLogs,
    getTodayStats,
    getNextDose,
    getHistory,
    getAdherenceRate,
    // Notifications
    requestNotificationPermission,
    // Constants
    MAX_SNOOZE_COUNT,
  };
}
