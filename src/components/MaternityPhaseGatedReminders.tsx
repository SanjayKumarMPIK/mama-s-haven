/**
 * MaternityPhaseGatedReminders.tsx
 *
 * Phase-gated wrapper for maternity-specific reminder popups.
 * Only renders maternal test/scan reminders, GTT popups, and symptom
 * warnings when the user is in the maternity phase AND on a maternity route.
 *
 * SCOPE GUARDS (all must pass):
 * 1. Phase guard:  phase === "maternity"
 * 2. Route guard:  current pathname is in the maternity whitelist AND
 *                  not in the blacklist (doctor/*, puberty/*, etc.)
 * 3. Delivery guard: mode === "pregnancy" && !isDelivered
 * 4. EDD guard:   due date has not passed
 *
 * This prevents scope leakage into:
 * - doctor routes (/doctor/*)
 * - other health phases (puberty, menopause, family-planning)
 * - login/auth pages
 * - onboarding pages
 * - any non-maternity route
 * - postpartum or premature phases
 */

import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useLocation } from "react-router-dom";
import { isMaternityRoute } from "@/lib/utils";
import { MaternityPopupQueueProvider } from "@/hooks/useMaternityPopupQueue";
import MaternityTestScanReminderPopup from "@/components/MaternityTestScanReminderPopup";
import { GTTQuestionPopup } from "@/components/GTTQuestionPopup";
import MaternitySymptomWarningPopup from "@/components/MaternitySymptomWarningPopup";

export default function MaternityPhaseGatedReminders() {
  const { phase } = usePhase();
  const { mode, profile, activeEDD } = usePregnancyProfile();
  const location = useLocation();

  // Guard 1: Phase must be maternity
  if (phase !== "maternity") return null;

  // Guard 2: Route must be a maternity route (using React Router pathname, not stale window.location)
  if (!isMaternityRoute(location.pathname)) return null;

  // Guard 3: Delivery guard — once delivered or not in pregnancy mode, stop test/scan notifications
  const isPregnancyActive = mode === "pregnancy" && !profile.delivery.isDelivered;

  // Guard 4: EDD guard — if due date has passed, stop all pregnancy test notifications
  const isEDDPast = activeEDD ? new Date(activeEDD) < new Date(new Date().toISOString().slice(0, 10)) : false;
  const canShowTestReminders = isPregnancyActive && !isEDDPast;

  return (
    <MaternityPopupQueueProvider>
      {/* Test/scan reminders — only during active pregnancy before EDD */}
      {canShowTestReminders && <MaternityTestScanReminderPopup />}

      {/* GTT popup — only during active pregnancy before EDD */}
      {canShowTestReminders && <GTTQuestionPopup />}

      {/* Symptom warning — always in maternity phase regardless of delivery */}
      <MaternitySymptomWarningPopup />
    </MaternityPopupQueueProvider>
  );
}
