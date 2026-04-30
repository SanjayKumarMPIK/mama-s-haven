import type { PostpartumNormalizedMetrics } from "./postpartumRecoveryAdapter";

export interface PostpartumRecoveryScoreResult {
  score: number;
  statusLabel: "Needs Attention" | "Recovering" | "Good Progress" | "Strong Recovery";
  trendPercent: number; // vs previous week
  dynamicRecommendations: string[];
  hasInsufficientData: boolean;
}

export function calculatePostpartumRecoveryScore(
  currentMetrics: PostpartumNormalizedMetrics,
  previousMetrics?: PostpartumNormalizedMetrics
): PostpartumRecoveryScoreResult {
  // Enforce fallback handling if no logs present
  if (currentMetrics.daysLogged === 0) {
    return {
      score: 0,
      statusLabel: "Needs Attention",
      trendPercent: 0,
      dynamicRecommendations: ["Start Logging to Track Recovery"],
      hasInsufficientData: true,
    };
  }

  // Weights for the scoring engine
  const weights = {
    sleep: 0.3,
    hydration: 0.2,
    mood: 0.3,
    fatigue: 0.2,
  };

  // Sleep score (target: 8 hours)
  const sleepScore = Math.min(100, ((currentMetrics.avgSleepHours || 0) / 8) * 100);
  
  // Hydration score (target: 8 glasses)
  const hydrationScore = Math.min(100, ((currentMetrics.avgHydrationGlasses || 0) / 8) * 100);

  // Mood score (Good=100, Okay=50, Low=0)
  const moodScore = currentMetrics.avgMoodScore || 0;

  // Fatigue score (Low=100, Medium=50, High=0)
  const fatigueScore = currentMetrics.avgFatigueScore || 0;

  const baseScore = 
    (sleepScore * weights.sleep) +
    (hydrationScore * weights.hydration) +
    (moodScore * weights.mood) +
    (fatigueScore * weights.fatigue);

  const score = Math.round(baseScore);

  let statusLabel: PostpartumRecoveryScoreResult["statusLabel"] = "Needs Attention";
  if (score >= 80) statusLabel = "Strong Recovery";
  else if (score >= 60) statusLabel = "Good Progress";
  else if (score >= 40) statusLabel = "Recovering";

  let prevScore = 0;
  if (previousMetrics && previousMetrics.daysLogged > 0) {
    const pSleep = Math.min(100, ((previousMetrics.avgSleepHours || 0) / 8) * 100);
    const pHydration = Math.min(100, ((previousMetrics.avgHydrationGlasses || 0) / 8) * 100);
    const pMood = previousMetrics.avgMoodScore || 0;
    const pFatigue = previousMetrics.avgFatigueScore || 0;
    prevScore = Math.round(
      (pSleep * weights.sleep) +
      (pHydration * weights.hydration) +
      (pMood * weights.mood) +
      (pFatigue * weights.fatigue)
    );
  }

  // Handle case where we have score but previous score was 0 (no trend)
  const trendPercent = prevScore > 0 ? Math.round(((score - prevScore) / prevScore) * 100) : 0;

  // Dynamic recommendations engine based on specific metric thresholds
  const dynamicRecommendations: string[] = [];
  if (sleepScore < 60) {
    dynamicRecommendations.push("Prioritize sleep and rest. Consider asking for help during night shifts.");
  }
  if (hydrationScore < 70) {
    dynamicRecommendations.push("Your hydration is slightly low. Keep a water bottle nearby during feedings.");
  }
  if (moodScore <= 50) {
    dynamicRecommendations.push("Your logs indicate tough mood days. It's okay to seek emotional support.");
  }
  if (fatigueScore <= 50) {
    dynamicRecommendations.push("You are experiencing high fatigue. Please minimize physical exertion.");
  }

  if (dynamicRecommendations.length === 0) {
    dynamicRecommendations.push("You are doing great! Keep up with your balanced recovery routine.");
  }

  return {
    score,
    statusLabel,
    trendPercent,
    dynamicRecommendations,
    hasInsufficientData: false,
  };
}
