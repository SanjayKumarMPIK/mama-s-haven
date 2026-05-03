import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Apple } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, getStageLabel } from "@/hooks/useMenopause";
import { generateFoodPlan, getFoodsToLimit } from "@/lib/menopauseWellnessEngine";

const FOCUS_NUTRIENTS = [
  { name: "Calcium", target: "1200mg", emoji: "🦴", foods: "Ragi, dairy, sesame, fortified milk", reason: "Bone density protection" },
  { name: "Vitamin D", target: "600-800 IU", emoji: "☀️", foods: "Sunlight, fortified foods, mushrooms", reason: "Calcium absorption" },
  { name: "Protein", target: "0.8-1g/kg", emoji: "💪", foods: "Dal, paneer, eggs, fish, tofu", reason: "Muscle mass maintenance" },
  { name: "Magnesium", target: "320mg", emoji: "🌿", foods: "Almonds, spinach, pumpkin seeds", reason: "Sleep and mood support" },
  { name: "Omega-3", target: "250-500mg", emoji: "🐟", foods: "Flaxseeds, walnuts, fish", reason: "Heart and joint health" },
  { name: "Fiber", target: "25g", emoji: "🥗", foods: "Oats, fruits, vegetables, legumes", reason: "Digestive and heart health" },
];

export default function MenoNutritionGuide() {
  const { profile } = useMenopause();
  const foodPlan = useMemo(() => profile ? generateFoodPlan(profile) : [], [profile]);
  const foodsToLimit = useMemo(() => getFoodsToLimit(), []);
  const stage = profile?.stage;
  const mealLabels: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" };
  const mealGradients: Record<string, string> = { breakfast: "from-amber-50 to-orange-50 border-amber-200", lunch: "from-green-50 to-emerald-50 border-green-200", dinner: "from-indigo-50 to-purple-50 border-indigo-200", snacks: "from-pink-50 to-rose-50 border-rose-200" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-teal-50/20">
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/dashboard" className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-600" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md"><Apple className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Nutrition Guide</h1><p className="text-xs text-slate-500">Menopause-focused nutrition • {stage ? getStageLabel(stage) : "All stages"}</p></div>
        </div>

        {/* Key Nutrients */}
        <div className="rounded-2xl border border-green-200/60 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🎯 Focus Nutrients for Menopause</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {FOCUS_NUTRIENTS.map((n) => (
              <div key={n.name} className="flex items-start gap-3 p-3.5 rounded-xl bg-green-50/60 border border-green-100/60 hover:shadow-sm transition-all">
                <span className="text-xl flex-shrink-0">{n.emoji}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-bold text-slate-800">{n.name}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">{n.target}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{n.foods}</p>
                  <p className="text-[10px] text-green-600 mt-1 font-medium">{n.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Plan */}
        {foodPlan.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4">🍽️ Your Daily Meal Plan</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {foodPlan.map((card) => (
                <div key={card.meal} className={cn("rounded-xl border p-4 bg-gradient-to-br", mealGradients[card.meal] || "border-slate-200")}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{card.emoji}</span>
                    <h3 className="text-sm font-bold text-slate-800">{mealLabels[card.meal]}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {card.items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2"><span className="text-green-400 mt-0.5">•</span>{item}</li>
                    ))}
                  </ul>
                  {card.highlight && <p className="mt-2 text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5 border border-amber-100">{card.highlight}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Foods to Limit */}
        <div className="rounded-2xl border border-rose-200/60 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🚫 Foods to Limit</h2>
          <div className="space-y-2">
            {foodsToLimit.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100/60">
                <span className="text-lg">{f.emoji}</span>
                <div className="flex-1"><p className="text-xs font-semibold text-slate-700">{f.item}</p><p className="text-[10px] text-slate-500">{f.reason}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* Stage tips */}
        {stage === "postmenopause" && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs text-indigo-800"><strong>Post-menopause tip:</strong> Calcium needs increase to 1200mg/day. Prioritize vitamin D for absorption and weight-bearing exercise for bone density.</p>
          </div>
        )}
        {stage === "perimenopause" && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-xs text-teal-800"><strong>Perimenopause tip:</strong> Phytoestrogens in soy, flaxseeds, and sesame may help ease transition symptoms. Include them daily.</p>
          </div>
        )}
      </div>
    </div>
  );
}
