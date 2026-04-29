import type { NutrientFoodEntry } from "@/lib/nutrition/nutritionTypes";

interface FoodRecommendationCardProps {
  food: NutrientFoodEntry;
}

export default function FoodRecommendationCard({ food }: FoodRecommendationCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-card p-4 hover:shadow-md transition-all group" id={`food-card-${food.name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <span className="text-2xl group-hover:scale-110 transition-transform">{food.emoji}</span>
        <h4 className="text-sm font-bold text-foreground">{food.name}</h4>
      </div>

      {/* Nutrient chips */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {food.nutrients.map((n) => (
          <span key={n} className="px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-semibold text-primary">
            {n}
          </span>
        ))}
      </div>

      {/* Why it helps */}
      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
        {food.whyItHelps}
      </p>
    </div>
  );
}
