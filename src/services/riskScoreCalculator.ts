import type { Nutrient, Severity } from "./deficiencyInsightEngine";

export interface WeeklyTrendData {
  week: number;
  riskScores: Record<Nutrient, number>;
}

export interface RiskScoreOutput {
  weeklyTrends: WeeklyTrendData[];
  improvementRate: number; // percentage improvement
  topImprovingNutrients: Nutrient[];
  topWorseningNutrients: Nutrient[];
  overallTrend: "improving" | "stable" | "worsening";
}

export function calculateRiskScores(
  historicalData: Array<{ date: string; nutrientRisks: Array<{ nutrient: Nutrient; probability: number }> }>
): RiskScoreOutput {
  const weeksToAnalyze = 4;
  const weekData: Map<number, Map<Nutrient, number[]>> = new Map();

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - (weeksToAnalyze * 7));

  for (const entry of historicalData) {
    const entryDate = new Date(entry.date);
    if (entryDate < weekStart) continue;

    const weekNumber = Math.floor((now.getTime() - entryDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (!weekData.has(weekNumber)) {
      weekData.set(weekNumber, new Map());
    }

    const weekMap = weekData.get(weekNumber)!;
    for (const risk of entry.nutrientRisks) {
      if (!weekMap.has(risk.nutrient)) {
        weekMap.set(risk.nutrient, []);
      }
      weekMap.get(risk.nutrient)!.push(risk.probability);
    }
  }

  const weeklyTrends: WeeklyTrendData[] = [];
  for (let week = weeksToAnalyze - 1; week >= 0; week--) {
    const weekMap = weekData.get(week);
    const riskScores: Record<Nutrient, number> = {} as any;
    
    if (weekMap) {
      for (const [nutrient, scores] of weekMap.entries()) {
        riskScores[nutrient] = scores.length > 0 
          ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
          : 0;
      }
    }
    
    weeklyTrends.push({ week: weeksToAnalyze - week, riskScores });
  }

  let topImprovingNutrients: Nutrient[] = [];
  let topWorseningNutrients: Nutrient[] = [];

  if (weeklyTrends.length >= 2) {
    const firstWeek = weeklyTrends[0].riskScores;
    const lastWeek = weeklyTrends[weeklyTrends.length - 1].riskScores;

    const nutrientChanges: Array<{ nutrient: Nutrient; change: number }> = [];
    
    for (const nutrient of Object.keys(firstWeek) as Nutrient[]) {
      const firstValue = firstWeek[nutrient] || 0;
      const lastValue = lastWeek[nutrient] || 0;
      const change = firstValue - lastValue;
      nutrientChanges.push({ nutrient, change });
    }

    nutrientChanges.sort((a, b) => b.change - a.change);
    topImprovingNutrients = nutrientChanges.slice(0, 3).map(n => n.nutrient);
    topWorseningNutrients = nutrientChanges.slice(-3).reverse().map(n => n.nutrient);
  }

  const avgFirstWeek = weeklyTrends.length > 0 
    ? Object.values(weeklyTrends[0].riskScores).reduce((sum, v) => sum + v, 0) / Object.keys(weeklyTrends[0].riskScores).length
    : 0;
  const avgLastWeek = weeklyTrends.length > 1
    ? Object.values(weeklyTrends[weeklyTrends.length - 1].riskScores).reduce((sum, v) => sum + v, 0) / Object.keys(weeklyTrends[weeklyTrends.length - 1].riskScores).length
    : 0;

  const improvementRate = avgFirstWeek > 0 ? Math.round(((avgFirstWeek - avgLastWeek) / avgFirstWeek) * 100) : 0;

  let overallTrend: "improving" | "stable" | "worsening" = "stable";
  if (improvementRate > 10) overallTrend = "improving";
  else if (improvementRate < -10) overallTrend = "worsening";

  return {
    weeklyTrends,
    improvementRate,
    topImprovingNutrients,
    topWorseningNutrients,
    overallTrend,
  };
}
