/**
 * MaternityPhaseGatedReminders.tsx
 *
 * Phase-gated wrapper for maternity-specific reminder popups.
 * Only renders maternal test reminders and GTT popups when the user
 * is in the maternity phase. This prevents pregnancy-related reminders
 * from appearing in puberty, menopause, or family-planning phases.
 *
 * GTT popup is additionally gated to only appear in pregnancy mode
 * (not postpartum or premature), as per strict production requirements.
 */

import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import MaternalTestRecommendationPopup from "@/components/MaternalTestRecommendationPopup";
import { GTTQuestionPopup } from "@/components/GTTQuestionPopup";
import MaternitySymptomWarningPopup from "@/components/MaternitySymptomWarningPopup";

export default function MaternityPhaseGatedReminders() {
  const { phase } = usePhase();
  const { mode } = usePregnancyProfile();

  // Only render maternity-specific reminders when in maternity phase
  if (phase !== "maternity") {
    return null;
  }

  return (
    <>
      <MaternalTestRecommendationPopup />
      {/* GTT popup only renders in pregnancy mode, not postpartum/premature */}
      {mode === "pregnancy" && <GTTQuestionPopup />}
      <MaternitySymptomWarningPopup />
    </>
  );
}
