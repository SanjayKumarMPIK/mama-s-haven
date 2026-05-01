import { useState, useCallback } from "react";
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
import { Link } from "react-router-dom";
import {
  Apple, Calendar, ChevronRight, ArrowRight, Activity,
  Sparkles, ShieldCheck, Search, ClipboardList, Scale, Salad
} from "lucide-react";
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

// ─── Explore More Links per phase ─────────────────────────────────────────
const EXPLORE_LINKS: Record<string, { to: string; label: string; desc: string }[]> = {
  puberty: [
    { to: "/puberty/nutrition/meal-plan", label: "Meal Plan", desc: "Personalized daily meals" },
    { to: "/puberty/nutrition/hydration", label: "Hydration", desc: "Water intake goals" },
    { to: "/puberty/nutrition/calories", label: "Calories", desc: "Daily calorie needs" },
    { to: "/puberty/nutrition/protein", label: "Protein", desc: "Protein requirements" },
    { to: "/puberty/nutrition/food-restrictions", label: "Foods to Avoid", desc: "Restriction guidance" },
    { to: "/puberty/nutrition/nutrient-recommendations", label: "Nutrients & Foods", desc: "Full nutrient guide" },
  ],
  maternity: [
    { to: "/maternity/nutrition/personalized-diet", label: "Personalized Diet", desc: "Region-based diet plan" },
    { to: "/maternity/nutrition/fitness-health-calculator", label: "Fitness Calculator", desc: "Calorie & hydration" },
    { to: "/maternity/nutrition/checklist", label: "Nutrition Checklist", desc: "Daily tracking" },
  ],
  "family-planning": [
    { to: "/family-planning/nutrition/deficiency-insights", label: "Deficiency Insights", desc: "Nutrient gap analysis" },
    { to: "/family-planning/nutrition/hormonal-balance", label: "Hormonal Nutrition", desc: "Hormone-support foods" },
    { to: "/family-planning/nutrition/cycle-plan", label: "Cycle Plan", desc: "Phase-specific eating" },
    { to: "/family-planning/nutrition/lifestyle", label: "Lifestyle & Metabolism", desc: "BMI & activity" },
    { to: "/family-planning/nutrition/foods-to-avoid", label: "Foods to Avoid", desc: "What to limit" },
  ],
  menopause: [],
};

// ─── Main Component ───────────────────────────────────────────────────────

export default function NutritionGuide() {
  const { simpleMode } = useLanguage();
  const { phase, phaseName, phaseEmoji } = usePhase();
  const { result, analyzeSymptom, searchSymptoms, suggestedSymptoms } = useNutritionIntelligence();
  const accent = phaseAccent[phase] ?? phaseAccent.puberty;
  const [selectedAnalysis, setSelectedAnalysis] = useState<SymptomAnalysisResult | null>(null);

  const handleSelectSymptom = useCallback((symptomId: string) => {
    const analysis = analyzeSymptom(symptomId);
    setSelectedAnalysis(analysis);
  }, [analyzeSymptom]);

  const exploreLinks = EXPLORE_LINKS[phase] ?? [];

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {phase === "maternity" ? (
        <>
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
                      Personalized nutrition guidance for a healthy pregnancy
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          <div className="container py-6 space-y-8">
            <ScrollReveal>
              <AffirmationBanner />
            </ScrollReveal>

            <ScrollReveal delay={50}>
              <div>
                <h2 className="text-xl font-bold tracking-tight mb-1">Explore Nutrition Tools</h2>
                <p className="text-sm text-muted-foreground mb-6">Use these tools to track, analyze and improve your nutrition and overall well-being.</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <FeatureCard 
                    to="/deficiency-insights"
                    icon={<div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center shrink-0"><ClipboardList className="w-8 h-8 text-purple-600" /></div>}
                    title="Deficiency Insights"
                    titleColor="text-purple-700"
                    desc="Analyze your symptoms and discover potential nutrient deficiencies with personalized recommendations."
                  />
                  <FeatureCard 
                    to="/maternity/nutrition/fitness-health-calculator"
                    icon={<div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Scale className="w-8 h-8 text-blue-600" /></div>}
                    title="Fitness Calculator"
                    titleColor="text-blue-700"
                    desc="Calculate your daily calorie needs, protein, water intake and track your fitness goals during pregnancy."
                  />
                  <FeatureCard 
                    to="/maternity/nutrition/personalized-diet"
                    icon={<div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Salad className="w-8 h-8 text-emerald-600" /></div>}
                    title="Personalized Diet"
                    titleColor="text-emerald-700"
                    desc="Get a customized diet plan tailored to your needs, preferences and pregnancy stage."
                  />
                  <FeatureCard 
                    to="/nutrition-intelligence"
                    icon={<div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shrink-0"><Apple className="w-8 h-8 text-rose-600" /></div>}
                    title="Nutrition Intelligence"
                    titleColor="text-rose-600"
                    desc="Advanced analysis of symptoms, nutrient risks and personalized food recommendations for smarter nutrition."
                  />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </>
      ) : (
        <>
          {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
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

        {/* ─── Affirmation Banner ─────────────────────────────── */}
        <ScrollReveal>
          <AffirmationBanner />
        </ScrollReveal>

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

            {/* ─── Fitness Calculator Inline ───────────────────── */}
            <ScrollReveal>
              <FitnessCalculatorInline />
            </ScrollReveal>

            {/* ─── Explore More (phase sub-pages) ──────────────── */}
            {exploreLinks.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Explore More" emoji="📚" />
                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {exploreLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{link.label}</p>
                        <p className="text-[11px] text-muted-foreground">{link.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Quick Links ──────────────────────────────────── */}
            <ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link to="/symptom-checker" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}>
                  <Activity className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1"><p className="text-sm font-semibold">Symptoms</p><p className="text-[11px] text-muted-foreground">See patterns</p></div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link to="/deficiency-insights" className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}>
                  <Sparkles className={`w-5 h-5 ${accent.text}`} />
                  <div className="flex-1"><p className="text-sm font-semibold">Deficiency</p><p className="text-[11px] text-muted-foreground">Full analysis</p></div>
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

        {/* ─── Medical Disclaimer ────────────────────────────── */}
        <ScrollReveal>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> These nutrition suggestions are generated from your logged symptoms and profile data. They are for informational purposes only and may not reflect actual deficiencies. Always consult a healthcare professional for medical advice.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
      </>
      )}

      <SafetyDisclaimer />
    </main>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
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
