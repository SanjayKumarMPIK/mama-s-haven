export type CanonicalSymptom =
  | "fatigue" | "poorSleep" | "moodSwings" | "headaches" | "dizziness"
  | "hairFall" | "paleSkin" | "cramps" | "lowEnergy" | "drySkin"
  | "weakness" | "brainFog" | "cravings" | "brittleNails"
  | "muscleWeakness" | "bonePain" | "nausea" | "backPain"
  | "legCramps" | "swelling" | "heartburn" | "breathlessness"
  | "anxiety" | "stress" | "bloating" | "constipation"
  | "heavyPeriod" | "lowOutdoorActivity";

const CANONICAL: Record<string, CanonicalSymptom> = {};

function reg(key: string, canonical: CanonicalSymptom): void {
  CANONICAL[key] = canonical;
}

reg("fatigue", "fatigue");
reg("tiredness", "fatigue");
reg("exhaustion", "fatigue");
reg("lowStamina", "fatigue");
reg("_highFatigue", "fatigue");

reg("poorSleep", "poorSleep");
reg("sleepDisturbance", "poorSleep");
reg("sleepIssues", "poorSleep");
reg("sleepDifficulty", "poorSleep");
reg("sleepDeprivation", "poorSleep");
reg("insomnia", "poorSleep");
reg("_poorSleep", "poorSleep");

reg("moodSwings", "moodSwings");
reg("moodChanges", "moodSwings");
reg("moodiness", "moodSwings");
reg("irritability", "moodSwings");
reg("emotional", "moodSwings");
reg("_moodLow", "moodSwings");

reg("headaches", "headaches");
reg("headache", "headaches");
reg("migraine", "headaches");

reg("dizziness", "dizziness");
reg("lightheadedness", "dizziness");
reg("vertigo", "dizziness");

reg("hairFall", "hairFall");
reg("hairLoss", "hairFall");
reg("hairThinning", "hairFall");

reg("paleSkin", "paleSkin");
reg("_lowHydration", "paleSkin");

reg("cramps", "cramps");
reg("legCramps", "cramps");
reg("muscleCramps", "cramps");
reg("abdominalPain", "cramps");

reg("lowEnergy", "lowEnergy");
reg("lowStamina", "lowEnergy");
reg("_highFatigue", "lowEnergy");

reg("drySkin", "drySkin");

reg("weakness", "weakness");
reg("bodyAche", "weakness");

reg("brainFog", "brainFog");
reg("confusion", "brainFog");
reg("forgetfulness", "brainFog");
reg("memoryIssues", "brainFog");

reg("cravings", "cravings");
reg("foodCravings", "cravings");
reg("increasedAppetite", "cravings");

reg("brittleNails", "brittleNails");

reg("muscleWeakness", "muscleWeakness");
reg("muscleAches", "muscleWeakness");

reg("bonePain", "bonePain");
reg("jointPain", "bonePain");

reg("nausea", "nausea");
reg("morningSickness", "nausea");

reg("backPain", "backPain");

reg("swelling", "swelling");
reg("edema", "swelling");

reg("heartburn", "heartburn");
reg("acidReflux", "heartburn");
reg("acidity", "heartburn");

reg("breathlessness", "breathlessness");
reg("shortnessOfBreath", "breathlessness");
reg("difficultyBreathing", "breathlessness");

reg("anxiety", "anxiety");
reg("nervousness", "anxiety");

reg("stress", "stress");

reg("bloating", "bloating");

reg("constipation", "constipation");

reg("heavyPeriod", "heavyPeriod");

reg("lowOutdoorActivity", "lowOutdoorActivity");

export function normalizeSymptom(raw: string): CanonicalSymptom {
  return CANONICAL[raw] ?? raw as CanonicalSymptom;
}

export function normalizeSymptomMap(
  raw: Record<string, number>
): Record<CanonicalSymptom, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const canonical = normalizeSymptom(key);
    result[canonical] = Math.max(result[canonical] ?? 0, value);
  }
  return result as Record<CanonicalSymptom, number>;
}

export const ALL_CANONICAL_SYMPTOMS: CanonicalSymptom[] = [
  "fatigue", "poorSleep", "moodSwings", "headaches", "dizziness",
  "hairFall", "paleSkin", "cramps", "lowEnergy", "drySkin",
  "weakness", "brainFog", "cravings", "brittleNails",
  "muscleWeakness", "bonePain", "nausea", "backPain",
  "legCramps", "swelling", "heartburn", "breathlessness",
  "anxiety", "stress", "bloating", "constipation",
  "heavyPeriod", "lowOutdoorActivity",
];
