import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useNutritionIntelligence } from "@/hooks/useNutritionIntelligence";
import { generateDiet, type DietPlan, type DietInput, getDefaultDietInput } from "@/lib/nutrition/dietGenerator";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import NutritionChecklistSection from "@/components/nutrition/NutritionChecklistSection";
import FoodRecommendationCard from "@/components/nutrition/FoodRecommendationCard";
import {
  Utensils, Clock, ArrowLeft, RefreshCw, ChevronRight, Info,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function MealCard({
  meal,
  accent,
}: {
  meal: any;
  accent: any;
}) {
  return (
    <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-5 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{meal.time}</h3>
            <p className={`text-[11px] font-semibold ${accent.text} mt-0.5`}>
              {meal.nutrientFocus}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Suggested Foods</p>
        <div className="flex flex-wrap gap-2">
          {meal.foods.map((food: string) => (
            <span
              key={food}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm"
            >
              {food}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-muted/20 border border-border/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <Info className="w-3 h-3 inline mr-1" />
          {meal.why}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PersonalizedDietPage() {
  const { profile } = useProfile();
  const { trimester } = usePregnancyProfile();
  const { result } = useNutritionIntelligence();
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [activeDietSegment, setActiveDietSegment] = useState<"mealPlan" | "foodGuidance" | "checklist">("mealPlan");

  const accent = {
    gradient: "from-purple-500 to-violet-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/60",
    cardBg: "bg-gradient-to-br from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
  };

  // Build diet input from profile
  const dietInput: DietInput = useMemo(() => {
    return {
      trimester: (trimester || 2) as 1 | 2 | 3,
      region: (profile?.region as "north" | "south" | "east" | "west") || "north",
      dietPreference: ((profile as any)?.dietPreference as "vegetarian" | "mixed") || "vegetarian",
      deficiencies: [], // Could be derived from deficiency insights
      weight: profile?.weight || 65,
    };
  }, [profile, trimester]);

  // Generate diet plan
  const dietPlan = useMemo<DietPlan>(() => {
    return generateDiet(dietInput);
  }, [dietInput, regenerateKey]);

  const handleRegenerate = () => {
    setRegenerateKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Personalized Diet Plan</h1>
                  <p className="text-sm text-muted-foreground">
                    Customized Indian diet recommendations for your pregnancy journey
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Profile Snapshot */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-5 flex-1`}>
              <div className="flex items-center gap-2 mb-3">
                <Info className={`w-4 h-4 ${accent.text}`} />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Profile
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="text-sm text-foreground/90">
                  <strong>Trimester:</strong> {dietPlan.profile.trimester}
                </span>
                <span className="text-sm text-foreground/90">
                  <strong>Region:</strong> {dietPlan.profile.region === "north" ? "North India" : dietPlan.profile.region === "south" ? "South India" : dietPlan.profile.region === "east" ? "East India" : "West India"}
                </span>
                <span className="text-sm text-foreground/90">
                  <strong>Diet:</strong> {dietPlan.profile.dietPreference === "vegetarian" ? "Vegetarian" : "Mixed (Veg + Non-Veg)"}
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Segmented Control */}
        <ScrollReveal delay={50}>
          <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/50 shadow-inner max-w-2xl mx-auto mb-8 relative">
            <button
              onClick={() => setActiveDietSegment("mealPlan")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                activeDietSegment === "mealPlan" 
                  ? "bg-white text-purple-700 shadow-sm border border-purple-100" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Utensils className="w-4 h-4" /> Daily Meal Plan
            </button>
            <button
              onClick={() => setActiveDietSegment("foodGuidance")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                activeDietSegment === "foodGuidance" 
                  ? "bg-white text-purple-700 shadow-sm border border-purple-100" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Info className="w-4 h-4" /> Food Guidance
            </button>
            <button
              onClick={() => setActiveDietSegment("checklist")}
              className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${
                activeDietSegment === "checklist" 
                  ? "bg-white text-purple-700 shadow-sm border border-purple-100" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <Clock className="w-4 h-4" /> Checklist
            </button>
          </div>
        </ScrollReveal>

        {/* ─── SEGMENT 1: Daily Meal Plan ──────────────────────────── */}
        {activeDietSegment === "mealPlan" && (
          <ScrollReveal delay={100}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${accent.text}`} />
                <h2 className="text-base font-bold">Daily Meal Plan</h2>
              </div>
              <div className="grid gap-4">
                {dietPlan.meals.map((meal, i) => (
                  <MealCard key={i} meal={meal} accent={accent} />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ─── SEGMENT 2: Food Guidance ────────────────────────────── */}
        {activeDietSegment === "foodGuidance" && (
          <div className="space-y-6">
            {/* Foods Recommended For You */}
            <ScrollReveal delay={150}>
              <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <Utensils className={`w-5 h-5 ${accent.text}`} />
                  <h2 className="text-base font-bold">Foods Recommended For You</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {dietPlan.recommendedFoods.slice(0, 20).map((food) => (
                    <span
                      key={food}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-sm"
                    >
                      {food}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Dynamic Food Recommendations from Nutrition Intelligence */}
            {result.foodRecommendations.length > 0 && (
              <ScrollReveal delay={160}>
                <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Utensils className={`w-5 h-5 ${accent.text}`} />
                    <h2 className="text-base font-bold">Personalized Food Recommendations</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {result.foodRecommendations.slice(0, 8).map((food) => (
                      <FoodRecommendationCard key={food.name} food={food} />
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Foods To Reduce */}
            {dietPlan.foodsToReduce.length > 0 && (
              <ScrollReveal delay={200}>
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-amber-600" />
                    <h2 className="text-base font-bold text-amber-900">Foods To Avoid / Reduce</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dietPlan.foodsToReduce.map((food) => (
                      <span
                        key={food}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-amber-100 text-amber-800 border-amber-300"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        )}

        {/* ─── SEGMENT 3: Checklist ────────────────────────────────── */}
        {activeDietSegment === "checklist" && (
          <ScrollReveal delay={250}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <NutritionChecklistSection />
            </div>
          </ScrollReveal>
        )}

        {/* Back to Nutrition Guide */}
        <ScrollReveal delay={250}>
          <Link
            to="/nutrition"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Nutrition Guide
          </Link>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
