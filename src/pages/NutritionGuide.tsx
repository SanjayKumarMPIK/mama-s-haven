import { useMemo, useState } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import {
  Apple, Calendar, ChevronRight, ArrowRight, Activity,
  Zap, Sparkles, ShieldCheck, Leaf,
  AlertTriangle, Heart, Droplets, Utensils, CheckSquare
} from "lucide-react";
import {
  computeNutritionInsights,
  type NutrientNeed,
} from "@/lib/nutritionInsightsEngine";
import { predictMaternityDeficiencies, type MaternityPredictionResult, type MaternityFallbackRecommendation } from "@/lib/maternityNutritionEngine";
import { predictPubertyDeficiencies, type PubertyNutritionResult } from "@/lib/pubertyNutritionEngine";
import {
  predictFamilyPlanningDeficiencies,
  computeNutritionSummary,
  type FamilyPlanningPredictionResult,
  type NutritionSummary,
} from "@/lib/familyPlanningNutritionEngine";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import {
  generatePubertyDailyFoodChart,
  generatePubertyDeficiencyPlan,
  type PubertyDailyFoodChart,
  type PubertyDeficiencyPlan,
} from "@/lib/pubertyFoodChartEngine";
import { computeIntelligentNutrition, type IntelligentNutritionResult } from "@/lib/pubertyIntelligentNutritionEngine";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Phase accent map Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Priority color Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function priorityStyle(priority: NutrientNeed["priority"]) {
  return priority === "high"
    ? "border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60"
    : "border-border/40 bg-card";
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Main Component Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

export default function NutritionGuide() {
  const { simpleMode } = useLanguage();
  const { phase, phaseName } = usePhase();
  const { logs } = useHealthLog();
  const { trimester } = usePregnancyProfile();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const accent = phaseAccent[phase] ?? phaseAccent.puberty;

  // Ã¢â€â‚¬Ã¢â€â‚¬ Compute generic nutrition insights (memoized) Ã¢â€â‚¬Ã¢â€â‚¬
  const data = useMemo(() => computeNutritionInsights(logs, phase), [logs, phase]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Compute maternity specific insights (memoized) Ã¢â€â‚¬Ã¢â€â‚¬
  const maternityData = useMemo(() => {
    if (phase === "maternity") return predictMaternityDeficiencies(logs, trimester);
    return null;
  }, [logs, phase, trimester]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Compute puberty specific insights (memoized) Ã¢â€â‚¬Ã¢â€â‚¬
  const pubertyData = useMemo(() => {
    if (phase === "puberty") return predictPubertyDeficiencies(logs, profile, onboardingConfig);
    return null;
  }, [logs, phase, profile, onboardingConfig]);

  const pubertyFoodChart = useMemo<PubertyDailyFoodChart | null>(() => {
    if (phase !== "puberty") return null;
    return generatePubertyDailyFoodChart({
      logs,
      profile,
      onboarding: onboardingConfig,
    });
  }, [logs, phase, profile, onboardingConfig]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Compute intelligent puberty nutrition analysis (memoized) Ã¢â€â‚¬Ã¢â€â‚¬
  const intelligentNutrition = useMemo<IntelligentNutritionResult | null>(() => {
    if (phase !== "puberty") return null;
    return computeIntelligentNutrition(logs, profile, onboardingConfig);
  }, [logs, phase, profile, onboardingConfig]);

  const pubertyDeficiencyPlan = useMemo<PubertyDeficiencyPlan | null>(() => {
    if (phase !== "puberty") return null;
    return generatePubertyDeficiencyPlan({
      logs,
      profile,
      onboarding: onboardingConfig,
    });
  }, [logs, phase, profile, onboardingConfig]);

  // Ã¢â€â‚¬Ã¢â€â‚¬ Compute family planning specific insights (memoized) Ã¢â€â‚¬Ã¢â€â‚¬
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const familyPlanningData = useMemo(() => {
    if (phase === "family-planning") return predictFamilyPlanningDeficiencies(logs, fpProfile.intent);
    return null;
  }, [logs, phase, fpProfile.intent]);

  // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Render Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Header Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
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
                  Personalized for <strong>{phaseName}</strong> Ã¢â‚¬Â¢ Based on your symptoms
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ PUBERTY PHASE Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
        {phase === "puberty" && pubertyData ? (
          <PubertyNutritionView
            data={pubertyData}
            chart={pubertyFoodChart}
            plan={pubertyDeficiencyPlan}
            accent={accent}
            intelligent={intelligentNutrition}
          />
        ) : phase === "family-planning" && familyPlanningData ? (
          <FamilyPlanningNutritionView data={familyPlanningData} accent={accent} userProfile={profile} fpProfile={fpProfile} />
        ) : phase === "maternity" && maternityData ? (
          <MaternityNutritionView data={maternityData} accent={accent} />
        ) : !data.hasData ? (
          /* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Empty State Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */
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
            {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Section 1: Today's Nutrition Focus Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

            {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Section 2: Key Nutrients You Need Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            {data.nutrients.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Key Nutrients You Need" emoji="Ã°Å¸Â§Â " />
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

            {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Section 3: Smart Suggestions Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            {data.suggestions.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Smart Suggestions" emoji="Ã°Å¸Å½Â¯" />
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

            {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Section 4: Quick Tips Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            {data.tips.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Quick Tips" emoji="Ã¢Å¡Â¡" />
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

            {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Inferred Deficiencies Badge Row Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
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

            {/* Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Integration Links Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ */}
            <ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                  to="/deficiency-insights"
                  className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                >
                  <Zap className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Deficiency Insights</p>
                    <p className="text-[11px] text-muted-foreground">Analyze nutrients</p>
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

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Sub-Components Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ PUBERTY NUTRITION VIEW Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â




function PubertyNutritionView({ data, chart, plan, accent, intelligent }: { data: PubertyNutritionResult; chart: PubertyDailyFoodChart | null; plan: PubertyDeficiencyPlan | null; accent: any; intelligent: IntelligentNutritionResult | null }) {
  return (
    <>
      {/* Safety Banner */}
      <ScrollReveal>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Note:</strong> This is a dynamic prediction based on your recent calendar symptoms and profile data. It is not a medical diagnosis. Always consult your doctor for medical advice.</span>
          </p>
        </div>
      </ScrollReveal>

      {/* 1. Identified Deficiencies â€” Inline (like maternity) */}
      {intelligent && intelligent.hasData && intelligent.deficiencyList.length > 0 && (
        <ScrollReveal delay={10}>
          <SectionHeader title="Identified Deficiencies" emoji="âš¡" />
          <div className="grid gap-3 sm:grid-cols-2 mb-2">
            {intelligent.deficiencyList.map((d) => (
              <div
                key={d.nutrient}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 hover:shadow-md transition-all ${
                  d.priority === "High" ? "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                  : d.priority === "Medium" ? "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50"
                  : "border-border/40 bg-muted/10"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  d.priority === "High" ? "bg-amber-100 border border-amber-300"
                  : d.priority === "Medium" ? "bg-blue-100 border border-blue-300"
                  : "bg-muted/40 border border-border/30"
                }`}>
                  <span className="text-xl">{d.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{d.nutrient}</p>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      d.priority === "High" ? "bg-amber-200/70 text-amber-800"
                      : d.priority === "Medium" ? "bg-blue-200/70 text-blue-800"
                      : "bg-slate-200/70 text-slate-700"
                    }`}>{d.priority}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{d.reason}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Link
              to="/puberty/nutrition/deficiency-insights"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-800 transition-colors"
            >
              View full deficiency analysis <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </ScrollReveal>
      )}

      {/* 2. Recommended Nutrients & Foods */}
      {intelligent && intelligent.hasData && intelligent.nutrientRecommendations.length > 0 && (
        <ScrollReveal delay={20}>
          <Link
            to="/puberty/nutrition/nutrient-recommendations"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-md shrink-0">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Recommended Nutrients & Foods</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {intelligent.nutrientRecommendations.length} prioritized nutrients with food sources & frequency guidance.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* 3. Hydration */}
      {intelligent?.hydration && (
        <ScrollReveal delay={30}>
          <Link
            to="/puberty/nutrition/hydration"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-md shrink-0">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Hydration Tracking</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Daily goal: <strong>{intelligent.hydration.dailyGoalLiters}L</strong> â€” based on weight, climate & activity level.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* 4. Food Restrictions */}
      {intelligent && intelligent.foodRestrictions.length > 0 && (
        <ScrollReveal delay={40}>
          <Link
            to="/puberty/nutrition/food-restrictions"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-red-500 flex items-center justify-center shadow-md shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Foods to Avoid / Reduce</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {intelligent.foodRestrictions.filter(f => f.category === "avoid").length} to avoid â€¢ {intelligent.foodRestrictions.filter(f => f.category === "reduce").length} to reduce â€” based on symptoms & conditions.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* 5. Calorie Intake */}
      {intelligent?.calories && (
        <ScrollReveal delay={50}>
          <Link
            to="/puberty/nutrition/calories"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Calorie Intake</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                <strong>{intelligent.calories.dailyKcal} kcal/day</strong> â€” {intelligent.calories.activityLabel} activity level. Personalized for your body.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* 6. Protein Intake */}
      {intelligent?.protein && (
        <ScrollReveal delay={60}>
          <Link
            to="/puberty/nutrition/protein"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Protein Intake</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                <strong>{intelligent.protein.dailyGrams}g/day</strong> â€” {intelligent.protein.tier === "fitness" ? "Fitness" : "Normal"} tier. Food sources included.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* 7. Personalized Meals */}
      {chart && (
        <ScrollReveal delay={70}>
          <Link
            to="/puberty/nutrition/meal-plan"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md shrink-0">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Personalized Meals for Today</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {chart.pubertyStatus} â€¢ {chart.dietType} diet â€¢ Region-based recommendations with swap options.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* 8. Nutritional Insights */}
      {data.hasData && data.deficiencies.length > 0 && (
        <ScrollReveal delay={80}>
          <Link
            to="/puberty/nutrition/insights"
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md shrink-0">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-foreground">Your Nutritional Insights</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Detailed deficiency analysis â€” {data.deficiencies.length} nutrient gaps with foods, habits & daily tips.
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      )}

      {/* Disclaimer */}
      <ScrollReveal delay={100}>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> {data.disclaimer} Do not start any supplements without consulting a doctor. These suggestions focus on food-based nutrition and healthy habits only.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ MATERNITY NUTRITION VIEW (unchanged) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

function MaternityNutritionView({
  data,
  accent,
}: {
  data: MaternityPredictionResult;
  accent: any;
}) {
  return (
    <>
      <ScrollReveal>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 mb-2">
          <p className="text-xs text-blue-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> This is a dynamic prediction based on your recent calendar symptoms and pregnancy week. It is not a medical diagnosis. Always consult your doctor for medical advice.
            </span>
          </p>
        </div>
      </ScrollReveal>

      {/* Deficiency Insights Quick Access Card */}
      <ScrollReveal delay={20}>
        <Link
          to="/deficiency-insights"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Deficiency Insights</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Analyze symptoms and identify likely nutritional deficiencies based on calendar severity logs.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {/* Fitness & Health Calculator Card */}
      <ScrollReveal delay={30}>
        <Link
          to="/maternity/nutrition/fitness-health-calculator"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Fitness & Health Calculator</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Personalized calorie, protein, and hydration recommendations based on your profile.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {/* Personalized Diet Card */}
      <ScrollReveal delay={40}>
        <Link
          to="/maternity/nutrition/personalized-diet"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Personalized Diet</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Get a region-based diet plan personalized to your pregnancy stage and preferences.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {/* Nutrition Checklist Card */}
      <ScrollReveal delay={45}>
        <Link
          to="/maternity/nutrition/checklist"
          className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <CheckSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">Nutrition Checklist</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Track nutrition habits personalized to your trimester and symptoms.
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </Link>
      </ScrollReveal>

      {data.hasData && data.predictions.length > 0 ? (
        <div className="space-y-6">
          <ScrollReveal>
            <SectionHeader title="Possible Nutritional Gaps" emoji="Ã°Å¸â€Â" />
            <div className="grid gap-4 md:grid-cols-2">
              {data.predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`rounded-2xl border-2 p-5 bg-card hover:shadow-md transition-all ${
                    pred.confidence === "High" ? "border-amber-200" : "border-border/60"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{pred.title}</h3>
                      <p className="text-sm text-primary font-semibold mt-0.5">{pred.nutrient}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        pred.confidence === "High"
                          ? "bg-amber-100 text-amber-800"
                          : pred.confidence === "Medium"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {pred.confidence} Confidence
                    </span>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why we predict this</p>
                      <p className="text-sm bg-muted/30 p-2.5 rounded-lg border border-border/50 text-foreground/90">
                        {pred.whyPredicted}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why it matters</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{pred.whyItMatters}</p>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Foods</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pred.foods.map((food) => (
                          <span
                            key={food}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r ${accent.gradient} text-white shadow-sm`}
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Healthy Habits</p>
                      <ul className="space-y-1.5 ml-4">
                        {pred.habits.map((habit, i) => (
                          <li key={i} className="text-sm text-foreground/85 list-disc">
                            {habit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Quick link below predictions */}
          <ScrollReveal delay={100}>
            <div className="flex justify-center mt-4">
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
              >
                <Calendar className="w-4 h-4" /> Log more symptoms for better accuracy
              </Link>
            </div>
          </ScrollReveal>
        </div>
      ) : data.fallback ? (
        <ScrollReveal>
          <div className="flex flex-col items-center justify-center text-center py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg`}>
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1">{data.fallback.focusTitle}</h3>
            <p className="text-sm text-muted-foreground mb-4">Trimester {data.fallback.trimester} Recommendation</p>
            <p className="text-sm max-w-lg text-foreground/90 leading-relaxed mb-6">
              {data.fallback.whyItMatters}
            </p>

            <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl text-left">
              <div className="bg-card border border-border p-4 rounded-xl">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Focus Foods</p>
                <div className="flex flex-wrap gap-2">
                  {data.fallback.foods.map((f: string) => (
                    <span key={f} className="px-2 py-1 text-[11px] font-semibold bg-primary/10 text-primary rounded-lg border border-primary/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-card border border-border p-4 rounded-xl">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Key Habits</p>
                <ul className="text-sm space-y-1.5 list-disc ml-4 text-foreground/90">
                  {data.fallback.habits.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 border-t border-border/50 pt-6 w-full max-w-2xl">
              <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                Want personalized predictions?
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-primary/20 text-primary text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
              >
                <Calendar className="w-4 h-4" />
                Log your symptoms now
              </Link>
            </div>
          </div>
        </ScrollReveal>
      ) : null}
    </>
  );
}

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ FAMILY PLANNING NUTRITION VIEW Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

function FamilyPlanningNutritionView({
  data,
  accent,
  userProfile,
  fpProfile,
}: {
  data: FamilyPlanningPredictionResult;
  accent: any;
  userProfile: any;
  fpProfile: any;
}) {
  const { logs } = useHealthLog();
  const intent = fpProfile?.intent ?? "tracking";

  const summary = useMemo(
    () => computeNutritionSummary(logs, intent, userProfile?.lastPeriodDate ?? "", userProfile?.cycleLength ?? 28),
    [logs, intent, userProfile?.lastPeriodDate, userProfile?.cycleLength],
  );

  const intentLabel = intent === "ttc" ? "Trying to Conceive" : intent === "avoid" ? "Avoiding Pregnancy" : "Cycle Tracking";
  const intentEmoji = intent === "ttc" ? "💕" : intent === "avoid" ? "🛡️" : "📊";

  const riskColor = summary.risk.color === "red" ? "text-red-600" : summary.risk.color === "amber" ? "text-amber-600" : "text-emerald-600";
  const riskBg = summary.risk.color === "red" ? "bg-red-100" : summary.risk.color === "amber" ? "bg-amber-100" : "bg-emerald-100";

  const moduleCards = [
    {
      to: "/family-planning/nutrition/deficiency-insights",
      icon: <Zap className="w-6 h-6 text-white" />,
      gradient: "from-teal-500 to-emerald-500",
      title: "Deficiency Insights",
      description: data.hasData && data.predictions.length > 0
        ? `${data.predictions.length} nutrient gap${data.predictions.length > 1 ? "s" : ""} • Risk ${summary.risk.overallScore}/100`
        : "Analyze your symptoms for nutrient gaps",
      badge: data.predictions.length > 0 ? `${data.predictions.length} gaps` : null,
      badgeColor: data.predictions.length > 0 ? "bg-amber-100 text-amber-700" : "",
    },
    {
      to: "/family-planning/nutrition/hormonal-balance",
      icon: <Heart className="w-6 h-6 text-white" />,
      gradient: "from-teal-500 to-emerald-400",
      title: intent === "ttc" ? "Fertility Nutrition" : intent === "avoid" ? "Hormonal Balance" : "Hormonal Nutrition",
      description: intent === "ttc" ? "Fertility-boosting foods and pre-conception nutrients" : intent === "avoid" ? "Hormone regulation diet for cycle predictability" : "Support your body's natural hormonal rhythms",
      badge: null,
      badgeColor: "",
    },
    {
      to: "/family-planning/nutrition/cycle-plan",
      icon: <Calendar className="w-6 h-6 text-white" />,
      gradient: "from-violet-500 to-purple-500",
      title: "Cycle-Based Plan",
      description: summary.cyclePhaseLabel
        ? `Day ${summary.cycleDay} — ${summary.cyclePhaseLabel}`
        : "Log your period for phase-specific nutrition",
      badge: summary.cyclePhaseLabel ? "Live" : null,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    {
      to: "/family-planning/nutrition/lifestyle",
      icon: <Activity className="w-6 h-6 text-white" />,
      gradient: "from-orange-400 to-red-500",
      title: "Lifestyle & Metabolism",
      description: userProfile?.bmi
        ? `BMI ${userProfile.bmi} • ${userProfile.bmiCategory}`
        : "BMI, hydration, activity, and sleep impact",
      badge: null,
      badgeColor: "",
    },
    {
      to: "/family-planning/nutrition/foods-to-avoid",
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      gradient: "from-amber-400 to-red-500",
      title: "Foods to Avoid",
      description: "Hormone disruptors, caffeine limits, and personalized warnings",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <>
      {/* Intent-Aware Header Banner */}
      <ScrollReveal>
        <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] opacity-10 bg-gradient-to-br from-current to-transparent" />
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">{intentEmoji}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Your Nutrition Goal</p>
              <h2 className="text-lg font-bold leading-snug">{intentLabel}</h2>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {summary.cycleDay !== null && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                    <Calendar className="w-3 h-3" /> Day {summary.cycleDay}
                  </span>
                )}
                {summary.cyclePhaseLabel && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-background/80 border border-border/30">
                    <Activity className="w-3 h-3" /> {summary.cyclePhaseLabel}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${riskBg} ${riskColor}`}>
                  <Sparkles className="w-3 h-3" /> {summary.risk.label} • {summary.risk.overallScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Safety Banner */}
      <ScrollReveal>
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
          <p className="text-xs text-teal-800 flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span><strong>Data-driven:</strong> All recommendations are generated from your last 30 days of symptom logs, cycle data, and profile. <Link to="/calendar" className="underline font-semibold">Log more →</Link></span>
          </p>
        </div>
      </ScrollReveal>

      {/* Module Link Cards */}
      {moduleCards.map((card, idx) => (
        <ScrollReveal key={card.to} delay={10 + idx * 10}>
          <Link
            to={card.to}
            className={`flex items-center gap-4 rounded-xl border ${accent.border} ${accent.bg} p-5 hover:shadow-md transition-all active:scale-[0.98] group`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md shrink-0`}>
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">{card.title}</h3>
                {card.badge && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed truncate">{card.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </ScrollReveal>
      ))}

      {/* Quick Links */}
      <ScrollReveal delay={70}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link to="/calendar" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98]`}>
            <Calendar className={`w-5 h-5 ${accent.text}`} />
            <div className="flex-1"><p className="text-sm font-semibold">Log Symptoms</p><p className="text-[11px] text-muted-foreground">Improve accuracy</p></div>
          </Link>
          <Link to="/wellness" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98]`}>
            <Sparkles className={`w-5 h-5 ${accent.text}`} />
            <div className="flex-1"><p className="text-sm font-semibold">Wellness</p><p className="text-[11px] text-muted-foreground">Full overview</p></div>
          </Link>
          <Link to="/symptom-checker" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98]`}>
            <Activity className={`w-5 h-5 ${accent.text}`} />
            <div className="flex-1"><p className="text-sm font-semibold">Symptoms</p><p className="text-[11px] text-muted-foreground">Check patterns</p></div>
          </Link>
          <Link to="/tools" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98]`}>
            <Leaf className={`w-5 h-5 ${accent.text}`} />
            <div className="flex-1"><p className="text-sm font-semibold">FP Tools</p><p className="text-[11px] text-muted-foreground">All tools</p></div>
          </Link>
        </div>
      </ScrollReveal>

      {/* Medical Disclaimer */}
      <ScrollReveal delay={80}>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> These nutrition suggestions are generated from your logged symptoms and profile data. They are for informational purposes only.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </>
  );
}
