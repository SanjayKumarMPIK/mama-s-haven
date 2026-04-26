export interface WorkoutReadinessInput {
  avgSleepHours: number | null;
  poorSleepFrequency: number; // 0..1
  fatigueFrequency: number; // 0..1
  lowEnergyFrequency: number; // 0..1
  stressFrequency: number; // 0..1
  hydrationStatus: "Low" | "Moderate" | "Good";
}

export interface WorkoutReadinessResult {
  score: number; // 0..100
  status: "Ready" | "Moderate" | "Recovery";
  explanation: string;
}

export function calculateWorkoutReadiness(input: WorkoutReadinessInput): WorkoutReadinessResult {
  const hydrationPenalty = input.hydrationStatus === "Low" ? 16 : input.hydrationStatus === "Moderate" ? 7 : 0;
  const sleepPenalty = Math.round(input.poorSleepFrequency * 22);
  const fatiguePenalty = Math.round(input.fatigueFrequency * 24);
  const energyPenalty = Math.round(input.lowEnergyFrequency * 20);
  const stressPenalty = Math.round(input.stressFrequency * 18);
  const sleepBonus = input.avgSleepHours && input.avgSleepHours >= 7 ? 6 : 0;

  const score = Math.max(18, Math.min(98, 84 - hydrationPenalty - sleepPenalty - fatiguePenalty - energyPenalty - stressPenalty + sleepBonus));
  const status: WorkoutReadinessResult["status"] = score >= 70 ? "Ready" : score >= 48 ? "Moderate" : "Recovery";
  const explanation =
    status === "Ready"
      ? "Body prepared for training. Keep hydration and warm-up consistent."
      : status === "Moderate"
      ? "Use moderate intensity today and prioritize sleep and hydration."
      : "Recovery-focused day recommended before intense sessions.";

  return { score, status, explanation };
}
