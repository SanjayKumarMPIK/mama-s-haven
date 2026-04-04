/**
 * Weekly Analytics Engine
 *
 * Reads the last 7 days of calendar data (HealthLogs) and produces
 * structured insights for the WeeklyGuide to display.
 *
 * Calendar → HealthLogs → analyzeWeek() → WeeklyInsights → WeeklyGuide (read-only)
 */

import type { HealthLogs, HealthLogEntry } from "@/hooks/useHealthLog";
import type { Phase } from "@/hooks/usePhase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SymptomFrequency {
  id: string;
  label: string;
  count: number;
  days: string[]; // ISO dates
}

export interface WeeklyInsight {
  type: "pattern" | "frequency" | "alert";
  emoji: string;
  title: string;
  description: string;
}

export interface SmartAdvice {
  emoji: string;
  title: string;
  description: string;
  category: "lifestyle" | "nutrition" | "medical" | "exercise";
}

export interface PreventiveTip {
  emoji: string;
  text: string;
}

export interface WeeklyAnalysis {
  /** ISO date range [start, end] */
  dateRange: [string, string];
  /** Total days that had any logged data */
  daysLogged: number;
  /** Most common symptoms sorted by frequency */
  symptomFrequencies: SymptomFrequency[];
  /** Pattern-based insights */
  insights: WeeklyInsight[];
  /** Age + symptom + phase based smart advice */
  smartAdvice: SmartAdvice[];
  /** Tips for the coming week */
  preventiveTips: PreventiveTip[];
  /** Mood summary if available */
  moodSummary: { good: number; okay: number; low: number } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLast7Days(): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

function humanize(camelCase: string): string {
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function getSymptomKeys(entry: HealthLogEntry): string[] {
  if (!entry.symptoms) return [];
  return Object.entries(entry.symptoms)
    .filter(([, v]) => v)
    .map(([k]) => k);
}

// ─── Symptom labels per phase ─────────────────────────────────────────────────

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: "Cramps",
  fatigue: "Fatigue",
  moodSwings: "Mood Swings",
  headache: "Headache",
  acne: "Acne",
  breastTenderness: "Breast Tenderness",
  nausea: "Nausea",
  dizziness: "Dizziness",
  swelling: "Swelling",
  backPain: "Back Pain",
  sleepDisturbance: "Sleep Disturbance",
  irregularCycle: "Irregular Cycle",
  ovulationPain: "Ovulation Pain",
  moodChanges: "Mood Changes",
  stress: "Stress",
  sleepIssues: "Sleep Issues",
  hotFlashes: "Hot Flashes",
  nightSweats: "Night Sweats",
  jointPain: "Joint Pain",
};

// ─── Main Analysis Function ───────────────────────────────────────────────────

export function analyzeWeek(
  logs: HealthLogs,
  phase: Phase,
  age?: number
): WeeklyAnalysis {
  const last7 = getLast7Days();
  const dateRange: [string, string] = [last7[0], last7[last7.length - 1]];

  // Collect entries for the last 7 days
  const weekEntries: [string, HealthLogEntry][] = [];
  for (const date of last7) {
    const entry = logs[date];
    if (entry) weekEntries.push([date, entry]);
  }

  const daysLogged = weekEntries.length;

  // ─── Symptom frequency counting ─────────────────────────────────────────
  const freqMap = new Map<string, { count: number; days: string[] }>();
  for (const [date, entry] of weekEntries) {
    for (const key of getSymptomKeys(entry)) {
      const existing = freqMap.get(key) ?? { count: 0, days: [] };
      existing.count += 1;
      existing.days.push(date);
      freqMap.set(key, existing);
    }
  }

  const symptomFrequencies: SymptomFrequency[] = Array.from(freqMap.entries())
    .map(([id, { count, days }]) => ({
      id,
      label: SYMPTOM_LABELS[id] ?? humanize(id),
      count,
      days,
    }))
    .sort((a, b) => b.count - a.count);

  // ─── Mood summary ─────────────────────────────────────────────────────────
  let moodSummary: WeeklyAnalysis["moodSummary"] = null;
  const moods = weekEntries
    .map(([, e]) => (e as any).mood)
    .filter(Boolean) as string[];
  if (moods.length > 0) {
    moodSummary = {
      good: moods.filter((m) => m === "Good").length,
      okay: moods.filter((m) => m === "Okay").length,
      low: moods.filter((m) => m === "Low").length,
    };
  }

  // ─── Pattern Insights ────────────────────────────────────────────────────
  const insights: WeeklyInsight[] = [];

  // Frequency-based insights
  for (const sf of symptomFrequencies) {
    if (sf.count >= 3) {
      insights.push({
        type: "frequency",
        emoji: "📊",
        title: `${sf.label} appeared ${sf.count} times`,
        description: `You logged "${sf.label}" on ${sf.count} out of 7 days this week. This is a recurring pattern worth monitoring.`,
      });
    }
  }

  // Pattern: fatigue + period/cramps combo
  const hasCramps = freqMap.has("cramps");
  const hasFatigue = freqMap.has("fatigue");
  if (hasCramps && hasFatigue) {
    insights.push({
      type: "pattern",
      emoji: "🔗",
      title: "Cramps & fatigue occurring together",
      description:
        "These symptoms often co-occur during menstruation. Adequate rest and warm compresses can help.",
    });
  }

  // Mood pattern
  if (moodSummary && moodSummary.low >= 3) {
    insights.push({
      type: "alert",
      emoji: "💭",
      title: "Low mood detected frequently",
      description:
        "You reported low mood on 3+ days. Consider gentle activities, social connection, or speaking with a counselor.",
    });
  }

  // Phase-specific patterns
  if (phase === "menopause") {
    const hotFlashCount = freqMap.get("hotFlashes")?.count ?? 0;
    const nightSweatCount = freqMap.get("nightSweats")?.count ?? 0;
    if (hotFlashCount >= 2 && nightSweatCount >= 2) {
      insights.push({
        type: "pattern",
        emoji: "🌡️",
        title: "Hot flashes and night sweats pattern",
        description:
          "Both symptoms are appearing frequently. Wearing breathable clothing and keeping rooms cool may help.",
      });
    }
  }

  if (phase === "maternity") {
    const nauseaCount = freqMap.get("nausea")?.count ?? 0;
    if (nauseaCount >= 3) {
      insights.push({
        type: "alert",
        emoji: "⚠️",
        title: "Frequent nausea detected",
        description:
          "Nausea on 3+ days this week. Eat small, frequent meals and stay hydrated. Consult your doctor if persistent.",
      });
    }
  }

  // ─── Smart Advice (Age + Symptom + Phase based) ─────────────────────────
  const smartAdvice: SmartAdvice[] = [];

  // Age-based + symptom-based advice
  if (age && age < 20 && phase === "puberty") {
    if ((freqMap.get("cramps")?.count ?? 0) >= 2) {
      smartAdvice.push({
        emoji: "🩹",
        title: "Puberty-specific cramp management",
        description:
          "Since you're under 20 and logging cramps frequently, try heat therapy (warm water bottle on abdomen), light stretching, and track intensity to share with your doctor.",
        category: "lifestyle",
      });
    }
    if (hasFatigue) {
      smartAdvice.push({
        emoji: "🥗",
        title: "Iron-rich foods recommended",
        description:
          "Fatigue during puberty periods could indicate low iron. Include spinach, jaggery, dates, and beans in your diet.",
        category: "nutrition",
      });
    }
  }

  if (age && age >= 30 && hasFatigue) {
    smartAdvice.push({
      emoji: "💊",
      title: "Cycle-related fatigue management",
      description:
        "Persistent fatigue at your age could be related to hormonal shifts. Regular exercise, adequate sleep (7-8hrs), and vitamin B12 rich foods can help.",
      category: "lifestyle",
    });
  }

  if (phase === "menopause" && (freqMap.get("jointPain")?.count ?? 0) >= 2) {
    smartAdvice.push({
      emoji: "🧘",
      title: "Joint pain during menopause",
      description:
        "Estrogen decline can affect joints. Try gentle yoga, calcium-rich foods, and consult your doctor about supplements.",
      category: "exercise",
    });
  }

  if (phase === "family-planning" && (freqMap.get("stress")?.count ?? 0) >= 2) {
    smartAdvice.push({
      emoji: "🧘‍♀️",
      title: "Stress management for fertility",
      description:
        "High stress can affect fertility. Practice deep breathing, meditation, and ensure 7-8 hours of sleep.",
      category: "lifestyle",
    });
  }

  // Generic advice based on common patterns
  if (symptomFrequencies.length === 0 && daysLogged === 0) {
    smartAdvice.push({
      emoji: "📝",
      title: "Start logging in your Calendar",
      description:
        "No data found for this week. Log your symptoms daily in the Calendar to get personalized insights here!",
      category: "lifestyle",
    });
  }

  // ─── Preventive Tips ────────────────────────────────────────────────────
  const preventiveTips: PreventiveTip[] = [];

  if (hasCramps || phase === "puberty") {
    preventiveTips.push(
      { emoji: "💧", text: "Increase hydration before your cycle — aim for 8+ glasses/day" },
      { emoji: "🧂", text: "Reduce salty foods to minimize bloating and water retention" },
    );
  }

  if (hasFatigue) {
    preventiveTips.push(
      { emoji: "🥬", text: "Include iron-rich leafy greens in tomorrow's meals" },
      { emoji: "😴", text: "Aim for 7-8 hours of sleep to combat fatigue" },
    );
  }

  if (phase === "maternity") {
    preventiveTips.push(
      { emoji: "🚶‍♀️", text: "Take a 15-minute gentle walk daily for better circulation" },
      { emoji: "🍌", text: "Eat potassium-rich foods like bananas to reduce leg cramps" },
    );
  }

  if (phase === "menopause") {
    preventiveTips.push(
      { emoji: "🌡️", text: "Keep your bedroom cool to prevent night sweats" },
      { emoji: "🧘", text: "Practice 10 minutes of morning stretching for joint stiffness" },
    );
  }

  if (phase === "family-planning") {
    preventiveTips.push(
      { emoji: "📅", text: "Track your cycle consistently for better pattern recognition" },
      { emoji: "🥗", text: "Include folate-rich foods for preconception health" },
    );
  }

  // Always add general tips
  preventiveTips.push(
    { emoji: "🌞", text: "Get 15 minutes of morning sunlight for vitamin D and mood" },
  );

  return {
    dateRange,
    daysLogged,
    symptomFrequencies,
    insights,
    smartAdvice,
    preventiveTips,
    moodSummary,
  };
}
