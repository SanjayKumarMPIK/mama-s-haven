/**
 * useConditionBasedNutrients.ts
 *
 * React hook that computes condition-based nutritional support.
 * Reads medical conditions from profile and maps to nutrient priorities.
 *
 * Only active during maternity phase.
 * Returned data can be safely used in all 4 nutrition locations.
 *
 * IMPORTANT: This extends existing nutrition intelligence, does NOT replace.
 */

import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import {
  getConditionNutrientIds,
  getConditionNutrientConfigs,
  aggregateConditionFoods,
  getConditionNutrientModifier,
  getConditionForNutrient,
  type ConditionNutrientConfig,
} from "@/lib/nutrition/conditionNutrientMapping";

export interface ConditionBasedNutrients {
  /** Active medical conditions selected in profile */
  conditions: string[];
  
  /** Nutrient IDs to prioritize (deduplicated) */
  nutrientIds: string[];
  
  /** Full config objects for each condition */
  configs: ConditionNutrientConfig[];
  
  /** Aggregated food recommendations based on conditions + diet preference */
  foods: string[];
  
  /** Whether condition-based intelligence should be active (maternity phase only) */
  isActive: boolean;
  
  /** Helper: Get weighting modifier for a nutrient given these conditions */
  getModifier: (nutrientId: string) => number;
  
  /** Helper: Get which condition links to a nutrient */
  getConditionLabel: (nutrientId: string) => string | null;
}

export function useConditionBasedNutrients(): ConditionBasedNutrients {
  const { profile } = useProfile();
  const { phase } = usePhase();
  const { mode } = usePregnancyProfile();

  return useMemo(() => {
    // Only active during pregnancy/maternity phase (NOT postpartum/premature)
    const isActive =
      phase === "maternity" && mode !== "postpartum" && mode !== "premature";

    if (!isActive || !profile?.medicalConditions) {
      return {
        conditions: [],
        nutrientIds: [],
        configs: [],
        foods: [],
        isActive: false,
        getModifier: () => 0,
        getConditionLabel: () => null,
      };
    }

    const conditions = profile.medicalConditions;
    const nutrientIds = getConditionNutrientIds(conditions);
    const configs = getConditionNutrientConfigs(conditions);
    
    // Get diet preference (default to vegetarian if not set)
    const dietPref =
      (profile.dietType as "veg" | "non-veg" | "mixed" | "eggetarian") ||
      "veg";
    
    const foods = aggregateConditionFoods(conditions, dietPref);

    return {
      conditions,
      nutrientIds,
      configs,
      foods,
      isActive,
      getModifier: (nutrientId: string) =>
        getConditionNutrientModifier(nutrientId, conditions),
      getConditionLabel: (nutrientId: string) =>
        getConditionForNutrient(nutrientId, conditions),
    };
  }, [profile, phase, mode]);
}
