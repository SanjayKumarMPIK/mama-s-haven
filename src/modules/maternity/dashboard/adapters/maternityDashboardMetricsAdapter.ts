// ─── Maternity Dashboard Metrics Adapter ─────────────────────────────────────
// Aggregates weekly metrics from Maternity Calendar for dashboard summary cards
// STRICTLY isolated to Maternity Phase only

import type { HealthLogs, HealthLogEntry } from "@/hooks/useHealthLog";

export interface MaternityDashboardMetrics {
  loggedDays: number;
  symptomsTracked: number;
  avgSleep: number | null;
  avgMood: number | null;
}

/**
 * Aggregates health metrics from maternity calendar entries for the current week.
 * Used by Pregnancy Dashboard summary cards.
 */
export function getMaternityDashboardMetrics(
  logs: HealthLogs
): MaternityDashboardMetrics {
  // Get current week (last 7 days)
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().slice(0, 10));
  }

  // Filter logs for last 7 days
  const recentLogs = last7Days
    .map(date => logs[date])
    .filter((log): log is HealthLogEntry => log !== undefined);

  // Days Logged: count unique dates with entries
  const daysLogged = recentLogs.length;

  // Symptoms Tracked: count total symptom records
  const symptomsTracked = recentLogs.reduce((count, log) => {
    if (log.symptoms && typeof log.symptoms === 'object') {
      const symptomCount = Object.values(log.symptoms as Record<string, boolean>).filter(Boolean).length;
      return count + symptomCount;
    }
    return count;
  }, 0);

  // Avg Sleep: average sleep duration
  const sleepLogs = recentLogs
    .map(log => log.sleepHours)
    .filter((s): s is number => s !== null && s !== undefined);
  
  const avgSleep = sleepLogs.length > 0 
    ? Math.round((sleepLogs.reduce((sum, s) => sum + s, 0) / sleepLogs.length) * 10) / 10 
    : null;

  // Avg Mood: average mood score (numeric)
  const moodLogs = recentLogs
    .map(log => log.mood)
    .filter((m): m is "Good" | "Okay" | "Low" => m !== null && m !== undefined);
  
  const avgMood = moodLogs.length > 0 
    ? Math.round((moodLogs.reduce((sum: number, m) => {
        const moodValue = m === "Good" ? 3 : m === "Okay" ? 2 : m === "Low" ? 1 : 2;
        return sum + moodValue;
      }, 0) / moodLogs.length) * 10) / 10 
    : null;

  return {
    loggedDays: daysLogged,
    symptomsTracked,
    avgSleep,
    avgMood,
  };
}
