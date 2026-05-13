import { supabaseUserClient } from "@/lib/supabase-user";
import type { MenopauseEntry } from "@/hooks/useHealthLog";

export type TriggerOptionId =
  | "caffeine"
  | "spicy_food"
  | "stressful_day"
  | "poor_sleep"
  | "low_hydration"
  | "warm_weather"
  | "alcohol"
  | "no_obvious_trigger";

export interface MenopauseTriggerLog {
  date: string;
  triggers: TriggerOptionId[];
  notes?: string;
}

export interface CoolingPlanRecord {
  date: string;
  symptomFocus: "hot_flashes" | "night_sweats" | "both";
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  bothers: string[];
  supportStyle: "simple_reminders" | "food_tips" | "sleep_tips" | "environment_tips";
  planItems: string[];
  completedItems: string[];
}

export interface CalmRoutineRecord {
  id: string;
  moodState: "anxious" | "irritable" | "restless" | "overwhelmed" | "cannot_sleep";
  durationMinutes: 3 | 5 | 10;
  routineType: "breathing" | "gentle_stretch" | "quiet_reflection" | "mixed";
  generated_steps?: string[]; // Legacy sync support
  generatedSteps: string[];
  completed: boolean;
  createdAt: string;
}

export interface BrainFogNote {
  id: string;
  noteText: string;
  reminderDate?: string;
  createdAt: string;
}

export interface BrainFogTask {
  id: string;
  taskText: string;
  date: string;
  completed: boolean;
  createdAt: string;
}

export interface TriggerPatternInsight {
  trigger: TriggerOptionId;
  symptom: "hotFlashes" | "nightSweats" | "moodSwings" | "sleepDisturbance" | "fatigue";
  triggerDays: number;
  symptomDaysWithTrigger: number;
  rate: number;
  confidence: "Early pattern" | "Possible pattern" | "Stronger pattern";
  message: string;
}

export interface MenopauseCalendarLog {
  date: string;
  entry: MenopauseEntry;
}

export const TRIGGER_OPTIONS: { id: TriggerOptionId; label: string }[] = [
  { id: "caffeine", label: "Caffeine" },
  { id: "spicy_food", label: "Spicy food" },
  { id: "stressful_day", label: "Stressful day" },
  { id: "poor_sleep", label: "Poor sleep" },
  { id: "low_hydration", label: "Low hydration" },
  { id: "warm_weather", label: "Warm weather" },
  { id: "alcohol", label: "Alcohol" },
  { id: "no_obvious_trigger", label: "No obvious trigger" },
];

const STORAGE_KEYS = {
  triggerLogs: "trigger-logs",
  coolingPlans: "cooling-plans",
  calmRoutines: "calm-routines",
  brainFogNotes: "brain-fog-notes",
  brainFogTasks: "brain-fog-tasks",
} as const;

const TABLE_MAP: Record<keyof typeof STORAGE_KEYS, string> = {
  triggerLogs: "menopause_trigger_logs",
  coolingPlans: "menopause_cooling_plans",
  calmRoutines: "menopause_calm_routines",
  brainFogNotes: "menopause_brain_fog_notes",
  brainFogTasks: "menopause_brain_fog_tasks",
};

function storageKey(userId: string | undefined, key: keyof typeof STORAGE_KEYS) {
  return `ss-menopause-tools-${STORAGE_KEYS[key]}-${userId || "anonymous"}`;
}

export function readMenopauseToolData<T>(userId: string | undefined, key: keyof typeof STORAGE_KEYS, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey(userId, key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeMenopauseToolData<T>(userId: string | undefined, key: keyof typeof STORAGE_KEYS, value: T) {
  localStorage.setItem(storageKey(userId, key), JSON.stringify(value));
  
  if (userId && userId !== "anonymous") {
    const table = TABLE_MAP[key];
    const today = new Date().toISOString().slice(0, 10);

    if (key === "coolingPlans" && Array.isArray(value)) {
      const latest = value[0] as CoolingPlanRecord;
      if (latest && latest.date === today) {
        supabaseUserClient.from(table).upsert({
          user_id: userId,
          date: today,
          symptom_focus: latest.symptomFocus,
          time_of_day: latest.timeOfDay,
          bothers: latest.bothers,
          support_style: latest.supportStyle,
          plan_items: latest.planItems,
          completed_items: latest.completedItems
        }).then(({ error }) => { if (error) console.warn(`[menoTools] ${table} upsert failed:`, error.message); });
      }
    } else if (key === "triggerLogs" && Array.isArray(value)) {
      const latest = value[value.length - 1] as MenopauseTriggerLog;
      if (latest) {
        supabaseUserClient.from(table).upsert({
          user_id: userId,
          date: latest.date,
          triggers: latest.triggers,
          notes: latest.notes
        }).then(({ error }) => { if (error) console.warn(`[menoTools] ${table} upsert failed:`, error.message); });
      }
    } else if (key === "calmRoutines" && Array.isArray(value)) {
      const latest = value[0] as CalmRoutineRecord;
      if (latest) {
        supabaseUserClient.from(table).upsert({
          id: latest.id,
          user_id: userId,
          mood_state: latest.moodState,
          duration_minutes: latest.durationMinutes,
          routine_type: latest.routineType,
          generated_steps: latest.generatedSteps,
          completed: latest.completed,
          created_at: latest.createdAt
        }).then(({ error }) => { if (error) console.warn(`[menoTools] ${table} upsert failed:`, error.message); });
      }
    } else if (key === "brainFogNotes" && Array.isArray(value)) {
      const latest = value[0] as BrainFogNote;
      if (latest) {
        supabaseUserClient.from(table).upsert({
          id: latest.id,
          user_id: userId,
          note_text: latest.noteText,
          reminder_date: latest.reminderDate,
          created_at: latest.createdAt
        }).then(({ error }) => { if (error) console.warn(`[menoTools] ${table} upsert failed:`, error.message); });
      }
    } else if (key === "brainFogTasks" && Array.isArray(value)) {
      const latest = value[0] as BrainFogTask;
      if (latest) {
        supabaseUserClient.from(table).upsert({
          id: latest.id,
          user_id: userId,
          task_text: latest.taskText,
          date: latest.date,
          completed: latest.completed,
          created_at: latest.createdAt
        }).then(({ error }) => { if (error) console.warn(`[menoTools] ${table} upsert failed:`, error.message); });
      }
    }
  }
}

export async function fetchSyncedToolData(userId: string | undefined, key: keyof typeof STORAGE_KEYS) {
  if (!userId || userId === "anonymous") return null;
  const table = TABLE_MAP[key];
  const orderCol = (key === "triggerLogs" || key === "coolingPlans") ? "date" : "created_at";
  const { data, error } = await supabaseUserClient
    .from(table)
    .select("*")
    .eq("user_id", userId)
    .order(orderCol, { ascending: false });
  if (error) {
    console.warn(`[menopauseTools] fetch ${table} failed:`, error.message);
    return null;
  }
  return data;
}

export function analyzeTriggerPatterns(
  triggerLogs: MenopauseTriggerLog[],
  calendarLogs: MenopauseCalendarLog[],
): TriggerPatternInsight[] {
  const recentTriggerLogs = triggerLogs.slice(-30);
  const entriesByDate = new Map(calendarLogs.map((log) => [log.date, log.entry]));
  const insights: TriggerPatternInsight[] = [];

  const symptomRules: Array<{
    key: TriggerPatternInsight["symptom"];
    label: string;
    matches: (entry: MenopauseEntry) => boolean;
  }> = [
    { key: "hotFlashes", label: "Hot flashes", matches: (entry) => !!entry.symptoms.hotFlashes },
    { key: "nightSweats", label: "Night sweats", matches: (entry) => !!entry.symptoms.nightSweats },
    { key: "moodSwings", label: "Mood changes", matches: (entry) => !!entry.symptoms.moodSwings || entry.mood === "Low" },
    { key: "sleepDisturbance", label: "Sleep difficulty", matches: (entry) => !!entry.symptoms.sleepDisturbance || (entry.sleepHours ?? 7) < 6 },
    { key: "fatigue", label: "Fatigue", matches: (entry) => !!entry.symptoms.fatigue },
  ];

  for (const trigger of TRIGGER_OPTIONS) {
    if (trigger.id === "no_obvious_trigger") continue;
    const daysWithTrigger = recentTriggerLogs.filter((log) => log.triggers.includes(trigger.id));
    if (daysWithTrigger.length < 2) continue;

    for (const symptom of symptomRules) {
      const symptomDaysWithTrigger = daysWithTrigger.filter((log) => {
        const entry = entriesByDate.get(log.date);
        return entry ? symptom.matches(entry) : false;
      }).length;

      if (symptomDaysWithTrigger < 2) continue;

      const rate = symptomDaysWithTrigger / daysWithTrigger.length;
      const confidence = rate >= 0.75 && symptomDaysWithTrigger >= 3
        ? "Stronger pattern"
        : rate >= 0.55
          ? "Possible pattern"
          : "Early pattern";

      insights.push({
        trigger: trigger.id,
        symptom: symptom.key,
        triggerDays: daysWithTrigger.length,
        symptomDaysWithTrigger,
        rate,
        confidence,
        message: `${symptom.label} appeared more often on days when ${trigger.label.toLowerCase()} was logged.`,
      });
    }
  }

  return insights.sort((a, b) => b.rate - a.rate || b.symptomDaysWithTrigger - a.symptomDaysWithTrigger);
}

export function countRecentCalendarPatterns(calendarLogs: MenopauseCalendarLog[]) {
  const recent = calendarLogs.slice(-14);
  return {
    nightSweatDays: recent.filter((log) => log.entry.symptoms.nightSweats).length,
    hotFlashDays: recent.filter((log) => log.entry.symptoms.hotFlashes).length,
    sleepDifficultyDays: recent.filter((log) => log.entry.symptoms.sleepDisturbance || (log.entry.sleepHours ?? 7) < 6).length,
    lowMoodDays: recent.filter((log) => log.entry.symptoms.moodSwings || log.entry.mood === "Low").length,
  };
}

export function buildCoolingPlan(
  input: Pick<CoolingPlanRecord, "symptomFocus" | "timeOfDay" | "bothers" | "supportStyle">,
  calendarLogs: MenopauseCalendarLog[],
): string[] {
  const summary = countRecentCalendarPatterns(calendarLogs);
  const items = new Set<string>();

  items.add("Keep a water bottle nearby and sip regularly through the day.");

  if (input.symptomFocus === "night_sweats" || input.symptomFocus === "both" || summary.nightSweatDays >= 3 || input.timeOfDay === "night") {
    items.add("Keep the bedroom cooler before sleep and use breathable bedding.");
    items.add("Choose lighter nightwear and keep a spare layer nearby.");
  }

  if (input.symptomFocus === "hot_flashes" || input.symptomFocus === "both" || summary.hotFlashDays >= 3) {
    items.add("Pause for a cooling break when you notice the first sign of heat rising.");
  }

  if (input.bothers.includes("Spicy food") || input.supportStyle === "food_tips") {
    items.add("Prefer lighter meals and reduce spicy food later in the day.");
  }
  if (input.bothers.includes("Stress") || input.supportStyle === "simple_reminders") {
    items.add("Set one calm pause reminder for the time symptoms usually build.");
  }
  if (input.bothers.includes("Poor sleep") || input.supportStyle === "sleep_tips" || summary.sleepDifficultyDays >= 3) {
    items.add("Start a quieter wind-down routine 30 minutes before bed.");
  }
  if (input.bothers.includes("Heat") || input.bothers.includes("Heavy clothing") || input.supportStyle === "environment_tips") {
    items.add("Choose lighter layers and improve airflow where you spend most of the day.");
  }

  items.add(input.timeOfDay === "night" ? "Log tonight's symptoms tomorrow morning to refine your plan." : "Log today's symptoms this evening to refine your plan.");

  return Array.from(items).slice(0, 5);
}

export function buildCalmRoutine(
  moodState: CalmRoutineRecord["moodState"],
  durationMinutes: CalmRoutineRecord["durationMinutes"],
  routineType: CalmRoutineRecord["routineType"],
  calendarLogs: MenopauseCalendarLog[],
): string[] {
  const summary = countRecentCalendarPatterns(calendarLogs);
  const sleepBias = summary.sleepDifficultyDays >= 3;
  const moodBias = summary.lowMoodDays >= 3;

  const steps: string[] = [];
  if (routineType === "breathing" || routineType === "mixed" || moodState === "anxious" || moodState === "overwhelmed") {
    steps.push("Slow your breathing with four gentle inhales and longer exhales.");
  }
  if (routineType === "gentle_stretch" || routineType === "mixed" || moodState === "restless" || moodState === "irritable") {
    steps.push("Roll your shoulders, relax your jaw, and release neck tension.");
  }
  if (routineType === "quiet_reflection" || routineType === "mixed" || moodBias) {
    steps.push("Write one grounding thought or one thing that feels manageable right now.");
  }
  if (sleepBias || moodState === "cannot_sleep") {
    steps.push("Dim the lights, reduce stimulation, and let your body settle before the next task.");
  }
  steps.push("Sip water slowly and check in with how your body feels after the pause.");

  if (durationMinutes === 3) return steps.slice(0, 3);
  if (durationMinutes === 5) return steps.slice(0, 4);
  return steps.slice(0, 5);
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildMemorySequence() {
  const pool = ["tea", "keys", "glass", "book", "plant", "clock", "scarf", "apple", "lamp", "phone"];
  const words = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
  return {
    prompt: "Study this short sequence, then type it back in the same order.",
    answer: words.join(", "),
    words,
  };
}

export function buildWordAssociationPrompt() {
  const prompts = ["calm", "focus", "home", "morning", "clear", "steady"];
  return prompts[Math.floor(Math.random() * prompts.length)];
}
