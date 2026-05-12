import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import { useDoctorAuth } from "@/modules/doctor/hooks/useDoctorAuth";
import RoleSelectionPage from "@/modules/role-selection/RoleSelectionPage";

export default function RoleEntry() {
  const { role } = useRole();
  const { user, isLoading: userAuthLoading } = useAuth();
  const { isDoctorLoggedIn, isDoctorLoading } = useDoctorAuth();
  const navigate = useNavigate();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;
    if (userAuthLoading || isDoctorLoading) return;

    if (role) {
      didRedirect.current = true;
      if (role === "doctor") {
        navigate(isDoctorLoggedIn ? "/doctor/dashboard" : "/login", { replace: true });
      } else {
        navigate(user ? "/dashboard" : "/login", { replace: true });
      }
    }
  }, [role, user, isDoctorLoggedIn, userAuthLoading, isDoctorLoading, navigate]);

  if (role) return null;

  return <RoleSelectionPage />;
}
