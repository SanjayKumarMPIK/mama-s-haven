import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import type { ReactNode } from "react";

/**
 * AuthGate enforces login → onboarding → profile setup → dashboard flow.
 *
 * - Not logged in → redirect to /login (except /login, /register, /emergency)
 * - Logged in + onboarding incomplete → show OnboardingFlow overlay
 * - Logged in + profile unconfigured → redirect to /profile
 * - Logged in + everything complete → render children normally
 */
function hasCompletedProfileSetup() {
  try {
    const raw = localStorage.getItem("ss-wellness-profile");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return !!(parsed.weight && parsed.height);
  } catch {
    return false;
  }
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const { config, showOnboarding } = useOnboarding();
  const { phase } = usePhase();
  const { profile: pregnancyProfile } = usePregnancyProfile();
  const location = useLocation();

  // Don't flash anything while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Public routes accessible without login
  const publicPaths = ["/login", "/register", "/emergency"];
  const isPublicRoute = publicPaths.includes(location.pathname);

  // Not logged in
  if (!user) {
    if (isPublicRoute) {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  // Logged in but on auth pages → redirect to dashboard
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <Navigate to="/" replace />;
  }

  // Require profile setup (weight & height) before allowing access to the rest of the application
  const isProfileComplete = hasCompletedProfileSetup();
  if (!isProfileComplete && location.pathname !== "/profile") {
    return <Navigate to="/profile?setup=true" replace />;
  }

  // Maternity users without pregnancy profile setup → redirect to pregnancy dashboard setup
  if (
    config.onboardingCompleted &&
    phase === "maternity" &&
    !pregnancyProfile.isSetup &&
    location.pathname !== "/pregnancy-dashboard"
  ) {
    return <Navigate to="/pregnancy-dashboard" replace />;
  }

  // Logged in → show onboarding if not completed (or if manually re-opened)
  return (
    <>
      {(!config.onboardingCompleted || showOnboarding) && <OnboardingFlow />}
      {children}
    </>
  );
}
