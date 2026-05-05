import { useMemo, useCallback } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import type { NutritionIntelligenceResult, SymptomAnalysisResult } from "@/lib/nutrition/nutritionTypes";
import {
  computeNutritionIntelligence,
  analyzeSymptom as analyzeSymptomEngine,
  searchSymptoms as searchSymptomsEngine,
  getPhaseSuggestedSymptoms,
} from "../services/pubertyNutritionEngine";

export interface UseNutritionIntelligenceReturn {
  result: NutritionIntelligenceResult;
  analyzeSymptom: (symptomId: string) => SymptomAnalysisResult | null;
  searchSymptoms: (query: string) => { id: string; label: string; emoji: string }[];
  suggestedSymptoms: { id: string; label: string; emoji: string }[];
  phase: string;
  phaseName: string;
}

export function usePubertyNutritionIntelligence(): UseNutritionIntelligenceReturn {
  const { logs } = useHealthLog();
  const { phase, phaseName } = usePhase();
  const { profile } = useProfile();

  // Main computation — memoized on logs + phase
  const result = useMemo<NutritionIntelligenceResult>(
    () => computeNutritionIntelligence(logs, phase),
    [logs, phase],
  );

  // Suggested symptoms for the current phase
  const suggestedSymptoms = useMemo(
    () => getPhaseSuggestedSymptoms(phase),
    [phase],
  );

  // Analyze a single symptom
  const analyzeSymptom = useCallback(
    (symptomId: string) => analyzeSymptomEngine(symptomId, phase, logs),
    [phase, logs],
  );

  // Fuzzy search symptoms
  const searchSymptoms = useCallback(
    (query: string) => searchSymptomsEngine(query, phase),
    [phase],
  );

  return {
    result,
    analyzeSymptom,
    searchSymptoms,
    suggestedSymptoms,
    phase,
    phaseName,
  };
}
