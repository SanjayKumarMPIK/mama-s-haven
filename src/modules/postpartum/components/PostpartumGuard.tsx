import { Navigate, Outlet } from "react-router-dom";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { resolveMaternityLifecycle } from "@/lib/maternityLifecycleResolver";
import { toMaternityLifecycleProfile } from "@/lib/maternalPhaseResolver";

export function PostpartumGuard({ children }: { children?: React.ReactNode }) {
  const { profile, activeEDD } = usePregnancyProfile();

  // Create unified lifecycle profile
  const maternityProfile = toMaternityLifecycleProfile(profile, activeEDD);

  // Resolve current lifecycle state safely (prevents circular dependencies with mode)
  const lifecycleState = resolveMaternityLifecycle(maternityProfile);

  // Allow access only if state resolves to postpartum or premature
  // This prevents infinite loops with MaternityRouteGuard which uses the exact same resolver.
  if (lifecycleState !== "postpartum" && lifecycleState !== "premature") {
    return <Navigate to="/pregnancy-dashboard" replace />;
  }

  // If we wanted to strictly redirect premature to a specific premature dashboard later,
  // we could do it here, but currently postpartum dashboard handles both.

  return children ? <>{children}</> : <Outlet />;
}
