/**
 * MaternityPhaseGatedReminders.tsx
 *
 * Phase-gated wrapper for maternity-specific reminder popups.
 * Only renders maternal test reminders and GTT popups when the user
 * is in the maternity phase AND on a maternity route.
 *
 * This dual guard (phase + route) prevents scope leakage into:
 * - doctor routes (/doctor/*)
 * - other health phases (puberty, menopause, family-planning)
 * - login/auth pages
 * - onboarding pages
 * - any non-maternity route
 *
 * GTT popup is additionally gated to only appear in pregnancy mode
 * (not postpartum or premature), as per strict production requirements.
 */

import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { isMaternityRoute } from "@/lib/utils";
import { MaternityPopupQueueProvider } from "@/hooks/useMaternityPopupQueue";
import MaternalTestRecommendationPopup from "@/components/MaternalTestRecommendationPopup";
import { GTTQuestionPopup } from "@/components/GTTQuestionPopup";
import MaternitySymptomWarningPopup from "@/components/MaternitySymptomWarningPopup";

export default function MaternityPhaseGatedReminders() {
  const { phase } = usePhase();
  const { mode, profile } = usePregnancyProfile();

  // Hard route guard + phase guard: only render on maternity routes during maternity phase
  if (phase !== "maternity" || !isMaternityRoute()) {
    return null;
  }

  return (
    <MaternityPopupQueueProvider>
      <MaternalTestRecommendationPopup />
      {/* GTT popup only renders in pregnancy mode, not postpartum/premature */}
      {mode === "pregnancy" && !profile.delivery.isDelivered && <GTTQuestionPopup />}
      <MaternitySymptomWarningPopup />
    </MaternityPopupQueueProvider>
  );
}
