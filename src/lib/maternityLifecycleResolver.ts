// ─── Maternity Lifecycle Resolver ─────────────────────────────────────────────
// Centralized resolver for determining maternity dashboard destination
// STRICTLY isolated to Maternity Phase navigation logic

export type MaternityLifecycleState = "pregnancy" | "postpartum" | "premature" | "none";

export interface MaternityProfile {
  activeEDD?: string | null;
  lmp?: string | null;
  delivery?: {
    isDelivered: boolean;
    birthDate?: string;
    weeksAtBirth?: number;
  };
  pregnancyActive?: boolean;
}

/**
 * Resolves the correct maternity dashboard based on lifecycle state.
 * This is the single source of truth for maternity navigation.
 */
export function resolveMaternityLifecycle(profile: MaternityProfile): MaternityLifecycleState {
  if (!profile) return "none";

  // Case 1: Delivery completed
  if (profile.delivery?.isDelivered) {
    const birthDate = profile.delivery.birthDate;
    if (birthDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const birth = new Date(birthDate + "T00:00:00");
      birth.setHours(0, 0, 0, 0);

      // If birth date is today or in the past, user is in postpartum
      if (birth.getTime() <= today.getTime()) {
        return "postpartum";
      }
    }
  }

  // Case 2: EDD reached or passed
  if (profile.activeEDD) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(profile.activeEDD + "T00:00:00");
    dueDate.setHours(0, 0, 0, 0);

    // If EDD is today or in the past, user is in postpartum state
    if (dueDate.getTime() <= today.getTime()) {
      return "postpartum";
    }
  }

  // Case 3: Active pregnancy
  if (profile.pregnancyActive && profile.activeEDD) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(profile.activeEDD + "T00:00:00");
    dueDate.setHours(0, 0, 0, 0);

    // If EDD is in the future, user is in active pregnancy
    if (dueDate.getTime() > today.getTime()) {
      return "pregnancy";
    }
  }

  // Case 4: Premature birth (if weeksAtBirth < 37)
  if (profile.delivery?.isDelivered && profile.delivery.weeksAtBirth) {
    if (profile.delivery.weeksAtBirth < 37) {
      return "premature";
    }
  }

  // Default: no valid maternity state
  return "none";
}

/**
 * Gets the appropriate dashboard route based on lifecycle state.
 */
export function getMaternityDashboardRoute(lifecycleState: MaternityLifecycleState): string {
  switch (lifecycleState) {
    case "pregnancy":
      return "/pregnancy-dashboard";
    case "postpartum":
      return "/postpartum-dashboard";
    case "premature":
      return "/premature-care";
    case "none":
    default:
      return "/maternity";
  }
}

/**
 * Determines if user should be on pregnancy dashboard.
 */
export function shouldNavigateToPregnancyDashboard(profile: MaternityProfile): boolean {
  const lifecycleState = resolveMaternityLifecycle(profile);
  return lifecycleState === "pregnancy";
}

/**
 * Determines if user should be on postpartum dashboard.
 */
export function shouldNavigateToPostpartumDashboard(profile: MaternityProfile): boolean {
  const lifecycleState = resolveMaternityLifecycle(profile);
  return lifecycleState === "postpartum";
}

/**
 * Determines if user should be on premature care dashboard.
 */
export function shouldNavigateToPrematureDashboard(profile: MaternityProfile): boolean {
  const lifecycleState = resolveMaternityLifecycle(profile);
  return lifecycleState === "premature";
}
