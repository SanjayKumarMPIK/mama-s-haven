import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePubertyNutritionIntelligence } from "../hooks/usePubertyNutritionIntelligence";
import { generatePubertyDiet, type PubertyDietPlan, type PubertyDietInput } from "../services/pubertyDietGenerator";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import { getPubertySpecificDiet } from "@/lib/pubertyDietLogic";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import FoodRecommendationCard from "@/components/nutrition/FoodRecommendationCard";
import ChecklistItem from "@/components/nutrition/ChecklistItem";
import {
  Utensils, Clock, ArrowLeft, RefreshCw, Info, CheckSquare,
  Apple, Lightbulb, Activity, Droplets, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Sub-components ───────────────────────────────────────────────────────────

function MealCard({
  meal,
  accent,
  extraFoods,
  whyAppend,
}: {
  meal: any;
  accent: any;
  extraFoods?: string[];
  whyAppend?: string;
}) {
  const allFoods = extraFoods
    ? [...meal.foods, ...extraFoods]
    : meal.foods;
  const whyText = whyAppend ? `${meal.why} ${whyAppend}` : meal.why;

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
          {allFoods.map((food: string) => (
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
          {whyText}
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PubertyPersonalizedDietPage() {
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { result } = usePubertyNutritionIntelligence();
  const [regenerateKey, setRegenerateKey] = useState(0);
  const [activeDietSegment, setActiveDietSegment] = useState<"mealPlan" | "foodGuidance" | "checklist">("mealPlan");
  const [showAllNotes, setShowAllNotes] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // ── Intelligent nutrition engine (for Food Guidance tab) ──────────
  const intelligentResult = useMemo(
    () => computeIntelligentNutrition(logs, profile, null),
    [logs, profile],
  );

  // ── Dynamic puberty diet context ──────────────────────────────────
  const dietContext = useMemo(
    () => getPubertySpecificDiet(profile, logs, todayISO),
    [profile, logs, todayISO],
  );

  const accent = {
    gradient: "from-purple-500 to-violet-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/60",
    cardBg: "bg-gradient-to-br from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
  };

  // Build diet input from profile
  const dietInput: PubertyDietInput = useMemo(() => {
    const rawDiet = profile?.dietType ?? "mixed";
    const dietPreference = rawDiet === "veg" ? "vegetarian" : "mixed";
    return {
      region: (profile?.region as "north" | "south" | "east" | "west") || "north",
      dietPreference,
      deficiencies: [],
      weight: profile?.weight || 45,
    };
  }, [profile]);

  // Generate diet plan
  const dietPlan = useMemo<PubertyDietPlan>(() => {
    return generatePubertyDiet(dietInput);
  }, [dietInput, regenerateKey]);

  const handleRegenerate = () => {
    setRegenerateKey((prev) => prev + 1);
  };

  // ── Helper to find extra foods for a meal slot ────────────────────
  function getExtraFoodsForMeal(time: string): { extraFoods: string[]; whyAppend: string } {
    for (const tag of dietContext.mealTags) {
      if (time.toLowerCase().includes(tag.mealSlotKey.toLowerCase())) {
        return { extraFoods: tag.extraFoods, whyAppend: tag.whySuffix };
      }
    }
    return { extraFoods: [], whyAppend: "" };
  }

  // ── Render ────────────────────────────────────────────────────────

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
                    Customized Indian diet recommendations for your puberty journey
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
        {/* Profile Snapshot + Diet Context */}
        <ScrollReveal>
          <div className="flex flex-col gap-3">
            <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <Info className={`w-4 h-4 ${accent.text}`} />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Your Profile
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="text-sm text-foreground/90">
                  <strong>Region:</strong> {dietPlan.profile.region === "north" ? "North India" : dietPlan.profile.region === "south" ? "South India" : dietPlan.profile.region === "east" ? "East India" : "West India"}
                </span>
                <span className="text-sm text-foreground/90">
                  <strong>Diet:</strong> {dietPlan.profile.dietPreference === "vegetarian" ? "Vegetarian" : "Mixed (Veg + Non-Veg)"}
                </span>
                <span className="text-sm text-foreground/90">
                  <strong>Puberty:</strong> {dietContext.timing}
                </span>
                {dietContext.activeConditions.length > 0 && (
                  <span className="text-sm text-foreground/90">
                    <strong>Conditions:</strong> {dietContext.activeConditions.join(", ")}
                  </span>
                )}
                {dietContext.periodStarted && (
                  <span className="text-sm font-semibold text-rose-600">
                    <Droplets className="w-3.5 h-3.5 inline mr-1" />
                    Period active — iron-rich diet
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic notes */}
            {dietContext.globalNotes.length > 0 && (
              <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    Today's Diet Notes
                  </p>
                  {dietContext.globalNotes.length > 2 && (
                    <button
                      onClick={() => setShowAllNotes(!showAllNotes)}
                      className="text-[10px] text-amber-700 font-semibold flex items-center gap-1"
                    >
                      {showAllNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {showAllNotes ? "Less" : `${dietContext.globalNotes.length - 2} more`}
                    </button>
                  )}
                </div>
                <div className="space-y-1">
                  {(showAllNotes ? dietContext.globalNotes : dietContext.globalNotes.slice(0, 2)).map((note, i) => (
                    <p key={i} className="text-xs text-amber-800">{note}</p>
                  ))}
                </div>
              </div>
            )}
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
                {dietPlan.meals.map((meal, i) => {
                  const { extraFoods, whyAppend } = getExtraFoodsForMeal(meal.time);
                  return (
                    <MealCard key={i} meal={meal} accent={accent} extraFoods={extraFoods} whyAppend={whyAppend} />
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ─── SEGMENT 2: Food Guidance ────────────────────────────── */}
        {activeDietSegment === "foodGuidance" && (
          <div className="space-y-6">
            {/* Medical Condition Meal Plan */}
            {intelligentResult.specialNotes.filter(n => n.type === "medical").length > 0 && (
              <ScrollReveal delay={150}>
                <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-sm border border-pink-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shadow-md">
                      <Utensils className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Condition-Specific Guidance</h2>
                      <p className="text-sm text-gray-600">Personalized nutrition recommendations based on your health profile</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {intelligentResult.specialNotes.filter(n => n.type === "medical").map((note, i) => (
                      <div key={i} className="bg-white/70 rounded-xl p-4 border border-pink-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span>{note.icon}</span>
                          <h3 className="font-semibold text-gray-900">{note.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{note.advice}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Puberty Timing Notes */}
            {intelligentResult.specialNotes.filter(n => n.type === "puberty_timing").length > 0 && (
              <ScrollReveal delay={160}>
                <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className={`w-5 h-5 ${accent.text}`} />
                    <h2 className="text-base font-bold">Puberty Stage Guidance</h2>
                  </div>
                  {intelligentResult.specialNotes.filter(n => n.type === "puberty_timing").map((note, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-border/40">
                      <span className="text-lg">{note.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{note.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{note.advice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* Personalized Food Recommendations */}
            {result.foodRecommendations.length > 0 && (
              <ScrollReveal delay={170}>
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
            {intelligentResult.foodRestrictions.length > 0 && (
              <ScrollReveal delay={200}>
                <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-amber-600" />
                    <h2 className="text-base font-bold text-amber-900">Foods To Avoid / Reduce</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {intelligentResult.foodRestrictions.map((r) => (
                      <span
                        key={r.food}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-amber-100 text-amber-800 border-amber-300"
                      >
                        {r.food}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>
        )}

        {/* ─── SEGMENT 3: Puberty Nutrition Checklist ──────────────── */}
        {activeDietSegment === "checklist" && (
          <ScrollReveal delay={250}>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-md">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Nutrition Checklist</h2>
                  <p className="text-[11px] text-muted-foreground">
                    Daily nutrition goals tailored to your symptoms and health profile
                  </p>
                </div>
              </div>

              {dietContext.todaySymptoms.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-muted/20 border border-border/40">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Today's Active Symptoms
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dietContext.todaySymptoms.map((sym) => (
                      <span
                        key={sym.id}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold",
                          sym.severity === "Severe"
                            ? "bg-red-100 text-red-700"
                            : sym.severity === "Moderate"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700",
                        )}
                      >
                        {sym.label} {sym.severity ?? ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {dietContext.checklistItems.length === 0 ? (
                  <div className="text-center py-8 bg-card rounded-xl border border-dashed">
                    <Apple className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No checklist items yet. Start logging symptoms to see personalized goals.</p>
                  </div>
                ) : (
                  dietContext.checklistItems.map((item, i) => (
                    <PubertyChecklistRow key={i} title={item.title} reason={item.reason} nutrient={item.nutrient} />
                  ))
                )}
              </div>

              {/* Hydration Goal */}
              {intelligentResult.hydration && (
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />
                    Hydration Goal: {intelligentResult.hydration.dailyGoalLiters}L / day
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">
                    {intelligentResult.hydration.distribution.map((s) => s.amount).join(" • ")}
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* Back to Nutrition Guide */}
        <ScrollReveal delay={250}>
          <Link
            to="/puberty/nutrition-guide"
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

// ─── Puberty Checklist Row ────────────────────────────────────────────────────

function PubertyChecklistRow({
  title,
  reason,
  nutrient,
}: {
  title: string;
  reason: string;
  nutrient: string;
}) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border transition-all",
        checked
          ? "bg-green-50 border-green-200 opacity-70"
          : "bg-card border-border hover:bg-muted/30",
      )}
    >
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          "w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all",
          checked
            ? "bg-green-500 border-green-500 text-white"
            : "border-muted-foreground/40",
        )}
      >
        {checked && <span className="text-[10px]">✓</span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", checked ? "text-muted-foreground line-through" : "text-foreground")}>
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{reason}</p>
      </div>
      <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
        {nutrient}
      </span>
    </div>
  );
}
