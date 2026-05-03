import type { PostpartumNormalizedMetrics } from "./postpartumRecoveryAdapter";

export interface PostpartumRecoveryScoreResult {
  score: number;
  statusLabel: "Needs Attention" | "Recovering" | "Good Progress" | "Strong Recovery";
  trendPercent: number; // vs previous week
  dynamicRecommendations: string[];
  hasInsufficientData: boolean;
}

// ── Fallback defaults ────────────────────────────────────────────────────────
// Per spec: if missing sleep/mood/energy → default "Good" → contributes 75 to that signal
const FALLBACK_SIGNAL_SCORE = 75;
const FALLBACK_TOTAL_SCORE = 75;

// ── Weights (user spec) ──────────────────────────────────────────────────────
// Symptom Recovery: 40%, Energy: 20%, Mood: 15%, Sleep: 15%, Consistency: 10%
const WEIGHTS = {
  symptomRecovery: 0.40,
  energy:          0.20,
  mood:            0.15,
  sleep:           0.15,
  consistency:     0.10,
} as const;

// ── Score calculator ─────────────────────────────────────────────────────────

function computeRawScore(metrics: PostpartumNormalizedMetrics): number {
  const { daysLogged, daysInWeek } = metrics;

  // If absolutely no data logged, return the fallback score (75) — do NOT penalize
  if (daysLogged === 0) {
    return FALLBACK_TOTAL_SCORE;
  }

  // Symptom Recovery (100 = no symptoms, penalty reduces it)
  const symptomScore = Math.max(0, 100 - (metrics.symptomSeverityPenalty || 0));

  // Energy (mapped from fatigueScore inverse: Low fatigue = High energy)
  // Fallback to "Good" (75) if not logged
  const energyScore = metrics.avgFatigueScore !== null ? metrics.avgFatigueScore : FALLBACK_SIGNAL_SCORE;

  // Mood: Fallback to "Good" (75) if not logged
  const moodScore = metrics.avgMoodScore !== null ? metrics.avgMoodScore : FALLBACK_SIGNAL_SCORE;

  // Sleep: target 8 hours. Fallback to "Good" (75) if not logged
  const sleepScore = metrics.avgSleepHours !== null
    ? Math.min(100, (metrics.avgSleepHours / 8) * 100)
    : FALLBACK_SIGNAL_SCORE;

  // Consistency: days logged / days available in this week
  const consistencyScore = Math.min(100, (daysLogged / Math.max(1, daysInWeek)) * 100);

  // Weighted sum
  const raw =
    (symptomScore   * WEIGHTS.symptomRecovery) +
    (energyScore    * WEIGHTS.energy) +
    (moodScore      * WEIGHTS.mood) +
    (sleepScore     * WEIGHTS.sleep) +
    (consistencyScore * WEIGHTS.consistency);

  return Math.round(raw);
}

function scoreToStatus(score: number): PostpartumRecoveryScoreResult["statusLabel"] {
  if (score >= 80) return "Strong Recovery";
  if (score >= 60) return "Good Progress";
  if (score >= 40) return "Recovering";
  return "Needs Attention";
}

// ── Main export ──────────────────────────────────────────────────────────────

export function calculatePostpartumRecoveryScore(
  currentMetrics: PostpartumNormalizedMetrics,
  previousMetrics?: PostpartumNormalizedMetrics
): PostpartumRecoveryScoreResult {
  const score = computeRawScore(currentMetrics);
  const statusLabel = scoreToStatus(score);

  // Previous week score for trend
  let prevScore = 0;
  if (previousMetrics) {
    prevScore = computeRawScore(previousMetrics);
  }

  // Trend: only show if previous week had meaningful data
  const trendPercent =
    previousMetrics && prevScore > 0
      ? Math.round(((score - prevScore) / prevScore) * 100)
      : 0;

  // ── Dynamic recommendations engine ─────────────────────────────────────────
  const dynamicRecommendations: string[] = [];
  const freqs = currentMetrics.symptomFrequencies || {};

  // Specific symptom-based recommendations (6 core postpartum symptoms)
  if (freqs.lowMilkSupply && freqs.lowMilkSupply > 0) {
    dynamicRecommendations.push(
      "Your low milk supply is affecting feeding stability. Keep hydrating and consider consulting a lactation expert."
    );
  }
  if ((freqs.breastPain && freqs.breastPain > 0) || (freqs.nipplePain && freqs.nipplePain > 0)) {
    dynamicRecommendations.push(
      "You are experiencing feeding discomfort. Apply warm compresses and ensure proper latching."
    );
  }
  if (freqs.bodyAche && freqs.bodyAche > 0) {
    dynamicRecommendations.push(
      "Physical recovery strain detected. Allow your body to rest and avoid heavy lifting."
    );
  }
  if (freqs.sleepDeprivation && freqs.sleepDeprivation > 0) {
    dynamicRecommendations.push(
      "Sleep deprivation is significantly impacting your recovery. Please ask for help to get uninterrupted rest."
    );
  }
  if (freqs.lowEnergy && freqs.lowEnergy > 0) {
    dynamicRecommendations.push(
      "Low energy detected frequently. Focus on iron-rich foods and adequate rest between feeds."
    );
  }

  // General metric-based recommendations (only when actual data exists)
  if (currentMetrics.daysLogged > 0) {
    const sleepScore = currentMetrics.avgSleepHours !== null
      ? Math.min(100, (currentMetrics.avgSleepHours / 8) * 100)
      : null;
    const moodScore = currentMetrics.avgMoodScore;

    if (sleepScore !== null && sleepScore < 60 && !freqs.sleepDeprivation) {
      dynamicRecommendations.push(
        "Prioritize sleep and rest. Consider asking for help during night shifts."
      );
    }
    if (moodScore !== null && moodScore <= 50) {
      dynamicRecommendations.push(
        "Your logs indicate tough mood days. It's okay to seek emotional support."
      );
    }
  }

  // Default positive message
  if (dynamicRecommendations.length === 0) {
    dynamicRecommendations.push(
      "You are doing great! Keep up with your balanced recovery routine."
    );
  }

  return {
    score,
    statusLabel,
    trendPercent,
    dynamicRecommendations,
    hasInsufficientData: false, // We use fallback instead of marking insufficient
  };
}
