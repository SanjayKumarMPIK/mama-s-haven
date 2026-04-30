/**
 * symptomInsightsEngine.ts
 *
 * Pure analytics engine that mines health-log calendar data to produce
 * symptom frequency, trends, correlations, pattern insights, and
 * actionable recommendations. Phase-aware — supports puberty, maternity,
 * family-planning, and menopause.
 */

import type { Phase } from "@/hooks/usePhase";
import type { HealthLogs } from "@/hooks/useHealthLog";
import { KEY_SYMPTOMS_BY_PHASE } from "@/lib/symptomAnalysis";
import { SYMPTOM_FOOD_BOOSTS } from "@/lib/wellnessEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SymptomFrequency {
  id: string;
  label: string;
  count7d: number;
  count30d: number;
  trend: "increasing" | "decreasing" | "stable";
  trendDelta: number; // positive = increasing
  lastOccurrence: string | null;
  emoji: string;
}

export interface PatternInsight {
  icon: string;
  title: string;
  description: string;
  type: "pattern" | "phase" | "behavioral" | "alert";
}

export interface TrendPoint {
  date: string;
  dateLabel: string;
  total: number;
  [symptomId: string]: number | string;
}

export interface SymptomDetailData {
  id: string;
  label: string;
  emoji: string;
  count7d: number;
  count30d: number;
  trend: "increasing" | "decreasing" | "stable";
  lastOccurrence: string | null;
  daysAgoLast: number | null;
  patterns: string[];
  suggestions: string[];
}

export interface SymptomInsightsData {
  hasData: boolean;
  topSymptoms: SymptomFrequency[];
  allSymptoms: SymptomFrequency[];
  trendData: TrendPoint[];
  insights: PatternInsight[];
  recommendations: { icon: string; text: string }[];
  avgMood7d: number | null;
  avgSleep7d: number | null;
  loggedDays7d: number;
  loggedDays30d: number;
  totalSymptoms7d: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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
};

const SYMPTOM_SUGGESTIONS: Record<string, string[]> = {
  cramps: [
    "Apply a warm compress to your lower abdomen",
    "Try gentle yoga — child's pose or knees-to-chest",
    "Increase iron-rich foods: spinach, dates, jaggery",
  ],
  fatigue: [
    "Prioritize 8+ hours of sleep tonight",
    "Include iron-rich foods: spinach, lentils, ragi",
    "Take short 10-minute rest breaks through the day",
  ],
  moodSwings: [
    "Practice 5-minute deep breathing exercises",
    "Include omega-3 rich foods: nuts, seeds, walnuts",
    "Maintain a consistent daily routine for stability",
  ],
  moodChanges: [
    "Use quick calming breaks — 2 to 5 minutes",
    "Try journaling your feelings for clarity",
    "Include curd or buttermilk for gut-brain balance",
  ],
  headache: [
    "Stay hydrated — sip water every 2 hours",
    "Take screen breaks using the 20-20-20 rule",
    "Rest in a quiet, dimly lit room when possible",
  ],
  acne: [
    "Use a gentle, non-comedogenic cleanser",
    "Avoid touching or picking at breakouts",
    "Drink plenty of water and eat fresh fruits",
  ],
  breastTenderness: [
    "Wear a supportive, comfortable bra",
    "Apply a warm or cool compress for relief",
    "Avoid caffeine which can worsen tenderness",
  ],
  nausea: [
    "Eat small, frequent meals throughout the day",
    "Try ginger tea or jeera water for relief",
    "Avoid strong smells and greasy foods",
  ],
  dizziness: [
    "Stand up slowly — avoid sudden position changes",
    "Increase fluid and electrolyte intake",
    "Consult a doctor if dizziness persists 3+ days",
  ],
  backPain: [
    "Gentle stretching and cat-cow yoga poses",
    "Use a pillow for lumbar support when sitting",
    "Include calcium-rich foods: milk, ragi, sesame",
  ],
  swelling: [
    "Elevate legs when resting for 15-20 minutes",
    "Reduce salt intake and stay well hydrated",
    "Take short walking breaks — avoid prolonged standing",
  ],
  sleepDisturbance: [
    "Maintain a consistent sleep-wake schedule",
    "No screens 1 hour before bedtime",
    "Try warm milk with a pinch of nutmeg before bed",
  ],
  sleepIssues: [
    "Create a calming pre-sleep ritual",
    "Keep your room cool, dark, and quiet",
    "Avoid caffeine after 3 PM",
  ],
  irregularCycle: [
    "Track your cycle consistently each month",
    "Manage stress with breathing or meditation",
    "Consult a PHC if irregularity persists over 3 months",
  ],
  ovulationPain: [
    "Apply a warm heat pack to the lower abdomen",
    "Rest and avoid intense physical activity",
    "Stay hydrated and monitor for changes",
  ],
  stress: [
    "Try deep breathing: 4-7-8 technique twice a day",
    "Take a 15-minute walk in fresh air",
    "Limit screen time and social media before bed",
  ],
  hotFlashes: [
    "Wear breathable, layered clothing you can adjust",
    "Keep your environment cool with a fan or AC",
    "Increase cooling foods: cucumber, coconut water, mint",
  ],
  nightSweats: [
    "Use light, breathable bedding and sleepwear",
    "Keep a glass of cool water by your bedside",
    "Practice relaxation before sleep — gentle stretches",
  ],
  jointPain: [
    "Do gentle morning stretches for 5-10 minutes",
    "Include turmeric and ginger in your cooking",
    "Use warm compresses for stiff or sore joints",
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db = new Date(b + "T12:00:00");
  return Math.round(Math.abs(db.getTime() - da.getTime()) / MS_PER_DAY);
}

function getSymptomLabel(phase: Phase, id: string): string {
  const syms = KEY_SYMPTOMS_BY_PHASE[phase] ?? [];
  const found = syms.find((s) => s.id === id);
  if (found) return found.label;
  return id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

const MOOD_SCORE: Record<string, number> = { Good: 3, Okay: 2, Low: 1 };

// ─── Main Computation ─────────────────────────────────────────────────────────

export function computeSymptomInsights(
  logs: HealthLogs,
  phase: Phase,
): SymptomInsightsData {
  const todayISO = toISODate(new Date());
  const d7 = getDaysAgoISO(7);
  const d14 = getDaysAgoISO(14);
  const d30 = getDaysAgoISO(30);

  // Collect entries for this phase
  const entries = Object.entries(logs)
    .filter(([, e]) => e.phase === phase)
    .filter(([d]) => d <= todayISO)
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    return emptyResult();
  }

  // ── Count symptoms across windows ──
  const counts7d: Record<string, number> = {};
  const countsPrev7d: Record<string, number> = {};
  const counts30d: Record<string, number> = {};
  const lastOcc: Record<string, string> = {};

  let moodSum = 0, moodN = 0;
  let sleepSum = 0, sleepN = 0;
  let logDays7 = 0, logDays30 = 0;
  let totalSymptoms7d = 0;

  // Per-day symptom map for correlation analysis
  const dayData: Record<string, { symptoms: string[]; mood: number | null; sleep: number | null }> = {};

  for (const [dateISO, entry] of entries) {
    const in7 = dateISO >= d7;
    const in30 = dateISO >= d30;
    const inPrev7 = dateISO >= d14 && dateISO < d7;

    if (in7) logDays7++;
    if (in30) logDays30++;

    const activeSyms: string[] = [];

    if (entry.symptoms) {
      for (const [key, val] of Object.entries(entry.symptoms)) {
        if (!val) continue;
        activeSyms.push(key);
        if (in7) { counts7d[key] = (counts7d[key] || 0) + 1; totalSymptoms7d++; }
        if (inPrev7) countsPrev7d[key] = (countsPrev7d[key] || 0) + 1;
        if (in30) counts30d[key] = (counts30d[key] || 0) + 1;
        if (!lastOcc[key] || dateISO > lastOcc[key]) lastOcc[key] = dateISO;
      }
    }

    // Mood & sleep
    const mood = MOOD_SCORE[(entry as any).mood ?? ""] ?? null;
    const sleep: number | null = (entry as any).sleepHours ?? null;

    if (in7 && mood !== null) { moodSum += mood; moodN++; }
    if (in7 && sleep !== null) { sleepSum += sleep; sleepN++; }

    dayData[dateISO] = { symptoms: activeSyms, mood, sleep };
  }

  // ── Build frequency list ──
  const phaseSyms = KEY_SYMPTOMS_BY_PHASE[phase] ?? [];
  const allSymptoms: SymptomFrequency[] = [];

  for (const sym of phaseSyms) {
    const c7 = counts7d[sym.id] || 0;
    const c30 = counts30d[sym.id] || 0;
    const cPrev = countsPrev7d[sym.id] || 0;

    if (c30 === 0 && c7 === 0) continue;

    const delta = c7 - cPrev;
    let trend: SymptomFrequency["trend"] = "stable";
    if (c7 >= 2 && cPrev === 0) trend = "increasing";
    else if (delta >= 2) trend = "increasing";
    else if (c7 === 0 && cPrev >= 2) trend = "decreasing";
    else if (delta <= -2) trend = "decreasing";

    allSymptoms.push({
      id: sym.id,
      label: sym.label,
      count7d: c7,
      count30d: c30,
      trend,
      trendDelta: delta,
      lastOccurrence: lastOcc[sym.id] ?? null,
      emoji: SYMPTOM_EMOJI[sym.id] ?? "📊",
    });
  }

  allSymptoms.sort((a, b) => b.count7d - a.count7d || b.count30d - a.count30d);
  const topSymptoms = allSymptoms.slice(0, 3);

  if (allSymptoms.length === 0) {
    return emptyResult();
  }

  // ── Build trend data (last 14 days) ──
  const topIds = topSymptoms.map((s) => s.id);
  const trendData: TrendPoint[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    const point: TrendPoint = {
      date: iso,
      dateLabel: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      total: 0,
    };

    const entry = logs[iso];
    if (entry && entry.phase === phase && entry.symptoms) {
      let total = 0;
      for (const symId of topIds) {
        const val = (entry.symptoms as Record<string, boolean>)[symId] ? 1 : 0;
        point[symId] = val;
        total += val;
      }
      point.total = total;
    } else {
      for (const symId of topIds) point[symId] = 0;
    }

    trendData.push(point);
  }

  // ── Generate insights ──
  const insights: PatternInsight[] = [];
  const avgSleep = sleepN > 0 ? sleepSum / sleepN : null;
  const avgMood = moodN > 0 ? moodSum / moodN : null;

  // 1. Sleep ↔ Fatigue correlation
  if (avgSleep !== null && avgSleep < 6.5 && (counts7d["fatigue"] || 0) >= 2) {
    insights.push({
      icon: "🔗",
      title: "Sleep–Fatigue Connection",
      description: `Fatigue appeared ${counts7d["fatigue"]}x this week. Your average sleep is ${avgSleep.toFixed(1)}h — improving sleep may reduce fatigue.`,
      type: "pattern",
    });
  }

  // 2. Mood ↔ Energy correlation
  if (avgMood !== null && avgMood < 2 && (counts7d["fatigue"] || 0) >= 1) {
    insights.push({
      icon: "💭",
      title: "Mood Drops With Low Energy",
      description: "Your mood tends to dip on days when fatigue or low energy is present. Rest and nourishment may help both.",
      type: "behavioral",
    });
  }

  // 3. Trend-based insights
  for (const sym of topSymptoms) {
    if (sym.trend === "increasing" && sym.count7d >= 2) {
      insights.push({
        icon: "📈",
        title: `${sym.label} Is Increasing`,
        description: `${sym.label} appeared ${sym.count7d}x in the last 7 days, up from the previous week. Monitor closely.`,
        type: "pattern",
      });
    }
  }

  // 4. Phase-based insights
  if (phase === "puberty") {
    if ((counts7d["cramps"] || 0) >= 2) {
      insights.push({
        icon: "🩸",
        title: "Cramps Align With Cycle",
        description: "Cramps often peak during the menstrual phase. Warm compresses and gentle movement can help.",
        type: "phase",
      });
    }
  }

  if (phase === "maternity") {
    if ((counts7d["nausea"] || 0) >= 2 && (counts7d["fatigue"] || 0) >= 1) {
      insights.push({
        icon: "🤰",
        title: "Nausea + Fatigue Pattern",
        description: "Both nausea and fatigue are common during pregnancy. Small frequent meals and rest can ease these.",
        type: "phase",
      });
    }
  }

  if (phase === "menopause") {
    if ((counts7d["hotFlashes"] || 0) >= 2 && (counts7d["nightSweats"] || 0) >= 1) {
      insights.push({
        icon: "🌡️",
        title: "Heat-Related Symptom Cluster",
        description: "Hot flashes and night sweats are appearing together. Stay cool and hydrated throughout the day.",
        type: "phase",
      });
    }
  }

  // 5. Consecutive day detection
  for (const sym of topSymptoms) {
    let consecutive = 0;
    let maxConsecutive = 0;
    for (let i = 0; i <= 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const dd = dayData[iso];
      if (dd && dd.symptoms.includes(sym.id)) {
        consecutive++;
        maxConsecutive = Math.max(maxConsecutive, consecutive);
      } else {
        consecutive = 0;
      }
    }
    if (maxConsecutive >= 3) {
      insights.push({
        icon: "🔥",
        title: `${sym.label} for ${maxConsecutive}+ Days`,
        description: `${sym.label} has appeared for ${maxConsecutive} consecutive days. Consider rest or consulting a healthcare worker.`,
        type: "alert",
      });
    }
  }

  // 6. Low sleep alert
  if (avgSleep !== null && avgSleep < 6) {
    insights.push({
      icon: "🌙",
      title: "Sleep Below Recommended",
      description: `Your average sleep this week is ${avgSleep.toFixed(1)} hours — below the recommended 7-8 hours. Prioritize rest.`,
      type: "behavioral",
    });
  }

  // Ensure at least one insight if we have data
  if (insights.length === 0 && topSymptoms.length > 0) {
    insights.push({
      icon: "✅",
      title: "Symptoms Appear Stable",
      description: "No concerning patterns detected this week. Keep logging daily for better insights over time.",
      type: "pattern",
    });
  }

  // ── Generate recommendations ──
  const recommendations: { icon: string; text: string }[] = [];
  const seenRecs = new Set<string>();

  // From top symptoms
  for (const sym of topSymptoms) {
    const sugs = SYMPTOM_SUGGESTIONS[sym.id];
    if (sugs) {
      for (const s of sugs.slice(0, 1)) {
        if (!seenRecs.has(s)) { recommendations.push({ icon: sym.emoji, text: s }); seenRecs.add(s); }
      }
    }
    // Food-based recommendations
    const foods = SYMPTOM_FOOD_BOOSTS[sym.id];
    if (foods) {
      for (const f of foods.slice(0, 1)) {
        if (!seenRecs.has(f)) { recommendations.push({ icon: "🍽️", text: f }); seenRecs.add(f); }
      }
    }
  }

  // General wellness
  if (avgSleep !== null && avgSleep < 7 && !seenRecs.has("sleep")) {
    recommendations.push({ icon: "😴", text: "Aim for 7-8 hours of sleep — set a consistent bedtime" });
  }
  if (totalSymptoms7d > 5 && !seenRecs.has("hydrate")) {
    recommendations.push({ icon: "💧", text: "Stay well hydrated — aim for 2-3 liters of water daily" });
  }

  return {
    hasData: true,
    topSymptoms,
    allSymptoms,
    trendData,
    insights,
    recommendations: recommendations.slice(0, 6),
    avgMood7d: moodN > 0 ? Math.round((moodSum / moodN) * 10) / 10 : null,
    avgSleep7d: sleepN > 0 ? Math.round((sleepSum / sleepN) * 10) / 10 : null,
    loggedDays7d: logDays7,
    loggedDays30d: logDays30,
    totalSymptoms7d,
  };
}

// ─── Symptom Detail ───────────────────────────────────────────────────────────

export function getSymptomDetail(
  logs: HealthLogs,
  phase: Phase,
  symptomId: string,
): SymptomDetailData {
  const todayISO = toISODate(new Date());
  const d7 = getDaysAgoISO(7);
  const d14 = getDaysAgoISO(14);
  const d30 = getDaysAgoISO(30);
  const label = getSymptomLabel(phase, symptomId);

  let c7 = 0, c30 = 0, cPrev = 0;
  let lastOcc: string | null = null;

  // For correlation: track co-occurring symptoms and sleep/mood
  const coOccurring: Record<string, number> = {};
  let lowSleepDays = 0, symptomOnLowSleep = 0;

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== phase || dateISO > todayISO) continue;
    const syms = entry.symptoms as Record<string, boolean>;
    if (!syms || !syms[symptomId]) continue;

    if (dateISO >= d7) c7++;
    if (dateISO >= d30) c30++;
    if (dateISO >= d14 && dateISO < d7) cPrev++;
    if (!lastOcc || dateISO > lastOcc) lastOcc = dateISO;

    // Co-occurring symptoms
    for (const [k, v] of Object.entries(syms)) {
      if (v && k !== symptomId) coOccurring[k] = (coOccurring[k] || 0) + 1;
    }

    // Sleep correlation
    const sleep = (entry as any).sleepHours;
    if (sleep !== null && sleep !== undefined) {
      if (sleep < 6) { lowSleepDays++; symptomOnLowSleep++; }
    }
  }

  const delta = c7 - cPrev;
  let trend: SymptomFrequency["trend"] = "stable";
  if (c7 >= 2 && cPrev === 0) trend = "increasing";
  else if (delta >= 2) trend = "increasing";
  else if (c7 === 0 && cPrev >= 2) trend = "decreasing";
  else if (delta <= -2) trend = "decreasing";

  // Build patterns
  const patterns: string[] = [];

  // Trend pattern
  if (trend === "increasing") {
    patterns.push(`${label} is appearing more frequently compared to the previous week`);
  } else if (trend === "decreasing") {
    patterns.push(`${label} frequency has decreased compared to the previous week — good progress`);
  }

  // Co-occurrence patterns
  const topCoOc = Object.entries(coOccurring)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);
  for (const [coId, count] of topCoOc) {
    if (count >= 2) {
      patterns.push(`Often appears together with ${getSymptomLabel(phase, coId)} (${count} times)`);
    }
  }

  // Sleep correlation
  if (symptomOnLowSleep >= 2) {
    patterns.push(`Linked with low sleep — appeared on ${symptomOnLowSleep} days with less than 6 hours of sleep`);
  }

  // Frequency context
  if (c7 >= 4) {
    patterns.push("Appearing almost daily — consider consulting a healthcare worker");
  } else if (c7 >= 2) {
    patterns.push(`Appearing ${c7} times this week — moderate frequency`);
  }

  if (patterns.length === 0 && c30 > 0) {
    patterns.push(`Appeared ${c30} time${c30 > 1 ? "s" : ""} in the last 30 days`);
  }

  const daysAgoLast = lastOcc ? daysBetween(lastOcc, todayISO) : null;

  return {
    id: symptomId,
    label,
    emoji: SYMPTOM_EMOJI[symptomId] ?? "📊",
    count7d: c7,
    count30d: c30,
    trend,
    lastOccurrence: lastOcc,
    daysAgoLast,
    patterns,
    suggestions: SYMPTOM_SUGGESTIONS[symptomId] ?? [
      "Keep tracking this symptom daily",
      "Consult a healthcare worker if it persists or worsens",
    ],
  };
}

// ─── Empty result ─────────────────────────────────────────────────────────────

function emptyResult(): SymptomInsightsData {
  return {
    hasData: false,
    topSymptoms: [],
    allSymptoms: [],
    trendData: [],
    insights: [],
    recommendations: [],
    avgMood7d: null,
    avgSleep7d: null,
    loggedDays7d: 0,
    loggedDays30d: 0,
    totalSymptoms7d: 0,
  };
}
