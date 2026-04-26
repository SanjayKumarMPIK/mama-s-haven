import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Droplets, Sparkles } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

export default function PubertyHydrationPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const data = useMemo(
    () => computeIntelligentNutrition(logs, profile, onboardingConfig),
    [logs, profile, onboardingConfig]
  );

  const hydration = data.hydration;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0f9ff] via-[#fdfbff] to-[#f9fdff] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="rounded-[28px] border border-cyan-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(6,182,212,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shadow-cyan-200/40">
                  <Droplets className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Hydration Tracking</h1>
                  <p className="text-sm text-muted-foreground">
                    Daily water goal based on weight, climate & activity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {!hydration ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Droplets className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Profile Weight Required</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                We need your weight from your profile to calculate a personalized hydration goal.
              </p>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Update Profile
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Daily Goal Hero */}
            <ScrollReveal delay={10}>
              <div className="rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-6 text-white shadow-lg shadow-cyan-200/30">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">
                  Your Daily Water Goal
                </p>
                <div className="flex items-end gap-3">
                  <p className="text-6xl font-black">{hydration.dailyGoalLiters}</p>
                  <div className="pb-2">
                    <p className="text-2xl font-bold text-white/90">Liters</p>
                    <p className="text-xs text-white/70">per day</p>
                  </div>
                  <Droplets className="w-12 h-12 text-white/30 ml-auto mb-1" />
                </div>

                {/* Breakdown */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/20 p-3 text-center">
                    <p className="text-lg font-bold">{hydration.baseMl} ml</p>
                    <p className="text-[10px] text-white/70 mt-0.5">Base</p>
                  </div>
                  {hydration.climateAddMl > 0 && (
                    <div className="rounded-xl bg-white/20 p-3 text-center">
                      <p className="text-lg font-bold">+{hydration.climateAddMl} ml</p>
                      <p className="text-[10px] text-white/70 mt-0.5">Climate</p>
                    </div>
                  )}
                  {hydration.activityAddMl > 0 && (
                    <div className="rounded-xl bg-white/20 p-3 text-center">
                      <p className="text-lg font-bold">+{hydration.activityAddMl} ml</p>
                      <p className="text-[10px] text-white/70 mt-0.5">Activity</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollReveal>

            {/* Time Distribution */}
            <ScrollReveal delay={20}>
              <div className="rounded-2xl border border-cyan-200/60 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-500" />
                  Daily Distribution Schedule
                </h2>
                <div className="space-y-3">
                  {hydration.distribution.map((slot, i) => (
                    <div
                      key={slot.slot}
                      className="rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 p-4"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <p className="text-sm font-bold text-foreground">{slot.slot}</p>
                        <span className="shrink-0 text-sm font-black text-cyan-700">
                          {slot.amount}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{slot.tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Smart Alerts */}
            {hydration.alerts.length > 0 && (
              <ScrollReveal delay={30}>
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-2">
                    <span>⚠️</span> Hydration Alerts
                  </h2>
                  <div className="space-y-2.5">
                    {hydration.alerts.map((alert, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-amber-100"
                      >
                        <span className="shrink-0 text-lg">{alert.emoji}</span>
                        <p className="text-sm text-foreground/80 leading-relaxed">{alert.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Tips */}
            <ScrollReveal delay={40}>
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  Hydration Tips
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { emoji: "🍋", tip: "Add lemon or mint to water to make it more enjoyable." },
                    { emoji: "🥥", tip: "Coconut water (nariyal paani) counts as excellent hydration." },
                    { emoji: "🍵", tip: "Herbal teas (tulsi, ginger) are great hydrating options." },
                    { emoji: "🥗", tip: "Foods like cucumber, tomato, and watermelon also add to your hydration." },
                    { emoji: "⏰", tip: "Drink a glass of water first thing in the morning before anything else." },
                    { emoji: "📱", tip: "Set hourly reminders to sip water throughout the day." },
                  ].map(({ emoji, tip }) => (
                    <div
                      key={tip}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-50/50 border border-cyan-100"
                    >
                      <span className="shrink-0 text-base">{emoji}</span>
                      <p className="text-xs text-foreground/80 leading-relaxed">{tip}</p>
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
