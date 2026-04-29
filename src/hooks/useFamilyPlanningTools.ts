/**
 * useFamilyPlanningTools.ts
 *
 * React hook that bridges the tools engine with component state.
 * Resolves dynamic tools based on the current FP profile + cycle data,
 * and re-computes whenever intent or cycle context changes.
 */

import { useMemo } from "react";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { useProfile } from "@/hooks/useProfile";
import {
  resolveDynamicTools,
  type DynamicToolsResult,
} from "@/lib/familyPlanningToolsEngine";
import {
  getCycleDay,
  getRiskFromCycleDay,
} from "@/lib/familyPlanningPersonalizationEngine";

export function useFamilyPlanningTools(): DynamicToolsResult {
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const { profile: userProfile } = useProfile();

  return useMemo(() => {
    const cycleLength =
      userProfile.cycleLength && userProfile.cycleLength >= 10
        ? userProfile.cycleLength
        : 28;

    const cycleDay = getCycleDay(userProfile.lastPeriodDate || "", cycleLength);
    const riskLevel = getRiskFromCycleDay(cycleDay, cycleLength);

    return resolveDynamicTools(
      fpProfile.intent,
      riskLevel,
      cycleDay,
      cycleLength,
      fpProfile.cycleRegularity,
      3, // Show top 3 tools initially
    );
  }, [fpProfile.intent, fpProfile.cycleRegularity, userProfile.lastPeriodDate, userProfile.cycleLength]);
}
