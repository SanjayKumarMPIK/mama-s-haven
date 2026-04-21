import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useOnboarding, type Goal, type OnboardingConfig } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useProfile } from "@/hooks/useProfile";
import type { Phase } from "@/hooks/usePhase";
import { X, ChevronRight, ChevronLeft, AlertTriangle, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import PubertyQuestions from "./PubertyQuestions";

// ─── Goal option data per phase ──────────────────────────────────────────────

interface GoalOption {
  id: Goal;
  emoji: string;
  label: string;
}

const PUBERTY_GOALS: GoalOption[] = [
  { id: "track_periods", emoji: "📅", label: "Track my periods" },
  { id: "understand_body", emoji: "🧠", label: "Understand my body changes" },
  { id: "manage_symptoms", emoji: "⚠️", label: "Manage symptoms" },
  { id: "learn_patterns", emoji: "📊", label: "Learn patterns" },
  { id: "just_exploring", emoji: "❓", label: "Just exploring" },
];

const MATERNITY_GOALS: GoalOption[] = [
  { id: "track_pregnancy", emoji: "👶", label: "Track pregnancy week-by-week" },
  { id: "health_nutrition", emoji: "🥗", label: "Health & nutrition" },
  { id: "emotional_support", emoji: "🧠", label: "Emotional support" },
  { id: "appointment_reminders", emoji: "🏥", label: "Appointment reminders" },
  { id: "baby_development", emoji: "📊", label: "Baby development" },
];

const FAMILY_PLANNING_GOALS: GoalOption[] = [
  { id: "track_ovulation", emoji: "📅", label: "Track ovulation" },
  { id: "plan_pregnancy", emoji: "❤️", label: "Plan pregnancy" },
  { id: "avoid_pregnancy", emoji: "🛑", label: "Avoid pregnancy" },
  { id: "prediction_accuracy", emoji: "📊", label: "Prediction accuracy" },
  { id: "fertility_education", emoji: "🧠", label: "Fertility education" },
];

const MENOPAUSE_GOALS: GoalOption[] = [
  { id: "track_symptoms", emoji: "🔥", label: "Track symptoms" },
  { id: "hormonal_understanding", emoji: "🧠", label: "Hormonal understanding" },
  { id: "sleep_lifestyle", emoji: "💤", label: "Sleep & lifestyle" },
  { id: "pattern_tracking", emoji: "📊", label: "Pattern tracking" },
  { id: "health_awareness", emoji: "🩺", label: "Health awareness" },
];

const GOALS_MAP: Record<Phase, GoalOption[]> = {
  puberty: PUBERTY_GOALS,
  maternity: MATERNITY_GOALS,
  "family-planning": FAMILY_PLANNING_GOALS,
  menopause: MENOPAUSE_GOALS,
};

// ─── Phase card data ─────────────────────────────────────────────────────────

interface PhaseOption {
  phase: Phase;
  emoji: string;
  title: string;
  description: string;
  gradient: string;
  border: string;
  iconBg: string;
}

const PHASE_OPTIONS: PhaseOption[] = [
  {
    phase: "puberty",
    emoji: "🌸",
    title: "Puberty",
    description: "Track your cycle, learn about body changes, and manage early symptoms",
    gradient: "from-pink-50 to-rose-50",
    border: "border-pink-200 hover:border-pink-400",
    iconBg: "bg-pink-100",
  },
  {
    phase: "maternity",
    emoji: "🤰",
    title: "Maternity",
    description: "Week-by-week pregnancy tracking, nutrition, and appointment care",
    gradient: "from-purple-50 to-violet-50",
    border: "border-purple-200 hover:border-purple-400",
    iconBg: "bg-purple-100",
  },
  {
    phase: "family-planning",
    emoji: "💑",
    title: "Family Planning",
    description: "Ovulation tracking, fertility awareness, and readiness support",
    gradient: "from-teal-50 to-emerald-50",
    border: "border-teal-200 hover:border-teal-400",
    iconBg: "bg-teal-100",
  },
  {
    phase: "menopause",
    emoji: "🌿",
    title: "Menopause",
    description: "Symptom tracking, hormonal insights, sleep and wellness guidance",
    gradient: "from-amber-50 to-orange-50",
    border: "border-amber-200 hover:border-amber-400",
    iconBg: "bg-amber-100",
  },
];

// ─── Age Warning Dialog ──────────────────────────────────────────────────────

function AgeWarningDialog({
  message,
  onContinue,
  onGoBack,
}: {
  message: string;
  onContinue: () => void;
  onGoBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl p-6 animate-scaleIn">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Age Notice</h3>
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onGoBack}
            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            i === current ? "w-8 bg-primary" : i < current ? "w-2 bg-primary/60" : "w-2 bg-slate-200",
          )}
        />
      ))}
    </div>
  );
}

// ─── Main OnboardingFlow ─────────────────────────────────────────────────────

export default function OnboardingFlow() {
  const { config, showOnboarding, setShowOnboarding, saveConfig } = useOnboarding();
  const { fullProfile } = useAuth();
  const { saveProfile } = usePregnancyProfile();
  const { profile: userProfile } = useProfile();
  const navigate = useNavigate();

  // Local state for form
  const [step, setStep] = useState(1); // 1 = purpose, 2 = goals (or maternity setup), 3 = puberty questions
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(config.onboardingCompleted ? config.phase : null);
  const [selectedGoals, setSelectedGoals] = useState<Set<Goal>>(new Set(config.goals));
  const [ageWarning, setAgeWarning] = useState<string | null>(null);
  const [phaseToConfirm, setPhaseToConfirm] = useState<Phase | null>(null);

  // Maternity setup form state
  const [maternityLmp, setMaternityLmp] = useState("");
  const name = userProfile?.name || "User";

  // Pre-fill when re-opening
  useEffect(() => {
    if (showOnboarding && config.onboardingCompleted) {
      setSelectedPhase(config.phase);
      setSelectedGoals(new Set(config.goals));
      setStep(1);
    }
  }, [showOnboarding, config]);

  if (!showOnboarding) return null;

  const userAge = fullProfile?.basic?.age ? parseInt(fullProfile.basic.age, 10) : config.age;
  const totalSteps = 2;

  // ─── Age validation ────────────────────────────────────────────────────────
  const checkAgeForPhase = (phase: Phase): boolean => {
    if (userAge !== null && userAge !== undefined && !isNaN(userAge)) {
      if (userAge <= 20 && phase === "maternity") {
        setAgeWarning(
          "You are 20 or under. Maternity tracking may not be medically recommended at this stage. Do you want to continue?",
        );
        setPhaseToConfirm(phase);
        return false;
      }
      if (userAge < 25 && phase === "family-planning") {
        setAgeWarning(
          "You are under 25. Family planning tracking is typically for later stages. Are you sure you want to continue?",
        );
        setPhaseToConfirm(phase);
        return false;
      }
      if (userAge < 50 && phase === "menopause") {
        setAgeWarning(
          "Menopause tracking is typically for ages 50 and above. Are you sure you want to continue?",
        );
        setPhaseToConfirm(phase);
        return false;
      }
    }
    return true;
  };

  const handlePhaseSelect = (phase: Phase) => {
    if (checkAgeForPhase(phase)) {
      setSelectedPhase(phase);
      setSelectedGoals(new Set());
      setStep(2); // For maternity: shows setup form. For others: shows goals.
    }
  };

  const handleAgeWarningContinue = () => {
    if (phaseToConfirm) {
      setSelectedPhase(phaseToConfirm);
      setSelectedGoals(new Set());
      setStep(2);
    }
    setAgeWarning(null);
    setPhaseToConfirm(null);
  };

  const handleAgeWarningGoBack = () => {
    setAgeWarning(null);
    setPhaseToConfirm(null);
  };

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goal)) {
        next.delete(goal);
      } else {
        next.add(goal);
      }
      return next;
    });
  };

  const handleCompletePhase2 = () => {
    if (!selectedPhase || selectedGoals.size === 0) return;
    
    if (selectedPhase === "puberty") {
      setStep(3); // Progress to the Puberty specific questionnaire
      return;
    }

    // Menopause: save config and navigate to menopause onboarding or calendar
    if (selectedPhase === "menopause") {
      const cfg: Partial<OnboardingConfig> = {
        phase: selectedPhase,
        goals: Array.from(selectedGoals),
        age: userAge,
        onboardingCompleted: true,
      };
      saveConfig(cfg);
      setShowOnboarding(false);

      // Check if menopause profile already exists
      try {
        const session = localStorage.getItem("swasthyasakhi_session");
        const userId = session ? JSON.parse(session)?.id : "anonymous";
        const existing = localStorage.getItem(`ss-menopause-profile-${userId}`);
        if (existing) {
          navigate("/menopause/calendar");
        } else {
          navigate("/menopause/onboarding");
        }
      } catch {
        navigate("/menopause/onboarding");
      }
      return;
    }

    const cfg: Partial<OnboardingConfig> = {
      phase: selectedPhase,
      goals: Array.from(selectedGoals),
      age: userAge,
      onboardingCompleted: true,
    };
    saveConfig(cfg);
    setShowOnboarding(false);
  };

  // ─── Maternity setup submit ────────────────────────────────────────────────
  const handleMaternitySetupSubmit = () => {
    if (!maternityLmp) return;

    // Save pregnancy profile data
    saveProfile({ name, lmp: maternityLmp, region: "north" });

    // Save onboarding config
    const cfg: Partial<OnboardingConfig> = {
      phase: "maternity",
      goals: [],
      age: userAge,
      onboardingCompleted: true,
    };
    saveConfig(cfg);
    setShowOnboarding(false);
  };

  const handlePubertyComplete = (pubertyData: any) => {
    const cfg: Partial<OnboardingConfig> = {
      phase: selectedPhase!,
      goals: Array.from(selectedGoals),
      age: userAge,
      onboardingCompleted: true,
      pubertyData: pubertyData,
    };
    saveConfig(cfg);
    setShowOnboarding(false);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const content = (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-rose-50 via-white to-purple-50 overflow-y-auto">
      {/* Close button if re-opening from settings */}
      {config.onboardingCompleted && (
        <button
          onClick={() => setShowOnboarding(false)}
          className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
          aria-label="Close onboarding"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      )}

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Logo */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            ✨ Personalize your experience
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Welcome to <span className="text-primary font-extrabold tracking-tight">SwasthyaSakhi</span>
          </h1>
        </div>

        <StepIndicator current={Math.min(step - 1, totalSteps - 1)} total={totalSteps} />

        <div className="w-full max-w-2xl">

          {/* ───── Step 1: Purpose Selection ───── */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-2">
                What brings you to SwasthyaSakhi?
              </h2>
              <p className="text-center text-sm text-slate-500 mb-8">
                Select the stage that best describes your current journey.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {PHASE_OPTIONS.map((opt) => (
                  <button
                    key={opt.phase}
                    onClick={() => handlePhaseSelect(opt.phase)}
                    className={cn(
                      "group relative text-left rounded-2xl border-2 p-5 transition-all duration-300",
                      "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                      `bg-gradient-to-br ${opt.gradient} ${opt.border}`,
                      selectedPhase === opt.phase && "ring-2 ring-primary ring-offset-2",
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-3", opt.iconBg)}>
                      {opt.emoji}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">{opt.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>
                    <ChevronRight className="absolute top-5 right-4 w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ───── Step 2 (Maternity): Set Up Your Dashboard ───── */}
          {step === 2 && selectedPhase === "maternity" && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤰</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Set Up Your Dashboard</h2>
                <p className="mt-2 text-sm text-slate-500">Enter your Last Menstrual Period (LMP) date to personalize your pregnancy tracker.</p>
              </div>

              <div className="space-y-4 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-lg mx-auto">
                {/* Welcome User Banner */}
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-800">Welcome, {name}</p>
                    <p className="text-[10px] text-slate-500">Using your profile information</p>
                  </div>
                </div>

                <div className="text-left">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Menstrual Period (LMP)</label>
                  <input
                    type="date"
                    value={maternityLmp}
                    onChange={(e) => setMaternityLmp(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100 text-left mb-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Your due date is auto-calculated from LMP (LMP&nbsp;+&nbsp;280&nbsp;days). You can adjust it later from the dashboard if your doctor gives a different date.
                  </p>
                </div>
                <button
                  onClick={handleMaternitySetupSubmit}
                  disabled={!maternityLmp}
                  className="w-full rounded-xl bg-primary text-white py-3 font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Start Tracking →
                </button>
              </div>

              {/* Back button */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    setSelectedPhase(null);
                    setStep(1);
                  }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 2 (Non-Maternity): Sub-Purpose Selection ───── */}
          {step === 2 && selectedPhase && selectedPhase !== "maternity" && (
            <div className="animate-fadeIn">
              <h2 className="text-xl md:text-2xl font-bold text-center text-slate-800 mb-2">
                What would you like help with?
              </h2>
              <p className="text-center text-sm text-slate-500 mb-8">
                Select one or more goals. You can change these later.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {GOALS_MAP[selectedPhase].map((option) => {
                  const isSelected = selectedGoals.has(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleGoal(option.id)}
                      className={cn(
                        "relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "hover:shadow-md active:scale-[0.98]",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-slate-200 bg-white hover:border-primary/30",
                      )}
                    >
                      <span className="text-2xl flex-shrink-0">{option.emoji}</span>
                      <span className="text-sm font-medium text-slate-700">{option.label}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-3 mt-8">
                <button
                  onClick={handleCompletePhase2}
                  disabled={selectedGoals.size === 0}
                  className="w-full max-w-xs py-3.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Get Started <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedPhase(null);
                    setStep(1);
                  }}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              </div>
            </div>
          )}

          {/* ───── Step 3: Puberty Questionnaire (Optional) ───── */}
          {step === 3 && selectedPhase === "puberty" && (
            <PubertyQuestions 
              onBack={() => setStep(2)} 
              onComplete={handlePubertyComplete} 
            />
          )}

        </div>
      </div>

      {/* Age warning dialog */}
      {ageWarning && (
        <AgeWarningDialog
          message={ageWarning}
          onContinue={handleAgeWarningContinue}
          onGoBack={handleAgeWarningGoBack}
        />
      )}
    </div>
  );

  return createPortal(content, document.body);
}
