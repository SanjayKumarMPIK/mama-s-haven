import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { usePhase, type Phase } from "@/hooks/usePhase";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PubertyGoal =
  | "track_periods"
  | "understand_body"
  | "manage_symptoms"
  | "learn_patterns"
  | "just_exploring";

export type MaternityGoal =
  | "track_pregnancy"
  | "health_nutrition"
  | "emotional_support"
  | "appointment_reminders"
  | "baby_development";

export type FamilyPlanningGoal =
  | "track_ovulation"
  | "plan_pregnancy"
  | "avoid_pregnancy"
  | "prediction_accuracy"
  | "fertility_education";

export type MenopauseGoal =
  | "track_symptoms"
  | "hormonal_understanding"
  | "sleep_lifestyle"
  | "pattern_tracking"
  | "health_awareness";

export type Goal = PubertyGoal | MaternityGoal | FamilyPlanningGoal | MenopauseGoal;

export interface PubertyOnboardingData {
  has_started_periods?: boolean;
  cramps?: "Yes" | "No" | "Not sure";
  mood_swings?: "Yes, a lot" | "Sometimes" | "Not really";
  fatigue?: "Often" | "Sometimes" | "Rarely";
  acne?: "Yes" | "Sometimes" | "No";
  sleep_hours?: "Less than 5 hours" | "5–7 hours" | "7+ hours";
  sleep_impact?: "Yes" | "No" | "Not sure";
  skin_impact?: "Yes" | "No" | "Not sure";
}

export interface OnboardingConfig {
  phase: Phase;
  goals: Goal[];
  age: number | null;
  onboardingCompleted: boolean;
  pubertyData?: PubertyOnboardingData;
}

interface OnboardingContextType {
  config: OnboardingConfig;
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  saveConfig: (cfg: Partial<OnboardingConfig>) => void;
  resetOnboarding: () => void;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: OnboardingConfig = {
  phase: "puberty",
  goals: [],
  age: null,
  onboardingCompleted: false,
};

function getStorageKey(userId?: string) {
  return userId ? `ss-onboarding-${userId}` : "ss-onboarding";
}

// ─── Context ─────────────────────────────────────────────────────────────────

const OnboardingContext = createContext<OnboardingContextType>({
  config: DEFAULT_CONFIG,
  showOnboarding: false,
  setShowOnboarding: () => {},
  saveConfig: () => {},
  resetOnboarding: () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const storageKey = getStorageKey(user?.id);
  const { setPhase } = usePhase();

  // Synchronously load config from localStorage to avoid flash of onboarding
  // Because AuthProvider loads user async, user.id may not be available yet.
  // So we check BOTH the generic key AND any user-specific key.
  const [config, setConfig] = useState<OnboardingConfig>(() => {
    try {
      // Try user-specific key first (if user loaded from session)
      const session = localStorage.getItem("swasthyasakhi_session");
      let userId: string | undefined;
      if (session) {
        try {
          const parsed = JSON.parse(session);
          userId = parsed?.id;
        } catch {}
      }

      // Try user-specific key, then generic key
      const keys = [
        userId ? `ss-onboarding-${userId}` : null,
        "ss-onboarding",
      ].filter(Boolean) as string[];

      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<OnboardingConfig>;
          if (parsed.onboardingCompleted) {
            return { ...DEFAULT_CONFIG, ...parsed };
          }
        }
      }
    } catch {}
    return DEFAULT_CONFIG;
  });
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Re-load config when user changes (login/logout)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<OnboardingConfig>;
        const next = { ...DEFAULT_CONFIG, ...parsed };
        setConfig(next);
        if (next.phase) {
          setPhase(next.phase);
        }
      }
    } catch {}
  }, [storageKey, setPhase]);

  // Auto-show onboarding ONCE if not completed AND user is logged in
  const hasAutoShown = useRef(false);
  useEffect(() => {
    if (hasAutoShown.current) return;
    if (user && !config.onboardingCompleted) {
      setShowOnboarding(true);
      hasAutoShown.current = true;
    } else if (!user) {
      setShowOnboarding(false);
      hasAutoShown.current = false;
    }
  }, [config.onboardingCompleted, user]);

  const saveConfig = useCallback(
    (partial: Partial<OnboardingConfig>) => {
      setConfig((prev) => {
        const next = { ...prev, ...partial };
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        // Sync phase with the existing PhaseProvider
        if (partial.phase) {
          setPhase(partial.phase);
        }
        return next;
      });
    },
    [setPhase, storageKey],
  );

  const resetOnboarding = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.setItem(storageKey, JSON.stringify(DEFAULT_CONFIG));
    } catch {}
    setShowOnboarding(true);
  }, [storageKey]);

  return (
    <OnboardingContext.Provider
      value={{ config, showOnboarding, setShowOnboarding, saveConfig, resetOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
