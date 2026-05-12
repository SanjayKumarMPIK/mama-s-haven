/**
 * MaternityPhaseGatedReminders.tsx
 *
 * Phase-gated wrapper for maternity-specific reminder popups.
 * Only renders maternal test/scan reminders, GTT popups, and symptom
 * warnings when the user is in the maternity phase AND on a maternity route.
 *
 * This dual guard (phase + route) prevents scope leakage into:
 * - doctor routes (/doctor/*)
 * - other health phases (puberty, menopause, family-planning)
 * - login/auth pages
 * - onboarding pages
 * - any non-maternity route
 *
 * Delivery/due-date guard:
 * - Once delivery is logged (isDelivered) or mode is no longer "pregnancy",
 *   all maternity test/scan reminders and GTT popups are stopped.
 * - Symptom warnings remain available if applicable.
 */

import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { isMaternityRoute } from "@/lib/utils";
import { MaternityPopupQueueProvider } from "@/hooks/useMaternityPopupQueue";
import MaternityTestScanReminderPopup from "@/components/MaternityTestScanReminderPopup";
import { GTTQuestionPopup } from "@/components/GTTQuestionPopup";
import MaternitySymptomWarningPopup from "@/components/MaternitySymptomWarningPopup";

export default function MaternityPhaseGatedReminders() {
  const { phase } = usePhase();
  const { mode, profile } = usePregnancyProfile();

  // Hard route guard + phase guard: only render on maternity routes during maternity phase
  if (phase !== "maternity" || !isMaternityRoute()) {
    return null;
  }

  // Delivery guard: once delivered or mode is no longer pregnancy, stop notifications
  const isPregnancyActive = mode === "pregnancy" && !profile.delivery.isDelivered;

  return (
    <MaternityPopupQueueProvider>
      {/* Test/scan reminders — only during active pregnancy */}
      {isPregnancyActive && <MaternityTestScanReminderPopup />}

      {/* GTT popup — only during active pregnancy */}
      {isPregnancyActive && <GTTQuestionPopup />}

      {/* Symptom warning — always in maternity phase regardless of delivery */}
      <MaternitySymptomWarningPopup />
    </MaternityPopupQueueProvider>
  );
}
