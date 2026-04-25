/**
 * recoveryScoreEngine.ts
 *
 * Maternal recovery analytics engine for Premature Care Dashboard.
 * Computes a 0–100 recovery score from real health-log data and
 * derives status, priorities, activity suggestions, and checkup state.
 *
 * ⚠️  Pure functions only — no React, no side-effects, no storage.
 *     Import from components and wrap in useMemo for performance.
 */

import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";

// ─── Types ────────────────────────────────────────────────────────────────────

export type RecoveryLevel = "critical" | "slow" | "moderate" | "stable" | "strong";

export interface RecoveryScoreBreakdown {
  overall: number;        // 0–100
  symptom: number;        // 0–100
  hydration: number;      // 0–100
  sleep: number;          // 0–100
  energy: number;         // 0–100
  emotional: number;      // 0–100
  breastfeeding: number;  // 0–100
}

export interface RecoveryStatus {
  level: RecoveryLevel;
  label: string;
  color: string;          // tailwind-compatible color key
  emoji: string;
}

export interface DailyPriority {
  id: string;
  label: string;
  emoji: string;
  reason: string;
}

export interface ActivitySuggestion {
  id: string;
  label: string;
  emoji: string;
  description: string;
  category: "movement" | "rest" | "emotional" | "nutrition";
}

export interface RecoveryTimelineWeek {
  weekNumber: number;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

export interface RecoveryCheckup {
  id: string;
  label: string;
  emoji: string;
  completed: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

/** Get the N most recent maternity log entries. */
function getRecentMaternityLogs(logs: HealthLogs, count: number): MaternityEntry[] {
  return Object.entries(logs)
    .filter(([, e]) => e.phase === "maternity")
    .sort(([a], [b]) => b.localeCompare(a)) // most recent first
    .slice(0, count)
    .map(([, e]) => e as MaternityEntry);
}

/** Get the single most recent maternity log. */
function getLatestLog(logs: HealthLogs): MaternityEntry | null {
  const recent = getRecentMaternityLogs(logs, 1);
  return recent.length > 0 ? recent[0] : null;
}

// ─── Score Calculation ────────────────────────────────────────────────────────

const WEIGHTS = {
  symptom: 0.25,
  hydration: 0.15,
  sleep: 0.15,
  energy: 0.15,
  emotional: 0.15,
  breastfeeding: 0.15,
};

function scoreSymptoms(entries: MaternityEntry[]): number {
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

function scoreHydration(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.hydrationGlasses).filter((v): v is number => v !== null);
  if (values.length === 0) return 50;
  const avg = values.reduce((s, n) => s + n, 0) / values.length;
  // Target: 8 glasses. Scale: 0 glasses=0, 8+=100
  return clamp((avg / 8) * 100);
}

function scoreSleep(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.sleepHours).filter((v): v is number => v !== null);
  if (values.length === 0) return 50;
  const avg = values.reduce((s, n) => s + n, 0) / values.length;
  // Target: 7-9 hours. Below 5 = 0, 7-9 = 100, >10 = 80
  if (avg >= 7 && avg <= 9) return 100;
  if (avg >= 6) return 80;
  if (avg >= 5) return 60;
  if (avg >= 4) return 35;
  if (avg > 10) return 80;
  return 15;
}

function scoreEnergy(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.fatigueLevel).filter((v): v is string => v !== null);
  if (values.length === 0) return 50;
  const map: Record<string, number> = { High: 100, Medium: 60, Low: 20 };
  const avg = values.reduce((s, v) => s + (map[v] ?? 50), 0) / values.length;
  return clamp(avg);
}

function scoreEmotional(entries: MaternityEntry[]): number {
  const values = entries.map(e => e.mood).filter((v): v is string => v !== null);
  if (values.length === 0) return 50;
  const map: Record<string, number> = { Good: 100, Okay: 60, Low: 20 };
  const avg = values.reduce((s, v) => s + (map[v] ?? 50), 0) / values.length;
  return clamp(avg);
}

function scoreBreastfeeding(entries: MaternityEntry[]): number {
  // Check if breastfeeding symptom is being tracked and its severity
  if (entries.length === 0) return 50;
  let tracked = 0;
  let positive = 0;
  for (const entry of entries) {
    const hasBF = entry.symptoms?.["breastfeeding"];
    if (hasBF) {
      tracked++;
      const sev = entry.symptomSeverities?.["breastfeeding"];
      if (sev === "mild" || !sev) positive++; // mild or no severity = going well
    }
  }
  if (tracked === 0) return 50; // not tracked = neutral
  return clamp((positive / tracked) * 100);
}

/**
 * Calculate the full recovery score breakdown from recent logs.
 * Uses the most recent 7 days of data for a weekly picture.
 */
export function calculateRecoveryScore(logs: HealthLogs): RecoveryScoreBreakdown {
  const entries = getRecentMaternityLogs(logs, 7);

  const symptom = scoreSymptoms(entries);
  const hydration = scoreHydration(entries);
  const sleep = scoreSleep(entries);
  const energy = scoreEnergy(entries);
  const emotional = scoreEmotional(entries);
  const breastfeeding = scoreBreastfeeding(entries);

  const overall = clamp(
    symptom * WEIGHTS.symptom +
    hydration * WEIGHTS.hydration +
    sleep * WEIGHTS.sleep +
    energy * WEIGHTS.energy +
    emotional * WEIGHTS.emotional +
    breastfeeding * WEIGHTS.breastfeeding
  );

  return { overall, symptom, hydration, sleep, energy, emotional, breastfeeding };
}

// ─── Recovery Status ──────────────────────────────────────────────────────────

const STATUS_MAP: { max: number; status: RecoveryStatus }[] = [
  { max: 20, status: { level: "critical", label: "Critical Recovery", color: "red", emoji: "🔴" } },
  { max: 40, status: { level: "slow", label: "Slow Recovery", color: "orange", emoji: "🟠" } },
  { max: 60, status: { level: "moderate", label: "Moderate Recovery", color: "amber", emoji: "🟡" } },
  { max: 80, status: { level: "stable", label: "Stable Recovery", color: "green", emoji: "🟢" } },
  { max: 100, status: { level: "strong", label: "Strong Recovery", color: "emerald", emoji: "💚" } },
];

export function getRecoveryStatus(score: number): RecoveryStatus {
  for (const entry of STATUS_MAP) {
    if (score <= entry.max) return entry.status;
  }
  return STATUS_MAP[STATUS_MAP.length - 1].status;
}

// ─── Daily Priorities ─────────────────────────────────────────────────────────

export function generateDailyPriorities(breakdown: RecoveryScoreBreakdown): DailyPriority[] {
  const priorities: DailyPriority[] = [];

  const scored: { key: string; score: number }[] = [
    { key: "hydration", score: breakdown.hydration },
    { key: "sleep", score: breakdown.sleep },
    { key: "energy", score: breakdown.energy },
    { key: "emotional", score: breakdown.emotional },
    { key: "symptom", score: breakdown.symptom },
    { key: "breastfeeding", score: breakdown.breastfeeding },
  ];

  // Sort by lowest score first — those are the priorities
  scored.sort((a, b) => a.score - b.score);

  const defs: Record<string, { label: string; emoji: string; reason: string }> = {
    hydration: { label: "Improve Hydration", emoji: "💧", reason: "Water intake is below target" },
    sleep: { label: "Rest More", emoji: "🌙", reason: "Sleep quality needs attention" },
    energy: { label: "Conserve Energy", emoji: "🔋", reason: "Energy levels are low" },
    emotional: { label: "Emotional Support", emoji: "💜", reason: "Mood tracking shows low emotional state" },
    symptom: { label: "Symptom Management", emoji: "🩹", reason: "Active symptoms need monitoring" },
    breastfeeding: { label: "Support Milk Production", emoji: "🤱", reason: "Breastfeeding tracking needs attention" },
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
      label: "Maintain Routine",
      emoji: "✨",
      reason: "Recovery indicators look good — keep it up!",
    });
  }

  return priorities;
}

// ─── Symptom Summary ──────────────────────────────────────────────────────────

export interface SymptomConcern {
  id: string;
  label: string;
  severity: "mild" | "moderate" | "severe";
  dayCount: number;
}

export function getHighConcernSymptoms(logs: HealthLogs): SymptomConcern[] {
  const entries = getRecentMaternityLogs(logs, 7);
  const symptomMap = new Map<string, { count: number; worstSeverity: "mild" | "moderate" | "severe" }>();

  for (const entry of entries) {
    const activeSymptoms = Object.entries(entry.symptoms || {}).filter(([, v]) => v);
    for (const [id] of activeSymptoms) {
      const sev = (entry.symptomSeverities?.[id] as "mild" | "moderate" | "severe") || "mild";
      const existing = symptomMap.get(id);
      if (existing) {
        existing.count++;
        const sevOrder = { mild: 0, moderate: 1, severe: 2 };
        if (sevOrder[sev] > sevOrder[existing.worstSeverity]) {
          existing.worstSeverity = sev;
        }
      } else {
        symptomMap.set(id, { count: 1, worstSeverity: sev });
      }
    }
  }

  // Format IDs as labels
  function idToLabel(id: string): string {
    return id
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
  }

  return Array.from(symptomMap.entries())
    .map(([id, data]) => ({
      id,
      label: idToLabel(id),
      severity: data.worstSeverity,
      dayCount: data.count,
    }))
    .sort((a, b) => {
      const sevOrder = { severe: 0, moderate: 1, mild: 2 };
      return sevOrder[a.severity] - sevOrder[b.severity] || b.dayCount - a.dayCount;
    })
    .slice(0, 6);
}

// ─── Activity Suggestions ─────────────────────────────────────────────────────

const ACTIVITY_POOL: ActivitySuggestion[] = [
  // Movement
  { id: "gentle_stretch", label: "Gentle Stretching", emoji: "🧘", description: "5–10 min light stretches to ease stiffness", category: "movement" },
  { id: "light_walk", label: "Short Walk", emoji: "🚶‍♀️", description: "10–15 min slow walk if comfortable", category: "movement" },
  { id: "pelvic_floor", label: "Pelvic Floor Exercises", emoji: "💪", description: "Gentle kegel exercises for recovery", category: "movement" },
  // Rest
  { id: "power_nap", label: "Power Nap", emoji: "😴", description: "20 min nap when baby sleeps", category: "rest" },
  { id: "rest_window", label: "Rest Window", emoji: "🛋️", description: "Feet up, eyes closed — even 10 min helps", category: "rest" },
  // Emotional
  { id: "breathing", label: "Breathing Exercise", emoji: "🌬️", description: "4-7-8 deep breathing for calm", category: "emotional" },
  { id: "journaling", label: "Quick Journal", emoji: "📝", description: "Write 3 things you're grateful for", category: "emotional" },
  { id: "guided_relax", label: "Guided Relaxation", emoji: "🎧", description: "5 min audio relaxation session", category: "emotional" },
  // Nutrition
  { id: "hydration_boost", label: "Hydration Boost", emoji: "💧", description: "Drink 2 glasses of water now", category: "nutrition" },
  { id: "nutrition_snack", label: "Nourishing Snack", emoji: "🥜", description: "Nuts, dates, or fruit for energy", category: "nutrition" },
  { id: "warm_drink", label: "Warm Drink", emoji: "☕", description: "Warm milk or herbal tea for comfort", category: "nutrition" },
];

export function generateActivitySuggestions(breakdown: RecoveryScoreBreakdown): ActivitySuggestion[] {
  const suggestions: ActivitySuggestion[] = [];
  const used = new Set<string>();

  function pick(category: ActivitySuggestion["category"], count: number) {
    const pool = ACTIVITY_POOL.filter(a => a.category === category && !used.has(a.id));
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      suggestions.push(pool[i]);
      used.add(pool[i].id);
    }
  }

  // Low energy → rest activities
  if (breakdown.energy < 50) pick("rest", 2);
  else pick("rest", 1);

  // Low emotional → emotional support
  if (breakdown.emotional < 50) pick("emotional", 2);
  else pick("emotional", 1);

  // Low hydration/nutrition → nutrition
  if (breakdown.hydration < 60) pick("nutrition", 2);
  else pick("nutrition", 1);

  // If energy is decent → movement
  if (breakdown.energy >= 40) pick("movement", 1);

  return suggestions.slice(0, 4);
}

// ─── Recovery Timeline ────────────────────────────────────────────────────────

export function getRecoveryTimeline(weeksPostDelivery: number): RecoveryTimelineWeek[] {
  const milestones: { week: number; label: string; description: string }[] = [
    { week: 1, label: "Initial Recovery", description: "Rest, bonding, establishing feeding" },
    { week: 2, label: "Early Healing", description: "Body begins to heal, energy slowly returns" },
    { week: 3, label: "Strength Building", description: "Gradual return to light activity" },
    { week: 4, label: "Stabilizing", description: "Sleep patterns improving, strength growing" },
    { week: 6, label: "Recovery Checkpoint", description: "6-week postpartum checkup milestone" },
    { week: 8, label: "Growing Confidence", description: "Routine establishing, healing progressing" },
    { week: 12, label: "Strong Recovery", description: "Significant healing progress achieved" },
  ];

  return milestones.map(m => ({
    weekNumber: m.week,
    label: m.label,
    description: m.description,
    status:
      weeksPostDelivery >= m.week + 1 ? "completed" :
      weeksPostDelivery >= m.week ? "current" :
      "upcoming",
  }));
}

// ─── Recovery Checkups ────────────────────────────────────────────────────────

const CHECKUP_STORAGE_KEY = "mh-premature-recovery-checkups";

export function getDefaultCheckups(): RecoveryCheckup[] {
  return [
    { id: "doctor_followup", label: "Doctor Follow-up", emoji: "👩‍⚕️", completed: false },
    { id: "bf_progress", label: "Breastfeeding Progress", emoji: "🤱", completed: false },
    { id: "sleep_quality", label: "Sleep Quality Improving", emoji: "😴", completed: false },
    { id: "pain_recovery", label: "Pain Recovery", emoji: "💊", completed: false },
    { id: "hydration_consistent", label: "Hydration Consistency", emoji: "💧", completed: false },
    { id: "emotional_recovery", label: "Emotional Recovery", emoji: "💜", completed: false },
  ];
}

export function loadCheckups(): RecoveryCheckup[] {
  try {
    const raw = localStorage.getItem(CHECKUP_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return getDefaultCheckups();
}

export function saveCheckups(checkups: RecoveryCheckup[]): void {
  try {
    localStorage.setItem(CHECKUP_STORAGE_KEY, JSON.stringify(checkups));
  } catch { /* ignore */ }
}
