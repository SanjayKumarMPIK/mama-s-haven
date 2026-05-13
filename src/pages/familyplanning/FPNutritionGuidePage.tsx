import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Apple,
  ArrowRight,
  HeartPulse,
  Scale,
  Salad,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  FP_NUTRITION_ACCENT,
  FP_NUTRITION_HOME,
  getFamilyPlanningAffirmation,
  getFPIntentMeta,
  getFPSymptomLabel,
  summarizeFPLogs,
} from "./fpNutritionShared";

export default function FPNutritionGuidePage() {
  const { simpleMode } = useLanguage();
  const { setPhase } = usePhase();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const { logs } = useHealthLog();
  const intent = fpProfile.intent ?? "tracking";

  useEffect(() => {
    void setPhase("family-planning");
  }, [setPhase]);

  const summary = useMemo(() => summarizeFPLogs(logs, 14), [logs]);
  const intentMeta = getFPIntentMeta(intent);
  const affirmation = useMemo(() => getFamilyPlanningAffirmation(intent, summary), [intent, summary]);
  const accent = FP_NUTRITION_ACCENT;

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
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
                  Personalized nutrition guidance for your family planning journey
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-8">
        <ScrollReveal>
          <div className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-relaxed text-foreground/90">{affirmation}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${accent.badge}`}>
                    {intentMeta.emoji} {intentMeta.label}
                  </span>
                  {summary.topSymptoms[0] && (
                    <span className="rounded-full bg-white/80 px-2.5 py-1 font-medium text-muted-foreground border border-border/50">
                      Recent focus: {getFPSymptomLabel(summary.topSymptoms[0])}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Explore Nutrition Tools</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Use these tools to support your goal, understand your body signals, and plan food and lifestyle habits with more confidence.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                to={`${FP_NUTRITION_HOME}/lifestyle`}
                icon={<div className="w-16 h-16 rounded-full bg-violet-50 flex items-center justify-center shrink-0"><HeartPulse className="w-8 h-8 text-violet-600" /></div>}
                title="Lifestyle"
                titleColor="text-violet-700"
                desc="Daily routine, stress, movement, sleep, and hydration guidance matched to your family planning goal."
              />
              <FeatureCard
                to={`${FP_NUTRITION_HOME}/fitness-health-calculator`}
                icon={<div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Scale className="w-8 h-8 text-blue-600" /></div>}
                title="Fitness Calculator"
                titleColor="text-blue-700"
                desc="Auto-calculated calories, protein, water, BMI, TDEE, and metabolism signals from your profile and logs."
              />
              <FeatureCard
                to={`${FP_NUTRITION_HOME}/personalized-diet`}
                icon={<div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Salad className="w-8 h-8 text-emerald-600" /></div>}
                title="Personalized Diet"
                titleColor="text-emerald-700"
                desc="Indian meal ideas, food guidance, and a daily checklist shaped around your goal, BMI, and symptoms."
              />
              <FeatureCard
                to={`${FP_NUTRITION_HOME}/nutrition-intelligence`}
                icon={<div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shrink-0"><Apple className="w-8 h-8 text-rose-600" /></div>}
                title="Nutrition Intelligence"
                titleColor="text-rose-600"
                desc="Symptom-based nutrient insights, deficiency risk overview, and food recommendations powered by your calendar logs."
              />
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="container pb-6">
        <ScrollReveal delay={100}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 mt-8 flex justify-center items-center">
            <p className="text-[11px] text-amber-800 flex items-center gap-1.5 text-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-blue-500 font-serif italic text-[12px] -mt-0.5">S</span>
              </span>
              <strong>This information is for awareness only, not a medical diagnosis. Consult a healthcare worker for personal advice.</strong>
            </p>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

function FeatureCard({ to, icon, title, titleColor, desc }: any) {
  return (
    <Link to={to} className="group relative rounded-[24px] border border-border/50 bg-card p-6 flex items-start gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {icon}
      <div className="flex-1 min-w-0 pr-10">
        <h3 className={`text-lg font-bold mb-2 ${titleColor}`}>{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <ArrowRight className="w-5 h-5" />
      </div>
    </Link>
  );
}
