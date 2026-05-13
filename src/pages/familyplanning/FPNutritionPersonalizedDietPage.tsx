import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile, type FPIntent } from "@/hooks/useFamilyPlanningProfile";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { ArrowLeft, CheckSquare, Clock, Info, RefreshCw, Salad, Utensils } from "lucide-react";
import { getFoodsToAvoid, getIntentNutrition } from "@/lib/familyPlanningNutritionEngine";
import { FP_NUTRITION_ACCENT, FP_NUTRITION_HOME, getFPIntentMeta, getFPSymptomLabel, summarizeFPLogs } from "./fpNutritionShared";

type MealPlanTab = "mealPlan" | "foodGuidance" | "checklist";

type RegionKey = "north" | "south" | "east" | "west";

const REGION_MEALS: Record<RegionKey, {
  breakfast: string;
  lunch: string;
  dinner: string;
}> = {
  north: {
    breakfast: "vegetable poha with curd",
    lunch: "roti, dal, palak sabzi, and cucumber salad",
    dinner: "moong khichdi with lauki and curd",
  },
  south: {
    breakfast: "idli with sambar and chutney",
    lunch: "red rice, sambar, beans poriyal, and curd",
    dinner: "vegetable upma with moong dal soup",
  },
  east: {
    breakfast: "chuda dahi with fruit and nuts",
    lunch: "rice, masoor dal, mixed sabzi, and sauteed greens",
    dinner: "light khichuri with vegetables and curd",
  },
  west: {
    breakfast: "thepla or poha with curd",
    lunch: "jowar roti, dal, seasonal sabzi, and salad",
    dinner: "vegetable daliya with curd or soup",
  },
};

function getProteinOptions(dietType: string) {
  if (dietType === "non-veg") {
    return { breakfast: "boiled eggs", lunch: "fish or chicken", dinner: "egg curry or grilled fish", omega: "fish", iron: "egg and greens" };
  }
  if (dietType === "mixed") {
    return { breakfast: "boiled eggs or curd", lunch: "dal with fish or chicken", dinner: "paneer or egg curry", omega: "fish or walnuts", iron: "greens with dal or egg" };
  }
  if (dietType === "eggetarian") {
    return { breakfast: "egg bhurji", lunch: "dal with curd", dinner: "egg curry with vegetables", omega: "eggs and walnuts", iron: "greens with eggs" };
  }
  return { breakfast: "paneer or sprouts", lunch: "dal, curd, or chana", dinner: "paneer or tofu", omega: "flaxseed and walnuts", iron: "greens with dal" };
}

function buildMealPlan(input: {
  region: RegionKey;
  dietType: string;
  intent: FPIntent;
  symptoms: Record<string, number>;
  bmiCategory: string;
  hasLogs: boolean;
}) {
  const regionMeals = REGION_MEALS[input.region] ?? REGION_MEALS.north;
  const protein = getProteinOptions(input.dietType);
  const ttc = input.intent === "ttc";
  const avoid = input.intent === "avoid";
  const fatigue = (input.symptoms.fatigue ?? 0) > 0;
  const mood = (input.symptoms.moodChanges ?? 0) > 0 || (input.symptoms.stress ?? 0) > 0;
  const irregularCycle = (input.symptoms.irregularCycle ?? 0) > 0;
  const ovulationPain = (input.symptoms.ovulationPain ?? 0) > 0;
  const weightBalance = input.bmiCategory === "Overweight" || input.bmiCategory === "Obese";
  const calorieSupport = input.bmiCategory === "Underweight";

  return [
    {
      time: "Early Morning",
      focus: ttc ? "Hydration + folate" : avoid ? "Hydration + steady energy" : "Hydration + cycle balance",
      foods: [
        "warm water or jeera water",
        ttc ? "soaked almonds and orange" : "fruit with soaked nuts",
        mood ? "1 tsp flaxseed or chia" : "light fruit bowl",
      ],
      note: ovulationPain ? "Keep fluids steady and use soothing foods early in the day." : "Start the day hydrated before caffeine.",
    },
    {
      time: "Breakfast",
      focus: ttc ? "Protein + zinc" : avoid ? "Protein + fiber" : "Protein + steady fuel",
      foods: [
        regionMeals.breakfast,
        protein.breakfast,
        ttc ? "pumpkin seeds or sesame" : "fruit on the side",
      ],
      note: mood ? "Add a healthy fat source to support calmer energy and mood." : "Protein in breakfast helps reduce later energy dips.",
    },
    {
      time: "Lunch",
      focus: fatigue ? "Iron + protein" : irregularCycle ? "Balanced plate" : "Fiber + micronutrients",
      foods: [
        regionMeals.lunch,
        fatigue ? protein.iron : protein.lunch,
        ttc ? "extra leafy greens with lemon" : "vegetable salad or curd",
      ],
      note: fatigue ? "Iron-rich foods are emphasized because fatigue was logged recently." : "A balanced lunch supports more stable afternoon energy.",
    },
    {
      time: "Evening Snack",
      focus: mood ? "Magnesium + omega-3" : avoid ? "Fiber + hydration" : "Light energy support",
      foods: [
        mood ? "banana with nuts or seeds" : "fruit with roasted chana",
        protein.omega,
        ovulationPain ? "coconut water or herbal tea" : "buttermilk or lemon water",
      ],
      note: mood ? "This snack leans into magnesium and omega-3 support for stress or mood shifts." : "Keep snacks simple so dinner stays balanced.",
    },
    {
      time: "Dinner",
      focus: ttc ? "Protein + recovery" : weightBalance ? "Light balanced plate" : "Gentle overnight support",
      foods: [
        regionMeals.dinner,
        protein.dinner,
        ovulationPain ? "turmeric or ginger soup" : "cooked vegetables",
      ],
      note: calorieSupport
        ? "If you are underweight, add one extra protein or dairy serving at dinner."
        : weightBalance
        ? "If weight balance is a goal, keep dinner light but do not skip it."
        : input.hasLogs
        ? "End the day with a lighter meal that still includes protein."
        : "This is a starter plan that will adapt as you log symptoms.",
    },
  ];
}

function buildChecklistItems(intent: FPIntent, symptoms: Record<string, number>) {
  const items = [
    { id: "water", label: "Drank enough water", note: "Space water through the day instead of drinking it all at once." },
    { id: "protein", label: "Included protein in meals", note: "Examples: dal, curd, paneer, eggs, fish, chicken, sprouts." },
    { id: "produce", label: "Included fruits or vegetables", note: "Aim for color and variety across meals." },
    {
      id: "iron-folate",
      label: intent === "ttc" ? "Included iron or folate-rich food" : "Included an iron-supportive food",
      note: "Examples: spinach, lentils, chana, beetroot, sesame, dates.",
    },
  ];

  if ((symptoms.moodChanges ?? 0) > 0 || (symptoms.stress ?? 0) > 0) {
    items.push({ id: "mood-support", label: "Included magnesium or omega-3 foods", note: "Examples: nuts, seeds, fish, eggs, banana, oats." });
  }

  if ((symptoms.ovulationPain ?? 0) > 0) {
    items.push({ id: "comfort-foods", label: "Included hydration or anti-inflammatory support", note: "Examples: coconut water, ginger, turmeric, soups, curd." });
  }

  if ((symptoms.irregularCycle ?? 0) > 0) {
    items.push({ id: "balanced-plate", label: "Kept meals balanced and regular", note: "Consistent meals help reduce energy swings and support cycle awareness." });
  }

  items.push({ id: "limit-triggers", label: "Limited excess caffeine or symptom triggers", note: "Pull back on extra caffeine, very spicy food, or skipped meals when symptoms are active." });
  return items;
}

export default function FPNutritionPersonalizedDietPage() {
  const { setPhase } = usePhase();
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile.intent ?? "tracking";
  const [activeTab, setActiveTab] = useState<MealPlanTab>("mealPlan");
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    void setPhase("family-planning");
  }, [setPhase]);

  const intentMeta = getFPIntentMeta(intent);
  const summary = useMemo(() => summarizeFPLogs(logs, 14), [logs]);
  const accent = FP_NUTRITION_ACCENT;
  const region = (profile.region ?? "north") as RegionKey;

  const mealPlan = useMemo(() => buildMealPlan({
    region,
    dietType: profile.dietType,
    intent,
    symptoms: summary.symptomCounts,
    bmiCategory: profile.bmiCategory,
    hasLogs: summary.hasLogs,
  }), [intent, profile.bmiCategory, profile.dietType, region, summary]);

  const checklistItems = useMemo(() => buildChecklistItems(intent, summary.symptomCounts), [intent, summary.symptomCounts]);
  const checklistStorageKey = `ss-fp-nutrition-checklist-${todayISO}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(checklistStorageKey);
      if (saved) {
        setCompletedItems(JSON.parse(saved));
      }
    } catch {
      setCompletedItems([]);
    }
  }, [checklistStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(checklistStorageKey, JSON.stringify(completedItems));
    } catch {}
  }, [checklistStorageKey, completedItems]);

  const todayNote = useMemo(() => {
    if (!summary.hasLogs) {
      return `Starter plan for ${intentMeta.label.toLowerCase()} until you add more cycle, sleep, hydration, and symptom logs.`;
    }
    if ((summary.symptomCounts.fatigue ?? 0) > 0) {
      return "Fatigue was logged recently, so today leans into iron, protein, and steady-energy foods.";
    }
    if ((summary.symptomCounts.moodChanges ?? 0) > 0 || (summary.symptomCounts.stress ?? 0) > 0) {
      return "Mood or stress signals were logged recently, so meals lean into magnesium-rich and omega-3-supportive foods.";
    }
    if ((summary.symptomCounts.irregularCycle ?? 0) > 0) {
      return "Recent irregular-cycle signals shift this plan toward regular meals, hydration, and balanced plates.";
    }
    if ((summary.symptomCounts.ovulationPain ?? 0) > 0) {
      return "Ovulation discomfort was logged, so hydration and soothing foods are given more space today.";
    }
    return `This plan supports ${intentMeta.label.toLowerCase()} with balanced meals, hydration, and simple consistency.`;
  }, [intentMeta.label, summary]);

  const intentNutrition = useMemo(() => getIntentNutrition(intent), [intent]);
  const foodsToLimit = useMemo(() => getFoodsToAvoid(intent).slice(0, 3), [intent]);

  const toggleChecklistItem = (id: string) => {
    setCompletedItems((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link to={FP_NUTRITION_HOME} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Personalized Diet</h1>
                  <p className="text-sm text-muted-foreground">
                    Food guidance and meal ideas for your family planning journey
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setCompletedItems([])} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-sm font-medium">
                <RefreshCw className="w-4 h-4" />
                Reset checklist
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <ScrollReveal>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <Info className={`w-4 h-4 ${accent.text}`} />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Profile</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-foreground/90">
                <span><strong>Region:</strong> {region}</span>
                <span><strong>Diet:</strong> {profile.dietType}</span>
                <span><strong>Goal:</strong> {intentMeta.label}</span>
                <span><strong>BMI:</strong> {profile.bmi ?? "N/A"} ({profile.bmiCategory})</span>
                {summary.topSymptoms[0] && <span><strong>Recent focus:</strong> {getFPSymptomLabel(summary.topSymptoms[0])}</span>}
                {(profile.knownConditions || profile.medicalConditions.length > 0) && (
                  <span><strong>Conditions:</strong> {[profile.knownConditions, ...profile.medicalConditions].filter(Boolean).join(", ")}</span>
                )}
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Salad className="w-4 h-4 text-emerald-600" />
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Diet Note</p>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{todayNote}</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={20}>
          <div className="rounded-2xl border border-border/50 bg-card p-2 grid grid-cols-3 gap-2">
            <TabButton active={activeTab === "mealPlan"} onClick={() => setActiveTab("mealPlan")} label="Daily Meal Plan" />
            <TabButton active={activeTab === "foodGuidance"} onClick={() => setActiveTab("foodGuidance")} label="Food Guidance" />
            <TabButton active={activeTab === "checklist"} onClick={() => setActiveTab("checklist")} label="Checklist" />
          </div>
        </ScrollReveal>

        {activeTab === "mealPlan" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {mealPlan.map((meal, index) => (
              <ScrollReveal key={meal.time} delay={30 + index * 10}>
                <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-5 h-full`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{meal.time}</h3>
                        <p className={`text-[11px] font-semibold ${accent.text} mt-0.5`}>{meal.focus}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {meal.foods.map((food) => (
                      <span key={food} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-white text-foreground/90">
                        {food}
                      </span>
                    ))}
                  </div>
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/30 text-xs text-muted-foreground leading-relaxed">
                    {meal.note}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        {activeTab === "foodGuidance" && (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {intentNutrition.cards.slice(0, 3).map((card, index) => (
                <ScrollReveal key={card.title} delay={30 + index * 10}>
                  <div className="rounded-2xl border border-border/50 bg-card p-5 h-full shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{card.emoji}</span>
                      <div>
                        <h3 className="text-base font-bold">{card.title}</h3>
                        <p className="text-xs text-muted-foreground">Why it helps</p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">{card.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {card.foods.slice(0, 5).map((food) => (
                        <span key={food} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {food}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.tips[0]}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={60}>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                <h3 className="text-base font-bold text-amber-900 mb-3">Foods to limit</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  {foodsToLimit.map((item) => (
                    <div key={item.category} className="rounded-xl border border-amber-200 bg-white/80 p-4">
                      <p className="text-sm font-semibold text-amber-900">{item.category}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.items.slice(0, 3).map((food) => (
                          <span key={food} className="px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-100 text-amber-800">
                            {food}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-amber-800 leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-4">
            {checklistItems.map((item, index) => {
              const completed = completedItems.includes(item.id);
              return (
                <ScrollReveal key={item.id} delay={30 + index * 10}>
                  <button type="button" onClick={() => toggleChecklistItem(item.id)} className={`w-full rounded-2xl border p-4 text-left transition-all ${completed ? "border-emerald-200 bg-emerald-50/70" : "border-border/50 bg-card hover:bg-muted/20"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center ${completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-white"}`}>
                        {completed && <CheckSquare className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{item.note}</p>
                      </div>
                    </div>
                  </button>
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-teal-600 text-white shadow-sm" : "bg-transparent text-muted-foreground hover:bg-muted/40"}`}>
      {label}
    </button>
  );
}
