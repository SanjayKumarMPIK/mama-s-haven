/**
 * symptomPredictionEngine.ts
 *
 * Rule-based predictive engine for upcoming symptom forecasting.
 * Analyzes historical health-log data to identify repeating patterns
 * and predicts likely upcoming symptoms with confidence levels.
 *
 * ⚠️ IMPORTANT: This is a WELLNESS feature, NOT medical diagnosis.
 * All predictions are informational, non-alarming, and clearly marked
 * as estimates based on past data.
 */

import type { Phase } from "@/hooks/usePhase";
import type {
  HealthLogs,
  PubertyEntry,
  FamilyPlanningEntry,
} from "@/hooks/useHealthLog";
import { calcAverageCycleLength } from "@/hooks/useHealthLog";
import { KEY_SYMPTOMS_BY_PHASE } from "@/lib/symptomAnalysis";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PredictionConfidence = "high" | "medium";
export type PredictionBasis =
  | "cycle_pattern"
  | "frequency_pattern"
  | "recency_pattern";

export interface SymptomPrediction {
  symptom: string;
  label: string;
  emoji: string;
  predictedDate: string;           // ISO date of expected occurrence
  confidence: PredictionConfidence;
  basedOn: PredictionBasis;
  message: string;                 // User-facing soft message
  confidenceLabel: string;         // "Based on your past patterns" etc.
}

export interface PredictionResult {
  predictions: SymptomPrediction[];
  hasSufficientData: boolean;
  disclaimer: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MIN_LOGGED_DAYS = 5;         // Minimum days logged in last 30d to show predictions
const MAX_PREDICTIONS = 4;         // Never show more than 4 predictions

const SYMPTOM_EMOJI: Record<string, string> = {
  cramps: "🤕",
  fatigue: "😴",
  moodSwings: "🎭",
  headache: "🤯",
  acne: "💆",
  breastTenderness: "💗",
  nausea: "🤢",
  dizziness: "💫",
  backPain: "🔙",
  swelling: "🦶",
  sleepDisturbance: "🌙",
  irregularCycle: "📅",
  ovulationPain: "⚡",
  moodChanges: "🎭",
  stress: "😰",
  sleepIssues: "🌙",
  hotFlashes: "🔥",
  nightSweats: "💧",
  jointPain: "🦴",
  // Postpartum / Premature
  breastPain: "💗",
  nipplePain: "⚡",
  lowMilkSupply: "🍼",
  lowEnergy: "🔋",
  sleepDeprivation: "🥱",
  bodyAche: "🤕",
};

/** Soft, non-alarming message templates keyed by symptom */
const PREDICTION_MESSAGES: Record<string, { short: string; withTime: (days: string) => string }> = {
  cramps:            { short: "Cramps may occur soon",               withTime: d => `Cramps likely in next ${d}` },
  fatigue:           { short: "Mild fatigue possible soon",          withTime: d => `Energy dip possible in ${d}` },
  moodSwings:        { short: "Mood changes may occur",              withTime: d => `Mood shifts expected in ${d}` },
  headache:          { short: "Mild headache possible",              withTime: d => `Headache may occur in ${d}` },
  acne:              { short: "Skin changes may happen",             withTime: d => `Skin changes possible in ${d}` },
  breastTenderness:  { short: "Breast tenderness may occur",         withTime: d => `Tenderness likely in ${d}` },
  nausea:            { short: "Mild nausea possible",                withTime: d => `Nausea may occur in ${d}` },
  dizziness:         { short: "Mild dizziness possible",             withTime: d => `Dizziness may occur in ${d}` },
  backPain:          { short: "Back discomfort possible",             withTime: d => `Back discomfort may occur in ${d}` },
  swelling:          { short: "Mild swelling possible",              withTime: d => `Swelling may occur in ${d}` },
  sleepDisturbance:  { short: "Sleep may be disrupted",              withTime: d => `Sleep changes expected in ${d}` },
  irregularCycle:    { short: "Cycle variation possible",            withTime: d => `Cycle variation possible in ${d}` },
  ovulationPain:     { short: "Ovulation discomfort possible",       withTime: d => `Ovulation discomfort likely in ${d}` },
  moodChanges:       { short: "Mood changes may occur",              withTime: d => `Mood changes expected in ${d}` },
  stress:            { short: "Stress levels may rise",              withTime: d => `Stress may increase in ${d}` },
  sleepIssues:       { short: "Sleep quality may change",            withTime: d => `Sleep changes possible in ${d}` },
  hotFlashes:        { short: "Hot flashes may occur",               withTime: d => `Hot flashes possible in ${d}` },
  nightSweats:       { short: "Night sweats may occur",              withTime: d => `Night sweats possible in ${d}` },
  jointPain:         { short: "Joint discomfort possible",           withTime: d => `Joint discomfort may occur in ${d}` },
  // Postpartum / Premature
  breastPain:        { short: "Breast discomfort possible",           withTime: d => `Breast discomfort may occur in ${d}` },
  nipplePain:        { short: "Nipple soreness possible",             withTime: d => `Nipple soreness may occur in ${d}` },
  lowMilkSupply:     { short: "Milk supply may dip",                  withTime: d => `Milk supply may dip in ${d}` },
  lowEnergy:         { short: "Energy levels may dip",                withTime: d => `Low energy possible in ${d}` },
  sleepDeprivation:  { short: "Sleep disruption likely",              withTime: d => `Sleep disruption likely in ${d}` },
  bodyAche:          { short: "Body ache possible",                   withTime: d => `Body ache may continue in ${d}` },
};

const CONFIDENCE_LABELS: Record<PredictionConfidence, string> = {
  high:   "Based on your past patterns",
  medium: "May occur based on recent trends",
};

const DISCLAIMER = "Predictions are based on your past data and may vary. This is not a medical diagnosis.";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseISO(s: string): Date {
  return new Date(s + "T12:00:00");
}

function todayISO(): string {
  return toISODate(new Date());
}

function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (parseISO(b).getTime() - parseISO(a).getTime()) / MS_PER_DAY,
  );
}

function getSymptomLabel(phase: string, id: string): string {
  const syms = KEY_SYMPTOMS_BY_PHASE[phase] ?? [];
  const found = syms.find((s) => s.id === id);
  if (found) return found.label;
  return id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

function makePrediction(
  symptomId: string,
  phase: string,
  predictedDate: string,
  confidence: PredictionConfidence,
  basedOn: PredictionBasis,
): SymptomPrediction {
  const today = todayISO();
  const daysAway = Math.max(0, daysBetween(today, predictedDate));
  const label = getSymptomLabel(phase, symptomId);
  const msgs = PREDICTION_MESSAGES[symptomId];

  let timeStr: string;
  if (daysAway <= 0) timeStr = "today";
  else if (daysAway === 1) timeStr = "next 24 hours";
  else if (daysAway <= 2) timeStr = "next 24–48 hours";
  else if (daysAway <= 4) timeStr = `next ${daysAway} days`;
  else timeStr = `${daysAway} days`;

  const message = msgs
    ? msgs.withTime(timeStr)
    : `${label} may occur in ${timeStr}`;

  return {
    symptom: symptomId,
    label,
    emoji: SYMPTOM_EMOJI[symptomId] ?? "📊",
    predictedDate,
    confidence,
    basedOn,
    message,
    confidenceLabel: CONFIDENCE_LABELS[confidence],
  };
}

// ─── Data extraction ──────────────────────────────────────────────────────────

interface SymptomTimeline {
  id: string;
  dates: string[];  // sorted ascending ISO dates when this symptom was true
}

function extractTimelines(
  logs: HealthLogs,
  phase: string,
): { timelines: Record<string, SymptomTimeline>; loggedDays30d: number } {
  const today = todayISO();
  const d30 = addDays(today, -30);

  const timelines: Record<string, SymptomTimeline> = {};
  let loggedDays = 0;

  const basePhase = phase.startsWith("maternity_") ? "maternity" : phase;

  const entries = Object.entries(logs)
    .filter(([d, e]) => e.phase === basePhase && d <= today && d >= d30)
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [dateISO, entry] of entries) {
    loggedDays++;
    if (!entry.symptoms) continue;

    for (const [key, val] of Object.entries(entry.symptoms)) {
      if (!val) continue;
      if (!timelines[key]) {
        timelines[key] = { id: key, dates: [] };
      }
      timelines[key].dates.push(dateISO);
    }
  }

  return { timelines, loggedDays30d: loggedDays };
}

// ─── Strategy 1: Cycle-Phase Pattern ──────────────────────────────────────────
//
// For puberty/family-planning: check if a symptom consistently appears
// in a specific cycle-day-range across ≥2 cycles, and if the next cycle
// is approaching that window, predict it.

function predictByCyclePhase(
  logs: HealthLogs,
  phase: string,
  timelines: Record<string, SymptomTimeline>,
): SymptomPrediction[] {
  const basePhase = phase.startsWith("maternity_") ? "maternity" : phase;
  if (basePhase !== "puberty" && basePhase !== "family-planning") return [];

  // Get period start dates
  let periodStarts: string[] = [];
  let avgCycle = 28;

  if (phase === "puberty") {
    periodStarts = Object.entries(logs)
      .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
      .map(([d]) => d)
      .sort();

    const calcAvg = calcAverageCycleLength(logs);
    if (calcAvg) avgCycle = calcAvg;
  } else {
    // family-planning: use lastPeriodDate + periodStarted markers
    const fpEntries = Object.entries(logs)
      .filter(([, e]) => e.phase === "family-planning")
      .sort(([a], [b]) => a.localeCompare(b));

    // Collect period start markers
    const starts = fpEntries
      .filter(([, e]) => (e as FamilyPlanningEntry).periodStarted)
      .map(([d]) => d);

    if (starts.length > 0) {
      periodStarts = starts;
    } else {
      // Fallback: use lastPeriodDate from most recent entry
      const latest = fpEntries[fpEntries.length - 1]?.[1] as FamilyPlanningEntry | undefined;
      if (latest?.lastPeriodDate) {
        periodStarts = [latest.lastPeriodDate];
        avgCycle = latest.cycleLength ?? 28;
      }
    }

    // Calculate average if multiple starts
    if (periodStarts.length >= 2) {
      const diffs: number[] = [];
      for (let i = 1; i < periodStarts.length; i++) {
        const diff = daysBetween(periodStarts[i - 1], periodStarts[i]);
        if (diff > 0 && diff < 100) diffs.push(diff);
      }
      if (diffs.length > 0) {
        avgCycle = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
      }
    }
  }

  if (periodStarts.length < 1) return [];

  const today = todayISO();
  const lastStart = periodStarts[periodStarts.length - 1];
  const daysSinceLast = daysBetween(lastStart, today);
  const dayInCycle = daysSinceLast % avgCycle;

  // Predict next period start
  const daysUntilNext = avgCycle - dayInCycle;
  const nextStartISO = addDays(today, daysUntilNext);

  const predictions: SymptomPrediction[] = [];

  // For each symptom, check if it appeared in a similar cycle-day window
  // across ≥2 different cycles
  for (const [symId, timeline] of Object.entries(timelines)) {
    if (timeline.dates.length < 2) continue;

    // Map each occurrence to its cycle-day relative to the nearest period start
    const cycleDays: number[] = [];
    for (const occDate of timeline.dates) {
      // Find the period start just before or on this date
      let nearestStart: string | null = null;
      for (const ps of periodStarts) {
        if (ps <= occDate) nearestStart = ps;
        else break;
      }
      if (!nearestStart) continue;
      const cd = daysBetween(nearestStart, occDate) % avgCycle;
      cycleDays.push(cd);
    }

    if (cycleDays.length < 2) continue;

    // Check if there's a cluster of cycle-days (±2 day tolerance)
    // Group into clusters
    cycleDays.sort((a, b) => a - b);
    const clusters: number[][] = [];
    let currentCluster = [cycleDays[0]];
    for (let i = 1; i < cycleDays.length; i++) {
      if (cycleDays[i] - cycleDays[i - 1] <= 3) {
        currentCluster.push(cycleDays[i]);
      } else {
        if (currentCluster.length >= 2) clusters.push(currentCluster);
        currentCluster = [cycleDays[i]];
      }
    }
    if (currentCluster.length >= 2) clusters.push(currentCluster);

    // For each valid cluster, check if we're approaching that window
    for (const cluster of clusters) {
      const avgCycleDay = Math.round(
        cluster.reduce((a, b) => a + b, 0) / cluster.length,
      );

      // How many days until this cycle-day arrives?
      let daysUntil = avgCycleDay - dayInCycle;
      if (daysUntil < 0) daysUntil += avgCycle;

      // Only predict if it's within the next 7 days
      if (daysUntil <= 7 && daysUntil >= 0) {
        const predicted = addDays(today, daysUntil);
        predictions.push(
          makePrediction(symId, phase, predicted, "high", "cycle_pattern"),
        );
        break; // One prediction per symptom
      }
    }
  }

  return predictions;
}

// ─── Strategy 2: Frequency Pattern ────────────────────────────────────────────
//
// If a symptom appeared ≥3 times in the last 14 days with a somewhat regular
// interval (±1 day tolerance), predict the next occurrence.

function predictByFrequency(
  phase: string,
  timelines: Record<string, SymptomTimeline>,
): SymptomPrediction[] {
  const today = todayISO();
  const d14 = addDays(today, -14);
  const predictions: SymptomPrediction[] = [];

  for (const [symId, timeline] of Object.entries(timelines)) {
    const recent = timeline.dates.filter((d) => d >= d14);
    if (recent.length < 3) continue;

    // Calculate intervals between consecutive occurrences
    const intervals: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      intervals.push(daysBetween(recent[i - 1], recent[i]));
    }

    if (intervals.length < 2) continue;

    // Check if intervals are consistent (±1 day tolerance)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const minInt = Math.min(...intervals);
    const maxInt = Math.max(...intervals);

    if (maxInt - minInt <= 2 && avgInterval >= 1 && avgInterval <= 7) {
      // Predict the next occurrence
      const lastDate = recent[recent.length - 1];
      const nextDate = addDays(lastDate, Math.round(avgInterval));
      const daysUntil = daysBetween(today, nextDate);

      // Only predict if it's upcoming (within 5 days)
      if (daysUntil >= 0 && daysUntil <= 5) {
        predictions.push(
          makePrediction(symId, phase, nextDate, "medium", "frequency_pattern"),
        );
      }
    }
  }

  return predictions;
}

// ─── Strategy 3: Recency + Trend Continuation ────────────────────────────────
//
// If a symptom appeared in the last 2 consecutive days and has been
// seen ≥3 times in the last 7 days, predict it may continue.

function predictByRecency(
  phase: string,
  timelines: Record<string, SymptomTimeline>,
): SymptomPrediction[] {
  const today = todayISO();
  const yesterday = addDays(today, -1);
  const d7 = addDays(today, -7);
  const predictions: SymptomPrediction[] = [];

  for (const [symId, timeline] of Object.entries(timelines)) {
    const last7 = timeline.dates.filter((d) => d >= d7);
    if (last7.length < 3) continue;

    // Check if it appeared yesterday and the day before (or today+yesterday)
    const hasToday = timeline.dates.includes(today);
    const hasYesterday = timeline.dates.includes(yesterday);
    const hasDayBefore = timeline.dates.includes(addDays(today, -2));

    const consecutive = (hasToday && hasYesterday) || (hasYesterday && hasDayBefore);
    if (!consecutive) continue;

    // Predict continuation
    const nextDate = hasToday ? addDays(today, 1) : today;
    predictions.push(
      makePrediction(symId, phase, nextDate, "medium", "recency_pattern"),
    );
  }

  return predictions;
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function computeSymptomPredictions(
  logs: HealthLogs,
  phase: string,
): PredictionResult {
  const { timelines, loggedDays30d } = extractTimelines(logs, phase);

  // Insufficient data guard
  if (loggedDays30d < MIN_LOGGED_DAYS) {
    return {
      predictions: [],
      hasSufficientData: false,
      disclaimer: DISCLAIMER,
    };
  }

  // Collect predictions from all strategies
  const cyclePreds = predictByCyclePhase(logs, phase, timelines);
  const freqPreds = predictByFrequency(phase, timelines);
  const recencyPreds = predictByRecency(phase, timelines);

  // Merge and deduplicate (prefer higher confidence)
  const seen = new Map<string, SymptomPrediction>();

  // Cycle patterns first (highest confidence)
  for (const p of cyclePreds) {
    if (!seen.has(p.symptom)) seen.set(p.symptom, p);
  }
  // Then frequency
  for (const p of freqPreds) {
    if (!seen.has(p.symptom)) seen.set(p.symptom, p);
  }
  // Then recency
  for (const p of recencyPreds) {
    if (!seen.has(p.symptom)) seen.set(p.symptom, p);
  }

  // Sort: high confidence first, then by proximity of predicted date
  const all = Array.from(seen.values()).sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return a.confidence === "high" ? -1 : 1;
    }
    return a.predictedDate.localeCompare(b.predictedDate);
  });

  return {
    predictions: all.slice(0, MAX_PREDICTIONS),
    hasSufficientData: true,
    disclaimer: DISCLAIMER,
  };
}
