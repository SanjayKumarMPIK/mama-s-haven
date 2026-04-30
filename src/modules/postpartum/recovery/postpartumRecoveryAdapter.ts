import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";

export interface PostpartumNormalizedMetrics {
  week: number;
  daysLogged: number;
  avgSleepHours: number | null;
  avgHydrationGlasses: number | null;
  avgMoodScore: number | null; // 0-100
  avgFatigueScore: number | null; // 0-100
}

export function getPostpartumNormalizedMetricsForWeek(
  logs: HealthLogs,
  deliveryDateISO: string,
  targetWeek: number
): PostpartumNormalizedMetrics {
  const deliveryDate = new Date(deliveryDateISO + "T00:00:00");
  if (isNaN(deliveryDate.getTime())) {
    return createEmptyMetrics(targetWeek);
  }

  let totalSleep = 0;
  let sleepCount = 0;
  let totalHydration = 0;
  let hydrationCount = 0;
  let totalMood = 0;
  let moodCount = 0;
  let totalFatigue = 0;
  let fatigueCount = 0;

  let daysLogged = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    // Postpartum-only isolation rule: ignore non-maternity logs
    if (entry.phase !== "maternity") continue;

    const logDate = new Date(dateISO + "T12:00:00");
    // Only process logs that occur on or after delivery date (postpartum logs)
    // Pregnancy data must NOT influence postpartum recovery score.
    if (logDate < deliveryDate) continue;

    // Calculate week postpartum
    const daysSinceDelivery = Math.floor((logDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    const logWeek = Math.floor(daysSinceDelivery / 7) + 1;

    if (logWeek !== targetWeek) continue;

    daysLogged++;
    const e = entry as MaternityEntry;

    if (e.sleepHours !== null) {
      totalSleep += e.sleepHours;
      sleepCount++;
    }

    if (e.hydrationGlasses !== null) {
      totalHydration += e.hydrationGlasses;
      hydrationCount++;
    }

    if (e.mood) {
      if (e.mood === "Good") totalMood += 100;
      else if (e.mood === "Okay") totalMood += 50;
      else if (e.mood === "Low") totalMood += 0;
      moodCount++;
    }

    if (e.fatigueLevel) {
      if (e.fatigueLevel === "Low") totalFatigue += 100;
      else if (e.fatigueLevel === "Medium") totalFatigue += 50;
      else if (e.fatigueLevel === "High") totalFatigue += 0;
      fatigueCount++;
    }
  }

  return {
    week: targetWeek,
    daysLogged,
    avgSleepHours: sleepCount > 0 ? totalSleep / sleepCount : null,
    avgHydrationGlasses: hydrationCount > 0 ? totalHydration / hydrationCount : null,
    avgMoodScore: moodCount > 0 ? totalMood / moodCount : null,
    avgFatigueScore: fatigueCount > 0 ? totalFatigue / fatigueCount : null,
  };
}

function createEmptyMetrics(week: number): PostpartumNormalizedMetrics {
  return {
    week,
    daysLogged: 0,
    avgSleepHours: null,
    avgHydrationGlasses: null,
    avgMoodScore: null,
    avgFatigueScore: null,
  };
}
