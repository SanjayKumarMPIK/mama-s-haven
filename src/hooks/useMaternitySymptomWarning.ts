import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";
import {
  evaluateMaternitySymptomFrequency,
  shouldShowWarning,
  type SymptomWarning,
} from "@/lib/maternitySymptomFrequency";

const DISMISSED_LS_KEY = "ss-maternity-symptom-warnings-dismissed";
const SESSION_DISMISSED_KEY = "ss-maternity-warning-session-dismissed";
const DOCTOR_ALERTS_KEY = "ss-maternity-doctor-alerts";

export type AlertPriority = "green" | "yellow" | "orange" | "red";
export type AlertStatus = "active" | "reviewed" | "resolved";

export interface DoctorAlert {
  id: string;
  patientName: string;
  symptomName: string | null;
  triggerType: string;
  priority: AlertPriority;
  symptomCount: number;
  consecutiveDays: number;
  timestamp: number;
  maternityPhase: string;
  alertStatus: AlertStatus;
}

function loadDismissedWarnings(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_DISMISSED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveDismissedWarnings(ids: Set<string>) {
  try {
    sessionStorage.setItem(SESSION_DISMISSED_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
}

function loadPersistentDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, number>;
      const now = Date.now();
      const valid = new Set<string>();
      for (const [id, ts] of Object.entries(parsed)) {
        if (now - ts < 24 * 60 * 60 * 1000) {
          valid.add(id);
        }
      }
      return valid;
    }
  } catch {
    /* ignore */
  }
  return new Set();
}

function savePersistentDismissed(ids: Set<string>) {
  try {
    const obj: Record<string, number> = {};
    const now = Date.now();
    for (const id of ids) {
      obj[id] = now;
    }
    localStorage.setItem(DISMISSED_LS_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

function loadDoctorAlerts(): DoctorAlert[] {
  try {
    const raw = localStorage.getItem(DOCTOR_ALERTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

function saveDoctorAlerts(alerts: DoctorAlert[]) {
  try {
    localStorage.setItem(DOCTOR_ALERTS_KEY, JSON.stringify(alerts));
  } catch {
    /* ignore */
  }
}

function getPatientName(fullProfile: unknown): string {
  try {
    const profile = fullProfile as { basic?: { fullName?: string } } | null;
    if (profile?.basic?.fullName) return profile.basic.fullName;
  } catch {
    /* ignore */
  }
  return "Patient";
}

export interface UseMaternitySymptomWarningReturn {
  activeWarning: SymptomWarning | null;
  visible: boolean;
  hasAnyWarning: boolean;
  dismissWarning: () => void;
  dismissAll: () => void;
  sendDoctorAlert: () => void;
  ignoreWarning: () => void;
  isHighRisk: boolean;
}

export function useMaternitySymptomWarning(): UseMaternitySymptomWarningReturn {
  const { phase } = usePhase();
  const { maternityLogs } = useHealthLog();
  const { fullProfile } = useAuth();

  const [dismissed, setDismissed] = useState<Set<string>>(() => {
    const session = loadDismissedWarnings();
    const persistent = loadPersistentDismissed();
    return new Set([...session, ...persistent]);
  });

  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  const warnings = useMemo(() => {
    if (phase !== "maternity") return [];
    return evaluateMaternitySymptomFrequency(maternityLogs);
  }, [maternityLogs, phase]);

  const activeWarning = useMemo(() => {
    return shouldShowWarning(warnings, dismissed);
  }, [warnings, dismissed]);

  const isHighRisk = activeWarning?.isHighRisk === true;

  useEffect(() => {
    const isVisible = visibleRef.current;

    if (activeWarning && !isVisible) {
      showTimerRef.current = setTimeout(() => {
        setVisible(true);
      }, 800);
    }

    if (!activeWarning && isVisible) {
      setVisible(false);
    }

    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };
  }, [activeWarning]);

  const hasAnyWarning = warnings.length > 0;

  const dismissWarning = useCallback(() => {
    setVisible(false);
    setDismissed((prev) => {
      const next = new Set(prev);
      if (activeWarning) {
        next.add(activeWarning.warningId);
      }
      saveDismissedWarnings(next);
      savePersistentDismissed(next);
      return next;
    });
  }, [activeWarning]);

  const dismissAll = useCallback(() => {
    setVisible(false);
    setDismissed((prev) => {
      const next = new Set(prev);
      for (const w of warnings) {
        next.add(w.warningId);
      }
      saveDismissedWarnings(next);
      savePersistentDismissed(next);
      return next;
    });
  }, [warnings]);

  const ignoreWarning = useCallback(() => {
    setVisible(false);
    setDismissed((prev) => {
      const next = new Set(prev);
      if (activeWarning) {
        next.add(activeWarning.warningId);
      }
      saveDismissedWarnings(next);
      return next;
    });
  }, [activeWarning]);

  const sendDoctorAlert = useCallback(() => {
    if (!activeWarning) return;

    const patientName = getPatientName(fullProfile);
    const triggerTypeMap: Record<string, string> = {
      "consecutive-3": "consecutive_symptoms",
      "consecutive-4": "consecutive_symptoms",
      "within-7d-4": "weekly_frequency",
      "weekly-5": "weekly_frequency",
      "within-30d-10": "monthly_frequency",
      "monthly-15": "monthly_frequency",
      "high-risk-25": "high_risk_monthly_frequency",
    };

    const priorityMap: Record<string, AlertPriority> = {
      "consecutive-3": "green",
      "consecutive-4": "green",
      "within-7d-4": "yellow",
      "weekly-5": "yellow",
      "within-30d-10": "orange",
      "monthly-15": "orange",
      "high-risk-25": "red",
    };

    const mappedTrigger = triggerTypeMap[activeWarning.triggerType] ?? activeWarning.triggerType;
    const priority = priorityMap[activeWarning.triggerType] ?? "green";
    const now = Date.now();
    const id = `ALT-${now}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const alert: DoctorAlert = {
      id,
      patientName,
      symptomName: activeWarning.symptomId !== "_overall" ? activeWarning.symptomName : null,
      triggerType: mappedTrigger,
      priority,
      symptomCount: activeWarning.count,
      consecutiveDays: activeWarning.windowDays,
      timestamp: now,
      maternityPhase: phase,
      alertStatus: "active",
    };

    const alerts = loadDoctorAlerts();
    alerts.push(alert);
    saveDoctorAlerts(alerts);

    setVisible(false);
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(activeWarning.warningId);
      saveDismissedWarnings(next);
      return next;
    });
  }, [activeWarning, fullProfile, phase]);

  return {
    activeWarning,
    visible,
    hasAnyWarning,
    dismissWarning,
    dismissAll,
    sendDoctorAlert,
    ignoreWarning,
    isHighRisk,
  };
}
