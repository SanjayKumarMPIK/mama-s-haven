/**
 * dailyStateEngine.ts
 *
 * Hormone → Performance Translator
 *
 * Derives a daily execution state from health-log data and maps it
 * to a structured recommendation plan (movement, nutrition, productivity,
 * recovery) with actionable Do/Avoid items and a short prediction.
 */

import type { CyclePhase } from "@/lib/wellnessEngine";
import type { HealthLogs, PubertyEntry, MaternityEntry, MenopauseEntry, FamilyPlanningEntry } from "@/hooks/useHealthLog";
import type { Phase } from "@/hooks/usePhase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EnergyLevel = "low" | "medium" | "high";
export type MentalState = "focused" | "normal" | "emotional";
export type BodyState = "recovery" | "normal" | "strain";
export type ExecutionMode = "Recovery Day" | "Balanced Day" | "Peak Performance Day";

export interface DailyState {
  energyLevel: EnergyLevel;
  mentalState: MentalState;
  bodyState: BodyState;
}

export interface DailyPlan {
  movement: string;
  nutrition: string;
  productivity: string;
  recovery: string;
}

export interface DailyRecommendations {
  executionMode: ExecutionMode;
  summary: string;
  why: string[];
  plan: DailyPlan;
  doItems: string[];
  avoidItems: string[];
  prediction: string;
}

// ─── Helpers — extract latest data ────────────────────────────────────────────

interface LatestSnapshot {
  energy: number;       // 1–3
  mood: number;         // 1–3
  sleepHours: number | null;
  symptoms: string[];   // active symptom keys
  cyclePhase: CyclePhase | null;
  hasData: boolean;
}

const MOOD_NUM: Record<string, number> = { Good: 3, Okay: 2, Low: 1 };

function getLatestSnapshot(logs: HealthLogs, phase: Phase, cyclePhase: CyclePhase | null): LatestSnapshot {
  const todayISO = new Date().toISOString().slice(0, 10);

  // Walk backwards from today up to 3 days to find the freshest entry
  const candidates: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    candidates.push(d.toISOString().slice(0, 10));
  }

  let entry: any = null;
  for (const iso of candidates) {
    const e = logs[iso];
    if (e && e.phase === phase) { entry = e; break; }
  }

  if (!entry) {
    return { energy: 2, mood: 2, sleepHours: null, symptoms: [], cyclePhase, hasData: false };
  }

  // Energy score
  let energy = 3;
  const syms: string[] = [];
  if (entry.symptoms) {
    for (const [k, v] of Object.entries(entry.symptoms)) {
      if (v) syms.push(k);
    }
  }
  if (syms.includes("fatigue")) energy = 1;
  else if (syms.includes("headache") || syms.includes("sleepDisturbance") || syms.includes("sleepIssues")) energy = 2;

  // Mood score
  const mood = MOOD_NUM[entry.mood ?? ""] ?? 2;

  // Sleep
  const sleepHours = entry.sleepHours ?? null;

  return { energy, mood, sleepHours, symptoms: syms, cyclePhase, hasData: true };
}

// ─── Derive Daily State ───────────────────────────────────────────────────────

export function deriveDailyState(snap: LatestSnapshot): DailyState {
  // Energy
  let energyLevel: EnergyLevel = "medium";
  if (snap.energy <= 1 || (snap.sleepHours !== null && snap.sleepHours < 6)) {
    energyLevel = "low";
  } else if (snap.energy >= 3 && (snap.sleepHours === null || snap.sleepHours >= 7)) {
    energyLevel = "high";
  }

  // Mental
  let mentalState: MentalState = "normal";
  if (snap.mood <= 1 || snap.symptoms.includes("moodSwings") || snap.symptoms.includes("moodChanges")) {
    mentalState = "emotional";
  } else if (snap.mood >= 3 && energyLevel === "high") {
    mentalState = "focused";
  }

  // Body
  let bodyState: BodyState = "normal";
  if (snap.symptoms.includes("fatigue") || snap.symptoms.includes("cramps") || snap.symptoms.includes("backPain")) {
    bodyState = "recovery";
  } else if (snap.symptoms.length >= 3) {
    bodyState = "strain";
  }

  return { energyLevel, mentalState, bodyState };
}

// ─── Map State → Execution Mode ──────────────────────────────────────────────

export function getExecutionMode(state: DailyState): ExecutionMode {
  if (state.energyLevel === "low" || state.bodyState === "recovery") return "Recovery Day";
  if (state.energyLevel === "high" && state.mentalState === "focused") return "Peak Performance Day";
  return "Balanced Day";
}

// ─── Generate Recommendations ─────────────────────────────────────────────────

function buildRecoveryDay(snap: LatestSnapshot, cyclePhase: CyclePhase | null): DailyRecommendations {
  const why: string[] = [];
  if (snap.symptoms.includes("fatigue")) why.push("Fatigue detected in recent log");
  if (snap.symptoms.includes("cramps")) why.push("Cramps reported — body needs gentle care");
  if (snap.sleepHours !== null && snap.sleepHours < 6) why.push(`Only ${snap.sleepHours}h sleep — below minimum`);
  if (snap.energy <= 1) why.push("Energy level is very low");
  if (snap.symptoms.includes("backPain")) why.push("Back pain detected");
  if (why.length === 0) why.push("Multiple recovery signals today");

  return {
    executionMode: "Recovery Day",
    summary: "Rest well today — focus on hydration and gentle care",
    why,
    plan: {
      movement: "Light walking or gentle stretching only",
      nutrition: "Warm, easy-to-digest foods — dal, rice, khichdi",
      productivity: "Low-effort tasks only — reading, light planning",
      recovery: "Prioritize rest — nap if possible, early bedtime",
    },
    doItems: [
      "Hydrate well — warm water with lemon",
      "Gentle stretching for 5–10 min",
      "Eat small, frequent meals",
      "Listen to calming music or rest",
    ],
    avoidItems: [
      "Intense workouts or running",
      "Skipping meals",
      "Heavy screen time before bed",
      "Caffeine after 3 PM",
    ],
    prediction: snap.symptoms.includes("cramps")
      ? "Cramps typically ease within 1–2 days with rest"
      : "Energy likely improves in 2–3 days with proper rest",
  };
}

function buildBalancedDay(snap: LatestSnapshot, cyclePhase: CyclePhase | null): DailyRecommendations {
  const why: string[] = [];
  if (snap.mood === 2) why.push("Mood is stable — good baseline");
  if (snap.energy === 2) why.push("Moderate energy available");
  if (snap.sleepHours !== null && snap.sleepHours >= 6) why.push(`${snap.sleepHours}h sleep — adequate rest`);
  if (snap.symptoms.length > 0 && snap.symptoms.length < 3) why.push("Mild symptoms present — manageable");
  if (cyclePhase === "luteal") why.push("Luteal phase — steady and preparing");
  if (cyclePhase === "follicular") why.push("Follicular phase — energy building up");
  if (why.length === 0) why.push("Overall balanced signals today");

  const hasMild = snap.symptoms.length > 0;

  return {
    executionMode: "Balanced Day",
    summary: hasMild
      ? "You're doing okay — manage mild symptoms while staying active"
      : "Steady energy today — maintain your balanced routine",
    why,
    plan: {
      movement: "30 min brisk walk or yoga session",
      nutrition: "Balanced meals — protein, whole grains, vegetables",
      productivity: "Moderate focus tasks — study, creative work",
      recovery: "Wind down by 9 PM with light reading",
    },
    doItems: [
      "Eat a protein-rich breakfast",
      "Take a 30-min activity break",
      "Stay hydrated — 2L minimum",
      "Include fruits or nuts as snacks",
    ],
    avoidItems: [
      "Skipping breakfast",
      "Prolonged sitting without breaks",
      "Excess sugar or processed snacks",
      "Late-night screen usage",
    ],
    prediction: cyclePhase === "follicular"
      ? "Energy building — expect a peak in the coming days"
      : "Maintaining this routine keeps your body in a good rhythm",
  };
}

function buildPeakDay(snap: LatestSnapshot, cyclePhase: CyclePhase | null): DailyRecommendations {
  const why: string[] = [];
  if (snap.energy >= 3) why.push("High energy detected");
  if (snap.mood >= 3) why.push("Mood is great — mentally sharp");
  if (snap.sleepHours !== null && snap.sleepHours >= 7) why.push(`${snap.sleepHours}h quality sleep`);
  if (snap.symptoms.length === 0) why.push("No active symptoms");
  if (cyclePhase === "ovulation") why.push("Ovulation phase — natural energy peak");
  if (cyclePhase === "follicular") why.push("Follicular phase — rising energy");
  if (why.length === 0) why.push("All indicators show peak readiness");

  return {
    executionMode: "Peak Performance Day",
    summary: "You're at your best today — make the most of it! ✨",
    why,
    plan: {
      movement: "45 min cardio, dance, or active sport",
      nutrition: "High-protein, complex carbs — fuel for performance",
      productivity: "Tackle challenging tasks — deep work, exams, presentations",
      recovery: "Cool-down stretching and 7+ hours sleep tonight",
    },
    doItems: [
      "Take on your hardest task first",
      "High-intensity or fun exercise",
      "Eat a nutrient-dense, protein-rich lunch",
      "Celebrate small wins today 🎉",
    ],
    avoidItems: [
      "Wasting peak energy on passive tasks",
      "Overtraining without recovery breaks",
      "Skipping post-workout stretching",
      "Going to bed too late",
    ],
    prediction: cyclePhase === "ovulation"
      ? "Peak window lasts 2–3 days — use it well"
      : "Sustain this by sleeping well and eating right",
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function computeDailyRecommendations(
  logs: HealthLogs,
  phase: Phase,
  cyclePhase: CyclePhase | null,
): DailyRecommendations {
  const snap = getLatestSnapshot(logs, phase, cyclePhase);
  const state = deriveDailyState(snap);
  const mode = getExecutionMode(state);

  switch (mode) {
    case "Recovery Day":
      return buildRecoveryDay(snap, cyclePhase);
    case "Peak Performance Day":
      return buildPeakDay(snap, cyclePhase);
    default:
      return buildBalancedDay(snap, cyclePhase);
  }
}

export { getLatestSnapshot };
