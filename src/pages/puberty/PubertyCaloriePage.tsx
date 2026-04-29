import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Info } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

export default function PubertyCaloriePage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();
  const data = useMemo(() => computeIntelligentNutrition(logs, profile, onboardingConfig), [logs, profile, onboardingConfig]);
  const calories = data.calories;

  const mealSplit = calories ? [
    { label: "Breakfast", pct: 25, kcal: Math.round(calories.dailyKcal * 0.25), emoji: "🌅", color: "from-orange-400 to-amber-400" },
    { label: "Mid-Morning Snack", pct: 10, kcal: Math.round(calories.dailyKcal * 0.1), emoji: "🍎", color: "from-green-400 to-emerald-400" },
    { label: "Lunch", pct: 35, kcal: Math.round(calories.dailyKcal * 0.35), emoji: "☀️", color: "from-yellow-400 to-orange-400" },
    { label: "Evening Snack", pct: 10, kcal: Math.round(calories.dailyKcal * 0.1), emoji: "🥜", color: "from-amber-400 to-yellow-400" },
    { label: "Dinner", pct: 20, kcal: Math.round(calories.dailyKcal * 0.2), emoji: "🌙", color: "from-violet-400 to-purple-400" },
  ] : [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f0] via-[#fdfbff] to-[#fff9f0] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        <ScrollReveal>
          <div className="rounded-[28px] border border-orange-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(249,115,22,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-200/40">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Calorie Intake</h1>
                  <p className="text-sm text-muted-foreground">Personalized daily calorie goal for your body</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {!calories ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Profile Weight Required</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Add your weight and activity level to your profile to get a personalized calorie goal.
              </p>
              <Link to="/profile" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                Update Profile
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <ScrollReveal delay={10}>
              <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 p-6 text-white shadow-lg shadow-orange-200/30">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">Your Daily Calorie Goal</p>
                <div className="flex items-end gap-2">
                  <p className="text-6xl font-black">{calories.dailyKcal}</p>
                  <div className="pb-2"><p className="text-2xl font-bold text-white/90">kcal</p><p className="text-xs text-white/70">per day</p></div>
                </div>
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Range</p>
                    <p className="text-sm font-bold">{calories.range[0]}–{calories.range[1]} kcal</p>
                  </div>
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Activity</p>
                    <p className="text-sm font-bold">{calories.activityLabel}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {calories.adjustmentNote && (
              <ScrollReveal delay={20}>
                <div className="flex items-start gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50/60">
                  <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800 leading-relaxed">{calories.adjustmentNote}</p>
                </div>
              </ScrollReveal>
            )}

            <ScrollReveal delay={30}>
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <h2 className="text-base font-bold mb-4">🍽️ Suggested Meal Distribution</h2>
                <div className="space-y-3">
                  {mealSplit.map((meal) => (
                    <div key={meal.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{meal.emoji}</span>
                          <span className="text-sm font-semibold">{meal.label}</span>
                        </div>
                        <span className="text-sm font-bold">{meal.kcal} kcal <span className="text-xs text-muted-foreground">({meal.pct}%)</span></span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div className={`h-2 rounded-full bg-gradient-to-r ${meal.color}`} style={{ width: `${meal.pct * 2.5}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={40}>
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h2 className="text-sm font-bold mb-3">💡 Calorie Tips for Puberty</h2>
                <div className="space-y-2">
                  {[
                    "Never eat below 1,400 kcal/day during puberty — your body needs fuel for growth.",
                    "Focus on calorie quality: choose nutrient-dense foods over empty-calorie snacks.",
                    "If you're very active (sports, dance, gym), you may need 200–400 kcal more.",
                    "Eating every 3–4 hours stabilizes energy levels and prevents overeating.",
                    "Include healthy fats (nuts, seeds, ghee) — they're calorie-dense and essential for hormones.",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 text-orange-500 font-bold text-sm mt-0.5">→</span>
                      <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
