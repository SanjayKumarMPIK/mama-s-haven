/**
 * MaternityPhaseGatedReminders.tsx
 *
 * Phase-gated wrapper for maternity-specific reminder popups.
 * Only renders maternal test reminders and GTT popups when the user
 * is in the maternity phase. This prevents pregnancy-related reminders
 * from appearing in puberty, menopause, or family-planning phases.
 */

import { usePhase } from "@/hooks/usePhase";
import MaternalTestRecommendationPopup from "@/components/MaternalTestRecommendationPopup";
import { GTTQuestionPopup } from "@/components/GTTQuestionPopup";

export default function MaternityPhaseGatedReminders() {
  const { phase } = usePhase();

  // Only render maternity-specific reminders when in maternity phase
  if (phase !== "maternity") {
    return null;
  }

  return (
    <>
      <MaternalTestRecommendationPopup />
      <GTTQuestionPopup />
    </>
  );
}
