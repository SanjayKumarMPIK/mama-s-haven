import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Sparkles } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

export default function PubertyFoodRestrictionsPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const data = useMemo(
    () => computeIntelligentNutrition(logs, profile, onboardingConfig),
    [logs, profile, onboardingConfig]
  );

  const avoidList = data.foodRestrictions.filter((f) => f.category === "avoid");
  const reduceList = data.foodRestrictions.filter((f) => f.category === "reduce");

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8f0] via-[#fdfbff] to-[#fff9f0] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="rounded-[28px] border border-amber-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(245,158,11,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-md shadow-amber-200/40">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Foods to Avoid / Reduce</h1>
                  <p className="text-sm text-muted-foreground">
                    Based on your symptoms & medical conditions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {!data.hasData || data.foodRestrictions.length === 0 ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Restrictions Detected</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Based on your current symptoms and profile, no specific food restrictions are
                recommended. Log more symptoms or add medical conditions to your profile for personalized guidance.
              </p>
              <div className="flex gap-3 flex-wrap justify-center">
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-red-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  Log Symptoms
                </Link>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm font-semibold hover:bg-amber-100 transition-all"
                >
                  Update Profile
                </Link>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Summary */}
            <ScrollReveal delay={10}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 text-center">
                  <p className="text-3xl font-black text-red-600">{avoidList.length}</p>
                  <p className="text-xs font-semibold text-red-700/80 mt-1">Foods to Avoid</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-center">
                  <p className="text-3xl font-black text-amber-600">{reduceList.length}</p>
                  <p className="text-xs font-semibold text-amber-700/80 mt-1">Foods to Reduce</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Avoid Section */}
            {avoidList.length > 0 && (
              <ScrollReveal delay={20}>
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-red-700 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                    Avoid Completely
                  </h2>
                  <div className="space-y-2.5">
                    {avoidList.map((f) => (
                      <div
                        key={f.food}
                        className="flex items-start gap-3 p-4 rounded-xl bg-red-50/80 border border-red-200/60 hover:shadow-sm transition-shadow"
                      >
                        <span className="text-xl shrink-0">🚫</span>
                        <div>
                          <p className="text-sm font-semibold text-red-900">{f.food}</p>
                          <p className="text-xs text-red-700/80 mt-0.5 leading-relaxed">{f.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Reduce Section */}
            {reduceList.length > 0 && (
              <ScrollReveal delay={30}>
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-700 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    Reduce Intake
                  </h2>
                  <div className="space-y-2.5">
                    {reduceList.map((f) => (
                      <div
                        key={f.food}
                        className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/80 border border-amber-200/60 hover:shadow-sm transition-shadow"
                      >
                        <span className="text-xl shrink-0">⚠️</span>
                        <div>
                          <p className="text-sm font-semibold text-amber-900">{f.food}</p>
                          <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">{f.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* General good practices */}
            <ScrollReveal delay={50}>
              <div className="rounded-xl border border-green-200 bg-green-50/50 p-5">
                <h2 className="text-sm font-bold mb-3 flex items-center gap-2 text-green-800">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  General Eating Principles
                </h2>
                <div className="space-y-2">
                  {[
                    { emoji: "✅", text: "Eat 3 balanced meals and 2 healthy snacks daily. Never skip meals." },
                    { emoji: "✅", text: "Choose whole grains (ragi, bajra, jowar) over refined flour (maida)." },
                    { emoji: "✅", text: "Pair iron-rich foods with Vitamin C sources (lemon, amla) for better absorption." },
                    { emoji: "✅", text: "Avoid eating heavy meals within 2 hours of bedtime." },
                    { emoji: "✅", text: "Cook with minimal oil — prefer steaming, pressure cooking, or baking." },
                  ].map(({ emoji, text }) => (
                    <div key={text} className="flex items-start gap-2.5">
                      <span className="shrink-0">{emoji}</span>
                      <p className="text-sm text-green-800/80 leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Context */}
            <ScrollReveal delay={60}>
              <div className="rounded-xl border border-border/40 bg-card p-4 text-xs text-muted-foreground">
                Restrictions are based on detected conditions:{" "}
                <strong>{(profile?.medicalConditions ?? []).join(", ") || "None detected"}</strong>{" "}
                and symptoms logged in the last 30 days.
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
