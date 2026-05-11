import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── GTT Popup Visibility Helper ─────────────────────────────────────────────────
// Centralized condition for GTT (Glucose Tolerance Test) popup notifications.
// This is the single source of truth for all GTT-related UI visibility checks.

export type GDMStatus = "confirmed" | "negative" | "not_sure" | "not_done" | null;

/**
 * Determines whether the GTT popup should be shown based on strict production rules.
 * 
 * Rules:
 * 1. ONLY show in pregnancy phase (not postpartum, premature, puberty, baby/child, etc.)
 * 2. ONLY between pregnancy weeks 25 and 36 inclusive
 * 3. If GTT status is confirmed/completed, stop all future popup appearances
 * 4. Null safety: if pregnancy week is undefined/null/NaN, do not show popup
 * 5. If user phase data is unavailable, fail safely and do not render popup
 * 6. If user has already delivered, never show popup
 * 
 * @param mode - Current maternity mode ("pregnancy" | "premature" | "postpartum")
 * @param pregnancyWeek - Current pregnancy week (1-40)
 * @param gdmStatus - GTT/GDM status from the test
 * @param isSetup - Whether the pregnancy profile is set up
 * @param isPopupOpen - Whether the popup is currently open (to prevent duplicate triggers)
 * @param questionCompleted - Whether the GTT question flow was already completed
 * @param isDelivered - Whether the user has marked delivery (override check)
 * @returns boolean - true if the GTT popup should be shown
 */
export function shouldShowGTTPopup(
  mode: string | null | undefined,
  pregnancyWeek: number | null | undefined,
  gdmStatus: GDMStatus,
  isSetup: boolean | null | undefined,
  isPopupOpen: boolean | null | undefined,
  questionCompleted: boolean | null | undefined,
  isDelivered?: boolean
): boolean {
  // Null safety: fail safely if data is unavailable
  if (!mode || pregnancyWeek == null || isNaN(pregnancyWeek)) {
    return false;
  }

  // Rule 1: ONLY show in pregnancy phase
  if (mode !== "pregnancy") {
    return false;
  }

  // Rule 2: ONLY between weeks 25 and 36 inclusive
  if (pregnancyWeek < 25 || pregnancyWeek > 36) {
    return false;
  }

  // Rule 3: If GTT status is confirmed, stop all future popup appearances
  // Also suppress for other completed status values
  if (gdmStatus === "confirmed" || gdmStatus === "negative") {
    return false;
  }

  // Rule 4: If user has delivered, never show popup
  if (isDelivered === true) {
    return false;
  }

  // Additional guard: profile must be set up
  if (!isSetup) {
    return false;
  }

  // Additional guard: question flow not already completed
  if (questionCompleted) {
    return false;
  }

  // Additional guard: popup not already open
  if (isPopupOpen) {
    return false;
  }

  return true;
}

/**
 * Checks if the current route is a maternity-specific route.
 * Uses a whitelist approach to prevent notification leakage into
 * doctor routes, other health phases, auth pages, onboarding, etc.
 */
export function isMaternityRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname;
  return (
    path === '/maternity' ||
    path.startsWith('/maternity/') ||
    path === '/pregnancy-dashboard' ||
    path === '/maternal-guide' ||
    path.startsWith('/maternal-guide/')
  );
}
