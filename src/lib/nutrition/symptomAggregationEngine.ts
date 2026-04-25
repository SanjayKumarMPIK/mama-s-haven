/**
 * symptomAggregationEngine.ts
 *
 * Aggregates symptom data from health logs with weighted scoring.
 * Tracks frequency, severity, and recency to prioritize dominant symptoms.
 */

import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";

export type Severity = "Mild" | "Moderate" | "Severe";

export interface SymptomEntry {
  symptom: string;
  severity: Severity;
  date: string;
}

export interface AggregatedSymptom {
  symptom: string;
  frequency: number;
  severityScores: number[];
  totalSeverityScore: number;
  averageSeverity: number;
  recentnessScore: number;
  weightedScore: number;
  lastSeen: string;
}

export interface AggregationResult {
  symptoms: AggregatedSymptom[];
  topSymptoms: AggregatedSymptom[];
  hasData: boolean;
}

// ─── Severity Weight Mapping ───────────────────────────────────────────────────

const SEVERITY_WEIGHT: Record<Severity, number> = {
  Mild: 1,
  Moderate: 2,
  Severe: 3,
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

function calculateRecentnessScore(dateStr: string, todayISO: string): number {
  const date = new Date(dateStr);
  const today = new Date(todayISO);
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  // More recent = higher score (max 7, min 1)
  if (daysDiff === 0) return 7;
  if (daysDiff === 1) return 6;
  if (daysDiff === 2) return 5;
  if (daysDiff === 3) return 4;
  if (daysDiff === 4) return 3;
  if (daysDiff === 5) return 2;
  if (daysDiff === 6) return 1;
  return 0; // Older than 7 days
}

// ─── Main Aggregation Function ─────────────────────────────────────────────────

export function aggregateSymptoms(
  logs: HealthLogs,
  daysToLookBack: number = 7
): AggregationResult {
  const todayISO = toISODate(new Date());
  const cutoffDate = getDaysAgoISO(daysToLookBack);

  const symptomMap = new Map<string, AggregatedSymptom>();
  const rawEntries: SymptomEntry[] = [];
  let hasLoggedDays = false;

  // Process logs to extract all symptom entries
  for (const [dateISO, entryRaw] of Object.entries(logs)) {
    if (entryRaw.phase !== "maternity") continue;
    if (dateISO > todayISO || dateISO < cutoffDate) continue;

    hasLoggedDays = true;
    const entry = entryRaw as MaternityEntry;

    // Extract fatigue level as symptom
    if (entry.fatigueLevel === "Medium" || entry.fatigueLevel === "High") {
      const severity: Severity = entry.fatigueLevel === "High" ? "Severe" : "Moderate";
      rawEntries.push({ symptom: "fatigue", severity, date: dateISO });
    }

    // Extract sleep disturbance
    if (entry.sleepHours !== null && entry.sleepHours < 6) {
      rawEntries.push({ symptom: "sleepDisturbance", severity: "Moderate", date: dateISO });
    }

    // Extract symptoms from the symptoms object
    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([sym, isTrue]) => {
        if (isTrue) {
          // Default severity to Moderate if not specified
          // In a real implementation, this would come from a severity field
          rawEntries.push({ symptom: sym, severity: "Moderate", date: dateISO });
        }
      });
    }
  }

  // If no data, return empty result
  if (!hasLoggedDays || rawEntries.length === 0) {
    return {
      symptoms: [],
      topSymptoms: [],
      hasData: false,
    };
  }

  // Aggregate by symptom
  rawEntries.forEach((entry) => {
    const existing = symptomMap.get(entry.symptom);
    const severityScore = SEVERITY_WEIGHT[entry.severity];
    const recentnessScore = calculateRecentnessScore(entry.date, todayISO);

    if (existing) {
      existing.frequency += 1;
      existing.severityScores.push(severityScore);
      existing.totalSeverityScore += severityScore;
      existing.averageSeverity = existing.totalSeverityScore / existing.frequency;
      existing.recentnessScore = Math.max(existing.recentnessScore, recentnessScore);
      existing.lastSeen = entry.date;
    } else {
      symptomMap.set(entry.symptom, {
        symptom: entry.symptom,
        frequency: 1,
        severityScores: [severityScore],
        totalSeverityScore: severityScore,
        averageSeverity: severityScore,
        recentnessScore,
        lastSeen: entry.date,
        weightedScore: 0, // Will be calculated after aggregation
      });
    }
  });

  // Calculate weighted scores for each symptom
  // Formula: (frequency × 2) + totalSeverityScore + recentnessScore
  const symptoms = Array.from(symptomMap.values()).map((sym) => {
    sym.weightedScore = (sym.frequency * 2) + sym.totalSeverityScore + sym.recentnessScore;
    return sym;
  });

  // Sort by weighted score (descending)
  symptoms.sort((a, b) => b.weightedScore - a.weightedScore);

  // Return top symptoms (top 5 or all if less)
  const topSymptoms = symptoms.slice(0, 5);

  // Debug logging
  console.log("=== Symptom Aggregation Debug ===");
  console.log("Raw entries:", rawEntries);
  console.log("Aggregated symptoms:", symptoms);
  console.log("Top symptoms:", topSymptoms);
  console.log("================================");

  return {
    symptoms,
    topSymptoms,
    hasData: true,
  };
}

// ─── Get Symptom Score for Deficiency Matching ───────────────────────────────

export function getSymptomScore(
  symptom: string,
  aggregation: AggregationResult
): number {
  const found = aggregation.symptoms.find((s) => s.symptom === symptom);
  return found ? found.weightedScore : 0;
}
