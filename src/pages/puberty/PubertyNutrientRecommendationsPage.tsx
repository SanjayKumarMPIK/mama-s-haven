import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Apple, Zap, Info, Sparkles } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

const PRIORITY_CARD = {
  High: {
    border: "border-amber-200",
    bg: "bg-gradient-to-br from-amber-50/60 to-orange-50/40",
    badge: "border-amber-300 bg-amber-100 text-amber-800",
    foodGradient: "from-amber-500 to-orange-500",
    dot: "bg-amber-500",
  },
  Medium: {
    border: "border-blue-200",
    bg: "bg-gradient-to-br from-blue-50/60 to-indigo-50/40",
    badge: "border-blue-300 bg-blue-100 text-blue-800",
    foodGradient: "from-blue-500 to-indigo-500",
    dot: "bg-blue-500",
  },
  Low: {
    border: "border-slate-200",
    bg: "bg-gradient-to-br from-slate-50/60 to-gray-50/40",
    badge: "border-slate-300 bg-slate-100 text-slate-700",
    foodGradient: "from-slate-500 to-gray-500",
    dot: "bg-slate-400",
  },
};

export default function PubertyNutrientRecommendationsPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const data = useMemo(
    () => computeIntelligentNutrition(logs, profile, onboardingConfig),
    [logs, profile, onboardingConfig]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8fb] via-[#fdfbff] to-[#f9f9ff] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="rounded-[28px] border border-pink-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(236,72,153,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-md shadow-pink-200/40">
                  <Apple className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Recommended Nutrients & Foods</h1>
                  <p className="text-sm text-muted-foreground">
                    Prioritized nutrients with food sources & frequency guidance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Note banner */}
        <ScrollReveal delay={10}>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Personalized:</strong> Recommendations are based on your 30-day symptom logs,
                medical conditions, diet preference ({data.dietPreference}), and region ({data.regionLabel}).
              </span>
            </p>
          </div>
        </ScrollReveal>

        {!data.hasData || data.nutrientRecommendations.length === 0 ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Apple className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get personalized nutrient recommendations.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Go to Calendar
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {data.nutrientRecommendations.map((rec, i) => {
                const style = PRIORITY_CARD[rec.priority];
                return (
                  <ScrollReveal key={rec.id} delay={20 + i * 10}>
                    <div
                      className={`rounded-2xl border-2 ${style.border} ${style.bg} p-5 hover:shadow-md transition-all`}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{rec.emoji}</span>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{rec.nutrient}</h3>
                            <p className="text-[11px] text-muted-foreground">{rec.severityLabel}</p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}
                        >
                          {rec.priority}
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {rec.reason}
                      </p>

                      {/* Food sources */}
                      <div className="mb-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                          Food Sources
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.sources.map((food) => (
                            <span
                              key={food}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gradient-to-r ${style.foodGradient} text-white shadow-sm`}
                            >
                              {food}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Frequency */}
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-white/60">
                        <Zap className={`w-3.5 h-3.5 ${style.dot.replace("bg-", "text-")}`} />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Frequency:{" "}
                          <strong className="text-foreground/80">{rec.frequency}</strong>
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Special Notes */}
            {data.specialNotes.length > 0 && (
              <ScrollReveal delay={80}>
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4 text-violet-500" />
                    Special Guidance
                  </h2>
                  {data.specialNotes.map((note, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 ${
                        note.type === "medical"
                          ? "border-rose-200/60 bg-rose-50/40"
                          : "border-violet-200/60 bg-violet-50/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0">{note.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{note.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {note.advice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* Context */}
            <ScrollReveal delay={100}>
              <div className="rounded-xl border border-border/40 bg-card p-4 text-xs text-muted-foreground">
                Analysis based on <strong>{data.analyzedDays} days</strong> of logged data •{" "}
                <strong>{data.pubertyTiming} Puberty</strong> •{" "}
                <strong>{data.dietPreference}</strong> diet •{" "}
                <strong>{data.regionLabel}</strong> region
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
