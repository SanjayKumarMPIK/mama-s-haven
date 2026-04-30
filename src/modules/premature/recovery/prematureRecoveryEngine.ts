/**
 * prematureRecoveryEngine.ts
 *
 * Premature baby recovery analytics engine.
 * Computes a 0–100 recovery score from premature baby care data including
 * NICU progress, feeding logs, weight gain trends, oxygen tracking, sleep stability,
 * development milestones, and baby health records.
 *
 * ⚠️  Pure functions only — no React, no side-effects, no storage.
 *     Import from components and wrap in useMemo for performance.
 */

import type { HealthLogs, MaternityEntry, FatigueLevel, MoodType } from "@/hooks/useHealthLog";
import type { WeightEntry } from "@/hooks/usePrematureBabyWeight";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrematureRecoveryLevel = "critical" | "slow" | "moderate" | "stable" | "strong";

export interface PrematureRecoveryScoreBreakdown {
  overall: number;        // 0–100
  nicuProgress: number;    // 0–100
  feeding: number;         // 0–100
  weightGain: number;      // 0–100
  oxygenSupport: number;   // 0–100
  sleepStability: number;  // 0–100
  development: number;     // 0–100
  healthRecords: number;   // 0–100
}

export interface PrematureRecoveryStatus {
  level: PrematureRecoveryLevel;
  label: string;
  color: string;          // tailwind-compatible color key
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

/** Get the N most recent maternity log entries for premature care context. */
function getRecentMaternityLogs(logs: HealthLogs, count: number): MaternityEntry[] {
  return Object.entries(logs)
    .filter(([, e]) => e.phase === "maternity")
    .sort(([a], [b]) => b.localeCompare(a)) // most recent first
    .slice(0, count)
    .map(([, e]) => e as MaternityEntry);
}

// ─── Score Calculation ────────────────────────────────────────────────────────

const PREMATURE_WEIGHTS = {
  nicuProgress: 0.20,
  feeding: 0.15,
  weightGain: 0.15,
  oxygenSupport: 0.10,
  sleepStability: 0.15,
  development: 0.15,
  healthRecords: 0.10,
};

/**
 * Score NICU progress based on symptom improvement and stability
 */
function scoreNICUProgress(entries: MaternityEntry[]): number {
  if (entries.length === 0) return 50; // no data = neutral

  let totalScore = 0;
  for (const entry of entries) {
    if (entry.noSymptomsToday) {
      totalScore += 100;
      continue;
    }
    const activeSymptoms = Object.entries(entry.symptoms || {}).filter(([, v]) => v);
    if (activeSymptoms.length === 0) {
      totalScore += 90;
      continue;
    }
    const severities = entry.symptomSeverities || {};
    let severityPenalty = 0;
    for (const [id] of activeSymptoms) {
      const sev = severities[id];
      if (sev === "severe") severityPenalty += 30;
      else if (sev === "moderate") severityPenalty += 18;
      else severityPenalty += 8; // mild
    }
    totalScore += clamp(100 - severityPenalty);
  }
  return clamp(totalScore / entries.length);
}

/**
 * Score feeding based on hydration and related feeding indicators
 */
function scoreFeeding(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.hydrationGlasses).filter((v): v is number => v !== null);
  if (values.length === 0) return 50;
  const avg = values.reduce((s, n) => s + n, 0) / values.length;
  // Target: 8 glasses as proxy for feeding consistency
  return clamp((avg / 8) * 100);
}

/**
 * Score weight gain based on weight tracker entries
 */
function scoreWeightGain(weightEntries: WeightEntry[]): number {
  if (weightEntries.length === 0) return 50;
  if (weightEntries.length === 1) return 60; // only one entry, can't assess trend

  // Calculate trend: compare latest with earliest
  const sorted = [...weightEntries].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  const percentGain = ((last - first) / first) * 100;

  // Premature babies should gain weight consistently
  // Positive gain = good, no gain or loss = concerning
  if (percentGain >= 10) return 100;
  if (percentGain >= 5) return 80;
  if (percentGain >= 2) return 60;
  if (percentGain >= 0) return 40;
  return 20; // weight loss
}

/**
 * Score oxygen support reduction based on energy levels (proxy for breathing improvement)
 */
function scoreOxygenSupport(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.fatigueLevel).filter((v): v is FatigueLevel => v !== null);
  if (values.length === 0) return 50;
  const map: Record<FatigueLevel, number> = { High: 100, Medium: 60, Low: 20 };
  const avg = values.reduce((s, v) => s + (map[v] ?? 50), 0) / values.length;
  return clamp(avg);
}

/**
 * Score sleep stability based on sleep hours
 */
function scoreSleepStability(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.sleepHours).filter((v): v is number => v !== null);
  if (values.length === 0) return 50;
  const avg = values.reduce((s, n) => s + n, 0) / values.length;
  // Target: 6-8 hours for stability
  if (avg >= 6 && avg <= 8) return 100;
  if (avg >= 5) return 80;
  if (avg >= 4) return 60;
  if (avg > 9) return 70; // too much sleep might indicate lethargy
  return 40;
}

/**
 * Score development based on mood and overall wellness indicators
 */
function scoreDevelopment(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.mood).filter((v): v is MoodType => v !== null);
  if (values.length === 0) return 50;
  const map: Record<MoodType, number> = { Good: 100, Okay: 60, Low: 20 };
  const avg = values.reduce((s, v) => s + (map[v] ?? 50), 0) / values.length;
  return clamp(avg);
}

/**
 * Score health records based on consistency of logging
 */
function scoreHealthRecords(entries: MaternityEntry[], targetDays: number = 7): number {
  if (entries.length === 0) return 30; // no records = poor
  const consistency = (entries.length / targetDays) * 100;
  return clamp(consistency);
}

/**
 * Calculate the full premature recovery score breakdown.
 */
export function calculatePrematureRecoveryScore(
  logs: HealthLogs,
  weightEntries: WeightEntry[]
): PrematureRecoveryScoreBreakdown {
  const entries = getRecentMaternityLogs(logs, 7);

  const nicuProgress = scoreNICUProgress(entries);
  const feeding = scoreFeeding(entries);
  const weightGain = scoreWeightGain(weightEntries);
  const oxygenSupport = scoreOxygenSupport(entries);
  const sleepStability = scoreSleepStability(entries);
  const development = scoreDevelopment(entries);
  const healthRecords = scoreHealthRecords(entries, 7);

  const overall = clamp(
    nicuProgress * PREMATURE_WEIGHTS.nicuProgress +
    feeding * PREMATURE_WEIGHTS.feeding +
    weightGain * PREMATURE_WEIGHTS.weightGain +
    oxygenSupport * PREMATURE_WEIGHTS.oxygenSupport +
    sleepStability * PREMATURE_WEIGHTS.sleepStability +
    development * PREMATURE_WEIGHTS.development +
    healthRecords * PREMATURE_WEIGHTS.healthRecords
  );

  return {
    overall,
    nicuProgress,
    feeding,
    weightGain,
    oxygenSupport,
    sleepStability,
    development,
    healthRecords,
  };
}

// ─── Recovery Status ──────────────────────────────────────────────────────────

const PREMATURE_STATUS_MAP: { max: number; status: PrematureRecoveryStatus }[] = [
  { max: 20, status: { level: "critical", label: "Critical Care", color: "red", emoji: "🔴" } },
  { max: 40, status: { level: "slow", label: "Slow Progress", color: "orange", emoji: "🟠" } },
  { max: 60, status: { level: "moderate", label: "Moderate Progress", color: "amber", emoji: "🟡" } },
  { max: 80, status: { level: "stable", label: "Stable Progress", color: "green", emoji: "🟢" } },
  { max: 100, status: { level: "strong", label: "Strong Progress", color: "emerald", emoji: "💚" } },
];

export function getPrematureRecoveryStatus(score: number): PrematureRecoveryStatus {
  for (const entry of PREMATURE_STATUS_MAP) {
    if (score <= entry.max) return entry.status;
  }
  return PREMATURE_STATUS_MAP[PREMATURE_STATUS_MAP.length - 1].status;
}

// ─── Daily Priorities ─────────────────────────────────────────────────────────

export function generatePrematureDailyPriorities(breakdown: PrematureRecoveryScoreBreakdown): PrematureDailyPriority[] {
  const priorities: PrematureDailyPriority[] = [];

  const scored: { key: string; score: number }[] = [
    { key: "nicuProgress", score: breakdown.nicuProgress },
    { key: "feeding", score: breakdown.feeding },
    { key: "weightGain", score: breakdown.weightGain },
    { key: "oxygenSupport", score: breakdown.oxygenSupport },
    { key: "sleepStability", score: breakdown.sleepStability },
    { key: "development", score: breakdown.development },
    { key: "healthRecords", score: breakdown.healthRecords },
  ];

  // Sort by lowest score first — those are the priorities
  scored.sort((a, b) => a.score - b.score);

  const defs: Record<string, { label: string; emoji: string; reason: string }> = {
    nicuProgress: { label: "Monitor NICU Progress", emoji: "🏥", reason: "NICU stabilization needs attention" },
    feeding: { label: "Support Feeding", emoji: "🍼", reason: "Feeding patterns need monitoring" },
    weightGain: { label: "Track Weight Gain", emoji: "⚖️", reason: "Weight gain trends need attention" },
    oxygenSupport: { label: "Monitor Oxygen", emoji: "💨", reason: "Oxygen support levels need review" },
    sleepStability: { label: "Improve Sleep", emoji: "😴", reason: "Sleep patterns need stabilization" },
    development: { label: "Track Development", emoji: "👶", reason: "Developmental milestones need monitoring" },
    healthRecords: { label: "Log Health Data", emoji: "📝", reason: "Consistent health logging needed" },
  };

  for (const { key, score } of scored) {
    if (score < 70 && priorities.length < 3) {
      const def = defs[key];
      if (def) {
        priorities.push({ id: key, ...def });
      }
    }
  }

  // If everything is good, show encouraging message
  if (priorities.length === 0) {
    priorities.push({
      id: "maintain",
      label: "Maintain Care Routine",
      emoji: "✨",
      reason: "Baby care indicators look good — keep it up!",
    });
  }

  return priorities;
}

// ─── Activity Suggestions ─────────────────────────────────────────────────────

const PREMATURE_ACTIVITY_POOL: PrematureActivitySuggestion[] = [
  // Care
  { id: "skin_contact", label: "Kangaroo Care", emoji: "🤱", description: "Skin-to-skin contact for bonding and warmth", category: "care" },
  { id: "gentle_stroke", label: "Gentle Touch", emoji: "👋", description: "Soft strokes to soothe and comfort baby", category: "care" },
  { id: "temp_check", label: "Temperature Check", emoji: "🌡️", description: "Monitor baby's temperature regularly", category: "care" },
  // Monitoring
  { id: "feeding_log", label: "Log Feeding", emoji: "🍼", description: "Record feeding times and amounts", category: "monitoring" },
  { id: "weight_check", label: "Weight Check", emoji: "⚖️", description: "Weigh baby and log the measurement", category: "monitoring" },
  { id: "observe_breathing", label: "Observe Breathing", emoji: "💨", description: "Watch breathing patterns for changes", category: "monitoring" },
  // Bonding
  { id: "talk_to_baby", label: "Talk to Baby", emoji: "🗣️", description: "Soft talking to promote recognition", category: "bonding" },
  { id: "quiet_time", label: "Quiet Time", emoji: "🤫", description: "Calm environment for rest and recovery", category: "bonding" },
  // Nutrition
  { id: "maternal_hydration", label: "Maternal Hydration", emoji: "💧", description: "Mother stays hydrated for feeding", category: "nutrition" },
  { id: "nutrition_snack", label: "Nourishing Snack", emoji: "🥜", description: "Nutritious snack for energy", category: "nutrition" },
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

  // Low NICU progress → care activities
  if (breakdown.nicuProgress < 50) pick("care", 2);
  else pick("care", 1);

  // Low feeding/weight → monitoring
  if (breakdown.feeding < 60 || breakdown.weightGain < 60) pick("monitoring", 2);
  else pick("monitoring", 1);

  // Low sleep → bonding/quiet time
  if (breakdown.sleepStability < 50) pick("bonding", 2);
  else pick("bonding", 1);

  // Always include nutrition
  pick("nutrition", 1);

  return suggestions.slice(0, 4);
}

// ─── Recovery Checkups ────────────────────────────────────────────────────────

const PREMATURE_CHECKUP_STORAGE_KEY = "mh-premature-baby-checkups";

export function getPrematureDefaultCheckups(): PrematureRecoveryCheckup[] {
  return [
    { id: "nicu_rounds", label: "NICU Rounds", emoji: "🏥", completed: false },
    { id: "feeding_assessment", label: "Feeding Assessment", emoji: "🍼", completed: false },
    { id: "weight_check", label: "Weight Check", emoji: "⚖️", completed: false },
    { id: "oxygen_review", label: "Oxygen Support Review", emoji: "💨", completed: false },
    { id: "development_screening", label: "Development Screening", emoji: "👶", completed: false },
    { id: "parent_education", label: "Parent Education Session", emoji: "📚", completed: false },
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
