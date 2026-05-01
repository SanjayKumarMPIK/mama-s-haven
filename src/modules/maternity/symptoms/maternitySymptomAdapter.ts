import {
  MATERNITY_PHASE_CONFIG,
  COMMON_CUSTOMIZABLE_SYMPTOMS,
  type MaternityPhaseStage,
  type ConfigSymptom
} from "./maternitySymptomConfig";

export interface AdaptedSymptom {
  id: string;
  label: string;
  emoji: string;
  isCore: boolean;
}

export interface MaternitySymptomResult {
  coreSymptoms: AdaptedSymptom[];
  customizableSymptoms: AdaptedSymptom[];
}

/**
 * Adapter function to merge the strictly defined Core 6 symptoms with
 * medical condition-prioritized symptoms, and return the final core/customizable lists.
 */
export function getMaternitySymptomsForPhase(
  stage: MaternityPhaseStage
): MaternitySymptomResult {
  // 1. Get the strict Core 6 for this stage
  const baseCore = MATERNITY_PHASE_CONFIG[stage];
  
  // 2. Build the customizable library from the common symptoms
  const customizablePool: AdaptedSymptom[] = COMMON_CUSTOMIZABLE_SYMPTOMS.map(sym => ({
    id: sym.id,
    label: sym.label,
    emoji: sym.emoji,
    isCore: false
  }));

  const finalCore: AdaptedSymptom[] = baseCore.map(sym => ({
    id: sym.id,
    label: sym.label,
    emoji: sym.emoji,
    isCore: true
  }));

  return {
    coreSymptoms: finalCore,
    customizableSymptoms: customizablePool,
  };
}
