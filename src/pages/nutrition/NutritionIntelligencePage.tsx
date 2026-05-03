import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useNutritionIntelligence } from "@/hooks/useNutritionIntelligence";
import { generateDiet, type DietInput, type DietPlan } from "@/lib/nutrition/dietGenerator";
import PriorityNutritionOverview from "@/components/nutrition/PriorityNutritionOverview";
import { MATERNITY_PRIORITY_NUTRIENTS, type MaternityStage } from "@/lib/nutrition/nutritionPriorityData";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import NutrientCard from "@/components/nutrition/NutrientCard";
import FoodRecommendationCard from "@/components/nutrition/FoodRecommendationCard";
import DeficiencySummaryInline from "@/components/nutrition/DeficiencySummaryInline";
import DeficiencyInsightsSection from "@/components/nutrition/DeficiencyInsightsSection";
import SafetyWarningBanner from "@/components/nutrition/SafetyWarningBanner";
import { Apple, Calendar, ArrowRight, ArrowLeft, Utensils, Lightbulb, Activity, Clock } from "lucide-react";

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
  const { result } = useNutritionIntelligence();
  const accent = phaseAccent[phase] ?? phaseAccent.puberty;
  const [activeTab, setActiveTab] = useState<'tips' | 'insights' | 'checklist'>('tips');

  const { profile } = useProfile();
  const { trimester, mode } = usePregnancyProfile();

  const maternityStage: MaternityStage | null = useMemo(() => {
    if (phase !== "maternity") return null;
    if (mode === "postpartum") return "postpartum";
    if (mode === "premature") return "premature";
    if (trimester === 3) return "trimester3";
    if (trimester === 2) return "trimester2";
    return "trimester1";
  }, [phase, mode, trimester]);

  const symptomPriorityIds = useMemo(() => {
    return result.nutrientNeeds.filter(n => n.isPriority).map(n => n.nutrientId);
  }, [result.nutrientNeeds]);

  const overviewNutrientIds = useMemo(() => {
    if (!maternityStage) return [];
    return MATERNITY_PRIORITY_NUTRIENTS[maternityStage]?.map(n => n.id) || [];
  }, [maternityStage]);

  const detailedNutrientNeeds = useMemo(() => {
    return result.nutrientNeeds.filter(n => !overviewNutrientIds.includes(n.nutrientId));
  }, [result.nutrientNeeds, overviewNutrientIds]);

  const dietInput: DietInput = useMemo(() => {
    return {
      trimester: (mode === "pregnancy" ? (trimester || 2) : 2) as 1 | 2 | 3,
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
            {phase === "maternity" ? (
              <>
                {/* ─── Global Nutrition Risk Summary (Always Visible) ── */}
                <ScrollReveal>
                  <DeficiencySummaryInline
                    deficiencyScore={result.deficiencyScore}
                    deficiencySeverity={result.deficiencySeverity}
                    priorityNutrient={result.priorityNutrient}
                    riskCounts={result.riskCounts}
                    accentGradient={accent.gradient}
                  />
                </ScrollReveal>

                {/* ─── Segmented Tab Bar ────────────────────────────── */}
                <ScrollReveal delay={50}>
                  <div className="flex bg-muted/40 p-1.5 rounded-[20px] mb-8 mt-6">
                    <button
                      onClick={() => setActiveTab('tips')}
                      className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'tips'
                          ? `bg-white shadow-sm ${accent.text} border-b-2 border-current`
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent'
                      }`}
                    >
                      <Lightbulb className="w-[18px] h-[18px]" />
                      Nutrition Tips
                    </button>
                    <button
                      onClick={() => setActiveTab('insights')}
                      className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'insights'
                          ? `bg-white shadow-sm ${accent.text} border-b-2 border-current`
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent'
                      }`}
                    >
                      <Activity className="w-[18px] h-[18px]" />
                      Deficiency Insights
                    </button>
                    <button
                      onClick={() => setActiveTab('checklist')}
                      className={`flex-1 flex justify-center items-center gap-2 py-3.5 px-4 rounded-[16px] text-sm font-semibold transition-all duration-300 ${
                        activeTab === 'checklist'
                          ? `bg-white shadow-sm ${accent.text} border-b-2 border-current`
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-b-2 border-transparent'
                      }`}
                    >
                      <Clock className="w-[18px] h-[18px]" />
                      Checklist
                    </button>
                  </div>
                </ScrollReveal>

                {/* ─── Tab Content Area ─────────────────────────────── */}
                <div className="min-h-[400px]">
                  {activeTab === 'tips' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {maternityStage && (
                        <PriorityNutritionOverview 
                          stage={maternityStage} 
                          symptomPriorityIds={symptomPriorityIds} 
                          accentGradient={accent.gradient} 
                        />
                      )}

                      {dietPlan.nutritionalHighlights.length > 0 && (
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
                      )}

                      {detailedNutrientNeeds.filter(n => n.isPriority).length > 0 && (
                        <div>
                          <SectionHeader title="Symptom Priority Nutrients" emoji="⚡" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            {detailedNutrientNeeds.filter(n => n.isPriority).map((nutrient) => (
                              <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                            ))}
                          </div>
                        </div>
                      )}

                      {detailedNutrientNeeds.filter(n => !n.isPriority).length > 0 && (
                        <div>
                          <SectionHeader title="Other Nutrient Needs" emoji="🧪" />
                          <div className="grid gap-3 sm:grid-cols-2">
                            {detailedNutrientNeeds.filter(n => !n.isPriority).map((nutrient) => (
                              <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <DeficiencyInsightsSection />
                    </div>
                  )}

                  {activeTab === 'checklist' && (
                    <div className="flex flex-col items-center justify-center text-center py-24 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg opacity-40`}>
                        <Clock className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Checklist module coming soon</h3>
                      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                        Stay tuned for a comprehensive checklist tailored to your maternal journey.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ─── Existing Sequential Layout for Non-Maternity ─── */
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

                {detailedNutrientNeeds.filter(n => n.isPriority).length > 0 && (
                  <ScrollReveal>
                    <SectionHeader title="Symptom Priority Nutrients" emoji="⚡" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailedNutrientNeeds.filter(n => n.isPriority).map((nutrient) => (
                        <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                      ))}
                    </div>
                  </ScrollReveal>
                )}

                {detailedNutrientNeeds.filter(n => !n.isPriority).length > 0 && (
                  <ScrollReveal>
                    <SectionHeader title="Other Nutrient Needs" emoji="🧪" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {detailedNutrientNeeds.filter(n => !n.isPriority).map((nutrient) => (
                        <NutrientCard key={nutrient.nutrientId} nutrient={nutrient} accentGradient={accent.gradient} />
                      ))}
                    </div>
                  </ScrollReveal>
                )}

                {result.foodRecommendations.length > 0 && (
                  <ScrollReveal>
                    <SectionHeader title="Recommended Foods" emoji="🥗" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {result.foodRecommendations.slice(0, 8).map((food) => (
                        <FoodRecommendationCard key={food.name} food={food} />
                      ))}
                    </div>
                  </ScrollReveal>
                )}

                <ScrollReveal>
                  <DeficiencyInsightsSection />
                </ScrollReveal>
              </>
            )}
          </>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
