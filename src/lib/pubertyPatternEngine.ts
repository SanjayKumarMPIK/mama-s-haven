/**
 * pubertyPatternEngine.ts
 *
 * 20-day rolling window pattern detection engine for puberty symptom logging.
 * Detects repeated high-intensity symptoms, validates clustering,
 * and infers possible nutritional/lifestyle deficiencies with confidence scoring.
 *
 * ⚠️  NOT a diagnostic tool. All language uses probability framing.
 *
 * Scoped ONLY to: Puberty phase → Calendar → Symptom logging
 */

import type { HealthLogs, PubertyEntry } from "@/hooks/useHealthLog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SymptomLog {
  date: string;     // ISO "YYYY-MM-DD"
  symptom: string;
  intensity: number; // 1–10
}

export interface DetectedPattern {
  symptom: string;
  symptomLabel: string;
  highIntensityCount: number;
  totalLogCount: number;
  patternStrength: "moderate" | "high";
  clusterValid: boolean;
  avgIntensity: number;
  dateRange: [string, string]; // [earliest, latest]
}

export interface DeficiencyInference {
  nutrient: string;
  emoji: string;
  confidence: number;        // 0–100
  confidenceLabel: "Low" | "Medium" | "High";
  explanation: string;
}

export interface PatternInsight {
  pattern: DetectedPattern;
  deficiencies: DeficiencyInference[];
}

export interface ContextData {
  avgSleepHours: number | null;
  lowSleepDays: number;
  lowMoodDays: number;
  periodIrregularity: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WINDOW_DAYS = 20;
const HIGH_INTENSITY_THRESHOLD = 7;
const PATTERN_TRIGGER_COUNT = 5;
const STRONG_PATTERN_COUNT = 7;
const CLUSTER_MIN_LOGS = 3;
const CLUSTER_WINDOW_DAYS = 7;
const CLUSTER_MAX_GAP_DAYS = 3;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: "Cramps",
  fatigue: "Fatigue",
  moodSwings: "Mood Swings",
  headache: "Headache",
  acne: "Acne",
  breastTenderness: "Breast Tenderness",
};

// ─── Deficiency Mapping ───────────────────────────────────────────────────────

interface DeficiencyTemplate {
  nutrient: string;
  emoji: string;
  explanation: string;
}

const SYMPTOM_DEFICIENCY_MAP: Record<string, DeficiencyTemplate[]> = {
  cramps: [
    { nutrient: "Iron", emoji: "🩸", explanation: "Frequent intense cramps may indicate low iron levels, especially during menstruation." },
    { nutrient: "Magnesium", emoji: "💎", explanation: "Magnesium helps relax muscles. Low levels may contribute to stronger cramping." },
    { nutrient: "Hormonal Balance", emoji: "⚖️", explanation: "Recurring intense cramps may reflect hormonal fluctuations common during puberty." },
  ],
  headache: [
    { nutrient: "Hydration", emoji: "💧", explanation: "Recurring headaches often correlate with insufficient water intake." },
    { nutrient: "Magnesium", emoji: "💎", explanation: "Magnesium deficiency is associated with tension headaches and migraines." },
    { nutrient: "Sleep Quality", emoji: "😴", explanation: "Poor or irregular sleep patterns may contribute to recurring headaches." },
  ],
  fatigue: [
    { nutrient: "Iron", emoji: "🩸", explanation: "Persistent fatigue is one of the hallmark signs of iron deficiency during puberty." },
    { nutrient: "Vitamin B12", emoji: "💊", explanation: "B12 is essential for energy production. Low levels cause persistent tiredness." },
    { nutrient: "Energy & Nutrition", emoji: "⚡", explanation: "Inadequate caloric intake or skipped meals may contribute to ongoing fatigue." },
  ],
  moodSwings: [
    { nutrient: "Omega-3 Fatty Acids", emoji: "🧠", explanation: "Omega-3s support brain health and emotional regulation during puberty." },
    { nutrient: "Vitamin D", emoji: "☀️", explanation: "Low Vitamin D levels have been linked to mood instability and low energy." },
    { nutrient: "Sleep Quality", emoji: "😴", explanation: "Irregular sleep directly impacts mood regulation and emotional resilience." },
  ],
  acne: [
    { nutrient: "Zinc", emoji: "🔬", explanation: "Zinc helps regulate skin oil production and supports immune function." },
    { nutrient: "Vitamin A", emoji: "🥕", explanation: "Vitamin A supports skin cell turnover and may help reduce breakouts." },
    { nutrient: "Hydration", emoji: "💧", explanation: "Adequate water intake supports skin health and toxin clearance." },
  ],
  breastTenderness: [
    { nutrient: "Vitamin E", emoji: "🌿", explanation: "Vitamin E has anti-inflammatory properties that may ease breast discomfort." },
    { nutrient: "Hormonal Balance", emoji: "⚖️", explanation: "Breast tenderness during puberty often reflects normal hormonal changes." },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseMidday(iso: string): Date {
  return new Date(iso + "T12:00:00");
}

function daysBetween(a: string, b: string): number {
  return Math.abs(
    Math.round((parseMidday(b).getTime() - parseMidday(a).getTime()) / MS_PER_DAY)
  );
}

// ─── Step 1: Extract Symptom Logs (20-Day Window) ─────────────────────────────

export function extractSymptomLogs(
  logs: HealthLogs,
  windowDays: number = WINDOW_DAYS
): SymptomLog[] {
  const today = new Date();
  const todayISO = toISODate(today);
  const windowStart = new Date(today.getTime() - windowDays * MS_PER_DAY);
  const windowStartISO = toISODate(windowStart);

  const result: SymptomLog[] = [];

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "puberty") continue;
    if (dateISO < windowStartISO || dateISO > todayISO) continue;

    const e = entry as PubertyEntry;
    if (!e.symptoms) continue;

    const intensities = e.symptomIntensities ?? {};

    for (const [symptomKey, isActive] of Object.entries(e.symptoms)) {
      if (!isActive) continue;

      // Use stored intensity, or fallback to 5 for legacy boolean-only logs
      const intensity = intensities[symptomKey] ?? 5;

      result.push({
        date: dateISO,
        symptom: symptomKey,
        intensity,
      });
    }
  }

  return result;
}

// ─── Step 2: Detect Patterns ──────────────────────────────────────────────────

function validateCluster(dates: string[]): boolean {
  if (dates.length < CLUSTER_MIN_LOGS) return false;

  const sorted = [...dates].sort();

  // Check if there are at least CLUSTER_MIN_LOGS within a CLUSTER_WINDOW_DAYS window
  for (let i = 0; i <= sorted.length - CLUSTER_MIN_LOGS; i++) {
    const windowEnd = sorted[i + CLUSTER_MIN_LOGS - 1];
    const windowStart = sorted[i];
    if (daysBetween(windowStart, windowEnd) <= CLUSTER_WINDOW_DAYS) {
      // Also validate max gap between consecutive logs in this cluster
      let maxGap = 0;
      for (let j = i + 1; j < i + CLUSTER_MIN_LOGS; j++) {
        const gap = daysBetween(sorted[j - 1], sorted[j]);
        maxGap = Math.max(maxGap, gap);
      }
      if (maxGap <= CLUSTER_MAX_GAP_DAYS) return true;
    }
  }

  return false;
}

export function detectPatterns(symptomLogs: SymptomLog[]): DetectedPattern[] {
  // Group by symptom
  const grouped = new Map<string, SymptomLog[]>();
  for (const log of symptomLogs) {
    const arr = grouped.get(log.symptom) ?? [];
    arr.push(log);
    grouped.set(log.symptom, arr);
  }

  const patterns: DetectedPattern[] = [];

  for (const [symptom, logs] of grouped) {
    // Filter high-intensity logs
    const highLogs = logs.filter(l => l.intensity >= HIGH_INTENSITY_THRESHOLD);

    if (highLogs.length < PATTERN_TRIGGER_COUNT) continue;

    const highDates = highLogs.map(l => l.date);
    const sortedDates = [...highDates].sort();
    const clusterValid = validateCluster(highDates);

    const avgIntensity =
      highLogs.reduce((sum, l) => sum + l.intensity, 0) / highLogs.length;

    patterns.push({
      symptom,
      symptomLabel: SYMPTOM_LABELS[symptom] ?? symptom,
      highIntensityCount: highLogs.length,
      totalLogCount: logs.length,
      patternStrength: highLogs.length >= STRONG_PATTERN_COUNT ? "high" : "moderate",
      clusterValid,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      dateRange: [sortedDates[0], sortedDates[sortedDates.length - 1]],
    });
  }

  // Sort by strength (high first), then by count
  patterns.sort((a, b) => {
    if (a.patternStrength !== b.patternStrength) {
      return a.patternStrength === "high" ? -1 : 1;
    }
    return b.highIntensityCount - a.highIntensityCount;
  });

  return patterns;
}

// ─── Step 3: Extract Context Data ─────────────────────────────────────────────

export function extractContextData(
  logs: HealthLogs,
  windowDays: number = WINDOW_DAYS
): ContextData {
  const today = new Date();
  const todayISO = toISODate(today);
  const windowStart = new Date(today.getTime() - windowDays * MS_PER_DAY);
  const windowStartISO = toISODate(windowStart);

  let sleepSum = 0;
  let sleepCount = 0;
  let lowSleepDays = 0;
  let lowMoodDays = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "puberty") continue;
    if (dateISO < windowStartISO || dateISO > todayISO) continue;

    const e = entry as PubertyEntry;

    if (e.sleepHours != null) {
      sleepSum += e.sleepHours;
      sleepCount++;
      if (e.sleepHours < 6) lowSleepDays++;
    }

    if (e.mood === "Low") lowMoodDays++;
  }

  // Check period irregularity
  const periodStarts = Object.entries(logs)
    .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
    .map(([d]) => parseMidday(d).getTime())
    .sort((a, b) => a - b);

  let periodIrregularity = false;
  for (let i = 1; i < periodStarts.length; i++) {
    const gapDays = (periodStarts[i] - periodStarts[i - 1]) / MS_PER_DAY;
    if (gapDays > 0 && gapDays < 21) {
      periodIrregularity = true;
      break;
    }
  }

  return {
    avgSleepHours: sleepCount > 0 ? Math.round((sleepSum / sleepCount) * 10) / 10 : null,
    lowSleepDays,
    lowMoodDays,
    periodIrregularity,
  };
}

// ─── Step 4: Compute Confidence ───────────────────────────────────────────────

function computeConfidence(
  pattern: DetectedPattern,
  context: ContextData
): number {
  // Intensity weight (0–1): avg intensity normalized from 7–10 range
  const intensityWeight = Math.min(1, Math.max(0, (pattern.avgIntensity - 5) / 5));

  // Frequency weight (0–1): based on count relative to thresholds
  const frequencyWeight = Math.min(1, pattern.highIntensityCount / 10);

  // Cluster weight (0–1): binary cluster validity + strength bonus
  const clusterWeight = pattern.clusterValid
    ? (pattern.patternStrength === "high" ? 1.0 : 0.7)
    : 0.2;

  // Context weight (0–1): composite of sleep, mood, period signals
  let contextScore = 0;
  if (context.avgSleepHours !== null && context.avgSleepHours < 7) contextScore += 0.3;
  if (context.lowSleepDays >= 3) contextScore += 0.2;
  if (context.lowMoodDays >= 3) contextScore += 0.3;
  if (context.periodIrregularity) contextScore += 0.2;
  const contextWeight = Math.min(1, contextScore);

  // Weighted formula from spec
  const raw =
    intensityWeight * 0.4 +
    frequencyWeight * 0.3 +
    clusterWeight * 0.2 +
    contextWeight * 0.1;

  // Normalize to 0–100%
  return Math.round(raw * 100);
}

function confidenceLabel(score: number): "Low" | "Medium" | "High" {
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

// ─── Step 5: Infer Deficiencies ───────────────────────────────────────────────

export function inferDeficiencies(
  pattern: DetectedPattern,
  context: ContextData
): DeficiencyInference[] {
  const templates = SYMPTOM_DEFICIENCY_MAP[pattern.symptom];
  if (!templates || templates.length === 0) return [];

  const baseConfidence = computeConfidence(pattern, context);

  return templates.map((tmpl, index) => {
    // Primary deficiency gets full confidence, secondary ones get diminishing
    const decay = 1 - index * 0.12;
    const finalConfidence = Math.round(Math.max(20, baseConfidence * decay));

    return {
      nutrient: tmpl.nutrient,
      emoji: tmpl.emoji,
      confidence: finalConfidence,
      confidenceLabel: confidenceLabel(finalConfidence),
      explanation: tmpl.explanation,
    };
  });
}

// ─── Top-Level: Analyze Patterns ──────────────────────────────────────────────

export function analyzePatterns(logs: HealthLogs): PatternInsight[] {
  const symptomLogs = extractSymptomLogs(logs);
  const patterns = detectPatterns(symptomLogs);

  if (patterns.length === 0) return [];

  const context = extractContextData(logs);

  return patterns.map(pattern => ({
    pattern,
    deficiencies: inferDeficiencies(pattern, context),
  }));
}
