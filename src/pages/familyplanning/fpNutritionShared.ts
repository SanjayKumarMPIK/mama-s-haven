import type { FPIntent } from "@/hooks/useFamilyPlanningProfile";
import type { FamilyPlanningEntry, HealthLogs } from "@/hooks/useHealthLog";

export const FP_NUTRITION_HOME = "/family-planning/nutrition-guide";

export const FP_NUTRITION_ACCENT = {
  gradient: "from-teal-500 to-emerald-400",
  bg: "bg-teal-50",
  text: "text-teal-700",
  border: "border-teal-200/60",
  cardBg: "bg-gradient-to-br from-teal-50 to-emerald-50",
  badge: "bg-teal-100 text-teal-700",
} as const;

const FP_SYMPTOM_LABELS: Record<string, string> = {
  irregularCycle: "Irregular cycle",
  ovulationPain: "Ovulation pain",
  moodChanges: "Mood changes",
  fatigue: "Fatigue",
  stress: "Stress",
  sleepIssues: "Sleep issues",
};

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getCutoffISO(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
}

export function getFPIntentMeta(intent: FPIntent) {
  if (intent === "ttc") {
    return {
      label: "Trying to Conceive",
      shortLabel: "Conception Support",
      emoji: "💕",
    };
  }

  if (intent === "avoid") {
    return {
      label: "Avoid Pregnancy",
      shortLabel: "Cycle Awareness",
      emoji: "🛡️",
    };
  }

  return {
    label: "Neutral Tracking",
    shortLabel: "Cycle Wellness",
    emoji: "📊",
  };
}

export interface FPRecentLogItem {
  dateISO: string;
  entry: FamilyPlanningEntry;
}

export interface FPRecentSummary {
  hasLogs: boolean;
  loggedDays: number;
  recentEntries: FPRecentLogItem[];
  avgSleepHours: number | null;
  avgHydrationGlasses: number | null;
  lowSleepDays: number;
  lowHydrationDays: number;
  symptomCounts: Record<string, number>;
  topSymptoms: string[];
  lastLoggedDate: string | null;
}

export function getRecentFPEntries(logs: HealthLogs, lookbackDays: number = 14): FPRecentLogItem[] {
  const todayISO = toISODate(new Date());
  const cutoffISO = getCutoffISO(lookbackDays);

  return Object.entries(logs)
    .filter(([dateISO, entry]) => entry.phase === "family-planning" && dateISO <= todayISO && dateISO >= cutoffISO)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dateISO, entry]) => ({ dateISO, entry: entry as FamilyPlanningEntry }));
}

export function summarizeFPLogs(logs: HealthLogs, lookbackDays: number = 14): FPRecentSummary {
  const recentEntries = getRecentFPEntries(logs, lookbackDays);
  const symptomCounts: Record<string, number> = {};
  const sleepValues: number[] = [];
  const hydrationValues: number[] = [];
  let lowSleepDays = 0;
  let lowHydrationDays = 0;

  for (const { entry } of recentEntries) {
    Object.entries(entry.symptoms ?? {}).forEach(([key, isActive]) => {
      if (isActive) {
        symptomCounts[key] = (symptomCounts[key] ?? 0) + 1;
      }
    });

    if (typeof entry.sleepHours === "number") {
      sleepValues.push(entry.sleepHours);
      if (entry.sleepHours < 6) lowSleepDays += 1;
    }

    if (typeof entry.hydrationGlasses === "number") {
      hydrationValues.push(entry.hydrationGlasses);
      if (entry.hydrationGlasses < 6) lowHydrationDays += 1;
    }
  }

  const topSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);

  return {
    hasLogs: recentEntries.length > 0,
    loggedDays: recentEntries.length,
    recentEntries,
    avgSleepHours: sleepValues.length > 0 ? Number((sleepValues.reduce((sum, value) => sum + value, 0) / sleepValues.length).toFixed(1)) : null,
    avgHydrationGlasses: hydrationValues.length > 0 ? Number((hydrationValues.reduce((sum, value) => sum + value, 0) / hydrationValues.length).toFixed(1)) : null,
    lowSleepDays,
    lowHydrationDays,
    symptomCounts,
    topSymptoms,
    lastLoggedDate: recentEntries[0]?.dateISO ?? null,
  };
}

export function getFPSymptomLabel(symptomId: string) {
  return FP_SYMPTOM_LABELS[symptomId] ?? symptomId;
}

export function getFamilyPlanningAffirmation(intent: FPIntent, summary: FPRecentSummary) {
  if (summary.lowSleepDays >= 2) {
    return intent === "ttc"
      ? "Steady rest and meals can support ovulation, energy, and conception readiness."
      : "A calmer sleep routine can support cycle awareness, energy, and overall wellbeing.";
  }

  if (summary.lowHydrationDays >= 2 || (summary.avgHydrationGlasses !== null && summary.avgHydrationGlasses < 6)) {
    return intent === "avoid"
      ? "Hydration and steady habits can support clearer cycle tracking and daily energy."
      : "Hydration and small daily routines can support your cycle, energy, and overall wellbeing.";
  }

  if ((summary.symptomCounts.fatigue ?? 0) >= 2) {
    return "Small daily choices can support your cycle, steady energy, and overall wellbeing.";
  }

  if (intent === "ttc") {
    return "Small daily choices can support ovulation, steady energy, and conception readiness.";
  }

  if (intent === "avoid") {
    return "Steady food, sleep, and cycle habits can support confident planning and wellbeing.";
  }

  return "Small daily choices can support your cycle, energy, and overall wellbeing.";
}
