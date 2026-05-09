import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";

export interface SymptomWarning {
  symptomId: string;
  symptomName: string;
  emoji: string;
  triggerType: "consecutive-3" | "within-7d-4" | "within-30d-10";
  count: number;
  windowDays: number;
  details: string;
  warningId: string;
}

const SYMPTOM_LABELS: Record<string, string> = {
  nausea: "Nausea / Vomiting",
  fatigue: "Fatigue",
  breastTenderness: "Breast Tenderness",
  backPain: "Back Pain",
  moodSwings: "Mood Swings",
  headache: "Headache",
  dizziness: "Dizziness",
  swelling: "Swelling",
  sleepDisturbance: "Sleep Disturbance",
  frequentUrination: "Frequent Urination",
  foodAversions: "Food Aversions",
  increasedAppetite: "Increased Appetite",
  babyBumpGrowth: "Baby Bump Growth",
  fetalMovement: "Fetal Movement",
  skinChanges: "Skin Changes",
  mildSwelling: "Mild Swelling",
  shortnessOfBreath: "Shortness of Breath",
  practiceContractions: "Practice Contractions",
  sleepDifficulty: "Sleep Difficulty",
  heartburn: "Heartburn",
  breastPain: "Breast Pain",
  nipplePain: "Nipple Pain",
  lowMilkSupply: "Low Milk Supply",
  lowEnergy: "Low Energy",
  sleepDeprivation: "Sleep Deprivation",
  bodyAche: "Body Ache",
  cramps: "Cramps",
  bloating: "Bloating",
  foodCravings: "Food Cravings",
  irritability: "Irritability",
  sleepIssues: "Sleep Issues",
  anxiety: "Anxiety",
  brainFog: "Brain Fog",
  spotting: "Spotting",
  weakness: "Weakness",
  anxietyStress: "Anxiety / Stress",
  appetiteChanges: "Appetite Changes",
  moodChanges: "Mood Changes",
  stress: "Stress",
};

const SYMPTOM_EMOJI: Record<string, string> = {
  nausea: "🤢",
  fatigue: "😴",
  breastTenderness: "💗",
  backPain: "🦴",
  moodSwings: "🎭",
  headache: "🤕",
  dizziness: "💫",
  swelling: "💧",
  sleepDisturbance: "🌙",
  frequentUrination: "🚻",
  foodAversions: "🚫",
  increasedAppetite: "🍽️",
  babyBumpGrowth: "🤰",
  fetalMovement: "👶",
  skinChanges: "✨",
  mildSwelling: "💧",
  shortnessOfBreath: "😮‍💨",
  practiceContractions: "⚡",
  sleepDifficulty: "🌙",
  heartburn: "🔥",
  breastPain: "💗",
  nipplePain: "⚡",
  lowMilkSupply: "🍼",
  lowEnergy: "🔋",
  sleepDeprivation: "🥱",
  bodyAche: "🤕",
  cramps: "💢",
  bloating: "🎈",
  foodCravings: "🍪",
  irritability: "😠",
  sleepIssues: "🌙",
  anxiety: "😰",
  brainFog: "😶‍🌫️",
  spotting: "🩸",
  weakness: "🥀",
  anxietyStress: "😰",
  appetiteChanges: "🥗",
  moodChanges: "🎭",
  stress: "😰",
};

function getSymptomName(id: string): string {
  return SYMPTOM_LABELS[id] ?? id.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

function getSymptomEmoji(id: string): string {
  return SYMPTOM_EMOJI[id] ?? "📊";
}

function buildSymptomDateList(logs: HealthLogs): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "maternity") continue;
    const symptoms = (entry as MaternityEntry).symptoms;
    if (!symptoms) continue;

    for (const [symptomId, present] of Object.entries(symptoms)) {
      if (present) {
        let dates = map.get(symptomId);
        if (!dates) {
          dates = [];
          map.set(symptomId, dates);
        }
        dates.push(dateISO);
      }
    }
  }

  for (const dates of map.values()) {
    dates.sort();
  }

  return map;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function parseDate(dateISO: string): Date {
  return new Date(dateISO + "T12:00:00");
}

function daysBetween(a: string, b: string): number {
  return Math.round(Math.abs(parseDate(b).getTime() - parseDate(a).getTime()) / MS_PER_DAY);
}

const WARNINGS_KEYS: Record<string, { threshold: number; windowDays: number; key: SymptomWarning["triggerType"] }> = {
  "within-7d-4": { threshold: 4, windowDays: 7, key: "within-7d-4" },
  "within-30d-10": { threshold: 10, windowDays: 30, key: "within-30d-10" },
};

function checkConsecutive(
  symptomId: string,
  dates: string[],
  seen: Set<string>
): SymptomWarning | null {
  if (dates.length < 3) return null;

  for (let i = 0; i <= dates.length - 3; i++) {
    const d1 = parseDate(dates[i]);
    const d2 = parseDate(dates[i + 1]);
    const d3 = parseDate(dates[i + 2]);

    const diff1 = Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY);
    const diff2 = Math.round((d3.getTime() - d2.getTime()) / MS_PER_DAY);

    if (diff1 === 1 && diff2 === 1) {
      const warningId = `consecutive-3-${symptomId}`;
      if (seen.has(warningId)) continue;

      return {
        symptomId,
        symptomName: getSymptomName(symptomId),
        emoji: getSymptomEmoji(symptomId),
        triggerType: "consecutive-3",
        count: 3,
        windowDays: 3,
        details: `${getSymptomName(symptomId)} has been logged 3 consecutive days in a row.`,
        warningId,
      };
    }
  }

  return null;
}

function checkTimeWindow(
  symptomId: string,
  dates: string[],
  triggerKey: "within-7d-4" | "within-30d-10",
  seen: Set<string>
): SymptomWarning | null {
  const config = WARNINGS_KEYS[triggerKey];
  if (dates.length < config.threshold) return null;

  for (let i = 0; i <= dates.length - config.threshold; i++) {
    const startDate = dates[i];
    const endDate = dates[i + config.threshold - 1];
    const diff = daysBetween(startDate, endDate);

    if (diff < config.windowDays) {
      const warningId = `${triggerKey}-${symptomId}`;
      if (seen.has(warningId)) continue;

      return {
        symptomId,
        symptomName: getSymptomName(symptomId),
        emoji: getSymptomEmoji(symptomId),
        triggerType: config.key,
        count: config.threshold,
        windowDays: config.windowDays,
        details: `${getSymptomName(symptomId)} has occurred ${config.threshold} times within the last ${config.windowDays} days.`,
        warningId,
      };
    }
  }

  return null;
}

export function evaluateMaternitySymptomFrequency(
  logs: HealthLogs
): SymptomWarning[] {
  const symptomDates = buildSymptomDateList(logs);
  const seen = new Set<string>();
  const warnings: SymptomWarning[] = [];

  for (const [symptomId, dates] of symptomDates) {
    if (dates.length < 3) continue;

    const consecutive = checkConsecutive(symptomId, dates, seen);
    if (consecutive) {
      warnings.push(consecutive);
      seen.add(consecutive.warningId);
    }

    const window7d = checkTimeWindow(symptomId, dates, "within-7d-4", seen);
    if (window7d) {
      warnings.push(window7d);
      seen.add(window7d.warningId);
    }

    const window30d = checkTimeWindow(symptomId, dates, "within-30d-10", seen);
    if (window30d) {
      warnings.push(window30d);
      seen.add(window30d.warningId);
    }
  }

  return warnings.sort((a, b) => {
    const order: Record<string, number> = { "consecutive-3": 0, "within-7d-4": 1, "within-30d-10": 2 };
    return (order[a.triggerType] ?? 99) - (order[b.triggerType] ?? 99);
  });
}

export function shouldShowWarning(
  warnings: SymptomWarning[],
  dismissedWarnings: Set<string>
): SymptomWarning | null {
  for (const w of warnings) {
    if (!dismissedWarnings.has(w.warningId)) {
      return w;
    }
  }
  return null;
}
