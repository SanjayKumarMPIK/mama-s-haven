/**
 * prematureRecoveryEngine.ts
 *
 * Intelligent, inference-based premature baby recovery analytics engine.
 * Computes a 0–100 recovery score from 7 health signals derived from
 * existing calendar logs — no unrealistic daily manual inputs required.
 *
 * Signals & weights:
 *   1. Symptom Stability     30%  — severity, recurrence, emergency indicators
 *   2. Sleep Consistency      15%  — sleep hours and stability
 *   3. Feeding Inference      15%  — inferred from absence of feeding-related symptoms
 *   4. Breathing Inference    15%  — inferred from absence of respiratory symptoms
 *   5. Temperature Inference  10%  — inferred from absence of fever/infection symptoms
 *   6. Care Consistency       10%  — medicine adherence + logging frequency
 *   7. Growth Confidence       5%  — weight entry trends (sparse is fine)
 *
 * ⚠️  Pure functions only — no React, no side-effects, no storage.
 *     Import from components and wrap in useMemo for performance.
 */

import type { HealthLogs, MaternityEntry, FatigueLevel, MoodType } from "@/hooks/useHealthLog";
import type { WeightEntry } from "@/hooks/usePrematureBabyWeight";
import { filterLogsByPhase } from "@/shared/symptom-sync/symptomAnalyticsAdapter";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrematureRecoveryLevel = "critical" | "earlyStabilization" | "improving" | "stable" | "strong";

export interface PrematureRecoveryScoreBreakdown {
  overall: number;              // 0–100
  symptomStability: number;     // 0–100
  sleepConsistency: number;     // 0–100
  feedingInference: number;     // 0–100
  breathingInference: number;   // 0–100
  temperatureInference: number; // 0–100
  careConsistency: number;      // 0–100
  growthConfidence: number;     // 0–100
}

export interface PrematureRecoveryStatus {
  level: PrematureRecoveryLevel;
  label: string;
  color: string;
  emoji: string;
}

export interface PrematureDailyPriority {
  id: string;
  label: string;
  emoji: string;
  reason: string;
}

export interface PrematureActivitySuggestion {
  id: string;
  label: string;
  emoji: string;
  description: string;
  category: "care" | "monitoring" | "bonding" | "nutrition";
}

export interface PrematureRecoveryCheckup {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

/** Get the N most recent maternity log entries (premature uses maternity phase). */
function getRecentMaternityLogs(logs: HealthLogs, count: number, deliveryDateISO: string): MaternityEntry[] {
  return filterLogsByPhase(logs, "premature", deliveryDateISO)
    .sort((a, b) => b.date.localeCompare(a.date)) // most recent first
    .slice(0, count)
    .map((item) => item.entry);
}

// ─── Symptom keyword sets for inference ───────────────────────────────────────

const FEEDING_RELATED_SYMPTOMS = new Set([
  "nausea", "appetiteChanges", "vomiting", "reflux",
  "digestiveDiscomfort", "lowMilkSupply", "engorgement",
  "nipplePain", "milkSupply", "constipation", "breastPain"
]);

const BREATHING_RELATED_SYMPTOMS = new Set([
  "fluidLeak", "shortnessOfBreath", "breathingDifficulty",
  "respiratoryDistress", "chestPain", "dizziness",
  "oxygenConcern", "wheezing",
]);

const TEMPERATURE_RELATED_SYMPTOMS = new Set([
  "fever", "chills", "infection", "bodyTemperature",
  "coldSweats", "nightSweats", "hotFlashes",
]);

const EMERGENCY_SYMPTOMS = new Set([
  "fluidLeak", "fever", "respiratoryDistress",
  "breathingDifficulty", "chestPain", "severePain",
]);

const GENERAL_RECOVERY_SYMPTOMS = new Set([
  "bodyAche", "lowEnergy", "sleepDeprivation", "fatigue", "weakness"
]);

// ─── Score Calculation: 7 Signals ─────────────────────────────────────────────

const WEIGHTS = {
  symptomStability: 0.30,
  sleepConsistency: 0.15,
  feedingInference: 0.15,
  breathingInference: 0.15,
  temperatureInference: 0.10,
  careConsistency: 0.10,
  growthConfidence: 0.05,
};

/**
 * Signal 1: Symptom Stability (30%)
 * Fewer + less severe symptoms → higher score.
 * Emergency symptoms heavily penalized.
 * Recurring symptoms across days penalize more.
 */
function scoreSymptomStability(entries: MaternityEntry[]): number {
  if (entries.length === 0) return 50;

  // Track recurrence across days
  const symptomDayCounts = new Map<string, number>();

  let totalScore = 0;
  for (const entry of entries) {
    if (entry.noSymptomsToday) {
      totalScore += 100;
      continue;
    }
    const activeSymptoms = Object.entries(entry.symptoms || {}).filter(([, v]) => v);
    if (activeSymptoms.length === 0) {
      totalScore += 95;
      continue;
    }

    const severities = entry.symptomSeverities || {};
    let dayPenalty = 0;

    for (const [id] of activeSymptoms) {
      // Track recurrence
      symptomDayCounts.set(id, (symptomDayCounts.get(id) || 0) + 1);

      // Severity-based penalty
      const sev = severities[id];
      if (EMERGENCY_SYMPTOMS.has(id)) {
        dayPenalty += sev === "severe" ? 40 : sev === "moderate" ? 28 : 18;
      } else if (FEEDING_RELATED_SYMPTOMS.has(id) || BREATHING_RELATED_SYMPTOMS.has(id) || GENERAL_RECOVERY_SYMPTOMS.has(id)) {
        dayPenalty += sev === "severe" ? 30 : sev === "moderate" ? 18 : 8;
      } else if (sev === "severe") {
        dayPenalty += 20;
      } else if (sev === "moderate") {
        dayPenalty += 10;
      } else {
        dayPenalty += 4;
      }
    }

    totalScore += clamp(100 - dayPenalty);
  }

  let baseScore = totalScore / entries.length;

  // Apply recurrence penalty: symptoms appearing 3+ days in 7 are concerning
  for (const [, count] of symptomDayCounts) {
    if (count >= 5) baseScore -= 8;
    else if (count >= 3) baseScore -= 4;
  }

  return clamp(baseScore);
}

/**
 * Signal 2: Sleep Consistency (15%)
 * Stable sleep patterns → better recovery.
 * Uses both hours and consistency (low variance).
 */
function scoreSleepConsistency(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.sleepHours).filter((v): v is number => v !== null && v > 0);
  if (values.length === 0) return 50;

  const avg = values.reduce((s, n) => s + n, 0) / values.length;

  // Target: 6–8 hours for parent/caregiver rest stability
  let hoursScore: number;
  if (avg >= 6 && avg <= 8) hoursScore = 100;
  else if (avg >= 5) hoursScore = 80;
  else if (avg >= 4) hoursScore = 55;
  else if (avg > 9) hoursScore = 70;
  else hoursScore = 30;

  // Consistency bonus: low variance = stable rhythm
  if (values.length >= 3) {
    const variance = values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    // Low std dev (<1h) = good consistency
    if (stdDev < 0.8) hoursScore = Math.min(100, hoursScore + 10);
    else if (stdDev > 2) hoursScore = Math.max(0, hoursScore - 10);
  }

  return clamp(hoursScore);
}

/**
 * Signal 3: Feeding Inference (15%)
 * NO explicit feeding quantity required.
 * Infers stability from ABSENCE of feeding-related symptoms.
 */
function scoreFeedingInference(entries: MaternityEntry[]): number {
  if (entries.length === 0) return 60; // no data = cautiously neutral

  let totalClean = 0;
  let totalChecked = 0;

  for (const entry of entries) {
    totalChecked++;
    const activeSymptoms = Object.entries(entry.symptoms || {}).filter(([, v]) => v);
    const feedingIssues = activeSymptoms.filter(([id]) => FEEDING_RELATED_SYMPTOMS.has(id));

    if (feedingIssues.length === 0) {
      totalClean++;
    } else {
      // Penalize based on severity of feeding issues
      const severities = entry.symptomSeverities || {};
      for (const [id] of feedingIssues) {
        const sev = severities[id];
        if (sev === "severe") totalClean -= 0.5; // extra penalty
      }
    }
  }

  const ratio = Math.max(0, totalClean) / totalChecked;
  return clamp(ratio * 100);
}

/**
 * Signal 4: Breathing Inference (15%)
 * NO explicit breathing measurement required.
 * Infers stability from ABSENCE of respiratory symptoms.
 */
function scoreBreathingInference(entries: MaternityEntry[]): number {
  if (entries.length === 0) return 60;

  let totalClean = 0;
  let totalChecked = 0;

  for (const entry of entries) {
    totalChecked++;
    const activeSymptoms = Object.entries(entry.symptoms || {}).filter(([, v]) => v);
    const breathingIssues = activeSymptoms.filter(([id]) => BREATHING_RELATED_SYMPTOMS.has(id));

    if (breathingIssues.length === 0) {
      totalClean++;
    } else {
      const severities = entry.symptomSeverities || {};
      for (const [id] of breathingIssues) {
        if (severities[id] === "severe") totalClean -= 0.5;
      }
    }
  }

  // Also factor in energy level as a proxy for breathing comfort
  const energyValues = entries.map(e => e.fatigueLevel).filter((v): v is FatigueLevel => v !== null);
  if (energyValues.length > 0) {
    const energyMap: Record<FatigueLevel, number> = { High: 1, Medium: 0.6, Low: 0.2 };
    const avgEnergy = energyValues.reduce((s, v) => s + (energyMap[v] ?? 0.5), 0) / energyValues.length;
    // Blend: 70% symptom absence + 30% energy proxy
    const symptomRatio = Math.max(0, totalClean) / totalChecked;
    return clamp((symptomRatio * 0.7 + avgEnergy * 0.3) * 100);
  }

  const ratio = Math.max(0, totalClean) / totalChecked;
  return clamp(ratio * 100);
}

/**
 * Signal 5: Temperature Inference (10%)
 * NO daily temperature logging required.
 * Infers stability from ABSENCE of fever/infection symptoms.
 */
function scoreTemperatureInference(entries: MaternityEntry[]): number {
  if (entries.length === 0) return 65; // no data = cautiously positive

  let cleanDays = 0;

  for (const entry of entries) {
    const activeSymptoms = Object.entries(entry.symptoms || {}).filter(([, v]) => v);
    const tempIssues = activeSymptoms.filter(([id]) => TEMPERATURE_RELATED_SYMPTOMS.has(id));

    if (tempIssues.length === 0) {
      cleanDays++;
    } else {
      // Severe fever is very concerning
      const severities = entry.symptomSeverities || {};
      for (const [id] of tempIssues) {
        if (severities[id] === "severe") cleanDays -= 1;
      }
    }
  }

  const ratio = Math.max(0, cleanDays) / entries.length;
  return clamp(ratio * 100);
}

/**
 * Signal 6: Care Consistency (10%)
 * Medicine adherence + logging frequency.
 */
function scoreCareConsistency(entries: MaternityEntry[], targetDays: number, medicineAdherence: number): number {
  // Logging consistency: how many of the last N days were logged
  const loggingScore = entries.length > 0
    ? clamp((entries.length / targetDays) * 100)
    : 30;

  // Medicine adherence: 0–100 from the medicine reminder hook
  const medScore = clamp(medicineAdherence);

  // Blend: 50% logging + 50% medicine adherence
  // If no medicines are tracked, rely purely on logging
  if (medicineAdherence < 0) {
    return loggingScore;
  }
  return clamp(loggingScore * 0.5 + medScore * 0.5);
}

/**
 * Signal 7: Growth Confidence (5%)
 * Uses sparse weight signals — no daily weight needed.
 */
function scoreGrowthConfidence(weightEntries: WeightEntry[]): number {
  if (weightEntries.length === 0) return 50; // no data = neutral
  if (weightEntries.length === 1) return 60; // one entry = baseline

  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  const percentGain = ((last - first) / first) * 100;

  if (percentGain >= 10) return 100;
  if (percentGain >= 5) return 85;
  if (percentGain >= 2) return 65;
  if (percentGain >= 0) return 45;
  return 20; // weight loss
}

// ─── Main Score Calculator ────────────────────────────────────────────────────

/**
 * Calculate the full premature recovery score breakdown.
 * Uses the most recent 7 days of calendar data.
 *
 * @param logs - Health logs from useHealthLog
 * @param weightEntries - Weight entries from usePrematureBabyWeight
 * @param medicineAdherence - 0–100 adherence rate, or -1 if no medicines tracked
 */
export function calculatePrematureRecoveryScore(
  logs: HealthLogs,
  weightEntries: WeightEntry[],
  deliveryDateISO: string,
  medicineAdherence: number = -1
): PrematureRecoveryScoreBreakdown {
  const entries = getRecentMaternityLogs(logs, 7, deliveryDateISO);

  const symptomStability = scoreSymptomStability(entries);
  const sleepConsistency = scoreSleepConsistency(entries);
  const feedingInference = scoreFeedingInference(entries);
  const breathingInference = scoreBreathingInference(entries);
  const temperatureInference = scoreTemperatureInference(entries);
  const careConsistency = scoreCareConsistency(entries, 7, medicineAdherence);
  const growthConfidence = scoreGrowthConfidence(weightEntries);

  const overall = clamp(
    symptomStability * WEIGHTS.symptomStability +
    sleepConsistency * WEIGHTS.sleepConsistency +
    feedingInference * WEIGHTS.feedingInference +
    breathingInference * WEIGHTS.breathingInference +
    temperatureInference * WEIGHTS.temperatureInference +
    careConsistency * WEIGHTS.careConsistency +
    growthConfidence * WEIGHTS.growthConfidence
  );

  return {
    overall,
    symptomStability,
    sleepConsistency,
    feedingInference,
    breathingInference,
    temperatureInference,
    careConsistency,
    growthConfidence,
  };
}

// ─── Recovery Status ──────────────────────────────────────────────────────────

const PREMATURE_STATUS_MAP: { max: number; status: PrematureRecoveryStatus }[] = [
  { max: 25,  status: { level: "critical",            label: "Critical Monitoring",  color: "red",     emoji: "🔴" } },
  { max: 45,  status: { level: "earlyStabilization",  label: "Early Stabilization",  color: "orange",  emoji: "🟠" } },
  { max: 65,  status: { level: "improving",           label: "Improving Recovery",   color: "amber",   emoji: "🟡" } },
  { max: 85,  status: { level: "stable",              label: "Stable Development",   color: "green",   emoji: "🟢" } },
  { max: 100, status: { level: "strong",              label: "Strong Progress",      color: "emerald", emoji: "💚" } },
];

export function getPrematureRecoveryStatus(score: number): PrematureRecoveryStatus {
  for (const entry of PREMATURE_STATUS_MAP) {
    if (score <= entry.max) return entry.status;
  }
  return PREMATURE_STATUS_MAP[PREMATURE_STATUS_MAP.length - 1].status;
}

// ─── Signal Metadata (for UI breakdown display) ───────────────────────────────

export interface SignalMeta {
  key: keyof Omit<PrematureRecoveryScoreBreakdown, "overall">;
  label: string;
  emoji: string;
  weight: number;
}

export const SIGNAL_META: SignalMeta[] = [
  { key: "symptomStability",     label: "Symptom Stability",     emoji: "🩺", weight: 30 },
  { key: "sleepConsistency",     label: "Sleep Consistency",     emoji: "😴", weight: 15 },
  { key: "feedingInference",     label: "Feeding Stability",     emoji: "🍼", weight: 15 },
  { key: "breathingInference",   label: "Breathing Stability",   emoji: "💨", weight: 15 },
  { key: "temperatureInference", label: "Temperature Stability", emoji: "🌡️", weight: 10 },
  { key: "careConsistency",      label: "Care Consistency",      emoji: "📋", weight: 10 },
  { key: "growthConfidence",     label: "Growth Confidence",     emoji: "📈", weight: 5 },
];

// ─── Daily Priorities ─────────────────────────────────────────────────────────

export function generatePrematureDailyPriorities(breakdown: PrematureRecoveryScoreBreakdown): PrematureDailyPriority[] {
  const priorities: PrematureDailyPriority[] = [];

  const scored: { key: string; score: number }[] = SIGNAL_META.map(s => ({
    key: s.key,
    score: breakdown[s.key],
  }));

  // Sort by lowest score first — those are the priorities
  scored.sort((a, b) => a.score - b.score);

  const defs: Record<string, { label: string; emoji: string; reason: string }> = {
    symptomStability:     { label: "Monitor Symptoms",       emoji: "🩺", reason: "Active symptoms need attention — track severity changes" },
    sleepConsistency:     { label: "Stabilize Sleep",        emoji: "😴", reason: "Sleep patterns need stabilization for recovery" },
    feedingInference:     { label: "Support Feeding",        emoji: "🍼", reason: "Feeding-related concerns detected — monitor comfort" },
    breathingInference:   { label: "Monitor Breathing",      emoji: "💨", reason: "Respiratory signals need attention" },
    temperatureInference: { label: "Watch Temperature",      emoji: "🌡️", reason: "Temperature or infection indicators detected" },
    careConsistency:      { label: "Maintain Care Routine",  emoji: "📋", reason: "Consistent logging and medicine adherence needed" },
    growthConfidence:     { label: "Track Growth",           emoji: "📈", reason: "Weight monitoring needed for growth confidence" },
  };

  for (const { key, score } of scored) {
    if (score < 70 && priorities.length < 3) {
      const def = defs[key];
      if (def) priorities.push({ id: key, ...def });
    }
  }

  if (priorities.length === 0) {
    priorities.push({
      id: "maintain",
      label: "Maintain Care Routine",
      emoji: "✨",
      reason: "All recovery signals look positive — keep up the great care!",
    });
  }

  return priorities;
}

// ─── Activity Suggestions ─────────────────────────────────────────────────────

const PREMATURE_ACTIVITY_POOL: PrematureActivitySuggestion[] = [
  // Care
  { id: "skin_contact",   label: "Kangaroo Care",      emoji: "🤱", description: "Skin-to-skin contact for bonding and warmth",    category: "care" },
  { id: "gentle_stroke",  label: "Gentle Touch",       emoji: "👋", description: "Soft strokes to soothe and comfort baby",        category: "care" },
  { id: "temp_check",     label: "Temperature Check",  emoji: "🌡️", description: "Monitor baby's temperature regularly",           category: "care" },
  // Monitoring
  { id: "feeding_log",    label: "Observe Feeding",    emoji: "🍼", description: "Watch feeding comfort and tolerance",            category: "monitoring" },
  { id: "weight_check",   label: "Weight Check",       emoji: "⚖️", description: "Weigh baby and log the measurement",             category: "monitoring" },
  { id: "observe_breath", label: "Observe Breathing",  emoji: "💨", description: "Watch breathing patterns for changes",           category: "monitoring" },
  // Bonding
  { id: "talk_to_baby",   label: "Talk to Baby",       emoji: "🗣️", description: "Soft talking to promote recognition",            category: "bonding" },
  { id: "quiet_time",     label: "Quiet Time",         emoji: "🤫", description: "Calm environment for rest and recovery",         category: "bonding" },
  // Nutrition
  { id: "maternal_hydration", label: "Stay Hydrated",  emoji: "💧", description: "Mother stays hydrated for feeding",              category: "nutrition" },
  { id: "nutrition_snack",    label: "Nourishing Snack", emoji: "🥜", description: "Nutritious snack for sustained energy",        category: "nutrition" },
];

export function generatePrematureActivitySuggestions(breakdown: PrematureRecoveryScoreBreakdown): PrematureActivitySuggestion[] {
  const suggestions: PrematureActivitySuggestion[] = [];
  const used = new Set<string>();

  function pick(category: PrematureActivitySuggestion["category"], count: number) {
    const pool = PREMATURE_ACTIVITY_POOL.filter(a => a.category === category && !used.has(a.id));
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      suggestions.push(pool[i]);
      used.add(pool[i].id);
    }
  }

  // Low symptom stability or breathing → care activities
  if (breakdown.symptomStability < 50 || breakdown.breathingInference < 50) pick("care", 2);
  else pick("care", 1);

  // Low feeding or growth → monitoring
  if (breakdown.feedingInference < 60 || breakdown.growthConfidence < 60) pick("monitoring", 2);
  else pick("monitoring", 1);

  // Low sleep → bonding/quiet time
  if (breakdown.sleepConsistency < 50) pick("bonding", 2);
  else pick("bonding", 1);

  // Always include nutrition
  pick("nutrition", 1);

  return suggestions.slice(0, 4);
}

// ─── Recovery Checkups ────────────────────────────────────────────────────────

const PREMATURE_CHECKUP_STORAGE_KEY = "mh-premature-baby-checkups";

export function getPrematureDefaultCheckups(): PrematureRecoveryCheckup[] {
  return [
    { id: "nicu_rounds",            label: "NICU Rounds",              emoji: "🏥", completed: false },
    { id: "feeding_assessment",     label: "Feeding Assessment",       emoji: "🍼", completed: false },
    { id: "weight_check",           label: "Weight Check",             emoji: "⚖️", completed: false },
    { id: "breathing_review",       label: "Breathing Review",         emoji: "💨", completed: false },
    { id: "development_screening",  label: "Development Screening",    emoji: "👶", completed: false },
    { id: "parent_education",       label: "Parent Education Session", emoji: "📚", completed: false },
  ];
}

export function loadPrematureCheckups(): PrematureRecoveryCheckup[] {
  try {
    const raw = localStorage.getItem(PREMATURE_CHECKUP_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return getPrematureDefaultCheckups();
}

export function savePrematureCheckups(checkups: PrematureRecoveryCheckup[]): void {
  try {
    localStorage.setItem(PREMATURE_CHECKUP_STORAGE_KEY, JSON.stringify(checkups));
  } catch { /* ignore */ }
}
