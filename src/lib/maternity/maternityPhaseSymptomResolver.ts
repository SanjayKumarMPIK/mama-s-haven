/**
 * maternityPhaseSymptomResolver.ts
 *
 * Resolves the correct KEY_SYMPTOMS_BY_PHASE key based on the active
 * maternity lifecycle state and trimester. Used by analytics engines
 * (symptomInsightsEngine, symptomPredictionEngine) and SymptomChecker
 * to ensure phase-accurate symptom resolution.
 *
 * ⚠️ Scoped ONLY to Maternity phase.
 */

import type { Phase } from "@/hooks/usePhase";
import type { MaternityMode } from "@/hooks/usePregnancyProfile";

/**
 * When the global phase is "maternity", resolves the precise sub-phase key
 * used in KEY_SYMPTOMS_BY_PHASE (e.g., "maternity_T1", "maternity_postpartum").
 *
 * For non-maternity phases, returns the phase as-is.
 */
export function resolveSymptomPhaseKey(
  phase: Phase,
  maternityMode?: MaternityMode,
  trimester?: number,
): string {
  if (phase !== "maternity") return phase;

  // Postpartum & Premature sub-phases
  if (maternityMode === "postpartum") return "maternity_postpartum";
  if (maternityMode === "premature") return "maternity_premature";

  // Pregnancy trimester sub-phases
  if (trimester === 1) return "maternity_T1";
  if (trimester === 2) return "maternity_T2";
  return "maternity_T3";
}
