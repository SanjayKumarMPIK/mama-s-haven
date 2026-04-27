import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { getCyclePhaseNutrition, analyzeSymptomFrequency } from "@/lib/familyPlanningNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { ArrowLeft, Calendar, ShieldCheck, Sparkles, Droplets } from "lucide-react";

export default function FPCycleNutritionPage() {
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();

  const cycleNutrition = useMemo(
    () => getCyclePhaseNutrition(profile?.lastPeriodDate ?? "", profile?.cycleLength ?? 28),
    [profile?.lastPeriodDate, profile?.cycleLength],
  );

  const frequency = useMemo(() => analyzeSymptomFrequency(logs, 30), [logs]);
  const hasCramps = frequency.some(s => s.symptomId === "cramps" && s.percentage >= 20);
  const hasFatigue = frequency.some(s => s.symptomId === "fatigue" && s.percentage >= 20);

  const hydrationGoal = profile?.weight ? Math.round(profile.weight * 0.033 * 10) / 10 : 2.5;

  const phaseColors: Record<string, { bg: string; border: string; text: string; dot: string; ring: string }> = {
    rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", dot: "bg-rose-500", ring: "ring-rose-300" },
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", ring: "ring-emerald-300" },
    violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", dot: "bg-violet-500", ring: "ring-violet-300" },
    indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", dot: "bg-indigo-500", ring: "ring-indigo-300" },
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Cycle-Based Nutrition Plan</h1>
                  <p className="text-sm text-muted-foreground">
                    {cycleNutrition.currentPhase
                      ? `Day ${cycleNutrition.cycleDay} — ${cycleNutrition.phases.find(p => p.isCurrent)?.label}`
                      : "Log your period to get phase-specific recommendations"}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Hydration & Phase Summary */}
        <ScrollReveal>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <p className="text-sm font-bold">Today's Hydration</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{hydrationGoal}L</p>
              <p className="text-xs text-muted-foreground mt-1">Based on your weight ({profile?.weight ?? "—"}kg)</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-violet-500" />
                <p className="text-sm font-bold">Cycle Day</p>
              </div>
              <p className="text-2xl font-bold text-violet-600">{cycleNutrition.cycleDay ?? "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{cycleNutrition.phases.find(p => p.isCurrent)?.label ?? "Track your period"}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* Symptom-driven adjustments */}
        {(hasCramps || hasFatigue) && (
          <ScrollReveal delay={5}>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Adapted for you:</strong>
                  {hasCramps && " Extra magnesium-rich foods added for cramp relief."}
                  {hasFatigue && " Iron-boosting recommendations emphasized for energy."}
                </span>
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* 4 Phase Cards */}
        <div className="space-y-4">
          {cycleNutrition.phases.map((phase, idx) => {
            const c = phaseColors[phase.color] ?? phaseColors.emerald;
            return (
              <ScrollReveal key={phase.phase} delay={10 + idx * 10}>
                <div className={`rounded-2xl border-2 p-6 transition-all ${
                  phase.isCurrent
                    ? `${c.border} ${c.bg} shadow-lg ring-2 ring-offset-2 ${c.ring}`
                    : "border-border/40 bg-card"
                }`}>
                  <div className="flex items-center gap-3 mb-3">
                    {phase.isCurrent && <span className={`w-3 h-3 rounded-full ${c.dot} animate-pulse`} />}
                    <span className="text-2xl">{phase.emoji}</span>
                    <div className="flex-1">
                      <h3 className={`text-base font-bold ${phase.isCurrent ? c.text : ""}`}>{phase.label}</h3>
                      <p className="text-xs text-muted-foreground">{phase.dayRange} • {phase.focus}</p>
                    </div>
                    {phase.isCurrent && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
                        Current Phase
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">{phase.description}</p>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Focus Foods</p>
                      <div className="flex flex-wrap gap-1.5">
                        {phase.foods.map((food) => (
                          <span key={food} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-background border-border/40">{food}</span>
                        ))}
                        {/* Dynamic additions based on symptoms */}
                        {phase.isCurrent && hasCramps && phase.phase === "luteal" && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm">Pumpkin Seeds ✨</span>
                        )}
                        {phase.isCurrent && hasFatigue && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-red-400 to-rose-400 text-white shadow-sm">Pomegranate ✨</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Nutrition Tips</p>
                      <ul className="space-y-1.5">
                        {phase.tips.map((tip, i) => (
                          <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0 bg-primary/50" /> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {phase.isCurrent && (
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Droplets className="w-3 h-3" />
                        Phase hydration target: <strong>{(hydrationGoal + (phase.phase === "ovulatory" ? 0.3 : 0)).toFixed(1)}L</strong>
                        {phase.phase === "ovulatory" && " (+0.3L for cervical mucus support)"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={60}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> Cycle-based nutrition is a general wellness guide. Individual needs may vary. Consult your healthcare provider for personalized advice.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={70}>
          <Link to="/nutrition" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Nutrition Guide
          </Link>
        </ScrollReveal>
      </div>
      <SafetyDisclaimer />
    </main>
  );
}
