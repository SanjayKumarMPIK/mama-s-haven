export type MaternityPhaseStage = "T1" | "T2" | "T3" | "postpartum";

export interface ConfigSymptom {
  id: string;
  label: string;
  emoji: string;
  category?: "physical" | "emotional" | "medical" | "recovery" | "digestive";
}

export const T1_CORE_SYMPTOMS: ConfigSymptom[] = [
  { id: "nausea", label: "Nausea", emoji: "🤢" },
  { id: "breastTenderness", label: "Breast tenderness", emoji: "💗" },
  { id: "foodAversions", label: "Food aversions", emoji: "🚫" },
  { id: "brainFog", label: "Brain fog", emoji: "😶‍🌫️" },
  { id: "irritability", label: "Irritability", emoji: "😠" },
  { id: "spotting", label: "Spotting", emoji: "🩸" },
];

export const T2_CORE_SYMPTOMS: ConfigSymptom[] = [
  { id: "fetalMovement", label: "Fetal movement", emoji: "👶" },
  { id: "babyBumpGrowth", label: "Baby bump growth", emoji: "🤰" },
  { id: "skinChanges", label: "Skin changes", emoji: "✨" },
  { id: "increasedAppetite", label: "Increased appetite", emoji: "🍽️" },
  { id: "mildSwelling", label: "Mild swelling", emoji: "💧" },
  { id: "backPain", label: "Back pain", emoji: "🦴" },
];

export const T3_CORE_SYMPTOMS: ConfigSymptom[] = [
  { id: "shortnessOfBreath", label: "Shortness of breath", emoji: "😮‍💨" },
  { id: "practiceContractions", label: "Practice contractions", emoji: "⚡" },
  { id: "heartburn", label: "Heartburn", emoji: "🔥" },
  { id: "sleepDifficulty", label: "Sleep difficulty", emoji: "🌙" },
  { id: "frequentUrination", label: "Frequent urination", emoji: "🚻" },
  { id: "swelling", label: "Swelling", emoji: "💧" },
];

export const POSTPARTUM_CORE_SYMPTOMS: ConfigSymptom[] = [
  { id: "breastPain", label: "Breast pain", emoji: "💗" },
  { id: "nipplePain", label: "Nipple pain", emoji: "⚡" },
  { id: "lowMilkSupply", label: "Low milk supply", emoji: "🍼" },
  { id: "lowEnergy", label: "Low energy", emoji: "🔋" },
  { id: "sleepDeprivation", label: "Sleep deprivation", emoji: "🥱" },
  { id: "bodyAche", label: "Body ache", emoji: "🤕" },
];

export const COMMON_CUSTOMIZABLE_SYMPTOMS: ConfigSymptom[] = [
  { id: "fatigue", label: "Fatigue", emoji: "😴", category: "physical" },
  { id: "weakness", label: "Weakness", emoji: "🥀", category: "physical" },
  { id: "dizziness", label: "Dizziness", emoji: "💫", category: "physical" },
  { id: "moodSwings", label: "Mood swings", emoji: "🎭", category: "emotional" },
  { id: "anxietyStress", label: "Anxiety / stress", emoji: "😰", category: "emotional" },
  { id: "cramps", label: "Cramps", emoji: "💢", category: "physical" },
  { id: "headache", label: "Headache", emoji: "🤕", category: "physical" },
  { id: "appetiteChanges", label: "Appetite changes", emoji: "🥗", category: "digestive" },
  { id: "bodyAche", label: "Body ache", emoji: "🤕", category: "physical" },
  { id: "backPain", label: "Back pain", emoji: "🦴", category: "physical" },
  { id: "frequentUrination", label: "Frequent urination", emoji: "🚻", category: "physical" },
  { id: "swelling", label: "Swelling", emoji: "💧", category: "physical" },
  { id: "sleepIssues", label: "Sleep issues", emoji: "🌙", category: "physical" },
  { id: "increasedAppetite", label: "Increased appetite", emoji: "🍽️", category: "digestive" },
];

export const MATERNITY_PHASE_CONFIG: Record<MaternityPhaseStage, ConfigSymptom[]> = {
  T1: T1_CORE_SYMPTOMS,
  T2: T2_CORE_SYMPTOMS,
  T3: T3_CORE_SYMPTOMS,
  postpartum: POSTPARTUM_CORE_SYMPTOMS,
};
