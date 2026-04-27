/**
 * wellnessCommandEngine.ts
 *
 * Data-driven engine for the Wellness Command Center.
 * All computations are pure functions operating on health log data.
 *
 * Provides:
 *   1. Wellness Score (0-100)
 *   2. Priority Actions (2-3 daily actionable items)
 *   3. Body Signals (mood, energy, sleep, symptoms)
 *   4. Smart Predictions (next 1-3 day forecasts)
 */

import type { HealthLogs, PubertyEntry, FamilyPlanningEntry, MoodType } from "@/hooks/useHealthLog";
import type { Phase } from "@/hooks/usePhase";

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

function getRecentEntries(
  logs: HealthLogs,
  phases: string[],
  lookbackDays: number,
): { date: string; entry: any }[] {
  const todayISO = toISODate(new Date());
  const cutoff = getDaysAgoISO(lookbackDays);
  return Object.entries(logs)
    .filter(([dateISO, entry]) => {
      if (!phases.includes(entry.phase)) return false;
      if (dateISO > todayISO || dateISO < cutoff) return false;
      if ((entry as any)._periodAutoMarked) return false;
      return true;
    })
    .map(([date, entry]) => ({ date, entry }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ─── 1. Wellness Score ────────────────────────────────────────────────────────

export interface WellnessScoreResult {
  score: number;       // 0-100
  label: string;       // "Excellent" | "Stable" | "Needs Attention"
  color: string;       // "emerald" | "amber" | "rose"
  insight: string;     // max 12-word AI summary
  loggedDays: number;
  totalDays: number;
}

export function computeWellnessScore(
  logs: HealthLogs,
  phase: Phase,
): WellnessScoreResult {
  const phases = phase === "family-planning"
    ? ["family-planning", "puberty"]
    : [phase];
  const entries = getRecentEntries(logs, phases, 7);
  const loggedDays = entries.length;

  if (loggedDays === 0) {
    return {
      score: 50,
      label: "No Data",
      color: "slate",
      insight: "Log your symptoms to see your wellness score",
      loggedDays: 0,
      totalDays: 7,
    };
  }

  let score = 70; // baseline

  // Symptom deductions
  let totalSymptoms = 0;
  let moodSum = 0;
  let sleepSum = 0;
  let sleepCount = 0;

  for (const { entry } of entries) {
    const e = entry as any;
    if (e.symptoms) {
      const activeCount = Object.values(e.symptoms).filter(Boolean).length;
      totalSymptoms += activeCount;
    }
    if (e.mood === "Good") moodSum += 3;
    else if (e.mood === "Okay") moodSum += 2;
    else if (e.mood === "Low") moodSum += 1;
    else moodSum += 2; // no data = neutral

    if (e.sleepHours != null) {
      sleepSum += e.sleepHours;
      sleepCount++;
    }
  }

  // Symptom impact: -3 per symptom occurrence
  score -= Math.min(30, totalSymptoms * 3);

  // Mood impact
  const avgMood = moodSum / loggedDays;
  if (avgMood >= 2.5) score += 10;
  else if (avgMood < 1.5) score -= 15;

  // Sleep impact
  if (sleepCount > 0) {
    const avgSleep = sleepSum / sleepCount;
    if (avgSleep >= 7) score += 10;
    else if (avgSleep < 6) score -= 15;
  }

  // Log consistency bonus
  if (loggedDays >= 5) score += 10;
  else if (loggedDays >= 3) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));

  // Label & color
  let label: string;
  let color: string;
  if (score >= 75) { label = "Excellent"; color = "emerald"; }
  else if (score >= 45) { label = "Stable"; color = "amber"; }
  else { label = "Needs Attention"; color = "rose"; }

  // Generate insight
  const latest = entries[0]?.entry as any;
  let insight = "Keep logging to improve your wellness insights";
  if (latest) {
    const syms = latest.symptoms
      ? Object.entries(latest.symptoms).filter(([, v]) => v).map(([k]) => k)
      : [];
    if (sleepCount > 0 && sleepSum / sleepCount < 6) {
      insight = "Energy low due to poor sleep patterns";
    } else if (syms.includes("fatigue")) {
      insight = "Fatigue detected — focus on rest and iron-rich foods";
    } else if (syms.includes("moodChanges") || syms.includes("moodSwings")) {
      insight = "Mood fluctuations — try mindfulness and balanced meals";
    } else if (syms.includes("stress")) {
      insight = "Stress levels elevated — prioritize relaxation today";
    } else if (latest.mood === "Good" && syms.length === 0) {
      insight = "You're doing great — keep up the routine!";
    } else if (syms.length > 2) {
      insight = "Multiple symptoms active — take it easy today";
    } else if (syms.length > 0) {
      insight = "Mild symptoms present — stay hydrated and rested";
    } else {
      insight = "Steady wellness signals — maintain your habits";
    }
  }

  return { score, label, color, insight, loggedDays, totalDays: 7 };
}

// ─── 2. Priority Actions ─────────────────────────────────────────────────────

export interface PriorityAction {
  id: string;
  icon: string; // emoji
  text: string;
  detail: string;
  impact: "high" | "medium";
}

export function generatePriorityActions(
  logs: HealthLogs,
  phase: Phase,
  weight: number | null,
): PriorityAction[] {
  const phases = phase === "family-planning"
    ? ["family-planning", "puberty"]
    : [phase];
  const entries = getRecentEntries(logs, phases, 3);
  const latest = entries[0]?.entry as any;
  const actions: PriorityAction[] = [];
  const hr = new Date().getHours();

  if (!latest) {
    actions.push({
      id: "log-symptoms",
      icon: "📋",
      text: "Log your symptoms today",
      detail: "Open the calendar and record how you're feeling — this powers all your insights.",
      impact: "high",
    });
    actions.push({
      id: "drink-water",
      icon: "💧",
      text: "Drink a glass of water now",
      detail: "Staying hydrated improves energy, focus, and hormonal balance.",
      impact: "medium",
    });
    return actions;
  }

  const syms = latest.symptoms
    ? Object.entries(latest.symptoms).filter(([, v]) => v).map(([k]) => k)
    : [];

  // Sleep-based
  if (latest.sleepHours != null && latest.sleepHours < 6) {
    actions.push({
      id: "improve-sleep",
      icon: "😴",
      text: "Get 8 hours of sleep tonight",
      detail: `You logged ${latest.sleepHours}h — poor sleep worsens fatigue and mood. Aim for 10 PM bedtime.`,
      impact: "high",
    });
  }

  // Fatigue
  if (syms.includes("fatigue")) {
    actions.push({
      id: "eat-iron",
      icon: "🥬",
      text: "Eat iron-rich foods today",
      detail: "Spinach, lentils, or pomegranate — iron fights fatigue and boosts energy.",
      impact: "high",
    });
  }

  // Hydration (time-based)
  if (hr < 14) {
    actions.push({
      id: "hydrate-now",
      icon: "💧",
      text: `Drink 500ml water in the next 2 hours`,
      detail: `Target: ${weight ? (weight * 0.033).toFixed(1) : "2.5"}L today. Hydration improves focus and reduces cramps.`,
      impact: "medium",
    });
  }

  // Mood-based
  if (latest.mood === "Low" || syms.includes("moodChanges") || syms.includes("moodSwings")) {
    actions.push({
      id: "mood-walk",
      icon: "🚶",
      text: "Take a 10-minute walk outside",
      detail: "Movement boosts serotonin. Even 10 min of walking improves mood significantly.",
      impact: "high",
    });
  }

  // Stress
  if (syms.includes("stress")) {
    actions.push({
      id: "destress",
      icon: "🧘",
      text: "Do 5 minutes of deep breathing",
      detail: "Box breathing (4-4-4-4) lowers cortisol. Try it before your next meal.",
      impact: "medium",
    });
  }

  // Cramps
  if (syms.includes("cramps") || syms.includes("ovulationPain")) {
    actions.push({
      id: "cramp-relief",
      icon: "🫖",
      text: "Drink warm ginger or chamomile tea",
      detail: "Warm beverages and gentle heat help ease cramps and relax muscles.",
      impact: "medium",
    });
  }

  // Evening wind-down
  if (hr >= 19) {
    actions.push({
      id: "wind-down",
      icon: "📵",
      text: "Put screens away by 9:30 PM",
      detail: "Blue light suppresses melatonin. Screen-free evenings improve sleep quality.",
      impact: "medium",
    });
  }

  // Sort by impact and cap at 3
  actions.sort((a, b) => (a.impact === "high" ? 0 : 1) - (b.impact === "high" ? 0 : 1));
  return actions.slice(0, 3);
}

// ─── 3. Body Signals ──────────────────────────────────────────────────────────

export interface BodySignal {
  id: string;
  label: string;
  emoji: string;
  value: number;       // 0-100 percentage
  trend: "up" | "down" | "stable";
  trendLabel: string;
  status: "good" | "moderate" | "poor";
  detail: string;
}

export function computeBodySignals(
  logs: HealthLogs,
  phase: Phase,
): BodySignal[] {
  const phases = phase === "family-planning"
    ? ["family-planning", "puberty"]
    : [phase];
  const recent7 = getRecentEntries(logs, phases, 7);
  const prior7 = getRecentEntries(logs, phases, 14).filter(
    e => !recent7.some(r => r.date === e.date),
  );

  // --- Mood ---
  const moodScore = (entries: typeof recent7) => {
    if (entries.length === 0) return 50;
    const scores = entries.map(({ entry }) => {
      const m = (entry as any).mood;
      if (m === "Good") return 100;
      if (m === "Okay") return 60;
      if (m === "Low") return 20;
      return 50;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };
  const moodNow = moodScore(recent7);
  const moodPrev = moodScore(prior7);

  // --- Energy (inverse of fatigue frequency) ---
  const energyScore = (entries: typeof recent7) => {
    if (entries.length === 0) return 50;
    const fatigueCount = entries.filter(({ entry }) => (entry as any).symptoms?.fatigue).length;
    return Math.round(((entries.length - fatigueCount) / entries.length) * 100);
  };
  const energyNow = energyScore(recent7);
  const energyPrev = energyScore(prior7);

  // --- Sleep ---
  const sleepScore = (entries: typeof recent7) => {
    const sleepEntries = entries.filter(({ entry }) => (entry as any).sleepHours != null);
    if (sleepEntries.length === 0) return 50;
    const avg = sleepEntries.reduce((s, { entry }) => s + ((entry as any).sleepHours ?? 0), 0) / sleepEntries.length;
    // 8h = 100%, 6h = 60%, 4h = 20%
    return Math.max(0, Math.min(100, Math.round((avg / 8) * 100)));
  };
  const sleepNow = sleepScore(recent7);
  const sleepPrev = sleepScore(prior7);

  // --- Symptoms (inverse of symptom burden) ---
  const symptomScore = (entries: typeof recent7) => {
    if (entries.length === 0) return 80;
    const totalSyms = entries.reduce((s, { entry }) => {
      const syms = (entry as any).symptoms;
      return s + (syms ? Object.values(syms).filter(Boolean).length : 0);
    }, 0);
    const avgPerDay = totalSyms / entries.length;
    // 0 symptoms = 100, 4+ = 20
    return Math.max(0, Math.min(100, Math.round(100 - avgPerDay * 20)));
  };
  const symptomNow = symptomScore(recent7);
  const symptomPrev = symptomScore(prior7);

  const getTrend = (now: number, prev: number): { trend: BodySignal["trend"]; label: string } => {
    const diff = now - prev;
    if (diff > 8) return { trend: "up", label: `+${diff}% from last week` };
    if (diff < -8) return { trend: "down", label: `${diff}% from last week` };
    return { trend: "stable", label: "Stable this week" };
  };

  const getStatus = (val: number): BodySignal["status"] => {
    if (val >= 70) return "good";
    if (val >= 40) return "moderate";
    return "poor";
  };

  const moodTrend = getTrend(moodNow, moodPrev);
  const energyTrend = getTrend(energyNow, energyPrev);
  const sleepTrend = getTrend(sleepNow, sleepPrev);
  const symptomTrend = getTrend(symptomNow, symptomPrev);

  return [
    {
      id: "mood",
      label: "Mood",
      emoji: "😊",
      value: moodNow,
      ...moodTrend,
      status: getStatus(moodNow),
      detail: moodNow >= 70 ? "Mood is positive" : moodNow >= 40 ? "Mood is okay" : "Mood needs care",
    },
    {
      id: "energy",
      label: "Energy",
      emoji: "⚡",
      value: energyNow,
      ...energyTrend,
      status: getStatus(energyNow),
      detail: energyNow >= 70 ? "Energy levels good" : energyNow >= 40 ? "Moderate energy" : "Low energy detected",
    },
    {
      id: "sleep",
      label: "Sleep",
      emoji: "🌙",
      value: sleepNow,
      ...sleepTrend,
      status: getStatus(sleepNow),
      detail: sleepNow >= 70 ? "Sleep quality good" : sleepNow >= 40 ? "Sleep is adequate" : "Sleep needs improvement",
    },
    {
      id: "symptoms",
      label: "Symptoms",
      emoji: "🩺",
      value: symptomNow,
      ...symptomTrend,
      status: getStatus(symptomNow),
      detail: symptomNow >= 70 ? "Low symptom burden" : symptomNow >= 40 ? "Some symptoms active" : "Multiple symptoms active",
    },
  ];
}

// ─── 4. Smart Predictions ─────────────────────────────────────────────────────

export interface SmartPrediction {
  id: string;
  symptom: string;
  emoji: string;
  probability: number; // 0-100
  timeframe: string;
  reason: string;
}

export function generateSmartPredictions(
  logs: HealthLogs,
  phase: Phase,
): SmartPrediction[] {
  const phases = phase === "family-planning"
    ? ["family-planning", "puberty"]
    : [phase];
  const entries = getRecentEntries(logs, phases, 14);

  if (entries.length < 3) {
    return [{
      id: "no-data",
      symptom: "More Data Needed",
      emoji: "📊",
      probability: 0,
      timeframe: "—",
      reason: "Log at least 3 days of symptoms for predictions.",
    }];
  }

  const symptomCounts: Record<string, number> = {};
  for (const { entry } of entries) {
    const e = entry as any;
    if (e.symptoms) {
      Object.entries(e.symptoms).forEach(([k, v]) => {
        if (v) symptomCounts[k] = (symptomCounts[k] ?? 0) + 1;
      });
    }
  }

  const SYMPTOM_META: Record<string, { label: string; emoji: string }> = {
    fatigue: { label: "Fatigue", emoji: "😮‍💨" },
    cramps: { label: "Cramps", emoji: "🔥" },
    moodSwings: { label: "Mood Swings", emoji: "🎭" },
    moodChanges: { label: "Mood Changes", emoji: "🎭" },
    headache: { label: "Headache", emoji: "🤕" },
    stress: { label: "Stress", emoji: "😤" },
    sleepIssues: { label: "Sleep Issues", emoji: "😴" },
    ovulationPain: { label: "Ovulation Pain", emoji: "⚡" },
    irregularCycle: { label: "Irregular Cycle", emoji: "🔄" },
    acne: { label: "Acne", emoji: "🫧" },
    breastTenderness: { label: "Breast Tenderness", emoji: "💢" },
  };

  const predictions: SmartPrediction[] = Object.entries(symptomCounts)
    .filter(([, count]) => count >= 2)
    .map(([symptom, count]) => {
      const freq = Math.round((count / entries.length) * 100);
      const probability = Math.max(15, Math.min(95, freq + 10));
      const meta = SYMPTOM_META[symptom] ?? { label: symptom, emoji: "❓" };
      const daysAhead = probability >= 60 ? "tomorrow" : "in 2-3 days";

      return {
        id: symptom,
        symptom: meta.label,
        emoji: meta.emoji,
        probability,
        timeframe: daysAhead,
        reason: `Appeared ${count} times in last ${entries.length} days (${freq}% frequency)`,
      };
    })
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  return predictions.length > 0 ? predictions : [{
    id: "all-clear",
    symptom: "Looking Good",
    emoji: "✅",
    probability: 0,
    timeframe: "next few days",
    reason: "No recurring symptoms detected. Keep it up!",
  }];
}

// ─── 5. Action Completion Persistence ─────────────────────────────────────────

const ACTION_LS_KEY = "ss-wellness-actions";

interface CompletionStore {
  date: string;
  completed: string[];
  streak: number;
}

export function getCompletedActions(): CompletionStore {
  try {
    const raw = localStorage.getItem(ACTION_LS_KEY);
    if (!raw) return { date: toISODate(new Date()), completed: [], streak: 0 };
    const parsed: CompletionStore = JSON.parse(raw);
    const today = toISODate(new Date());
    if (parsed.date !== today) {
      // New day — check streak
      const yesterday = getDaysAgoISO(1);
      const newStreak = parsed.date === yesterday && parsed.completed.length > 0
        ? parsed.streak + 1
        : 0;
      const fresh: CompletionStore = { date: today, completed: [], streak: newStreak };
      localStorage.setItem(ACTION_LS_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    return { date: toISODate(new Date()), completed: [], streak: 0 };
  }
}

export function toggleActionComplete(actionId: string): CompletionStore {
  const store = getCompletedActions();
  if (store.completed.includes(actionId)) {
    store.completed = store.completed.filter(id => id !== actionId);
  } else {
    store.completed.push(actionId);
  }
  localStorage.setItem(ACTION_LS_KEY, JSON.stringify(store));
  return store;
}
