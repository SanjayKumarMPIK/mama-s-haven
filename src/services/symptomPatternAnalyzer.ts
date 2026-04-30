export interface SymptomLogEntry {
  date: string;
  symptoms: string[];
  severity: number; // 0-1
}

export interface SymptomPatternOutput {
  frequentSymptoms: string[];
  symptomFrequency: Record<string, number>; // 0-1
  symptomTrend: "improving" | "stable" | "worsening";
  peakSymptomDays: string[];
  averageSeverity: number;
}

export function analyzeSymptomPatterns(logs: SymptomLogEntry[], daysToAnalyze: number = 30): SymptomPatternOutput {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToAnalyze);

  const recentLogs = logs.filter(log => new Date(log.date) >= cutoffDate);
  const totalLogs = Math.max(recentLogs.length, 1);

  const symptomCounts: Record<string, number> = {};
  const symptomSeveritySum: Record<string, number> = {};
  let totalSeverity = 0;

  for (const log of recentLogs) {
    totalSeverity += log.severity;
    for (const symptom of log.symptoms) {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      symptomSeveritySum[symptom] = (symptomSeveritySum[symptom] || 0) + log.severity;
    }
  }

  const symptomFrequency: Record<string, number> = {};
  for (const [symptom, count] of Object.entries(symptomCounts)) {
    symptomFrequency[symptom] = count / totalLogs;
  }

  const frequentSymptoms = Object.entries(symptomFrequency)
    .filter(([_, freq]) => freq >= 0.3)
    .map(([symptom]) => symptom)
    .sort((a, b) => symptomFrequency[b] - symptomFrequency[a]);

  const averageSeverity = totalSeverity / totalLogs;

  const sortedLogs = [...recentLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const halfPoint = Math.floor(sortedLogs.length / 2);
  const firstHalf = sortedLogs.slice(0, halfPoint);
  const secondHalf = sortedLogs.slice(halfPoint);

  const firstHalfAvgSeverity = firstHalf.length > 0 
    ? firstHalf.reduce((sum, log) => sum + log.severity, 0) / firstHalf.length 
    : 0;
  const secondHalfAvgSeverity = secondHalf.length > 0 
    ? secondHalf.reduce((sum, log) => sum + log.severity, 0) / secondHalf.length 
    : 0;

  let symptomTrend: "improving" | "stable" | "worsening" = "stable";
  if (secondHalfAvgSeverity < firstHalfAvgSeverity - 0.1) {
    symptomTrend = "improving";
  } else if (secondHalfAvgSeverity > firstHalfAvgSeverity + 0.1) {
    symptomTrend = "worsening";
  }

  const peakSymptomDays = recentLogs
    .filter(log => log.severity >= 0.7)
    .map(log => log.date)
    .slice(0, 5);

  return {
    frequentSymptoms,
    symptomFrequency,
    symptomTrend,
    peakSymptomDays,
    averageSeverity,
  };
}
