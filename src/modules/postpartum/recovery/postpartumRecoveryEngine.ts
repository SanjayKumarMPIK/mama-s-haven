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

  // Weights for the scoring engine, now including symptoms
  const weights = {
    symptoms: 0.3,
    sleep: 0.25,
    mood: 0.25,
    fatigue: 0.2,
    hydration: 0.0, // Folded into general fatigue/mood for simplicity, or we can keep it:
    // Let's adjust to: symptoms 30%, sleep 25%, mood 20%, fatigue 15%, hydration 10%
  };

  const adjustedWeights = {
    symptoms: 0.30,
    sleep: 0.25,
    mood: 0.20,
    fatigue: 0.15,
    hydration: 0.10,
  };

  // Sleep score (target: 8 hours)
  const sleepScore = Math.min(100, ((currentMetrics.avgSleepHours || 0) / 8) * 100);
  
  // Hydration score (target: 8 glasses)
  const hydrationScore = Math.min(100, ((currentMetrics.avgHydrationGlasses || 0) / 8) * 100);

  // Mood score (Good=100, Okay=50, Low=0)
  const moodScore = currentMetrics.avgMoodScore || 0;

  // Fatigue score (Low=100, Medium=50, High=0)
  const fatigueScore = currentMetrics.avgFatigueScore || 0;

  // Symptom Score
  const symptomScore = Math.max(0, 100 - (currentMetrics.symptomSeverityPenalty || 0));

  const baseScore = 
    (symptomScore * adjustedWeights.symptoms) +
    (sleepScore * adjustedWeights.sleep) +
    (hydrationScore * adjustedWeights.hydration) +
    (moodScore * adjustedWeights.mood) +
    (fatigueScore * adjustedWeights.fatigue);

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
    const pSymptom = Math.max(0, 100 - (previousMetrics.symptomSeverityPenalty || 0));

    prevScore = Math.round(
      (pSymptom * adjustedWeights.symptoms) +
      (pSleep * adjustedWeights.sleep) +
      (pHydration * adjustedWeights.hydration) +
      (pMood * adjustedWeights.mood) +
      (pFatigue * adjustedWeights.fatigue)
    );
  }

  // Handle case where we have score but previous score was 0 (no trend)
  const trendPercent = prevScore > 0 ? Math.round(((score - prevScore) / prevScore) * 100) : 0;

  // Dynamic recommendations engine based on specific metric thresholds
  const dynamicRecommendations: string[] = [];
  
  // Specific symptom-based recommendations (for the 6 core Postpartum symptoms)
  const freqs = currentMetrics.symptomFrequencies || {};
  if (freqs.lowMilkSupply && freqs.lowMilkSupply > 0) {
    dynamicRecommendations.push("Your low milk supply is affecting feeding stability. Keep hydrating and consider consulting a lactation expert.");
  }
  if ((freqs.breastPain && freqs.breastPain > 0) || (freqs.nipplePain && freqs.nipplePain > 0)) {
    dynamicRecommendations.push("You are experiencing feeding discomfort. Apply warm compresses and ensure proper latching.");
  }
  if (freqs.bodyAche && freqs.bodyAche > 0) {
    dynamicRecommendations.push("Physical recovery strain detected. Allow your body to rest and avoid heavy lifting.");
  }
  if (freqs.sleepDeprivation && freqs.sleepDeprivation > 0) {
    dynamicRecommendations.push("Sleep deprivation is significantly impacting your recovery. Please ask for help to get uninterrupted rest.");
  }

  // General metric-based recommendations
  if (sleepScore < 60 && !freqs.sleepDeprivation) {
    dynamicRecommendations.push("Prioritize sleep and rest. Consider asking for help during night shifts.");
  }
  if (hydrationScore < 70) {
    dynamicRecommendations.push("Your hydration is slightly low. Keep a water bottle nearby during feedings.");
  }
  if (moodScore <= 50) {
    dynamicRecommendations.push("Your logs indicate tough mood days. It's okay to seek emotional support.");
  }
  if (fatigueScore <= 50 && !freqs.lowEnergy) {
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
