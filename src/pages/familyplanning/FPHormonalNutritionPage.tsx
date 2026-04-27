import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import {
  getIntentNutrition,
  analyzeSymptomFrequency,
} from "@/lib/familyPlanningNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { ArrowLeft, Heart, ShieldCheck, Sparkles } from "lucide-react";

export default function FPHormonalNutritionPage() {
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile?.intent ?? "tracking";

  const intentNutrition = useMemo(() => getIntentNutrition(intent), [intent]);
  const frequency = useMemo(() => analyzeSymptomFrequency(logs, 30), [logs]);

  // Map symptoms to food recommendations dynamically
  const topSymptoms = frequency.slice(0, 3);
  const hasMoodIssues = topSymptoms.some(s => s.symptomId === "moodChanges" || s.symptomId === "moodSwings");
  const hasFatigue = topSymptoms.some(s => s.symptomId === "fatigue");
  const hasSleep = topSymptoms.some(s => s.symptomId === "sleepIssues");

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
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {intent === "ttc" ? "Fertility Boosting Nutrition" : intent === "avoid" ? "Hormonal Balance Nutrition" : "Balanced Hormonal Nutrition"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Personalized for {intentNutrition.intentLabel} {intentNutrition.intentEmoji}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Data-driven personalization banner */}
        {topSymptoms.length > 0 && (
          <ScrollReveal>
            <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
              <p className="text-xs text-teal-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Personalized for you:</strong> Based on your recent symptoms
                  ({topSymptoms.map(s => s.label).join(", ")}), we've highlighted the most relevant nutritional guidance below.
                </span>
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Dynamic symptom-based highlights */}
        {(hasMoodIssues || hasFatigue || hasSleep) && (
          <ScrollReveal delay={5}>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Based on Your Symptom Logs
              </h3>
              <div className="space-y-2">
                {hasMoodIssues && (
                  <p className="text-sm text-foreground/85">• <strong>Mood changes detected:</strong> Focus on Omega-3s and Vitamin B6 — these support neurotransmitter balance.</p>
                )}
                {hasFatigue && (
                  <p className="text-sm text-foreground/85">• <strong>Fatigue logged frequently:</strong> Prioritize iron-rich foods and Vitamin D — energy production depends on these.</p>
                )}
                {hasSleep && (
                  <p className="text-sm text-foreground/85">• <strong>Sleep issues noted:</strong> Include magnesium-rich foods in your evening meals — they promote relaxation.</p>
                )}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Nutrition Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {intentNutrition.cards.map((card, idx) => (
            <ScrollReveal key={card.title} delay={10 + idx * 10}>
              <div className="rounded-2xl border-2 border-border/40 bg-card p-6 hover:shadow-md transition-all h-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{card.emoji}</span>
                  <h3 className="text-base font-bold">{card.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{card.description}</p>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommended Foods</p>
                  <div className="flex flex-wrap gap-1.5">
                    {card.foods.map((food) => (
                      <span key={food} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm">{food}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tips</p>
                  <ul className="space-y-1.5">
                    {card.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-teal-500" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Disclaimer */}
        <ScrollReveal delay={60}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> Nutrition recommendations are generated from your symptom patterns and goal. Consult a doctor before making dietary changes.
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
