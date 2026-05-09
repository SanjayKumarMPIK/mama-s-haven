import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/hooks/useRole";
import { useAuth } from "@/hooks/useAuth";
import RoleSelectionPage from "@/modules/role-selection/RoleSelectionPage";

export default function RoleEntry() {
  const { role } = useRole();
  const { user } = useAuth();
  const navigate = useNavigate();
  const didRedirect = useRef(false);

  useEffect(() => {
    if (didRedirect.current) return;

    if (role) {
      didRedirect.current = true;
      if (user) {
        navigate(role === "doctor" ? "/doctor" : "/dashboard", { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [role, user, navigate]);

  if (role) return null;

  return <RoleSelectionPage />;
}
