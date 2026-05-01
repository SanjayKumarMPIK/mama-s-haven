import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useNutritionIntelligence } from "@/hooks/useNutritionIntelligence";
import { generateDiet, type DietInput, type DietPlan } from "@/lib/nutrition/dietGenerator";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import SymptomSearchBar from "@/components/nutrition/SymptomSearchBar";
import SymptomAnalysisCard from "@/components/nutrition/SymptomAnalysisCard";
import NutrientCard from "@/components/nutrition/NutrientCard";
import FoodRecommendationCard from "@/components/nutrition/FoodRecommendationCard";
import DeficiencySummaryInline from "@/components/nutrition/DeficiencySummaryInline";
import SafetyWarningBanner from "@/components/nutrition/SafetyWarningBanner";
import { Apple, Calendar, ArrowRight, ArrowLeft, Utensils } from "lucide-react";
import type { SymptomAnalysisResult } from "@/lib/nutrition/nutritionTypes";

// ─── Phase accent map ─────────────────────────────────────────────────────
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

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

export default function NutritionIntelligencePage() {
  const { simpleMode } = useLanguage();
  const { phase, phaseName, phaseEmoji } = usePhase();
  const { result, analyzeSymptom, searchSymptoms, suggestedSymptoms } = useNutritionIntelligence();
  const accent = phaseAccent[phase] ?? phaseAccent.puberty;
  const [selectedAnalysis, setSelectedAnalysis] = useState<SymptomAnalysisResult | null>(null);

  const handleSelectSymptom = useCallback((symptomId: string) => {
    const analysis = analyzeSymptom(symptomId);
    setSelectedAnalysis(analysis);
  }, [analyzeSymptom]);

  const { profile } = useProfile();
  const { trimester } = usePregnancyProfile();

  const dietInput: DietInput = useMemo(() => {
    return {
      trimester: (trimester || 2) as 1 | 2 | 3,
      region: (profile?.region as "north" | "south" | "east" | "west") || "north",
      dietPreference: ((profile as any)?.dietPreference as "vegetarian" | "mixed") || "vegetarian",
      deficiencies: [],
      weight: profile?.weight || 65,
    };
  }, [profile, trimester]);

  const dietPlan = useMemo<DietPlan>(() => {
    return generateDiet(dietInput);
  }, [dietInput]);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Apple className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nutrition Intelligence</h1>
                <p className="text-sm text-muted-foreground">
                  {phaseEmoji} Personalized for <strong>{phaseName}</strong> • Symptom-driven insights
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* ─── Symptom Search ─────────────────────────────────── */}
        <ScrollReveal>
          <SymptomSearchBar
            onSearch={searchSymptoms}
            onSelectSymptom={handleSelectSymptom}
            suggestedSymptoms={suggestedSymptoms}
            accentColor={phase}
          />
        </ScrollReveal>

        {/* ─── Symptom Analysis Card (when selected) ──────────── */}
        {selectedAnalysis && (
          <ScrollReveal>
            <SymptomAnalysisCard
              analysis={selectedAnalysis}
              accentGradient={accent.gradient}
              onClose={() => setSelectedAnalysis(null)}
            />
          </ScrollReveal>
        )}

        {/* ─── Safety Warnings ────────────────────────────────── */}
        {result.safetyWarnings.length > 0 && (
          <ScrollReveal>
            <SafetyWarningBanner warnings={result.safetyWarnings} />
          </ScrollReveal>
        )}

        {/* ─── No Data State ──────────────────────────────────── */}
        {!result.hasData ? (
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
            {/* ─── Deficiency Summary ──────────────────────────── */}
            <ScrollReveal>
              <DeficiencySummaryInline
                deficiencyScore={result.deficiencyScore}
                deficiencySeverity={result.deficiencySeverity}
                priorityNutrient={result.priorityNutrient}
                riskCounts={result.riskCounts}
                accentGradient={accent.gradient}
              />
            </ScrollReveal>

            {/* ─── Nutritional Highlights ──────────────────────── */}
            {phase === "maternity" && dietPlan.nutritionalHighlights.length > 0 && (
              <ScrollReveal delay={50}>
                <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Utensils className={`w-5 h-5 ${accent.text}`} />
                    <h2 className="text-base font-bold">Nutritional Highlights</h2>
                  </div>
                  <ul className="space-y-2 text-sm text-foreground/85">
                    {dietPlan.nutritionalHighlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            )}

            {/* ─── Detected Symptoms ───────────────────────────── */}
            {result.detectedSymptoms.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Detected Symptoms" emoji="🔍" />
                <div className="flex flex-wrap gap-2">
                  {result.detectedSymptoms.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSelectSymptom(s.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${accent.border} ${accent.bg} text-sm font-medium hover:shadow-md transition-all active:scale-95 cursor-pointer`}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
                        {s.count}x
                      </span>
                    </button>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Priority Nutrients ──────────────────────────── */}
            {result.nutrientNeeds.filter(n => n.isPriority).length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Priority Nutrients" emoji="⚡" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.nutrientNeeds.filter(n => n.isPriority).map((nutrient) => (
                    <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── All Nutrient Needs ──────────────────────────── */}
            {result.nutrientNeeds.filter(n => !n.isPriority).length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Other Nutrient Needs" emoji="🧪" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.nutrientNeeds.filter(n => !n.isPriority).map((nutrient) => (
                    <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Food Recommendations ────────────────────────── */}
            {phase !== 'maternity' && result.foodRecommendations.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Recommended Foods" emoji="🥗" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {result.foodRecommendations.slice(0, 8).map((food) => (
                    <FoodRecommendationCard key={food.name} food={food} />
                  ))}
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
