import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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
  Coffee, Sun, Moon, Sparkles, Heart, Apple, CheckCircle2,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function MealCard({
  meal,
  accent,
  isFirst,
  isLast,
}: {
  meal: any;
  accent: any;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const getMealIcon = (time: string) => {
    const t = time.toLowerCase();
    if (t.includes("breakfast") || t.includes("morning")) return <Coffee className="w-5 h-5" />;
    if (t.includes("lunch") || t.includes("noon")) return <Sun className="w-5 h-5" />;
    if (t.includes("dinner") || t.includes("night")) return <Moon className="w-5 h-5" />;
    if (t.includes("snack")) return <Apple className="w-5 h-5" />;
    return <Utensils className="w-5 h-5" />;
  };

  return (
    <div className="relative pl-8 pb-10 group last:pb-0">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-slate-100 group-hover:bg-purple-100 transition-colors" />
      )}
      
      {/* Timeline Dot */}
      <div className={cn(
        "absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110",
        accent.bg,
        accent.text
      )}>
        <div className="w-2 h-2 rounded-full bg-current" />
      </div>

      <div className={cn(
        "rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-purple-200 relative overflow-hidden",
        "before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-purple-500 before:opacity-0 hover:before:opacity-100 before:transition-opacity"
      )}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner transition-colors",
              "bg-slate-50 group-hover:bg-purple-50 text-slate-400 group-hover:text-purple-600"
            )}>
              {getMealIcon(meal.time)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-slate-900">{meal.time}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className={cn("text-[10px] font-bold uppercase tracking-wider", accent.text)}>
                  {meal.nutrientFocus}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium italic">Perfectly timed for your energy needs</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Balanced
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Apple className="w-3 h-3" /> Suggested Foods
            </h4>
            <div className="flex flex-wrap gap-2">
              {meal.foods.map((food: string) => (
                <span
                  key={food}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-50 border border-slate-100 text-slate-700 hover:bg-purple-50 hover:border-purple-100 hover:text-purple-700 transition-all cursor-default"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100/50 group/tip">
            <div className="flex gap-3 text-xs text-purple-800 leading-relaxed">
              <div className="mt-0.5 p-1 rounded-lg bg-white shadow-sm shrink-0 group-hover/tip:scale-110 transition-transform">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <p className="font-medium italic">
                <span className="font-bold text-purple-900 not-italic mr-1">Why this?</span> 
                {meal.why}
              </p>
            </div>
          </div>
        </div>
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
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-20">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Link 
                  to="/nutrition"
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className={cn("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shadow-purple-200", accent.gradient)}>
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight">Personalized Diet</h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                      Crafted for your {trimester === 1 ? '1st' : trimester === 2 ? '2nd' : '3rd'} Trimester
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRegenerate}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 shadow-sm transition-all text-sm font-bold active:scale-95"
              >
                <RefreshCw className="w-4 h-4 text-purple-600" />
                Regenerate Plan
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8 max-w-5xl">
        {/* Profile Snapshot */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-sm mb-10">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-50" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Dietary Profile</h3>
                  <p className="text-xs text-slate-500">Based on your recent health info</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Region", value: dietPlan.profile.region.charAt(0).toUpperCase() + dietPlan.profile.region.slice(1) + " India" },
                  { label: "Preference", value: dietPlan.profile.dietPreference === "vegetarian" ? "Vegetarian" : "Mixed" },
                  { label: "Weight", value: `${dietInput.weight} kg` }
                ].map((item, i) => (
                  <div key={i} className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-slate-700 leading-none">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Segmented Control */}
        <ScrollReveal delay={50}>
          <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-inner max-w-2xl mx-auto mb-12">
            {[
              { id: "mealPlan", label: "Daily Meal Plan", icon: Utensils },
              { id: "foodGuidance", label: "Food Guidance", icon: Apple },
              { id: "checklist", label: "Daily Checklist", icon: CheckCircle2 }
            ].map((seg) => (
              <button
                key={seg.id}
                onClick={() => setActiveDietSegment(seg.id as any)}
                className={cn(
                  "flex-1 py-3 text-xs md:text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2",
                  activeDietSegment === seg.id 
                    ? "bg-white text-purple-700 shadow-md scale-[1.02] border border-purple-100" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/40"
                )}
              >
                <seg.icon className="w-4 h-4" /> 
                <span className="hidden sm:inline">{seg.label}</span>
                <span className="sm:hidden">{seg.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* ─── SEGMENT 1: Daily Meal Plan ──────────────────────────── */}
        {activeDietSegment === "mealPlan" && (
          <ScrollReveal delay={100}>
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">A Day of Balanced Nutrition</h2>
              </div>
              
              <div className="flex flex-col">
                {dietPlan.meals.map((meal, i) => (
                  <MealCard 
                    key={i} 
                    meal={meal} 
                    accent={accent} 
                    isFirst={i === 0}
                    isLast={i === dietPlan.meals.length - 1}
                  />
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ─── SEGMENT 2: Food Guidance ────────────────────────────── */}
        {activeDietSegment === "foodGuidance" && (
          <div className="space-y-6">
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
              <NutritionChecklistSection hideSummary={true} />
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
