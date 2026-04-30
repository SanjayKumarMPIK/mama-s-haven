// ─── Maternity Route Guard ─────────────────────────────────────────────────────
// Protects maternity dashboard routes based on lifecycle state
// STRICTLY isolated to Maternity Phase navigation logic

import { Navigate } from "react-router-dom";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import {
  resolveMaternityLifecycle,
  getMaternityDashboardRoute,
  type MaternityProfile,
} from "@/lib/maternityLifecycleResolver";

interface MaternityRouteGuardProps {
  expectedState: "pregnancy" | "postpartum" | "premature";
  children: React.ReactNode;
}

/**
 * Route guard component that ensures user is on the correct maternity dashboard.
 * Redirects to the appropriate dashboard based on lifecycle state.
 */
export default function MaternityRouteGuard({
  expectedState,
  children,
}: MaternityRouteGuardProps) {
  const { profile, activeEDD, mode } = usePregnancyProfile();

  // Build profile object for resolver from hook data
  const maternityProfile: MaternityProfile = {
    activeEDD: activeEDD || profile?.calculatedEDD || profile?.userEDD,
    lmp: profile?.lmp,
    delivery: profile?.delivery
      ? {
          isDelivered: profile.delivery.isDelivered,
          birthDate: profile.delivery.birthDate,
          weeksAtBirth: profile.delivery.weeksAtBirth,
        }
      : undefined,
    pregnancyActive: mode === "pregnancy" && !profile?.delivery?.isDelivered,
  };

  // Resolve current lifecycle state
  const lifecycleState = resolveMaternityLifecycle(maternityProfile);

  // If user is not in the expected state, redirect to correct dashboard
  if (lifecycleState !== expectedState && lifecycleState !== "none") {
    const correctRoute = getMaternityDashboardRoute(lifecycleState);
    return <Navigate to={correctRoute} replace />;
  }

  // If no valid lifecycle state, redirect to maternity landing
  if (lifecycleState === "none") {
    return <Navigate to="/maternity" replace />;
  }

  // User is in the correct state, render children
  return <>{children}</>;
}
