import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Utensils, ChevronDown, ChevronUp, Info, Sparkles } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import {
  generatePubertyDailyFoodChart,
  type MealSlot,
} from "@/lib/pubertyFoodChartEngine";
import ScrollReveal from "@/components/ScrollReveal";

export default function PubertyMealPlanPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const chart = useMemo(
    () => generatePubertyDailyFoodChart({ logs, profile, onboarding: onboardingConfig }),
    [logs, profile, onboardingConfig]
  );

  const [selectedBySlot, setSelectedBySlot] = useState<Record<string, string>>(() => {
    if (!chart) return {};
    const init: Record<string, string> = {};
    for (const slot of Object.keys(chart.meals) as MealSlot[]) {
      init[slot] = chart.meals[slot].selectedOptionId;
    }
    return init;
  });

  const [expandedWhy, setExpandedWhy] = useState<Record<string, boolean>>({});

  const effectiveSelected = useMemo(() => {
    if (!chart) return selectedBySlot;
    const next = { ...selectedBySlot };
    for (const slot of Object.keys(chart.meals) as MealSlot[]) {
      if (!next[slot]) next[slot] = chart.meals[slot].selectedOptionId;
    }
    return next;
  }, [chart, selectedBySlot]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f5f0ff] via-[#fdfbff] to-[#f9f0ff] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="rounded-[28px] border border-violet-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(139,92,246,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md shadow-violet-200/40">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Personalized Meals for Today</h1>
                  <p className="text-sm text-muted-foreground">
                    Region-based, diet-specific meal plan — swap options as you like
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {!chart ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Meal Plan Available</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Complete your profile (diet type, region) to get a personalized daily meal plan.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Update Profile
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Context Tags */}
            <ScrollReveal delay={10}>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200">
                  🌸 {chart.pubertyStatus}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                  🍽️ {chart.dietType} Diet
                </span>
                {chart.medicalConditions.slice(0, 3).map((c) => (
                  <span key={c} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                    🏥 {c}
                  </span>
                ))}
                {chart.detectedSymptoms.slice(0, 3).map((s) => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                    ⚡ {s}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            {/* Note */}
            <ScrollReveal delay={15}>
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <p className="text-xs text-blue-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dynamic Plan:</strong> This meal plan is generated based on your
                    detected symptoms, medical conditions, diet type, and region. Use the{" "}
                    <strong>Swap</strong> dropdown to pick alternative meals for each slot.
                  </span>
                </p>
              </div>
            </ScrollReveal>

            {/* Meal Slots */}
            <div className="space-y-4">
              {(Object.keys(chart.meals) as MealSlot[]).map((slot, i) => {
                const meal = chart.meals[slot];
                const selectedId = effectiveSelected[slot] ?? meal.selectedOptionId;
                const selectedOpt = meal.options.find((o) => o.id === selectedId) ?? meal.options[0];
                const isWhyOpen = !!expandedWhy[slot];

                return (
                  <ScrollReveal key={slot} delay={20 + i * 10}>
                    <div className="rounded-2xl border border-violet-200/60 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
                      {/* Slot Header */}
                      <div className="bg-gradient-to-r from-violet-50 to-purple-50 px-5 py-3 border-b border-violet-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-violet-600">{slot}</p>
                      </div>

                      <div className="p-5">
                        {/* Selected Meal Info */}
                        <div className="flex items-start gap-4 flex-wrap mb-4">
                          <div className="flex-1 min-w-[200px]">
                            <p className="text-lg font-bold text-foreground mb-2">{selectedOpt?.label}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(selectedOpt?.tags ?? []).slice(0, 6).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 border border-violet-200 text-violet-700 font-medium"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Swap control */}
                          <div className="min-w-[200px] flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
                              Swap Option
                            </label>
                            <select
                              value={selectedId}
                              onChange={(e) =>
                                setSelectedBySlot((prev) => ({ ...prev, [slot]: e.target.value }))
                              }
                              className="w-full h-10 rounded-xl border border-violet-200 bg-violet-50/50 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-300"
                            >
                              {meal.options.map((opt) => (
                                <option key={opt.id} value={opt.id}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Why this food toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedWhy((prev) => ({ ...prev, [slot]: !prev[slot] }))
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors"
                        >
                          <Info className="w-3.5 h-3.5" />
                          Why this food?
                          {isWhyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <div
                          className="transition-all duration-300 ease-in-out overflow-hidden"
                          style={{ maxHeight: isWhyOpen ? "300px" : "0px", opacity: isWhyOpen ? 1 : 0 }}
                        >
                          <div className="mt-3 rounded-xl bg-violet-50/60 border border-violet-100 p-3 space-y-1.5">
                            {(selectedOpt?.why ?? []).map((w) => (
                              <p key={w} className="text-xs text-foreground/80">• {w}</p>
                            ))}
                            {(meal.slotWhy ?? []).map((w) => (
                              <p key={w} className="text-xs text-foreground/80">• {w}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Avoid / Limit */}
            {chart.avoidOrLimit.length > 0 && (
              <ScrollReveal delay={80}>
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2">
                    ⚠️ Avoid / Limit Today
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {chart.avoidOrLimit.slice(0, 12).map((x) => (
                      <span
                        key={x}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-amber-300 text-amber-900"
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>
    </main>
  );
}
