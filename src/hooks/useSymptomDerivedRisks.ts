import { useMemo } from "react";
import { analyzeSymptomPatterns, type SymptomLogEntry } from "@/services/symptomPatternAnalyzer";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";

export function useSymptomDerivedRisks() {
  const { getPhaseLogs } = useHealthLog();
  const { phase } = usePhase();

  const patterns = useMemo(() => {
    const logs = getPhaseLogs(phase);
    const symptomLogs: SymptomLogEntry[] = Object.entries(logs).map(([date, entry]) => ({
      date,
      symptoms: Object.keys((entry as any).symptoms || {}),
      severity: (entry as any).fatigueLevel === "High" ? 0.8 : (entry as any).fatigueLevel === "Medium" ? 0.5 : 0.3,
    }));

    return analyzeSymptomPatterns(symptomLogs, 30);
  }, [getPhaseLogs, phase]);

  return patterns;
}
