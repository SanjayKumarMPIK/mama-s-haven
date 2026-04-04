import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
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

  const [config, setConfig] = useState<OnboardingConfig>(DEFAULT_CONFIG);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { setPhase } = usePhase();

  // Load config when user changes
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
      } else {
        setConfig(DEFAULT_CONFIG);
      }
    } catch {
      setConfig(DEFAULT_CONFIG);
    }
  }, [storageKey, setPhase]);

  // Auto-show onboarding if not completed AND user is logged in
  useEffect(() => {
    if (user && !config.onboardingCompleted) {
      setShowOnboarding(true);
    } else if (!user) {
      setShowOnboarding(false);
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
