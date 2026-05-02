// ─── Postpartum Metrics Adapter ───────────────────────────────────────────────
// Aggregates recovery metrics from Maternity Calendar for Postpartum Dashboard
// STRICTLY isolated to Postpartum Dashboard only

import type { HealthLogs, HealthLogEntry } from "@/hooks/useHealthLog";
import { filterLogsByPhase } from "@/shared/symptom-sync/symptomAnalyticsAdapter";

export interface PostpartumMetrics {
  symptomsLogged: number;
  avgSleep: number | null;
  moodLabel: string | null;
  painLevel: number | null;
  trends: {
    symptoms: string;
    sleep: string;
    mood: string;
    pain: string;
  };
}

/**
 * Aggregates recovery metrics from maternity calendar entries for postpartum recovery.
 * Uses adaptive rolling window (7 days, expand to 14 days if low data).
 */
export function getPostpartumMetrics(logs: HealthLogs, deliveryDateISO: string): PostpartumMetrics {
  // Filter for postpartum phase entries only using the adapter
  const maternityLogs = filterLogsByPhase(logs, "postpartum", deliveryDateISO)
    .map(({ date, entry }) => ({ date, log: entry as unknown as HealthLogEntry }));

  // Determine adaptive window
  const windowDays = maternityLogs.length >= 7 ? 7 : 14;

  // Get dates for the window
  const windowDates: string[] = [];
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    windowDates.push(d.toISOString().slice(0, 10));
  }

  // Filter logs within window
  const recentLogs = windowDates
    .map(date => maternityLogs.find(l => l.date === date))
    .filter((l): l is { date: string; log: HealthLogEntry } => l !== undefined);

  // Get previous period for trend comparison
  const previousWindowDates: string[] = [];
  for (let i = windowDays; i < windowDays * 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    previousWindowDates.push(d.toISOString().slice(0, 10));
  }

  const previousLogs = previousWindowDates
    .map(date => maternityLogs.find(l => l.date === date))
    .filter((l): l is { date: string; log: HealthLogEntry } => l !== undefined);

  // ─── Symptoms Logged ───────────────────────────────────────────────────────
  const currentSymptomsCount = recentLogs.reduce((count, { log }) => {
    if (log.symptoms && typeof log.symptoms === 'object') {
      const symptomCount = Object.values(log.symptoms as Record<string, boolean>).filter(Boolean).length;
      return count + symptomCount;
    }
    return count;
  }, 0);

  const previousSymptomsCount = previousLogs.reduce((count, { log }) => {
    if (log.symptoms && typeof log.symptoms === 'object') {
      const symptomCount = Object.values(log.symptoms as Record<string, boolean>).filter(Boolean).length;
      return count + symptomCount;
    }
    return count;
  }, 0);

  let symptomsTrend = "Stable";
  if (previousSymptomsCount > 0) {
    const change = ((currentSymptomsCount - previousSymptomsCount) / previousSymptomsCount) * 100;
    if (change > 5) symptomsTrend = `+${Math.round(change)}%`;
    else if (change < -5) symptomsTrend = `${Math.round(change)}%`;
  } else if (currentSymptomsCount > 0) {
    symptomsTrend = "New";
  }

  // ─── Avg Sleep ───────────────────────────────────────────────────────────────
  const currentSleepLogs = recentLogs
    .map(({ log }) => log.sleepHours)
    .filter((s): s is number => s !== null && s !== undefined);

  const previousSleepLogs = previousLogs
    .map(({ log }) => log.sleepHours)
    .filter((s): s is number => s !== null && s !== undefined);

  const avgSleep = currentSleepLogs.length > 0 
    ? Math.round((currentSleepLogs.reduce((sum, s) => sum + s, 0) / currentSleepLogs.length) * 10) / 10 
    : null;

  let sleepTrend = "Stable";
  if (previousSleepLogs.length > 0 && avgSleep !== null) {
    const prevAvg = previousSleepLogs.reduce((sum, s) => sum + s, 0) / previousSleepLogs.length;
    const change = avgSleep - prevAvg;
    if (change > 0.5) sleepTrend = `+${change.toFixed(1)} hrs`;
    else if (change < -0.5) sleepTrend = `${change.toFixed(1)} hrs`;
  }

  // ─── Mood ───────────────────────────────────────────────────────────────────
  const currentMoodLogs = recentLogs
    .map(({ log }) => log.mood)
    .filter((m): m is "Good" | "Okay" | "Low" => m !== null && m !== undefined);

  const previousMoodLogs = previousLogs
    .map(({ log }) => log.mood)
    .filter((m): m is "Good" | "Okay" | "Low" => m !== null && m !== undefined);

  let moodLabel: string | null = null;
  if (currentMoodLogs.length > 0) {
    const avgMood = currentMoodLogs.reduce((sum: number, m) => {
      const moodValue = m === "Good" ? 3 : m === "Okay" ? 2 : m === "Low" ? 1 : 2;
      return sum + moodValue;
    }, 0) / currentMoodLogs.length;

    // Convert back to label
    if (avgMood >= 2.5) moodLabel = "Good";
    else if (avgMood >= 1.5) moodLabel = "Okay";
    else moodLabel = "Low";
  }

  let moodTrend = "Stable";
  if (previousMoodLogs.length > 0 && moodLabel !== null) {
    const prevAvg = previousMoodLogs.reduce((sum: number, m) => {
      const moodValue = m === "Good" ? 3 : m === "Okay" ? 2 : m === "Low" ? 1 : 2;
      return sum + moodValue;
    }, 0) / previousMoodLogs.length;

    const currentAvg = currentMoodLogs.reduce((sum: number, m) => {
      const moodValue = m === "Good" ? 3 : m === "Okay" ? 2 : m === "Low" ? 1 : 2;
      return sum + moodValue;
    }, 0) / currentMoodLogs.length;

    if (currentAvg > prevAvg + 0.3) moodTrend = "Improved";
    else if (currentAvg < prevAvg - 0.3) moodTrend = "Declined";
  }

  // ─── Pain Level ────────────────────────────────────────────────────────────
  const currentPainLogs = recentLogs
    .filter(({ log }) => log.symptoms && typeof log.symptoms === 'object');

  const previousPainLogs = previousLogs
    .filter(({ log }) => log.symptoms && typeof log.symptoms === 'object');

  let painLevel: number | null = null;
  if (currentPainLogs.length > 0) {
    const severitySum = currentPainLogs.reduce((sum, { log }) => {
      const symptoms = log.symptoms as Record<string, boolean>;
      const severities = (log as any).symptomSeverities as Record<string, "mild" | "moderate" | "severe"> | undefined;
      
      let entrySum = 0;
      let symptomCount = 0;

      Object.entries(symptoms).forEach(([symptom, isActive]) => {
        if (!isActive) return;
        symptomCount++;

        // Use explicit severity if available, otherwise default to moderate (5)
        if (severities && severities[symptom]) {
          const severity = severities[symptom];
          if (severity === "mild") entrySum += 3;
          else if (severity === "moderate") entrySum += 5;
          else if (severity === "severe") entrySum += 8;
        } else {
          entrySum += 5; // Default to moderate
        }
      });

      return sum + entrySum;
    }, 0);
    
    const totalSymptoms = currentPainLogs.reduce((sum, { log }) => {
      const symptoms = log.symptoms as Record<string, boolean>;
      return sum + Object.values(symptoms).filter(Boolean).length;
    }, 0);
    
    painLevel = totalSymptoms > 0 ? Math.round((severitySum / totalSymptoms) * 10) / 10 : null;
  }

  let painTrend = "Stable";
  if (previousPainLogs.length > 0 && painLevel !== null) {
    const prevSeveritySum = previousPainLogs.reduce((sum, { log }) => {
      const symptoms = log.symptoms as Record<string, boolean>;
      const severities = (log as any).symptomSeverities as Record<string, "mild" | "moderate" | "severe"> | undefined;
      
      let entrySum = 0;

      Object.entries(symptoms).forEach(([symptom, isActive]) => {
        if (!isActive) return;

        if (severities && severities[symptom]) {
          const severity = severities[symptom];
          if (severity === "mild") entrySum += 3;
          else if (severity === "moderate") entrySum += 5;
          else if (severity === "severe") entrySum += 8;
        } else {
          entrySum += 5;
        }
      });

      return sum + entrySum;
    }, 0);
    
    const prevTotalSymptoms = previousPainLogs.reduce((sum, { log }) => {
      const symptoms = log.symptoms as Record<string, boolean>;
      return sum + Object.values(symptoms).filter(Boolean).length;
    }, 0);
    
    const prevPainLevel = prevTotalSymptoms > 0 ? (prevSeveritySum / prevTotalSymptoms) : 0;

    if (painLevel < prevPainLevel - 1) painTrend = "Improved";
    else if (painLevel > prevPainLevel + 1) painTrend = "Higher";
  }

  return {
    symptomsLogged: currentSymptomsCount,
    avgSleep,
    moodLabel,
    painLevel,
    trends: {
      symptoms: symptomsTrend,
      sleep: sleepTrend,
      mood: moodTrend,
      pain: painTrend,
    },
  };
}
