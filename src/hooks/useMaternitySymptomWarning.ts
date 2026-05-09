import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import {
  evaluateMaternitySymptomFrequency,
  shouldShowWarning,
  type SymptomWarning,
} from "@/lib/maternitySymptomFrequency";

const DISMISSED_LS_KEY = "ss-maternity-symptom-warnings-dismissed";
const SESSION_DISMISSED_KEY = "ss-maternity-warning-session-dismissed";

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

export interface UseMaternitySymptomWarningReturn {
  activeWarning: SymptomWarning | null;
  visible: boolean;
  hasAnyWarning: boolean;
  dismissWarning: () => void;
  dismissAll: () => void;
}

export function useMaternitySymptomWarning(): UseMaternitySymptomWarningReturn {
  const { phase } = usePhase();
  const { maternityLogs } = useHealthLog();

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

  return {
    activeWarning,
    visible,
    hasAnyWarning,
    dismissWarning,
    dismissAll,
  };
}
