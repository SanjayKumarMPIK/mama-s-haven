import type { Phase } from "@/hooks/usePhase";

export interface NormalizedSymptom {
  canonicalId: string;
  originalId: string;
  date: string;
  severity?: "mild" | "moderate" | "severe";
  source: "healthLog";
  phase: Phase;
}

export interface AggregatedSymptom {
  canonicalId: string;
  label: string;
  emoji: string;
  frequency: number;
  severityScore: number;
  recentDates: string[];
  sources: string[];
}

export interface NutrientRisk {
  nutrientId: string;
  label: string;
  emoji: string;
  score: number;
  severity: "high" | "moderate" | "low" | "good";
  isPriority: boolean;
  reasons: string[];
  symptomSources: string[];
  recommendedFoods: { name: string; emoji: string; nutrients: string[]; whyItHelps: string }[];
}

export interface ComputedDeficiencyInsights {
  hasData: boolean;
  lastUpdated: string;
  overallScore: number;
  overallSeverity: "Critical" | "High" | "Moderate" | "Mild" | "Good";
  riskCounts: { high: number; moderate: number; low: number; good: number };
  deficiencies: NutrientRisk[];
  topDeficiencies: NutrientRisk[];
  priorityNutrient: NutrientRisk | null;
  recommendations: string[];
  summary: {
    activeSymptoms: AggregatedSymptom[];
    frequentSymptoms: { symptom: string; count: number; emoji: string }[];
    loggedDays: number;
    avgSleepHours: number | null;
    avgMoodScore: number | null;
  };
  charts: {
    nutrientProbabilities: { name: string; value: number; label: string; emoji: string }[];
    riskDistribution: { name: string; count: number }[];
  };
  _debug: {
    lastUpdated: string;
    activeSymptoms: string[];
    normalizedCount: number;
  };
}

export const EMPTY_INSIGHTS: ComputedDeficiencyInsights = {
  hasData: false,
  lastUpdated: new Date().toISOString(),
  overallScore: 0,
  overallSeverity: "Good",
  riskCounts: { high: 0, moderate: 0, low: 0, good: 0 },
  deficiencies: [],
  topDeficiencies: [],
  priorityNutrient: null,
  recommendations: [],
  summary: {
    activeSymptoms: [],
    frequentSymptoms: [],
    loggedDays: 0,
    avgSleepHours: null,
    avgMoodScore: null,
  },
  charts: {
    nutrientProbabilities: [],
    riskDistribution: [],
  },
  _debug: {
    lastUpdated: new Date().toISOString(),
    activeSymptoms: [],
    normalizedCount: 0,
  },
};
