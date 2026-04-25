import { useMemo, useState } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import {
  Apple, Calendar, ChevronRight, ArrowRight, Activity,
  Zap, Sparkles, ShieldCheck, Leaf, ChevronDown, ChevronUp,
  AlertTriangle, Info, Heart, Sun, Droplets, Brain,
  Bone, Battery, Pill, Utensils,
} from "lucide-react";
import {
  computeNutritionInsights,
  type NutrientNeed,
} from "@/lib/nutritionInsightsEngine";
import { predictMaternityDeficiencies, type MaternityPredictionResult, type MaternityFallbackRecommendation } from "@/lib/maternityNutritionEngine";
import { predictPubertyDeficiencies, type PubertyNutritionResult, type PubertyDeficiencyPrediction, type Confidence } from "@/lib/pubertyNutritionEngine";
import { predictFamilyPlanningDeficiencies, type FamilyPlanningPredictionResult } from "@/lib/familyPlanningNutritionEngine";
import { generatePubertyDailyFoodChart, type PubertyDailyFoodChart, type MealSlot } from "@/lib/pubertyFoodChartEngine";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

// ─── Phase accent map ─────────────────────────────────────────────────────────

const phaseAccent: Record<string, {
  gradient: string; bg: string; text: string; border: string;
  cardBg: string; badge: string;
}> = {
  puberty: {
    gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50", text: "text-pink-700",
    border: "border-pink-200/60", cardBg: "bg-gradient-to-br from-pink-50 to-rose-50",
    badge: "bg-pink-100 text-pink-700",
  },
  maternity: {
    gradient: "from-purple-500 to-violet-400", bg: "bg-purple-50", text: "text-purple-700",
    border: "border-purple-200/60", cardBg: "bg-gradient-to-br from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
  },
  "family-planning": {
    gradient: "from-teal-500 to-emerald-400", bg: "bg-teal-50", text: "text-teal-700",
    border: "border-teal-200/60", cardBg: "bg-gradient-to-br from-teal-50 to-emerald-50",
    badge: "bg-teal-100 text-teal-700",
  },
  menopause: {
    gradient: "from-amber-500 to-orange-400", bg: "bg-amber-50", text: "text-amber-700",
    border: "border-amber-200/60", cardBg: "bg-gradient-to-br from-amber-50 to-orange-50",
    badge: "bg-amber-100 text-amber-700",
  },
};

// ─── Priority color ────────────────────────────────────────────────────────────

function priorityStyle(priority: NutrientNeed["priority"]) {
  return priority === "high"
    ? "border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60"
    : "border-border/40 bg-card";
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function NutritionGuide() {
  const { simpleMode } = useLanguage();
  const { phase, phaseName } = usePhase();
  const { logs } = useHealthLog();
  const { trimester } = usePregnancyProfile();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const accent = phaseAccent[phase] ?? phaseAccent.puberty;

  // ── Compute generic nutrition insights (memoized) ──
  const data = useMemo(() => computeNutritionInsights(logs, phase), [logs, phase]);

  // ── Compute maternity specific insights (memoized) ──
  const maternityData = useMemo(() => {
    if (phase === "maternity") return predictMaternityDeficiencies(logs, trimester);
    return null;
  }, [logs, phase, trimester]);

  // ── Compute puberty specific insights (memoized) ──
  const pubertyData = useMemo(() => {
    if (phase === "puberty") return predictPubertyDeficiencies(logs, profile, onboardingConfig);
    return null;
  }, [logs, phase, profile, onboardingConfig]);

  const pubertyFoodChart = useMemo<PubertyDailyFoodChart | null>(() => {
    if (phase !== "puberty") return null;
    return generatePubertyDailyFoodChart({
      logs,
      profile,
      onboarding: onboardingConfig,
    });
  }, [logs, phase, profile, onboardingConfig]);

  // ── Compute family planning specific insights (memoized) ──
  const familyPlanningData = useMemo(() => {
    if (phase === "family-planning") return predictFamilyPlanningDeficiencies(logs);
    return null;
  }, [logs, phase]);

  // ═══ Render ═════════════════════════════════════════════════════════════════

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Apple className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nutrition Guide</h1>
                <p className="text-sm text-muted-foreground">
                  Personalized for <strong>{phaseName}</strong> • Based on your symptoms
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* ─── PUBERTY PHASE ─────────────────────────────────────────────── */}
        {phase === "puberty" && pubertyData ? (
          <PubertyNutritionView data={pubertyData} chart={pubertyFoodChart} accent={accent} />
        ) : phase === "family-planning" && familyPlanningData ? (
          <FamilyPlanningNutritionView data={familyPlanningData} accent={accent} />
        ) : phase === "maternity" && maternityData ? (
          <MaternityNutritionView data={maternityData} accent={accent} />
        ) : !data.hasData ? (
          /* ─── Empty State ──────────────────────────────────────────────── */
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg opacity-40`}>
                <Apple className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Health Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get personalized nutrition guidance
                tailored to what your body needs today.
              </p>
              <Link
                to="/calendar"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
              >
                <Calendar className="w-4 h-4" />
                Go to Calendar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* ─── Section 1: Today's Nutrition Focus ─────────────────────── */}
            <ScrollReveal>
              <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] opacity-10 bg-gradient-to-br from-current to-transparent" />
                <div className="flex items-start gap-4">
                  <span className="text-4xl shrink-0">{data.focusEmoji}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Today's Nutrition Focus
                    </p>
                    <h2 className="text-lg font-bold leading-snug">{data.focus}</h2>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                        <Zap className="w-3 h-3" />
                        Energy: <span className="capitalize">{data.state.energyTrend}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                        <ShieldCheck className="w-3 h-3" />
                        Recovery: <span className="capitalize">{data.state.recoveryNeed}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                        <Activity className="w-3 h-3" />
                        {data.state.loggedDays} day{data.state.loggedDays !== 1 ? "s" : ""} logged
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* ─── Section 2: Key Nutrients You Need ──────────────────────── */}
            {data.nutrients.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Key Nutrients You Need" emoji="🧠" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.nutrients.map((nutrient) => (
                    <div
                      key={nutrient.name}
                      className={`rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${priorityStyle(nutrient.priority)}`}
                    >
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <span className="text-2xl">{nutrient.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold">{nutrient.name}</h3>
                            {nutrient.priority === "high" && (
                              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-700">
                                Priority
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {nutrient.reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {nutrient.foods.map((food) => (
                          <span
                            key={food}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg bg-background/80 border border-border/30 text-xs font-medium"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Section 3: Smart Suggestions ──────────────────────────── */}
            {data.suggestions.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Smart Suggestions" emoji="🎯" />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {data.suggestions.map((sug, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-4 hover:shadow-sm transition-shadow"
                    >
                      <span className="text-lg mt-0.5 shrink-0">{sug.emoji}</span>
                      <p className="text-sm leading-relaxed">{sug.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Section 4: Quick Tips ──────────────────────────────────── */}
            {data.tips.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Quick Tips" emoji="⚡" />
                <div className="rounded-2xl border border-border/40 bg-card divide-y divide-border/30">
                  {data.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="text-base mt-0.5 shrink-0">{tip.emoji}</span>
                      <p className="text-sm leading-relaxed text-foreground/85">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Inferred Deficiencies Badge Row ───────────────────────── */}
            {data.state.deficiencies.length > 0 && (
              <ScrollReveal>
                <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-4`}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Leaf className={`w-4 h-4 ${accent.text}`} />
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Possible Nutritional Gaps
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Based on your recent symptoms, your body may benefit from more:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.state.deficiencies.map((d) => (
                      <span
                        key={d}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${accent.badge} border border-current/10`}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* ─── Integration Links ─────────────────────────────────────── */}
            <ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Link
                  to="/symptom-checker"
                  className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                >
                  <Activity className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Symptom Insights</p>
                    <p className="text-[11px] text-muted-foreground">See your patterns</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/deficiency-insights"
                  className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                >
                  <Zap className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Deficiency Insights</p>
                    <p className="text-[11px] text-muted-foreground">Analyze nutrients</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/wellness"
                  className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                >
                  <Sparkles className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Wellness Dashboard</p>
                    <p className="text-[11px] text-muted-foreground">Full health overview</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/calendar"
                  className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                >
                  <Calendar className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Log Symptoms</p>
                    <p className="text-[11px] text-muted-foreground">Keep data fresh</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PUBERTY NUTRITION VIEW ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const NUTRIENT_ICON: Record<string, typeof Sun> = {
  iron: Heart,
  vitamin_d: Sun,
  calcium: Bone,
  energy: Battery,
  electrolyte: Droplets,
  omega3: Brain,
  b12: Pill,
};

const CONFIDENCE_STYLE: Record<Confidence, { bg: string; text: string; ringColor: string; label: string }> = {
  High: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ringColor: "border-amber-300",
    label: "High likelihood",
  },
  Medium: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ringColor: "border-blue-300",
    label: "Medium likelihood",
  },
  Low: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    ringColor: "border-slate-300",
    label: "Low likelihood",
  },
};

function DeficiencyCard({
  prediction,
  accent,
  index,
}: {
  prediction: PubertyDeficiencyPrediction;
  accent: any;
  index: number;
}) {
  const [showWhy, setShowWhy] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(index === 0);
  const confStyle = CONFIDENCE_STYLE[prediction.confidence];
  const Icon = NUTRIENT_ICON[prediction.id] ?? Leaf;

  return (
    <div
      className={`rounded-2xl border-2 ${confStyle.ringColor} bg-card overflow-hidden transition-all duration-300 hover:shadow-lg`}
    >
      {/* ── Card Header ── */}
      <div className={`px-5 py-4 ${confStyle.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confStyle.bg} border ${confStyle.ringColor}`}>
              <span className="text-xl">{prediction.emoji}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{prediction.nutrient}</h3>
              <p className={`text-[11px] font-semibold ${confStyle.text} mt-0.5`}>
                {confStyle.label}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${confStyle.ringColor} ${confStyle.bg} ${confStyle.text}`}
          >
            {prediction.confidence}
          </span>
        </div>
      </div>

      {/* ── Explanation ── */}
      <div className="px-5 py-4 border-t border-border/30">
        <p className="text-sm text-foreground/85 leading-relaxed">
          {prediction.explanation}
        </p>

        {/* Trigger symptoms */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {prediction.triggers.map((trigger) => (
            <span
              key={trigger}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground border border-border/30"
            >
              {trigger}
            </span>
          ))}
        </div>

        {/* ── Why this suggestion (expandable) ── */}
        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="flex items-center gap-1.5 mt-3 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          Why this suggestion?
          {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: showWhy ? "200px" : "0px", opacity: showWhy ? 1 : 0 }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 bg-muted/20 rounded-lg p-3 border border-border/20">
            {prediction.whyThisSuggestion}
          </p>
        </div>
      </div>

      {/* ── Recommendations (expandable) ── */}
      <div className="border-t border-border/30">
        <button
          type="button"
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
            🍽️ Recommended Support
          </span>
          {showRecommendations ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: showRecommendations ? "600px" : "0px", opacity: showRecommendations ? 1 : 0 }}
        >
          <div className="px-5 pb-5 space-y-4">
            {/* Food suggestions */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Foods to include
              </p>
              <div className="flex flex-wrap gap-2">
                {prediction.foods.map((food) => (
                  <span
                    key={food}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-gradient-to-r ${accent.gradient} text-white shadow-sm`}
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>

            {/* Habit suggestions */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Healthy habits
              </p>
              <ul className="space-y-1.5 ml-4">
                {prediction.habits.map((habit, i) => (
                  <li key={i} className="text-sm text-foreground/85 list-disc leading-relaxed">
                    {habit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Daily tip */}
            <div className={`rounded-xl ${accent.bg} border ${accent.border} p-3 flex items-start gap-2.5`}>
              <Zap className={`w-4 h-4 ${accent.text} shrink-0 mt-0.5`} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Daily Tip
                </p>
                <p className="text-sm font-medium text-foreground/90">{prediction.dailyTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PubertyNutritionView({
  data,
  chart,
  accent,
}: {
  data: PubertyNutritionResult;
  chart: PubertyDailyFoodChart | null;
  accent: any;
}) {
  const [selectedBySlot, setSelectedBySlot] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    if (!chart) return init;
    for (const slot of Object.keys(chart.meals) as MealSlot[]) {
      init[slot] = chart.meals[slot].selectedOptionId;
    }
    return init;
  });

  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  const effectiveSelectedBySlot = useMemo(() => {
    if (!chart) return selectedBySlot;
    const next = { ...selectedBySlot };
    for (const slot of Object.keys(chart.meals) as MealSlot[]) {
      if (!next[slot]) next[slot] = chart.meals[slot].selectedOptionId;
    }
    return next;
  }, [chart, selectedBySlot]);

  return (
    <>
      {/* ── Safety Banner ──────────────────────────────────────────────── */}
      <ScrollReveal>
        <div className="rounded-xl border border-rose-200/60 bg-gradient-to-r from-rose-50/50 to-pink-50/30 p-4">
          <p className="text-xs text-rose-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span>
              <strong>Important:</strong> This is not a diagnostic tool. The insights below are
              based on your logged symptoms and profile data. They use probability-based language
              and are meant for general awareness only. Always consult a healthcare professional for
              medical advice.
            </span>
          </p>
        </div>
      </ScrollReveal>

      {/* ── Dynamic Daily Food Chart ─────────────────────────────────────── */}
      {chart && (
        <ScrollReveal delay={60}>
          <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                Daily Food Chart
              </p>
              <h2 className="text-lg font-bold leading-snug">Personalized meals for today</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Puberty status: <strong>{chart.pubertyStatus}</strong> • Diet: <strong>{chart.dietType}</strong>
              </p>
            </div>

            {(chart.medicalConditions.length > 0 || chart.detectedSymptoms.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {chart.medicalConditions.slice(0, 6).map((c) => (
                  <span key={c} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                    🩺 {c}
                  </span>
                ))}
                {chart.detectedSymptoms.slice(0, 6).map((s) => (
                  <span key={s} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                    ⚡ {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {(Object.keys(chart.meals) as MealSlot[]).map((slot) => {
                const meal = chart.meals[slot];
                const selectedId = effectiveSelectedBySlot[slot] ?? meal.selectedOptionId;
                const selectedOpt = meal.options.find((o) => o.id === selectedId) ?? meal.options[0];
                const isOpen = !!expandedWhy[slot];

                return (
                  <div key={slot} className="rounded-xl border border-border/40 bg-background/70 p-4">
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-[220px]">
                        <p className="text-xs font-semibold text-muted-foreground">{slot}</p>
                        <p className="text-sm font-bold mt-1">{selectedOpt?.label}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {(selectedOpt?.tags ?? []).slice(0, 6).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 border border-border/30 text-muted-foreground font-semibold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="min-w-[220px] flex-1">
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                          Swap option
                        </label>
                        <select
                          value={selectedId}
                          onChange={(e) => setSelectedBySlot((prev) => ({ ...prev, [slot]: e.target.value }))}
                          className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
                        >
                          {meal.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => setExpandedWhy((prev) => ({ ...prev, [slot]: !prev[slot] }))}
                          className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Why this food?
                          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{ maxHeight: isOpen ? "220px" : "0px", opacity: isOpen ? 1 : 0 }}
                    >
                      <div className="mt-3 rounded-lg bg-muted/20 border border-border/30 p-3 space-y-2">
                        {(selectedOpt?.why ?? []).length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                              Food reason
                            </p>
                            <ul className="space-y-1">
                              {selectedOpt.why.map((w) => (
                                <li key={w} className="text-xs text-foreground/80 leading-relaxed">
                                  • {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(meal.slotWhy ?? []).length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                              Personalization
                            </p>
                            <ul className="space-y-1">
                              {meal.slotWhy.map((w) => (
                                <li key={w} className="text-xs text-foreground/80 leading-relaxed">
                                  • {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {chart.avoidOrLimit.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2">
                  Avoid / Limit
                </p>
                <div className="flex flex-wrap gap-2">
                  {chart.avoidOrLimit.slice(0, 10).map((x) => (
                    <span
                      key={x}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-amber-200 text-amber-900"
                    >
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      )}

      {/* ── Age Group Badge ──────────────────────────────────────────── */}
      <ScrollReveal delay={50}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full border ${accent.border} ${accent.bg} ${accent.text} px-3 py-1`}>
            🌸 {data.ageGroup.label}
          </span>
          <span className="text-[11px] text-muted-foreground">
            Recommendations tuned for your age group
          </span>
        </div>
      </ScrollReveal>

      {data.hasData && data.deficiencies.length > 0 ? (
        <div className="space-y-6">
          {/* ── Section 1: Deficiency Cards ─────────────────────────────── */}
          <ScrollReveal delay={100}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔍</span>
              <h2 className="text-lg font-bold tracking-tight">Your Nutritional Insights</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your recent symptoms and health data, here are areas where your body may need extra support:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {data.deficiencies.map((pred, i) => (
                <DeficiencyCard key={pred.id} prediction={pred} accent={accent} index={i} />
              ))}
            </div>
          </ScrollReveal>

          {/* ── Section 2: General Tips ─────────────────────────────────── */}
          <ScrollReveal delay={150}>
            <SectionHeader title="General Daily Tips" emoji="⚡" />
            <div className="rounded-2xl border border-border/40 bg-card divide-y divide-border/30">
              {data.generalTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <span className="text-base mt-0.5 shrink-0">✅</span>
                  <p className="text-sm leading-relaxed text-foreground/85">{tip}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* ── Log More CTA ─────────────────────────────────────────────── */}
          <ScrollReveal delay={200}>
            <div className="flex justify-center">
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Calendar className="w-4 h-4" /> Log more symptoms for better accuracy
              </Link>
            </div>
          </ScrollReveal>

          {/* ── Integration Links ─────────────────────────────────────── */}
          <ScrollReveal delay={250}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/symptom-checker"
                className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
              >
                <Activity className={`w-5 h-5 ${accent.text}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Symptom Insights</p>
                  <p className="text-[11px] text-muted-foreground">See your patterns</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/wellness"
                className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
              >
                <Sparkles className={`w-5 h-5 ${accent.text}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Wellness Dashboard</p>
                  <p className="text-[11px] text-muted-foreground">Full health overview</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/calendar"
                className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
              >
                <Calendar className={`w-5 h-5 ${accent.text}`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Log Symptoms</p>
                  <p className="text-[11px] text-muted-foreground">Keep data fresh</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      ) : (
        /* ─── No Deficiencies / Empty State ──────────────────────────── */
        <ScrollReveal delay={100}>
          <div className="flex flex-col items-center justify-center text-center py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg`}>
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">
              {data.hasData ? "Looking Good! 🌟" : "Log Your Symptoms to Get Started"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
              {data.hasData
                ? "Based on your current data, no significant nutritional gaps were detected. Keep maintaining your healthy habits!"
                : "Log your daily symptoms in the Calendar to get personalized nutritional insights tailored to your body's needs."}
            </p>

            {/* General tips always shown */}
            <div className="w-full max-w-lg text-left mb-6">
              <SectionHeader title="General Daily Tips" emoji="⚡" />
              <div className="rounded-2xl border border-border/40 bg-card divide-y divide-border/30">
                {data.generalTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="text-base mt-0.5 shrink-0">✅</span>
                    <p className="text-sm leading-relaxed text-foreground/85">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/calendar"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
            >
              <Calendar className="w-4 h-4" />
              {data.hasData ? "Log More Symptoms" : "Go to Calendar"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      )}

      {/* ── Extended Disclaimer ──────────────────────────────────────── */}
      <ScrollReveal delay={300}>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 mt-2">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> {data.disclaimer} Do not start any supplements without
              consulting a doctor. These suggestions focus on food-based nutrition and healthy habits only.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MATERNITY NUTRITION VIEW (unchanged) ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function MaternityNutritionView({
  data,
  accent,
}: {
  data: MaternityPredictionResult;
  accent: any;
}) {
  return (
    <>
      <ScrollReveal>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 mb-2">
          <p className="text-xs text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> This is a dynamic prediction based on your recent calendar symptoms and pregnancy week. It is not a medical diagnosis. Always consult your doctor for medical advice.
            </span>
          </p>
        </div>
      </ScrollReveal>

      {/* Deficiency Insights Quick Access Card */}
      <ScrollReveal delay={20}>
        <Link
          to="/deficiency-insights"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Deficiency Insights</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Analyze symptoms and identify likely nutritional deficiencies based on calendar severity logs.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {/* Fitness & Health Calculator Card */}
      <ScrollReveal delay={30}>
        <Link
          to="/maternity/nutrition/fitness-health-calculator"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Fitness & Health Calculator</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Personalized calorie, protein, and hydration recommendations based on your profile.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {/* Personalized Diet Card */}
      <ScrollReveal delay={40}>
        <Link
          to="/maternity/nutrition/personalized-diet"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Personalized Diet</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Get a region-based diet plan personalized to your pregnancy stage and preferences.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {data.hasData && data.predictions.length > 0 ? (
        <div className="space-y-6">
          <ScrollReveal>
            <SectionHeader title="Possible Nutritional Gaps" emoji="🔍" />
            <div className="grid gap-4 md:grid-cols-2">
              {data.predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`rounded-2xl border-2 p-5 bg-card hover:shadow-md transition-all ${
                    pred.confidence === "High" ? "border-amber-200" : "border-border/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{pred.title}</h3>
                      <p className="text-sm text-primary font-semibold mt-0.5">{pred.nutrient}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        pred.confidence === "High"
                          ? "bg-amber-100 text-amber-800"
                          : pred.confidence === "Medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pred.confidence} Confidence
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why we predict this</p>
                      <p className="text-sm bg-muted/30 p-2.5 rounded-lg border border-border/50 text-foreground/90">
                        {pred.whyPredicted}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why it matters</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{pred.whyItMatters}</p>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Foods</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pred.foods.map((food) => (
                          <span
                            key={food}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r ${accent.gradient} text-white shadow-sm`}
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Healthy Habits</p>
                      <ul className="space-y-1.5 ml-4">
                        {pred.habits.map((habit, i) => (
                          <li key={i} className="text-sm text-foreground/85 list-disc">
                            {habit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Quick link below predictions */}
          <ScrollReveal delay={100}>
            <div className="flex justify-center mt-4">
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Calendar className="w-4 h-4" /> Log more symptoms for better accuracy
              </Link>
            </div>
          </ScrollReveal>
        </div>
      ) : data.fallback ? (
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center text-center py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg`}>
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{data.fallback.focusTitle}</h3>
            <p className="text-sm text-muted-foreground mb-4">Trimester {data.fallback.trimester} Recommendation</p>
            <p className="text-sm max-w-lg text-foreground/90 leading-relaxed mb-6">
              {data.fallback.whyItMatters}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl text-left">
              <div className="bg-card border border-border p-4 rounded-xl">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Focus Foods</p>
                <div className="flex flex-wrap gap-2">
                  {data.fallback.foods.map((f: string) => (
                    <span key={f} className="px-2 py-1 text-[11px] font-semibold bg-primary/10 text-primary rounded-lg border border-primary/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border p-4 rounded-xl">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Habits</p>
                <ul className="text-sm space-y-1.5 list-disc ml-4 text-foreground/90">
                  {data.fallback.habits.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-border/50 pt-6 w-full max-w-2xl">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Want personalized predictions?
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-primary/20 text-primary text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
              >
                <Calendar className="w-4 h-4" />
                Log your symptoms now
              </Link>
            </div>
          </div>
        </ScrollReveal>
      ) : null}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── FAMILY PLANNING NUTRITION VIEW ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function FamilyPlanningNutritionView({
  data,
  accent,
}: {
  data: FamilyPlanningPredictionResult;
  accent: any;
}) {
  return (
    <>
      <ScrollReveal>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 mb-2">
          <p className="text-xs text-teal-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> These suggestions aim to align your dietary habits optimally for fertility and preconception health.
            </span>
          </p>
        </div>
      </ScrollReveal>

      {data.hasData && data.predictions.length > 0 ? (
        <div className="space-y-6">
          <ScrollReveal>
            <SectionHeader title="Your Preconception Nutrient Gaps" emoji="🔍" />
            <div className="grid gap-4 md:grid-cols-2">
              {data.predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`rounded-2xl border-2 p-5 bg-card hover:shadow-md transition-all ${
                    pred.confidence === "High" ? "border-amber-200" : "border-border/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{pred.title}</h3>
                      <p className="text-sm text-primary font-semibold mt-0.5">{pred.nutrient}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        pred.confidence === "High"
                          ? "bg-amber-100 text-amber-800"
                          : pred.confidence === "Medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pred.confidence} Confidence
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why we predict this</p>
                      <p className="text-sm bg-muted/30 p-2.5 rounded-lg border border-border/50 text-foreground/90">
                        {pred.whyPredicted}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why it matters for preconception</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{pred.whyItMatters}</p>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Recommended Sources</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pred.foods.map((food) => (
                          <span
                            key={food}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r ${accent.gradient} text-white shadow-sm`}
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Healthy Habits</p>
                      <ul className="space-y-1.5 ml-4">
                        {pred.habits.map((habit, i) => (
                          <li key={i} className="text-sm text-foreground/85 list-disc">
                            {habit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex justify-center mt-4">
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Calendar className="w-4 h-4" /> Log more symptoms for better accuracy
              </Link>
            </div>
          </ScrollReveal>
        </div>
      ) : data.fallback ? (
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center text-center py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg`}>
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{data.fallback.focusTitle}</h3>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
              {data.fallback.whyItMatters}
            </p>

            <div className="w-full max-w-lg text-left mb-6">
               <SectionHeader title="Preconception Focus" emoji="📌" />
               <div className="rounded-2xl border border-border/40 bg-card divide-y divide-border/30">
                  <div className="px-5 py-3.5 border-b border-border/30">
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Base Foods</p>
                     <div className="flex flex-wrap gap-2">
                        {data.fallback.foods.map((food) => (
                           <span key={food} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r ${accent.gradient} text-white shadow-sm`}>{food}</span>
                        ))}
                     </div>
                  </div>
                  <div className="px-5 py-3.5">
                     <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Base Habits</p>
                     <ul className="space-y-1.5 ml-4">
                        {data.fallback.habits.map((habit, i) => (
                           <li key={i} className="text-sm text-foreground/85 list-disc">{habit}</li>
                        ))}
                     </ul>
                  </div>
               </div>
            </div>

            <Link
              to="/calendar"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
            >
              <Calendar className="w-4 h-4" />
              Go to Calendar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      ) : null}
    </>
  );
}
