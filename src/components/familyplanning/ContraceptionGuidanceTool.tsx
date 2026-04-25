/**
 * ContraceptionGuidanceTool.tsx
 *
 * Avoid Tool: Wrapper around existing ContraceptionGuide,
 * resolved by the dynamic tools system.
 */

import { useMemo } from "react";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { useProfile } from "@/hooks/useProfile";
import { computePersonalization } from "@/lib/familyPlanningPersonalizationEngine";

import ContraceptionGuide from "@/components/guidance/ContraceptionGuide";

export default function ContraceptionGuidanceTool() {
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const { profile: userProfile } = useProfile();

  const personalization = useMemo(() => {
    return computePersonalization(
      fpProfile,
      userProfile.lastPeriodDate || "",
      userProfile.cycleLength || 28,
    );
  }, [fpProfile, userProfile.lastPeriodDate, userProfile.cycleLength]);

  if (personalization.contraception.length === 0) {
    return (
      <div className="rounded-xl p-4 border border-blue-200 bg-blue-50">
        <p className="text-sm text-blue-800">
          💊 Contraception guidance is being prepared based on your profile.
        </p>
      </div>
    );
  }

  return (
    <ContraceptionGuide
      categories={personalization.contraception}
      isFirstTime={personalization.segment === "first-time"}
    />
  );
}
