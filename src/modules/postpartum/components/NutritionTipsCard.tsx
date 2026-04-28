/**
 * NutritionTipsCard.tsx
 *
 * Nutrition insights card for Postpartum Dashboard.
 * Displays 4 key nutrition recommendations based on postpartum recovery stage.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Apple, ChevronRight, Droplets, Wheat, Bone } from "lucide-react";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

interface NutritionTip {
  icon: any;
  title: string;
  description: string;
}

// Get nutrition tips for postpartum recovery
function getNutritionTips(): NutritionTip[] {
  return [
    {
      icon: Wheat,
      title: "Protein-Rich Foods",
      description: "Dal, eggs, paneer for tissue repair",
    },
    {
      icon: Bone,
      title: "Iron & Fiber",
      description: "Spinach, jaggery, dates for blood health",
    },
    {
      icon: Droplets,
      title: "Hydration",
      description: "10-12 glasses of water daily",
    },
    {
      icon: Apple,
      title: "Calcium & Vitamin D",
      description: "Milk, curd, sunlight for bone strength",
    },
  ];
}

export default function NutritionTipsCard() {
  const nutritionTips = useMemo(() => getNutritionTips(), []);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <Apple className="w-4 h-4 text-rose-700" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Nutrition Tips</h2>
            <p className="text-[10px] text-muted-foreground">
              Eat well to support recovery and energy levels
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {nutritionTips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <Link
              key={index}
              to="/nutrition"
              className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/30 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{tip.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{tip.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
            </Link>
          );
        })}
      </div>

      <Link
        to="/nutrition"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
      >
        View All Nutrition Tips
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
