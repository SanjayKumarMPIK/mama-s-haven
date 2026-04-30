import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

export default function PubertyProteinPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();
  const data = useMemo(() => computeIntelligentNutrition(logs, profile, onboardingConfig), [logs, profile, onboardingConfig]);
  const protein = data.protein;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f0fff8] via-[#fdfbff] to-[#f0fff8] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        <ScrollReveal>
          <div className="rounded-[28px] border border-emerald-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(16,185,129,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200/40">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Protein Intake</h1>
                  <p className="text-sm text-muted-foreground">Daily protein goal with food sources</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {!protein ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Profile Weight Required</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Add your weight and activity level to your profile to get a personalized protein goal.
              </p>
              <Link to="/profile" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                Update Profile
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Hero */}
            <ScrollReveal delay={10}>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 text-white shadow-lg shadow-emerald-200/30">
                <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">Your Daily Protein Goal</p>
                <div className="flex items-end gap-2">
                  <p className="text-6xl font-black">{protein.dailyGrams}</p>
                  <div className="pb-2"><p className="text-2xl font-bold text-white/90">grams</p><p className="text-xs text-white/70">per day</p></div>
                </div>
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Range</p>
                    <p className="text-sm font-bold">{protein.range[0]}–{protein.range[1]} g</p>
                  </div>
                  <div className="rounded-xl bg-white/20 px-4 py-2">
                    <p className="text-[10px] text-white/70 uppercase tracking-wider">Tier</p>
                    <p className="text-sm font-bold capitalize">{protein.tier}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Food sources */}
            <ScrollReveal delay={20}>
              <div className="rounded-2xl border border-emerald-200/60 bg-white p-5">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Protein Food Sources
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {protein.sources.map((s) => (
                    <div key={s.name} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                      <span className="text-sm font-medium text-foreground/80 truncate pr-2">{s.name}</span>
                      <span className="text-sm font-black text-emerald-700 shrink-0">{s.grams}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Tips */}
            <ScrollReveal delay={30}>
              <div className="rounded-xl border border-border/40 bg-card p-5">
                <h2 className="text-sm font-bold mb-3">💡 Protein Tips for Puberty</h2>
                <div className="space-y-2">
                  {[
                    "Distribute protein across all 3 main meals — don't eat it all at once.",
                    "Pair dal + rice = complete protein. Add a small bowl of curd for extra protein.",
                    "Paneer, eggs, and soy chunks are highly efficient protein sources.",
                    "After physical activity, have a protein-rich snack within 30–60 minutes.",
                    "Sprouted legumes have higher protein bioavailability than unsprouted.",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="shrink-0 text-emerald-500 font-bold text-sm mt-0.5">→</span>
                      <p className="text-sm text-foreground/80 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Context */}
            <ScrollReveal delay={40}>
              <div className="rounded-xl border border-border/40 bg-card p-4 text-xs text-muted-foreground">
                Diet: <strong>{data.dietPreference}</strong> • Activity tier: <strong>{protein.tier === "fitness" ? "Active / Fitness" : "Normal"}</strong>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
