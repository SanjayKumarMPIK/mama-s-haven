import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import {
  Apple, Calendar, ChevronRight, ArrowRight, Activity,
  Zap, Sparkles, ShieldCheck, Leaf,
} from "lucide-react";
import {
  computeNutritionInsights,
  type NutrientNeed,
} from "@/lib/nutritionInsightsEngine";

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

  const accent = phaseAccent[phase] ?? phaseAccent.puberty;

  // ── Compute nutrition insights (memoized) ──
  const data = useMemo(() => computeNutritionInsights(logs, phase), [logs, phase]);

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
        {!data.hasData ? (
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
