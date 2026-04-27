import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { getFoodsToAvoid, analyzeSymptomFrequency } from "@/lib/familyPlanningNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { ArrowLeft, AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

export default function FPFoodsToAvoidPage() {
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile?.intent ?? "tracking";

  const foodsToAvoid = useMemo(() => getFoodsToAvoid(intent), [intent]);
  const frequency = useMemo(() => analyzeSymptomFrequency(logs, 30), [logs]);

  const hasSleepIssues = frequency.some(s => s.symptomId === "sleepIssues" && s.percentage >= 20);
  const hasStress = frequency.some(s => s.symptomId === "stress" && s.percentage >= 20);
  const hasMoodChanges = frequency.some(s => (s.symptomId === "moodChanges" || s.symptomId === "moodSwings") && s.percentage >= 20);

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
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Foods to Avoid</h1>
                  <p className="text-sm text-muted-foreground">
                    Hormone disruptors and dietary watchpoints for your goal
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Personalized warnings */}
        {(hasSleepIssues || hasStress || hasMoodChanges) && (
          <ScrollReveal>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Personalized for your symptoms:</strong>
                  {hasSleepIssues && " Caffeine warnings highlighted due to your sleep issues."}
                  {hasStress && " Sugar reduction emphasized — stress + sugar worsen cortisol spikes."}
                  {hasMoodChanges && " Processed food warnings enhanced — they can amplify mood instability."}
                </span>
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Food Categories */}
        <div className="space-y-4">
          {foodsToAvoid.map((item, idx) => {
            const isPersonalized = (
              (item.category === "Excess Caffeine" && hasSleepIssues) ||
              (item.category === "Refined Sugars" && hasStress) ||
              (item.category === "Processed Foods" && hasMoodChanges)
            );

            return (
              <ScrollReveal key={item.category} delay={idx * 10}>
                <div className={`rounded-2xl border-2 p-6 ${
                  item.severity === "high" ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"
                } ${isPersonalized ? "ring-2 ring-offset-2 ring-amber-300" : ""}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <h3 className="text-base font-bold">{item.category}</h3>
                      {isPersonalized && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          ⚡ Highlighted for you
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      item.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>{item.severity} impact</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.items.map((food) => (
                      <span key={food} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        item.severity === "high" ? "bg-red-100 text-red-800 border-red-300" : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}>{food}</span>
                    ))}
                  </div>

                  <div className="bg-white/60 rounded-xl p-4 border border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Why to Avoid</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{item.reason}</p>
                  </div>

                  {isPersonalized && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-100/50 border border-amber-200/50">
                      <p className="text-xs text-amber-800">
                        <strong>Your data:</strong>
                        {item.category === "Excess Caffeine" && hasSleepIssues && " Sleep issues were logged frequently — caffeine worsens sleep quality and delays onset."}
                        {item.category === "Refined Sugars" && hasStress && " Stress was frequently logged — sugar causes insulin spikes that amplify cortisol release."}
                        {item.category === "Processed Foods" && hasMoodChanges && " Mood changes detected — trans fats and additives in processed foods can worsen emotional instability."}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Healthy Alternatives */}
        <ScrollReveal delay={60}>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
            <h3 className="text-base font-bold mb-3 text-emerald-800">✅ Healthy Alternatives</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-white/60 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm font-semibold mb-1">Instead of processed snacks</p>
                <p className="text-xs text-foreground/70">Try pumpkin seeds, almonds, roasted makhana, or fresh fruits with nut butter.</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm font-semibold mb-1">Instead of sugary drinks</p>
                <p className="text-xs text-foreground/70">Try infused water (cucumber-mint), coconut water, or herbal teas.</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm font-semibold mb-1">Instead of excess caffeine</p>
                <p className="text-xs text-foreground/70">Try chamomile tea, rooibos, or golden milk (turmeric + warm milk).</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4 border border-emerald-100">
                <p className="text-sm font-semibold mb-1">Instead of refined carbs</p>
                <p className="text-xs text-foreground/70">Try whole grains, millets (ragi, jowar), or sweet potatoes for sustained energy.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={70}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> These are general dietary guidelines. Individual tolerances vary. Consult your healthcare provider or a nutritionist for personalized advice.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Link to="/nutrition" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Nutrition Guide
          </Link>
        </ScrollReveal>
      </div>
      <SafetyDisclaimer />
    </main>
  );
}
