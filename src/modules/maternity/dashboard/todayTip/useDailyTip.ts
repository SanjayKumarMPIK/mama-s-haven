// ─── useDailyTip Hook ───────────────────────────────────────────────────────────
// React hook for daily tip selection with automatic caching

import { useMemo, useCallback } from "react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog } from "@/hooks/useHealthLog";
import { getDailyTipWithCache, getRecentTipHistory, type SelectTipOptions } from "./tipEngine";
import { PregnancyTip } from "./maternityTips";

// ─── Trimester Helper ───────────────────────────────────────────────────────────

function getTrimesterFromWeek(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1;
  if (week <= 26) return 2;
  return 3;
}

// ─── Main Hook ─────────────────────────────────────────────────────────────────

export function useDailyTip() {
  const { currentWeek } = usePregnancyProfile();
  const { user } = useAuth();
  const { getPhaseLogs } = useHealthLog();

  // Get today's date in YYYY-MM-DD format
  const todayDate = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  // Get recent symptoms for personalization
  const recentSymptoms = useMemo(() => {
    if (!currentWeek) return [];
    
    try {
      const logs = getPhaseLogs("maternity");
      const recentLogs = Object.entries(logs)
        .filter(([date]) => {
          const logDate = new Date(date + "T00:00:00");
          const daysDiff = Math.floor((new Date().getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7; // Last 7 days
        })
        .map(([, entry]) => entry);

      // Extract symptom keys from recent logs
      const symptomSet = new Set<string>();
      recentLogs.forEach((log) => {
        if (log.symptoms) {
          Object.keys(log.symptoms).forEach((symptom) => {
            if (log.symptoms[symptom]) {
              symptomSet.add(symptom);
            }
          });
        }
      });

      return Array.from(symptomSet);
    } catch {
      return [];
    }
  }, [currentWeek, getPhaseLogs]);

  // Get recent tip history to avoid repetition
  const recentTipIds = useMemo(() => {
    return getRecentTipHistory(5);
  }, []);

  // Select daily tip
  const dailyTip = useMemo(() => {
    if (!currentWeek || !user?.id) {
      return null;
    }

    const trimester = getTrimesterFromWeek(currentWeek);

    const options: SelectTipOptions = {
      pregnancyWeek: currentWeek,
      trimester,
      userId: user.id,
      date: todayDate,
      symptoms: recentSymptoms,
      recentTipIds,
    };

    return getDailyTipWithCache(options);
  }, [currentWeek, user?.id, todayDate, recentSymptoms, recentTipIds]);

  // Force refresh tip (useful for testing or manual refresh)
  const refreshTip = useCallback(() => {
    if (!currentWeek || !user?.id) return null;

    const trimester = getTrimesterFromWeek(currentWeek);

    const options: SelectTipOptions = {
      pregnancyWeek: currentWeek,
      trimester,
      userId: user.id,
      date: todayDate,
      symptoms: recentSymptoms,
      recentTipIds: [], // Clear recent history to allow any tip
    };

    return getDailyTipWithCache(options);
  }, [currentWeek, user?.id, todayDate, recentSymptoms]);

  return {
    dailyTip,
    refreshTip,
    currentDate: todayDate,
    pregnancyWeek: currentWeek,
  };
}
