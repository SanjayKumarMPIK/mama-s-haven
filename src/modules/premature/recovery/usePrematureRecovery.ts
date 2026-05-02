/**
 * usePrematureRecovery.ts
 *
 * React hook for premature baby recovery analytics.
 * Wraps the inference-based recovery engine with React state management
 * and memoization for performance. Recalculates only on calendar changes.
 */

import { useMemo, useState, useCallback } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { usePrematureBabyWeight, type WeightEntry } from "@/hooks/usePrematureBabyWeight";
import { useMedicineReminder } from "@/hooks/useMedicineReminder";
import {
  calculatePrematureRecoveryScore,
  getPrematureRecoveryStatus,
  generatePrematureDailyPriorities,
  generatePrematureActivitySuggestions,
  loadPrematureCheckups,
  savePrematureCheckups,
  SIGNAL_META,
  type PrematureRecoveryScoreBreakdown,
  type PrematureRecoveryStatus,
  type PrematureDailyPriority,
  type PrematureActivitySuggestion,
  type PrematureRecoveryCheckup,
  type SignalMeta,
} from "./prematureRecoveryEngine";
import {
  getPrematureRecoveryTimeline,
  getCurrentPhase,
  type PrematureTimelinePhase,
} from "./prematureRecoveryTimeline";

export function usePrematureRecovery(weeksPostDelivery: number = 0) {
  const { maternityLogs } = useHealthLog();
  const { profile } = usePregnancyProfile();
  const weightTracker = usePrematureBabyWeight();
  const { getAdherenceRate, medicines } = useMedicineReminder();

  const deliveryDateISO = profile.delivery?.birthDate || new Date().toISOString().split("T")[0];

  // ─── Medicine Adherence (memoized) ─────────────────────────────────────────
  const medicineAdherence = useMemo(() => {
    // If no medicines are tracked, return -1 to signal "not applicable"
    if (medicines.length === 0) return -1;
    return getAdherenceRate(7);
  }, [medicines, getAdherenceRate]);

  // ─── Recovery Analytics (memoized, recalculates on log changes) ────────────
  const recoveryBreakdown = useMemo(() => {
    return calculatePrematureRecoveryScore(maternityLogs, weightTracker.entries, deliveryDateISO, medicineAdherence);
  }, [maternityLogs, weightTracker.entries, deliveryDateISO, medicineAdherence]);

  const recoveryStatus = useMemo(() => {
    return getPrematureRecoveryStatus(recoveryBreakdown.overall);
  }, [recoveryBreakdown.overall]);

  const dailyPriorities = useMemo(() => {
    return generatePrematureDailyPriorities(recoveryBreakdown);
  }, [recoveryBreakdown]);

  const activitySuggestions = useMemo(() => {
    return generatePrematureActivitySuggestions(recoveryBreakdown);
  }, [recoveryBreakdown]);

  // ─── Adaptive Timeline (memoized) ─────────────────────────────────────────
  const timelinePhases = useMemo(() => {
    return getPrematureRecoveryTimeline(weeksPostDelivery, recoveryBreakdown.overall);
  }, [weeksPostDelivery, recoveryBreakdown.overall]);

  const currentPhase = useMemo(() => {
    return getCurrentPhase(timelinePhases);
  }, [timelinePhases]);

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
    // Signal metadata for UI display
    signalMeta: SIGNAL_META,
    // Adaptive timeline
    timelinePhases,
    currentPhase,
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
  PrematureTimelinePhase,
  SignalMeta,
};
