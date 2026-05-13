import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useRole } from "@/hooks/useRole";
import { useDoctorAuth } from "@/modules/doctor/context/DoctorAuthContext";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import type { ReactNode } from "react";

/**
 * AuthGate enforces login → onboarding → profile setup → dashboard flow.
 *
 * - Not logged in → redirect to /login (except /login, /register, /emergency)
 * - Doctor logged in → redirect to /doctor
 * - Logged in + onboarding incomplete → show OnboardingFlow overlay
 * - Logged in + everything complete → render children normally
 *
 * IMPORTANT: We wait for BOTH useAuth and DoctorAuthContext to finish loading
 * before making any routing decision, to avoid redirect loops when sessionStorage
 * is cleared but a Supabase session still exists in localStorage.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const { config, showOnboarding } = useOnboarding();
  const { phase } = usePhase();
  const { profile: pregnancyProfile } = usePregnancyProfile();
  const { role } = useRole();
  const { isDoctorLoading, isDoctorLoggedIn } = useDoctorAuth();
  const location = useLocation();

  // ── 1. Wait for both auth systems to resolve ──────────────────────────────
  // isDoctorLoading starts true and resolves after the doctor_profiles check.
  // Without this, role=null + user=set triggers a /dashboard → / infinite loop.
  if (isLoading || isDoctorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ── 2. Derive effective role ───────────────────────────────────────────────
  // Respect the explicitly chosen role from sessionStorage first.
  // Only fall back to isDoctorLoggedIn when no role is chosen (new tab,
  // cleared storage) but a Supabase doctor session still exists.
  const effectiveRole = role ?? (isDoctorLoggedIn ? "doctor" : null);

  // ── 3. Enforce role selection ─────────────────────────────────────────────
  if (!effectiveRole) {
    if (location.pathname !== "/") {
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  // Public routes accessible without login
  const publicPaths = ["/login", "/register", "/emergency", "/"];
  const isPublicRoute = publicPaths.includes(location.pathname);

  // ── 4. Not logged in ──────────────────────────────────────────────────────
  // Use role-specific auth state: for "doctor", check doctor session;
  // for "user", check the regular user session.
  const hasValidSession =
    effectiveRole === "doctor" ? isDoctorLoggedIn : !!user;
  if (!hasValidSession) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  // ── 5. Logged-in → redirect away from auth pages ─────────────────────────
  if (
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/"
  ) {
    if (effectiveRole === "doctor") {
      if (isDoctorLoggedIn) {
        // Let the root route render RoleEntry so the user can choose a role,
        // rather than auto-redirecting to the doctor dashboard from a stale session.
        if (location.pathname === "/") {
          return <>{children}</>;
        }
        return <Navigate to="/doctor/dashboard" replace />;
      }
      return <>{children}</>;
    }
    if (phase === "postpartum") {
      return <Navigate to="/postpartum-dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // ── 6. Maternity setup check (non-doctors only) ───────────────────────────
  if (
    config.onboardingCompleted &&
    phase === "maternity" &&
    !pregnancyProfile.isSetup &&
    location.pathname !== "/pregnancy-dashboard" &&
    effectiveRole !== "doctor"
  ) {
    return <Navigate to="/pregnancy-dashboard" replace />;
  }

  // ── 7. Render children (with optional onboarding overlay) ─────────────────
  return (
    <>
      {(!config.onboardingCompleted || showOnboarding) &&
        effectiveRole !== "doctor" && <OnboardingFlow />}
      {children}
    </>
  );
}
