import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { predictMaternityDeficiencies, type MaternityPredictionResult } from "@/lib/maternityNutritionEngine";
import { calculateFoodRestrictions, type FoodRestrictionResult } from "@/lib/nutrition/foodRestrictionEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import {
  ChevronRight, AlertTriangle, Info, ChevronDown, ChevronUp,
  Sun, Heart, Bone, Battery, Droplets, Brain, Pill, Leaf, Zap, XCircle, MinusCircle
} from "lucide-react";

// ─── Confidence styling ─────────────────────────────────────────────────────

const CONFIDENCE_STYLE: Record<"High" | "Medium" | "Low", { bg: string; text: string; ringColor: string; label: string }> = {
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

const NUTRIENT_ICON: Record<string, typeof Sun> = {
  iron: Heart,
  calcium: Bone,
  b6_folate: Pill,
  hydration_potassium: Droplets,
  magnesium: Battery,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function DeficiencyCard({
  prediction,
  accent,
  index,
}: {
  prediction: any;
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
      {/* Card Header */}
      <div className={`px-5 py-4 ${confStyle.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${confStyle.bg} border ${confStyle.ringColor}`}>
              <Icon className={`w-5 h-5 ${confStyle.text}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{prediction.title}</h3>
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

      {/* Explanation */}
      <div className="px-5 py-4 border-t border-border/30">
        <p className="text-sm text-foreground/85 leading-relaxed">
          {prediction.whyPredicted}
        </p>

        {/* Trigger symptoms */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {prediction.reasons.map((trigger: string) => (
            <span
              key={trigger}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground border border-border/30"
            >
              {trigger}
            </span>
          ))}
        </div>

        {/* Why this matters (expandable) */}
        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="flex items-center gap-1.5 mt-3 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          Why this matters
          {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{ maxHeight: showWhy ? "200px" : "0px", opacity: showWhy ? 1 : 0 }}
        >
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 bg-muted/20 rounded-lg p-3 border border-border/20">
            {prediction.whyItMatters}
          </p>
        </div>
      </div>

      {/* Recommendations (expandable) */}
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
                {prediction.foods.map((food: string) => (
                  <span
                    key={food}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm"
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
                {prediction.habits.map((habit: string, i: number) => (
                  <li key={i} className="text-sm text-foreground/85 list-disc leading-relaxed">
                    {habit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DeficiencyInsights() {
  const { phase } = usePhase();
  const { logs } = useHealthLog();
  const { trimester } = usePregnancyProfile();

  const accent = {
    gradient: "from-purple-500 to-violet-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/60",
    cardBg: "bg-gradient-to-br from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
  };

  // Compute maternity deficiency predictions
  const data = useMemo<MaternityPredictionResult>(() => {
    if (phase === "maternity") {
      return predictMaternityDeficiencies(logs, trimester);
    }
    return { hasData: false, predictions: [], fallback: null };
  }, [logs, phase, trimester]);

  // Compute food restrictions
  const foodRestrictions = useMemo<FoodRestrictionResult>(() => {
    if (phase === "maternity") {
      return calculateFoodRestrictions(logs, trimester as 1 | 2 | 3);
    }
    return { avoid: [], reduce: [], explanation: "", hasData: false };
  }, [logs, phase, trimester]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Deficiency Insights</h1>
                <p className="text-sm text-muted-foreground">
                  Based on your symptom tracking and health patterns
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Safety Banner */}
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

        {/* Empty State */}
        {!data.hasData && (
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg opacity-40`}>
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No symptom history available yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get personalized deficiency insights
                tailored to what your body needs.
              </p>
              <Link
                to="/calendar"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
              >
                Track Symptoms in Calendar
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* Fallback Recommendation (when no predictions but has data) */}
        {data.hasData && data.fallback && (
          <ScrollReveal>
            <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌸</span>
                <div>
                  <h2 className="text-lg font-bold">{data.fallback.focusTitle}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Trimester {data.fallback.trimester} focus</p>
                </div>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed mb-4">
                {data.fallback.whyItMatters}
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Foods to include
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.fallback.foods.map((food) => (
                      <span
                        key={food}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Healthy habits
                  </p>
                  <ul className="space-y-1.5 ml-4">
                    {data.fallback.habits.map((habit, i) => (
                      <li key={i} className="text-sm text-foreground/85 list-disc leading-relaxed">
                        {habit}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Deficiency Cards */}
        {data.hasData && data.predictions.length > 0 && (
          <ScrollReveal>
            <div className="grid gap-4 md:grid-cols-2">
              {data.predictions.map((pred, i) => (
                <DeficiencyCard key={pred.id} prediction={pred} accent={accent} index={i} />
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Foods to Avoid & Reduce Section */}
        {data.hasData && (
          <ScrollReveal delay={50}>
            <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <XCircle className={`w-5 h-5 ${accent.text}`} />
                <h2 className="text-base font-bold">Foods to Avoid & Reduce</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Based on your trimester, symptoms, and current health patterns.
              </p>

              {foodRestrictions.hasData ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Reduce Foods */}
                  <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <MinusCircle className="w-4 h-4 text-amber-600" />
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Reduce
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {foodRestrictions.reduce.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-amber-50 text-amber-800 border-amber-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Avoid Foods */}
                  <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Avoid
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {foodRestrictions.avoid.map((item) => (
                        <span
                          key={item}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-rose-50 text-rose-800 border-rose-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    No specific food restrictions detected yet.
                  </p>
                  <Link
                    to="/calendar"
                    className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                  >
                    Track more symptoms for personalized guidance
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {foodRestrictions.hasData && foodRestrictions.explanation && (
                <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {foodRestrictions.explanation}
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
