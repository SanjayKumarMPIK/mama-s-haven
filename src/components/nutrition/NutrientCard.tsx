import type { NutrientNeedResult } from "@/lib/nutrition/nutritionTypes";

interface NutrientCardProps {
  nutrient: NutrientNeedResult;
  accentGradient?: string;
}

export default function NutrientCard({ nutrient, accentGradient = "from-pink-500 to-rose-400" }: NutrientCardProps) {
  const borderStyle = nutrient.isPriority
    ? "border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60"
    : "border-border/40 bg-card";

  return (
    <div className={`rounded-2xl border-2 p-5 transition-shadow hover:shadow-md ${borderStyle}`} id={`nutrient-card-${nutrient.nutrientId}`}>
      <div className="flex items-center gap-2.5 mb-2.5">
        <span className="text-2xl">{nutrient.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{nutrient.label}</h3>
            {nutrient.isPriority && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200/60 text-amber-700">
                Priority
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reasons */}
      {nutrient.reasons.length > 0 && (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">
          {nutrient.reasons[0]}
        </p>
      )}

      {/* Symptom Sources */}
      {nutrient.symptomSources.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-[10px] text-muted-foreground font-medium">From:</span>
          {nutrient.symptomSources.map((s) => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 font-medium text-foreground/70">
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Food chips */}
      <div className="flex flex-wrap gap-1.5">
        {nutrient.foods.slice(0, 4).map((food) => (
          <span
            key={food.name}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background/80 border border-border/30 text-xs font-medium"
          >
            {food.emoji} {food.name}
          </span>
        ))}
      </div>
    </div>
  );
}
