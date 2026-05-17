import { useMemo } from "react";
import { Sparkles, Utensils } from "lucide-react";
import { MATERNITY_PRIORITY_NUTRIENTS, type MaternityStage } from "@/lib/nutrition/nutritionPriorityData";
import { useConditionBasedNutrients } from "@/hooks/useConditionBasedNutrients";
import type { PriorityNutrient } from "@/lib/nutrition/nutritionPriorityData";

interface Props {
  stage: MaternityStage;
  symptomPriorityIds: string[];
  accentGradient: string;
}

export default function PriorityNutritionOverview({ stage, symptomPriorityIds, accentGradient }: Props) {
  const priorityNutrients = MATERNITY_PRIORITY_NUTRIENTS[stage] || [];
  const { configs: conditionConfigs, isActive: conditionsActive } =
    useConditionBasedNutrients();

  // ─── Build display nutrients ─────────────────────────────────────────────────────
  // Combine stage nutrients + condition-linked nutrients that aren't already in stage
  const displayNutrients = useMemo(() => {
    const stageMapped = new Set(priorityNutrients.map((n) => n.id));
    const display = [...priorityNutrients];

    // Add condition-linked nutrients if not already in stage nutrients
    if (conditionsActive && conditionConfigs.length > 0) {
      conditionConfigs.forEach((config) => {
        if (!stageMapped.has(config.nutrientId)) {
          // Create a display card for this condition-linked nutrient
          const conditionNutrient: PriorityNutrient & { isConditionLinked?: boolean; conditionLabel?: string } = {
            id: config.nutrientId,
            name: config.nutrient,
            emoji: config.emoji,
            description: config.description,
            foods: config.foods.vegetarian, // Default to vegetarian, will vary by diet
            isConditionLinked: true,
            conditionLabel: Object.entries({ ...conditionConfigs }).find(
              ([_, c]) => c.nutrientId === config.nutrientId
            )?.[0],
          };
          display.push(conditionNutrient as any);
        }
      });
    }

    return display;
  }, [priorityNutrients, conditionConfigs, conditionsActive]);

  if (displayNutrients.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-base font-bold">Priority Nutrition Overview</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayNutrients.map((nutrient) => {
          const isSymptomPriority = symptomPriorityIds.includes(nutrient.id);
          const isConditionLinked = (nutrient as any).isConditionLinked;
          
          let priorityLabel = "Stage Priority";
          let badgeBg = "bg-purple-100 text-purple-700";
          
          if (isSymptomPriority && isConditionLinked) {
            priorityLabel = "Symptom + Condition";
            badgeBg = "bg-rose-100 text-rose-700";
          } else if (isSymptomPriority) {
            priorityLabel = "Top Priority (Symptom + Stage)";
            badgeBg = "bg-rose-100 text-rose-700";
          } else if (isConditionLinked) {
            priorityLabel = "Condition Support";
            badgeBg = "bg-amber-100 text-amber-700";
          }

          return (
            <div
              key={nutrient.id}
              className="flex flex-col rounded-2xl border border-border/50 bg-card p-5 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div
                className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentGradient}`}
              />

              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl shrink-0">
                  {nutrient.emoji}
                </div>
                <div
                  className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-wide uppercase ${badgeBg} text-right max-w-[120px] leading-tight`}
                >
                  {priorityLabel}
                </div>
              </div>

              <h3 className="font-bold text-base mb-1">{nutrient.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
                {nutrient.description}
              </p>

              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Utensils className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Top Sources
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground/80 leading-snug">
                  {nutrient.foods.join(", ")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
