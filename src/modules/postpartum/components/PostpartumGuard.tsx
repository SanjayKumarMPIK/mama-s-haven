import { Navigate, Outlet } from "react-router-dom";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

export function PostpartumGuard({ children }: { children?: React.ReactNode }) {
  const { profile } = usePregnancyProfile();

  const deliveryCompleted = profile.delivery?.isDelivered;
  const congratulationsCompleted = profile.delivery?.isDelivered; 
  const babyQuestionsCompleted = profile.delivery?.isDelivered && profile.delivery?.birthWeight !== null; 
  const deliveryWeeks = profile.delivery?.weeksAtBirth || 0;

  if (!deliveryCompleted || !congratulationsCompleted || !babyQuestionsCompleted) {
    return <Navigate to="/pregnancy-dashboard" replace />;
  }

  if (deliveryWeeks < 37) {
    return <Navigate to="/pregnancy-dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
