// ─── Maternity Analytics Data Hook ─────────────────────────────────────────────
// Derives analytics data for Symptoms, Sleep, Mood, and Activity trends
// STRICTLY fetches from Maternity Calendar only

import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { getMaternityAnalyticsFromCalendar } from "./adapters/maternityCalendarAnalyticsAdapter";
import type { MaternityAnalyticsData } from "./adapters/maternityCalendarAnalyticsAdapter";
import type { MaternityEntry } from "@/hooks/useHealthLog";

// Re-export types from adapter for convenience
export type { SymptomTrendData, SleepTrendData, MoodTrendData, ActivityTrendData, MaternityAnalyticsData } from "./adapters/maternityCalendarAnalyticsAdapter";

// ─── Main Hook ─────────────────────────────────────────────────────────────────

/**
 * Hook that fetches Maternity Calendar data and transforms it into chart-ready analytics.
 * 
 * STRICTLY isolated to Maternity Phase only.
 * Does NOT touch other phases, global logs, or external data sources.
 * 
 * @param days - Number of days to include in analytics (default: 7)
 * @returns Chart-ready analytics data for Symptoms, Sleep, Mood, and Activity trends
 */
export function useMaternityAnalytics(days: number = 7): MaternityAnalyticsData {
  const { getPhaseLogs } = useHealthLog();
  const healthLogs = getPhaseLogs("maternity");

  // Filter and cast to ensure only MaternityEntry types are passed to adapter
  const maternityLogs = useMemo(() => {
    const filtered: Record<string, MaternityEntry> = {};
    for (const [date, entry] of Object.entries(healthLogs)) {
      if (entry.phase === "maternity") {
        filtered[date] = entry as MaternityEntry;
      }
    }
    return filtered;
  }, [healthLogs]);

  const analytics = useMemo(() => {
    return getMaternityAnalyticsFromCalendar(maternityLogs, days);
  }, [maternityLogs, days]);

  return analytics;
}
