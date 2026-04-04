import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog } from "@/hooks/useHealthLog";
import {
  generateWeeklyGuidance,
  type WeeklyGuidanceResult,
} from "@/lib/weeklyGuidanceEngine";

export interface UseWeeklyGuidanceReturn {
  data: WeeklyGuidanceResult | null;
  hasDob: boolean;
  hasLogs: boolean;
}

/**
 * Computes weekly guidance entirely from localStorage data.
 * Falls back gracefully when DOB or logs are missing.
 */
export function useWeeklyGuidance(): UseWeeklyGuidanceReturn {
  const { fullProfile } = useAuth();
  const { logs } = useHealthLog();

  const dob = fullProfile?.basic?.dob;
  const hasDob = !!dob && dob.trim().length > 0;
  const hasLogs = Object.keys(logs).length > 0;

  const data = useMemo<WeeklyGuidanceResult | null>(() => {
    if (!hasDob) return null;
    return generateWeeklyGuidance(dob!, logs);
  }, [hasDob, dob, logs]);

  return { data, hasDob, hasLogs };
}
