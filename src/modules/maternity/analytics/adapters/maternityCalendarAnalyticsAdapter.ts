// ─── Maternity Calendar Analytics Adapter ─────────────────────────────────────
// Transforms Maternity Calendar entries into chart-ready analytics data
// STRICTLY isolated to Maternity Phase only

import type { MaternityEntry } from "@/hooks/useHealthLog";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SymptomTrendData {
  date: string;
  dayLabel: string;
  symptomCount: number;
}

export interface SleepTrendData {
  date: string;
  dayLabel: string;
  hours: number;
}

export interface MoodTrendData {
  date: string;
  dayLabel: string;
  moodScore: number;
  moodLabel: string;
}

export interface ActivityTrendData {
  date: string;
  dayLabel: string;
  activityLevel: "low" | "medium" | "active";
  activityScore: number;
}

export interface MaternityAnalyticsData {
  symptoms: SymptomTrendData[];
  sleep: SleepTrendData[];
  mood: MoodTrendData[];
  activity: ActivityTrendData[];
  hasData: boolean;
  // Menu counts for analytics menu
  symptomsCount: number;
  sleepCount: number;
  moodCount: number;
  activityCount: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getLast7Days(): { date: string; dayLabel: string }[] {
  const days: { date: string; dayLabel: string }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const date = d.toISOString().slice(0, 10);
    const dayLabel = dayNames[d.getDay()];
    days.push({ date, dayLabel });
  }
  
  return days;
}

function getMoodScore(mood: string | null): number {
  if (!mood) return 3;
  switch (mood) {
    case "Good": return 5;
    case "Okay": return 4;
    case "Low": return 2;
    default: return 3;
  }
}

function getMoodLabel(score: number): string {
  if (score >= 4.5) return "Happy";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Neutral";
  if (score >= 1.5) return "Low";
  return "Poor";
}

function getActivityLevel(entry: MaternityEntry): "low" | "medium" | "active" {
  try {
    // Derive activity from fatigue level and symptom count
    const fatigueScore = entry.fatigueLevel === "Low" ? 3 : entry.fatigueLevel === "Medium" ? 2 : 1;
    const symptomCount = Object.values(entry.symptoms || {}).filter(Boolean).length;
    
    const totalScore = fatigueScore + (symptomCount > 3 ? 1 : symptomCount > 0 ? 2 : 3);
    
    if (totalScore >= 5) return "active";
    if (totalScore >= 3) return "medium";
    return "low";
  } catch {
    return "low";
  }
}

function getActivityScore(level: "low" | "medium" | "active"): number {
  switch (level) {
    case "active": return 3;
    case "medium": return 2;
    case "low": return 1;
  }
}

// ─── Main Adapter Function ─────────────────────────────────────────────────────

/**
 * Transforms Maternity Calendar entries into chart-ready analytics data.
 * 
 * STRICTLY fetches ONLY from Maternity Calendar logs (maternity phase).
 * Does NOT touch other phases, global logs, or external data sources.
 * 
 * @param maternityLogs - Map of dateISO -> MaternityEntry from Maternity Calendar
 * @param days - Number of days to include in analytics (default: 7)
 * @returns Chart-ready analytics data for Symptoms, Sleep, Mood, and Activity trends
 */
export function getMaternityAnalyticsFromCalendar(
  maternityLogs: Record<string, MaternityEntry>,
  days: number = 7
): MaternityAnalyticsData {
  try {
    const lastDays = getLast7Days().slice(0, days);
    
    const symptoms: SymptomTrendData[] = [];
    const sleep: SleepTrendData[] = [];
    const mood: MoodTrendData[] = [];
    const activity: ActivityTrendData[] = [];

    for (const { date, dayLabel } of lastDays) {
      const entry = maternityLogs[date];

      // Symptoms Trend - from calendar symptom entries
      if (entry) {
        const symptomCount = Object.values(entry.symptoms || {}).filter(Boolean).length;
        symptoms.push({ date, dayLabel, symptomCount });
      } else {
        symptoms.push({ date, dayLabel, symptomCount: 0 });
      }

      // Sleep Trend - from calendar sleep logs
      if (entry?.sleepHours !== null && entry.sleepHours !== undefined) {
        sleep.push({ date, dayLabel, hours: entry.sleepHours });
      } else {
        sleep.push({ date, dayLabel, hours: 0 });
      }

      // Mood Trend - from calendar mood entries
      if (entry?.mood) {
        const moodScore = getMoodScore(entry.mood);
        mood.push({ date, dayLabel, moodScore, moodLabel: getMoodLabel(moodScore) });
      } else {
        mood.push({ date, dayLabel, moodScore: 3, moodLabel: "Neutral" });
      }

      // Activity Trend - derived from calendar fatigue and symptom data
      if (entry) {
        const activityLevel = getActivityLevel(entry);
        activity.push({ date, dayLabel, activityLevel, activityScore: getActivityScore(activityLevel) });
      } else {
        activity.push({ date, dayLabel, activityLevel: "low", activityScore: 1 });
      }
    }

    const hasData = Object.keys(maternityLogs).length > 0;

    // Calculate menu counts
    const symptomsCount = symptoms.reduce((sum, d) => sum + d.symptomCount, 0);
    const sleepCount = sleep.filter(d => d.hours > 0).length;
    const moodCount = mood.filter(d => d.moodScore !== 3).length;
    const activityCount = activity.filter(d => d.activityLevel === "active").length;

    return {
      symptoms,
      sleep,
      mood,
      activity,
      hasData,
      symptomsCount,
      sleepCount,
      moodCount,
      activityCount,
    };
  } catch (error) {
    console.error("Maternity Calendar Analytics Adapter error:", error);
    return {
      symptoms: [],
      sleep: [],
      mood: [],
      activity: [],
      hasData: false,
      symptomsCount: 0,
      sleepCount: 0,
      moodCount: 0,
      activityCount: 0,
    };
  }
}
