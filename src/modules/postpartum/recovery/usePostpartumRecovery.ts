import { useState, useMemo, useEffect } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { getPostpartumNormalizedMetricsForWeek } from "./postpartumRecoveryAdapter";
import { calculatePostpartumRecoveryScore } from "./postpartumRecoveryEngine";
import { postpartumMilestones, getMilestoneForWeek } from "./postpartumMilestoneConfig";

export function usePostpartumRecovery() {
  const { maternityLogs } = useHealthLog();
  const { profile } = usePregnancyProfile();

  // If no delivery date exists (edge case), default to today
  const deliveryDateISO = profile.delivery?.birthDate || new Date().toISOString().split("T")[0];

  // Calculate true current postpartum week based on delivery date
  const currentWeek = useMemo(() => {
    const delivery = new Date(deliveryDateISO + "T00:00:00");
    const now = new Date();
    if (isNaN(delivery.getTime()) || now < delivery) return 1;
    const diffTime = Math.abs(now.getTime() - delivery.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return Math.max(1, Math.ceil(diffDays / 7));
  }, [deliveryDateISO]);

  // Interactive timeline state: allows user to select a week on the timeline
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);

  // Sync selectedWeek when currentWeek changes (e.g., date rollover)
  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  // Analytics cache layer: Memoize metric calculations to avoid recalculating on every render
  const currentMetrics = useMemo(() => {
    return getPostpartumNormalizedMetricsForWeek(maternityLogs, deliveryDateISO, selectedWeek);
  }, [maternityLogs, deliveryDateISO, selectedWeek]);

  const previousMetrics = useMemo(() => {
    if (selectedWeek <= 1) return undefined;
    return getPostpartumNormalizedMetricsForWeek(maternityLogs, deliveryDateISO, selectedWeek - 1);
  }, [maternityLogs, deliveryDateISO, selectedWeek]);

  // Execute scoring engine
  const scoreResult = useMemo(() => {
    return calculatePostpartumRecoveryScore(currentMetrics, previousMetrics);
  }, [currentMetrics, previousMetrics]);

  // Get active milestone for the selected week
  const activeMilestone = useMemo(() => {
    return getMilestoneForWeek(selectedWeek);
  }, [selectedWeek]);

  // Days postpartum for overview card
  const daysPostpartum = useMemo(() => {
    const delivery = new Date(deliveryDateISO + "T00:00:00");
    const now = new Date();
    if (isNaN(delivery.getTime()) || now < delivery) return 0;
    return Math.floor((now.getTime() - delivery.getTime()) / (1000 * 60 * 60 * 24));
  }, [deliveryDateISO]);

  return {
    currentWeek,
    selectedWeek,
    setSelectedWeek,
    scoreResult,
    activeMilestone,
    milestones: postpartumMilestones,
    daysPostpartum,
    deliveryDateISO,
  };
}
