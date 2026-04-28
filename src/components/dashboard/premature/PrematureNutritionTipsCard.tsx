/**
 * PrematureNutritionTipsCard.tsx
 *
 * Nutrition insights card for Premature Dashboard.
 * Displays 4 key nutrition recommendations for premature baby care.
 * Fully isolated from Postpartum Dashboard.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Apple, ChevronRight, Droplets, Wheat, Baby, Milk } from "lucide-react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

const accent = {
  gradient: "from-violet-500 to-purple-400",
  bg: "bg-violet-50",
  text: "text-violet-700",
  border: "border-violet-200/60",
  cardBg: "bg-gradient-to-br from-violet-50 to-purple-50",
};

interface NutritionTip {
  icon: any;
  title: string;
  description: string;
}

// Get nutrition tips for premature baby care
function getPrematureNutritionTips(weeksAtBirth: number): NutritionTip[] {
  // High-risk premature babies (< 32 weeks) need more intensive nutrition support
  if (weeksAtBirth < 32) {
    return [
      {
        icon: Milk,
        title: "Breastfeeding Support",
        description: "Fortified breast milk for optimal growth",
      },
      {
        icon: Wheat,
        title: "High-Calorie Nutrition",
        description: "Extra calories for catch-up growth",
      },
      {
        icon: Droplets,
        title: "Hydration Monitoring",
        description: "Track fluid intake carefully",
      },
      {
        icon: Baby,
        title: "Protein-Rich Feeding",
        description: "Support tissue development",
      },
    ];
  }

  // Moderate-risk premature babies (32-36 weeks)
  return [
    {
      icon: Milk,
      title: "Breastfeeding Nutrition",
      description: "Mother's milk for immunity boost",
    },
    {
      icon: Wheat,
        title: "Protein Support",
      description: "Dal, eggs for growth and repair",
    },
    {
      icon: Droplets,
      title: "Hydration Guidance",
      description: "8-10 glasses for breastfeeding moms",
    },
    {
      icon: Apple,
      title: "Iron & Calcium",
      description: "Leafy greens, dairy for strength",
    },
  ];
}

export default function PrematureNutritionTipsCard() {
  const { profile } = usePregnancyProfile();
  const weeksAtBirth = profile.delivery?.weeksAtBirth || 37;

  const nutritionTips = useMemo(() => getPrematureNutritionTips(weeksAtBirth), [weeksAtBirth]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Apple className="w-4 h-4 text-violet-700" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Nutrition Tips</h2>
            <p className="text-[10px] text-muted-foreground">
              Support premature recovery and early development
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
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-violet-600" />
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
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition-colors"
      >
        View All Nutrition Tips
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
