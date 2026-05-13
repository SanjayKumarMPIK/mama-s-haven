import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useNutritionIntelligence } from "@/hooks/useNutritionIntelligence";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import SymptomSearchBar from "@/components/nutrition/SymptomSearchBar";
import SymptomAnalysisCard from "@/components/nutrition/SymptomAnalysisCard";
import NutrientCard from "@/components/nutrition/NutrientCard";
import FoodRecommendationCard from "@/components/nutrition/FoodRecommendationCard";
import DeficiencySummaryInline from "@/components/nutrition/DeficiencySummaryInline";
import FitnessCalculatorInline from "@/components/nutrition/FitnessCalculatorInline";
import SafetyWarningBanner from "@/components/nutrition/SafetyWarningBanner";
import AffirmationBanner from "@/components/nutrition/AffirmationBanner";
import AccordionSection from "@/components/nutrition/AccordionSection";
import { Apple, ArrowLeft, ArrowRight, Calendar, ChevronRight, ShieldCheck, Sparkles, Activity } from "lucide-react";
import type { SymptomAnalysisResult } from "@/lib/nutrition/nutritionTypes";
import { FP_NUTRITION_ACCENT, FP_NUTRITION_HOME } from "./fpNutritionShared";

export default function FPNutritionIntelligencePage() {
  const { simpleMode } = useLanguage();
  const { setPhase } = usePhase();
  const { result, analyzeSymptom, searchSymptoms, suggestedSymptoms } = useNutritionIntelligence();
  const accent = FP_NUTRITION_ACCENT;
  const [selectedAnalysis, setSelectedAnalysis] = useState<SymptomAnalysisResult | null>(null);

  useEffect(() => {
    void setPhase("family-planning");
  }, [setPhase]);

  const priorityNutrients = useMemo(
    () => result.nutrientNeeds.filter((nutrient) => nutrient.isPriority),
    [result.nutrientNeeds],
  );
  const otherNutrients = useMemo(
    () => result.nutrientNeeds.filter((nutrient) => !nutrient.isPriority),
    [result.nutrientNeeds],
  );
  const defaultSection = priorityNutrients.length > 0 ? "priority" : "symptoms";
  const [activeAccordion, setActiveAccordion] = useState<string | null>(defaultSection);

  useEffect(() => {
    setActiveAccordion(defaultSection);
  }, [defaultSection]);

  const toggleAccordion = useCallback(
    (key: string) => setActiveAccordion((prev) => (prev === key ? null : key)),
    [],
  );

  const handleSelectSymptom = useCallback((symptomId: string) => {
    const analysis = analyzeSymptom(symptomId);
    setSelectedAnalysis(analysis);
  }, [analyzeSymptom]);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to={FP_NUTRITION_HOME} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Apple className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nutrition Intelligence</h1>
                <p className="text-sm text-muted-foreground">
                  Family planning symptom-driven nutrient insights and food guidance
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <ScrollReveal>
          <AffirmationBanner />
        </ScrollReveal>

        <ScrollReveal>
          <SymptomSearchBar
            onSearch={searchSymptoms}
            onSelectSymptom={handleSelectSymptom}
            suggestedSymptoms={suggestedSymptoms}
            accentColor="family-planning"
            showSearchInput={false}
          />
        </ScrollReveal>

        {selectedAnalysis && (
          <ScrollReveal>
            <SymptomAnalysisCard
              analysis={selectedAnalysis}
              accentGradient={accent.gradient}
              onClose={() => setSelectedAnalysis(null)}
            />
          </ScrollReveal>
        )}

        {result.safetyWarnings.length > 0 && (
          <ScrollReveal>
            <SafetyWarningBanner warnings={result.safetyWarnings} />
          </ScrollReveal>
        )}

        {!result.hasData ? (
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg opacity-40`}>
                <Apple className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Health Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get personalized nutrition guidance tailored to what your body needs today.
              </p>
              <Link to="/calendar" className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}>
                <Calendar className="w-4 h-4" />
                Go to Calendar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            <ScrollReveal>
              <DeficiencySummaryInline
                deficiencyScore={result.deficiencyScore}
                deficiencySeverity={result.deficiencySeverity}
                priorityNutrient={result.priorityNutrient}
                riskCounts={result.riskCounts}
                accentGradient={accent.gradient}
              />
            </ScrollReveal>

            <div className="space-y-3">
              {result.detectedSymptoms.length > 0 && (
                <AccordionSection
                  title="Detected Symptoms"
                  emoji="🔍"
                  count={result.detectedSymptoms.length}
                  countLabel="found"
                  isOpen={activeAccordion === "symptoms"}
                  onToggle={() => toggleAccordion("symptoms")}
                  accentGradient={accent.gradient}
                  accentBorder={accent.border}
                >
                  <div className="flex flex-wrap gap-2">
                    {result.detectedSymptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        onClick={() => handleSelectSymptom(symptom.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border ${accent.border} ${accent.bg} text-sm font-medium hover:shadow-md transition-all active:scale-95 cursor-pointer`}
                      >
                        <span>{symptom.emoji}</span>
                        <span>{symptom.label}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${accent.badge}`}>
                          {symptom.count}x
                        </span>
                      </button>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {priorityNutrients.length > 0 && (
                <AccordionSection
                  title="Priority Nutrients"
                  emoji="⚡"
                  count={priorityNutrients.length}
                  countLabel="nutrients"
                  isOpen={activeAccordion === "priority"}
                  onToggle={() => toggleAccordion("priority")}
                  accentGradient={accent.gradient}
                  accentBorder={accent.border}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {priorityNutrients.map((nutrient) => (
                      <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                    ))}
                  </div>
                </AccordionSection>
              )}

              {otherNutrients.length > 0 && (
                <AccordionSection
                  title="Other Nutrient Needs"
                  emoji="🧪"
                  count={otherNutrients.length}
                  countLabel="nutrients"
                  isOpen={activeAccordion === "other"}
                  onToggle={() => toggleAccordion("other")}
                  accentGradient={accent.gradient}
                  accentBorder={accent.border}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {otherNutrients.map((nutrient) => (
                      <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                    ))}
                  </div>
                </AccordionSection>
              )}

              {result.foodRecommendations.length > 0 && (
                <AccordionSection
                  title="Recommended Foods"
                  emoji="🥗"
                  count={result.foodRecommendations.length}
                  countLabel="foods"
                  isOpen={activeAccordion === "foods"}
                  onToggle={() => toggleAccordion("foods")}
                  accentGradient={accent.gradient}
                  accentBorder={accent.border}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {result.foodRecommendations.slice(0, 8).map((food) => (
                      <FoodRecommendationCard key={food.name} food={food} />
                    ))}
                  </div>
                </AccordionSection>
              )}

              <AccordionSection
                title="Fitness & Health"
                emoji="💪"
                isOpen={activeAccordion === "fitness"}
                onToggle={() => toggleAccordion("fitness")}
                accentGradient={accent.gradient}
                accentBorder={accent.border}
              >
                <FitnessCalculatorInline />
              </AccordionSection>
            </div>

            <ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link to="/symptom-checker" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}>
                  <Activity className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1"><p className="text-sm font-semibold">Symptoms</p><p className="text-[11px] text-muted-foreground">See patterns</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to={`${FP_NUTRITION_HOME}/fitness-health-calculator`} className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}>
                  <Sparkles className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1"><p className="text-sm font-semibold">Calculator</p><p className="text-[11px] text-muted-foreground">Full metrics</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/wellness" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}>
                  <ShieldCheck className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1"><p className="text-sm font-semibold">Wellness</p><p className="text-[11px] text-muted-foreground">Full overview</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/calendar" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}>
                  <Calendar className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1"><p className="text-sm font-semibold">Log More</p><p className="text-[11px] text-muted-foreground">Keep data fresh</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
          </>
        )}

        <ScrollReveal>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> These nutrition suggestions are generated from your logged symptoms and profile data. They are informational only and may not reflect actual deficiencies. Consult a healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
