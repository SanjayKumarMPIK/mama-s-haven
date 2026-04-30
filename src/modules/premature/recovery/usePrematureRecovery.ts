/**
 * usePrematureRecovery.ts
 *
 * React hook for premature baby recovery analytics.
 * Wraps the premature recovery engine with React state management
 * and memoization for performance.
 */

import { useMemo, useState, useCallback } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePrematureBabyWeight, type WeightEntry } from "@/hooks/usePrematureBabyWeight";
import {
  calculatePrematureRecoveryScore,
  getPrematureRecoveryStatus,
  generatePrematureDailyPriorities,
  generatePrematureActivitySuggestions,
  loadPrematureCheckups,
  savePrematureCheckups,
  type PrematureRecoveryScoreBreakdown,
  type PrematureRecoveryStatus,
  type PrematureDailyPriority,
  type PrematureActivitySuggestion,
  type PrematureRecoveryCheckup,
} from "./prematureRecoveryEngine";

export function usePrematureRecovery() {
  const { maternityLogs } = useHealthLog();
  const weightTracker = usePrematureBabyWeight();

  // ─── Recovery Analytics (memoized) ────────────────────────────────────────
  const recoveryBreakdown = useMemo(() => {
    return calculatePrematureRecoveryScore(maternityLogs, weightTracker.entries);
  }, [maternityLogs, weightTracker.entries]);

  const recoveryStatus = useMemo(() => {
    return getPrematureRecoveryStatus(recoveryBreakdown.overall);
  }, [recoveryBreakdown.overall]);

  const dailyPriorities = useMemo(() => {
    return generatePrematureDailyPriorities(recoveryBreakdown);
  }, [recoveryBreakdown]);

  const activitySuggestions = useMemo(() => {
    return generatePrematureActivitySuggestions(recoveryBreakdown);
  }, [recoveryBreakdown]);

  // ─── Checkups State ────────────────────────────────────────────────────────
  const [checkups, setCheckups] = useState<PrematureRecoveryCheckup[]>(() => loadPrematureCheckups());

  const toggleCheckup = useCallback((id: string) => {
    setCheckups(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c);
      savePrematureCheckups(updated);
      return updated;
    });
  }, []);

  const resetCheckups = useCallback(() => {
    const defaultCheckups = loadPrematureCheckups();
    setCheckups(defaultCheckups);
  }, []);

  return {
    // Recovery analytics
    recoveryBreakdown,
    recoveryStatus,
    dailyPriorities,
    activitySuggestions,
    // Checkups
    checkups,
    toggleCheckup,
    resetCheckups,
    // Raw data access
    weightEntries: weightTracker.entries,
  };
}

export type {
  PrematureRecoveryScoreBreakdown,
  PrematureRecoveryStatus,
  PrematureDailyPriority,
  PrematureActivitySuggestion,
  PrematureRecoveryCheckup,
};
