/**
 * phaseSymptomConfigs.ts
 *
 * Phase-specific symptom configurations for the global symptoms engine.
 * Each phase defines its own core symptoms, predefined library, and categories.
 */

import type { Phase } from "@/hooks/usePhase";

// Extended phase type to include maternity sub-phases
export type ExtendedPhase = Phase | "postpartum" | "premature";

export type SymptomCategory = 
  | "recovery" 
  | "mental" 
  | "period" 
  | "breastfeeding" 
  | "medical"
  | "physical"
  | "emotional"
  | "hormonal"
  | "skin"
  | "digestive";

export interface PredefinedSymptom {
  id: string;
  name: string;
  category: SymptomCategory;
}

export interface ActiveSymptom {
  id: string;
  name: string;
  isCore: boolean;
}

export interface PhaseSymptomConfig {
  phase: ExtendedPhase;
  coreSymptoms: ActiveSymptom[];
  predefinedLibrary: PredefinedSymptom[];
  maxActiveSymptoms: number;
  localStorageKey: string;
}

// ─── Maternity/Pregnancy Configuration ───────────────────────────────────────

const MATERNITY_CORE: ActiveSymptom[] = [
  { id: "nausea", name: "Nausea", isCore: true },
  { id: "fatigue", name: "Fatigue", isCore: true },
  { id: "swelling", name: "Swelling", isCore: true },
  { id: "cramps", name: "Cramps", isCore: true },
  { id: "back_pain", name: "Back Pain", isCore: true },
  { id: "headache", name: "Headache", isCore: true },
];

const MATERNITY_LIBRARY: PredefinedSymptom[] = [
  // Physical
  { id: "dizziness", name: "Dizziness", category: "physical" },
  { id: "shortness_of_breath", name: "Shortness of Breath", category: "physical" },
  { id: "heartburn", name: "Heartburn", category: "digestive" },
  { id: "constipation", name: "Constipation", category: "digestive" },
  { id: "frequent_urination", name: "Frequent Urination", category: "physical" },
  
  // Emotional
  { id: "mood_swings", name: "Mood Swings", category: "emotional" },
  { id: "anxiety", name: "Anxiety", category: "mental" },
  { id: "stress", name: "Stress", category: "mental" },
  { id: "irritability", name: "Irritability", category: "emotional" },
  
  // Hormonal
  { id: "hot_flashes", name: "Hot Flashes", category: "hormonal" },
  { id: "breast_tenderness", name: "Breast Tenderness", category: "hormonal" },
  
  // Skin
  { id: "acne", name: "Acne", category: "skin" },
  { id: "stretch_marks", name: "Stretch Marks", category: "skin" },
];

// ─── Postpartum Configuration ───────────────────────────────────────────────

const POSTPARTUM_CORE: ActiveSymptom[] = [
  { id: "bleeding", name: "Bleeding", isCore: true },
  { id: "pain", name: "Pain", isCore: true },
  { id: "mood", name: "Mood", isCore: true },
  { id: "energy", name: "Energy", isCore: true },
  { id: "breast_health", name: "Breast Health", isCore: true },
  { id: "pelvic_health", name: "Pelvic Health", isCore: true },
];

const POSTPARTUM_LIBRARY: PredefinedSymptom[] = [
  // Recovery
  { id: "back_pain", name: "Back Pain", category: "recovery" },
  { id: "swelling", name: "Swelling", category: "recovery" },
  { id: "scar_pain", name: "Scar Pain", category: "recovery" },
  { id: "body_ache", name: "Body Ache", category: "recovery" },
  { id: "dizziness", name: "Dizziness", category: "recovery" },

  // Mental
  { id: "stress", name: "Stress", category: "mental" },
  { id: "anxiety", name: "Anxiety", category: "mental" },
  { id: "brain_fog", name: "Brain Fog", category: "mental" },
  { id: "irritability", name: "Irritability", category: "mental" },

  // Period Related
  { id: "spotting", name: "Spotting", category: "period" },
  { id: "cramps", name: "Cramps", category: "period" },
  { id: "cycle_irregularity", name: "Cycle Irregularity", category: "period" },

  // Breastfeeding
  { id: "milk_supply", name: "Milk Supply", category: "breastfeeding" },
  { id: "nipple_pain", name: "Nipple Pain", category: "breastfeeding" },
  { id: "engorgement", name: "Engorgement", category: "breastfeeding" },

  // Medical Monitoring
  { id: "fever", name: "Fever", category: "medical" },
  { id: "chills", name: "Chills", category: "medical" },
  { id: "headache", name: "Headache", category: "medical" },
  { id: "appetite_changes", name: "Appetite Changes", category: "medical" },
  { id: "sleep_quality", name: "Sleep Quality", category: "medical" },
];

// ─── Premature Configuration ─────────────────────────────────────────────────

const PREMATURE_CORE: ActiveSymptom[] = [
  { id: "contractions", name: "Contractions", isCore: true },
  { id: "pelvic_pressure", name: "Pelvic Pressure", isCore: true },
  { id: "spotting", name: "Spotting", isCore: true },
  { id: "back_pain", name: "Back Pain", isCore: true },
  { id: "mood", name: "Mood", isCore: true },
  { id: "energy", name: "Energy", isCore: true },
];

const PREMATURE_LIBRARY: PredefinedSymptom[] = [
  // Physical
  { id: "cramping", name: "Cramping", category: "physical" },
  { id: "fluid_leak", name: "Fluid Leak", category: "medical" },
  { id: "vaginal_discharge", name: "Vaginal Discharge", category: "medical" },
  { id: "dizziness", name: "Dizziness", category: "physical" },
  
  // Emotional
  { id: "anxiety", name: "Anxiety", category: "mental" },
  { id: "stress", name: "Stress", category: "mental" },
  { id: "fear", name: "Fear", category: "emotional" },
  
  // Medical
  { id: "fever", name: "Fever", category: "medical" },
  { id: "headache", name: "Headache", category: "medical" },
  { id: "nausea", name: "Nausea", category: "digestive" },
];

// ─── Menopause Configuration ───────────────────────────────────────────────

const MENOPAUSE_CORE: ActiveSymptom[] = [
  { id: "hot_flashes", name: "Hot Flashes", isCore: true },
  { id: "night_sweats", name: "Night Sweats", isCore: true },
  { id: "mood_swings", name: "Mood Swings", isCore: true },
  { id: "sleep_disturbance", name: "Sleep Disturbance", isCore: true },
  { id: "joint_pain", name: "Joint Pain", isCore: true },
  { id: "fatigue", name: "Fatigue", isCore: true },
];

const MENOPAUSE_LIBRARY: PredefinedSymptom[] = [
  // Hormonal
  { id: "irregular_periods", name: "Irregular Periods", category: "hormonal" },
  { id: "vaginal_dryness", name: "Vaginal Dryness", category: "hormonal" },
  { id: "weight_gain", name: "Weight Gain", category: "hormonal" },
  
  // Emotional
  { id: "anxiety", name: "Anxiety", category: "mental" },
  { id: "depression", name: "Depression", category: "mental" },
  { id: "irritability", name: "Irritability", category: "emotional" },
  { id: "memory_lapse", name: "Memory Lapse", category: "mental" },
  
  // Physical
  { id: "headache", name: "Headache", category: "physical" },
  { id: "muscle_aches", name: "Muscle Aches", category: "physical" },
  { id: "bloating", name: "Bloating", category: "digestive" },
  
  // Skin
  { id: "dry_skin", name: "Dry Skin", category: "skin" },
  { id: "hair_thinning", name: "Hair Thinning", category: "skin" },
];

// ─── Puberty Configuration ───────────────────────────────────────────────────

const PUBERTY_CORE: ActiveSymptom[] = [
  { id: "cramps", name: "Cramps", isCore: true },
  { id: "fatigue", name: "Fatigue", isCore: true },
  { id: "mood_swings", name: "Mood Swings", isCore: true },
  { id: "headache", name: "Headache", isCore: true },
  { id: "acne", name: "Acne", isCore: true },
  { id: "breast_tenderness", name: "Breast Tenderness", isCore: true },
];

const PUBERTY_LIBRARY: PredefinedSymptom[] = [
  // Physical
  { id: "back_pain", name: "Back Pain", category: "physical" },
  { id: "bloating", name: "Bloating", category: "digestive" },
  { id: "nausea", name: "Nausea", category: "digestive" },
  { id: "dizziness", name: "Dizziness", category: "physical" },
  
  // Emotional
  { id: "anxiety", name: "Anxiety", category: "mental" },
  { id: "stress", name: "Stress", category: "mental" },
  { id: "irritability", name: "Irritability", category: "emotional" },
  { id: "emotional_changes", name: "Emotional Changes", category: "emotional" },
  
  // Skin
  { id: "oily_skin", name: "Oily Skin", category: "skin" },
  { id: "hair_changes", name: "Hair Changes", category: "skin" },
  
  // Period Related
  { id: "heavy_flow", name: "Heavy Flow", category: "period" },
  { id: "irregular_cycle", name: "Irregular Cycle", category: "period" },
];

// ─── Phase Configuration Map ───────────────────────────────────────────────

const PHASE_CONFIGS: Record<ExtendedPhase, PhaseSymptomConfig> = {
  maternity: {
    phase: "maternity",
    coreSymptoms: MATERNITY_CORE,
    predefinedLibrary: MATERNITY_LIBRARY,
    maxActiveSymptoms: 6,
    localStorageKey: "swasthyasakhi_maternity_symptoms",
  },
  postpartum: {
    phase: "postpartum",
    coreSymptoms: POSTPARTUM_CORE,
    predefinedLibrary: POSTPARTUM_LIBRARY,
    maxActiveSymptoms: 6,
    localStorageKey: "swasthyasakhi_postpartum_symptoms",
  },
  premature: {
    phase: "premature",
    coreSymptoms: PREMATURE_CORE,
    predefinedLibrary: PREMATURE_LIBRARY,
    maxActiveSymptoms: 6,
    localStorageKey: "swasthyasakhi_premature_symptoms",
  },
  menopause: {
    phase: "menopause",
    coreSymptoms: MENOPAUSE_CORE,
    predefinedLibrary: MENOPAUSE_LIBRARY,
    maxActiveSymptoms: 6,
    localStorageKey: "swasthyasakhi_menopause_symptoms",
  },
  puberty: {
    phase: "puberty",
    coreSymptoms: PUBERTY_CORE,
    predefinedLibrary: PUBERTY_LIBRARY,
    maxActiveSymptoms: 6,
    localStorageKey: "swasthyasakhi_puberty_symptoms",
  },
  "family-planning": {
    phase: "family-planning",
    coreSymptoms: [
      { id: "irregular_cycle", name: "Irregular Cycle", isCore: true },
      { id: "ovulation_pain", name: "Ovulation Pain", isCore: true },
      { id: "mood_changes", name: "Mood Changes", isCore: true },
      { id: "fatigue", name: "Fatigue", isCore: true },
      { id: "stress", name: "Stress", isCore: true },
      { id: "sleep_issues", name: "Sleep Issues", isCore: true },
    ],
    predefinedLibrary: [
      // Cycle & Reproductive
      { id: "spotting", name: "Spotting", category: "period" },
      { id: "heavy_bleeding", name: "Heavy Bleeding", category: "period" },
      { id: "missed_period", name: "Missed Period", category: "period" },
      { id: "cervical_mucus_changes", name: "Cervical Mucus Changes", category: "period" },

      // Hormonal
      { id: "acne", name: "Acne", category: "hormonal" },
      { id: "hair_fall", name: "Hair Fall", category: "hormonal" },
      { id: "hot_flashes", name: "Hot Flashes", category: "hormonal" },
      { id: "low_libido", name: "Low Libido", category: "hormonal" },

      // Mood
      { id: "anxiety", name: "Anxiety", category: "mental" },
      { id: "irritability", name: "Irritability", category: "emotional" },
      { id: "brain_fog", name: "Brain Fog", category: "mental" },

      // Physical
      { id: "headache", name: "Headache", category: "physical" },
      { id: "dizziness", name: "Dizziness", category: "physical" },

      // Digestive
      { id: "bloating", name: "Bloating", category: "digestive" },
      { id: "constipation", name: "Constipation", category: "digestive" },
      { id: "cravings", name: "Cravings", category: "digestive" },
    ],
    maxActiveSymptoms: 6,
    localStorageKey: "swasthyasakhi_family_planning_symptoms",
  },
};

/**
 * Get symptom configuration for a specific phase
 */
export function getPhaseSymptomConfig(phase: ExtendedPhase): PhaseSymptomConfig {
  return PHASE_CONFIGS[phase] || PHASE_CONFIGS.maternity; // Default to maternity
}

/**
 * Get all available phases
 */
export function getAllPhases(): ExtendedPhase[] {
  return Object.keys(PHASE_CONFIGS) as ExtendedPhase[];
}
