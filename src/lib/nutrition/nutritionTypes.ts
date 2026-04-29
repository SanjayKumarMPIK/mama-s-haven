import type { Phase } from "@/hooks/usePhase";

export interface SymptomDef {
  id: string;
  label: string;
  emoji: string;
  category: "core" | "phase-specific";
}

export interface SymptomNutrientMapping {
  nutrientId: string;
  weight: number;
  reason: Partial<Record<Phase, string>> & { default: string };
}

export interface NutrientFoodEntry {
  name: string;
  emoji: string;
  nutrients: string[];
  whyItHelps: string;
}

export interface PhaseConfig {
  symptoms: string[];
  nutrientPriorities: Record<string, number>;
  title: string;
  emoji: string;
  gradient: string;
}

export interface DetectedSymptom {
  id: string;
  label: string;
  emoji: string;
  count: number;
  recentDates: string[];
}

export interface NutrientNeedResult {
  nutrientId: string;
  label: string;
  emoji: string;
  score: number;
  isPriority: boolean;
  reasons: string[];
  symptomSources: string[];
  foods: NutrientFoodEntry[];
}

export interface SafetyWarning {
  symptomId: string;
  label: string;
  emoji: string;
  message: string;
  severity: "amber" | "red";
}

export interface SymptomAnalysisResult {
  symptomId: string;
  label: string;
  emoji: string;
  detected: boolean;
  count: number;
  possibleReasons: string[];
  helpfulNutrients: { nutrientId: string; label: string; emoji: string }[];
  foodRecommendations: NutrientFoodEntry[];
}

export interface NutritionIntelligenceResult {
  hasData: boolean;
  detectedSymptoms: DetectedSymptom[];
  nutrientNeeds: NutrientNeedResult[];
  foodRecommendations: NutrientFoodEntry[];
  deficiencyScore: number;
  deficiencySeverity: "Good" | "Mild" | "Moderate" | "High" | "Critical";
  safetyWarnings: SafetyWarning[];
  priorityNutrient: string | null;
  riskCounts: { high: number; moderate: number; low: number; good: number };
}
