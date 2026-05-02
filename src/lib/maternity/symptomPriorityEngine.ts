/**
 * symptomPriorityEngine.ts
 *
 * Medical-condition-aware symptom prioritization engine for Maternity phase.
 * Injects condition-specific symptoms into trimester core symptoms based on user's medical conditions.
 *
 * ⚠️  Scoped ONLY to: Maternity phase → Symptom prioritization
 * Do NOT import in Puberty, Family Planning, or Menopause modules.
 */

import type { Trimester, TrimesterSymptom } from "../maternityTrimesterData";

// ─── Medical Condition to Symptom Mappings ────────────────────────────────────────

export interface ConditionSymptom {
  id: string;
  label: string;
  emoji: string;
}

export const CONDITION_SYMPTOMS: Record<string, ConditionSymptom[]> = {
  "Hypothyroidism": [
    { id: "weight_gain", label: "Weight Gain", emoji: "⚖️" },
    { id: "cold_sensitivity", label: "Cold Sensitivity", emoji: "🥶" },
  ],
  "Hyperthyroidism": [
    { id: "weight_loss", label: "Weight Loss", emoji: "📉" },
    { id: "rapid_heartbeat", label: "Rapid Heartbeat", emoji: "💓" },
  ],
  "PCOD": [
    { id: "bloating", label: "Bloating", emoji: "🎈" },
    { id: "pelvic_discomfort", label: "Pelvic Discomfort", emoji: "⚡" },
  ],
  "Polycystic Ovary Syndrome": [
    { id: "excess_hair_growth", label: "Excess Hair Growth", emoji: "🧔" },
  ],
  "Diabetes": [
    { id: "excess_thirst", label: "Excess Thirst", emoji: "💧" },
    { id: "hunger_spikes", label: "Hunger Spikes", emoji: "🍽️" },
  ],
  "Anemia": [
    { id: "dizziness", label: "Dizziness", emoji: "😵" },
    { id: "weakness", label: "Weakness", emoji: "💪" },
  ],
  "Osteoporosis": [
    { id: "bone_pain", label: "Bone Pain", emoji: "🦴" },
    { id: "weak_bone", label: "Weak Bone", emoji: "🦴" },
  ],
};

// ─── Symptom Priority Order (lower index = higher priority) ─────────────────────

// Define priority order for default trimester symptoms
// Symptoms at the end are considered lower priority and will be replaced first
const SYMPTOM_PRIORITY: Record<string, number> = {
  // High priority symptoms (keep if possible)
  nausea: 1,
  fatigue: 2,
  breastTenderness: 3,
  fetalMovement: 4,
  shortnessOfBreath: 5,
  practiceContractions: 6,
  
  // Medium priority
  frequentUrination: 7,
  moodSwings: 8,
  babyBumpGrowth: 9,
  backPain: 10,
  sleepDifficulty: 11,
  heartburn: 12,
  
  // Lower priority (replace first)
  foodAversions: 13,
  increasedAppetite: 14,
  skinChanges: 15,
  mildSwelling: 16,
  swelling: 17,
};

// ─── Engine Types ───────────────────────────────────────────────────────────────

export interface PrioritizedSymptomsResult {
  coreSymptoms: TrimesterSymptom[];
  customizableSymptoms: TrimesterSymptom[];
}

export const PREMATURE_CORE_SYMPTOMS: TrimesterSymptom[] = [
  { id: "breastPain", label: "Breast pain", emoji: "💗" },
  { id: "nipplePain", label: "Nipple pain", emoji: "⚡" },
  { id: "lowMilkSupply", label: "Low milk supply", emoji: "🍼" },
  { id: "lowEnergy", label: "Low energy", emoji: "🔋" },
  { id: "sleepDeprivation", label: "Sleep deprivation", emoji: "🥱" },
  { id: "bodyAche", label: "Body ache", emoji: "🤕" },
];

export interface SymptomPriorityEngineInput {
  trimester: Trimester;
  medicalConditions: string[];
  defaultSymptoms: TrimesterSymptom[];
  pregnancyWeek?: number;
}

// ─── Core Engine Function ───────────────────────────────────────────────────────

/**
 * Generates prioritized symptoms based on medical conditions.
 * 
 * Algorithm:
 * 1. Load trimester default symptoms
 * 2. Get condition-specific symptoms from user's medical conditions
 * 3. Sort default symptoms by priority (lower priority first for replacement)
 * 4. Remove lowest-priority symptoms to make room for condition symptoms
 * 5. Inject condition symptoms, avoiding duplicates
 * 6. Move removed symptoms to customizable pool
 * 7. Return exactly 6 core symptoms
 */
export function generatePrioritizedSymptoms(
  input: SymptomPriorityEngineInput
): PrioritizedSymptomsResult {
  const { trimester, medicalConditions, defaultSymptoms, pregnancyWeek } = input;

  const isPrematureCare = pregnancyWeek !== undefined && pregnancyWeek >= 32;
  
  if (isPrematureCare) {
    // ─── Premature Care Pipeline ──────────────────────────────────────────────
    // 1. Core symptoms are exactly the PREMATURE_CORE_SYMPTOMS
    const coreSymptoms = [...PREMATURE_CORE_SYMPTOMS];
    const coreIds = new Set(coreSymptoms.map(s => s.id));

    // 2. Build the customizable pool from default symptoms and condition symptoms
    const customizablePool: TrimesterSymptom[] = [];
    
    // Add default symptoms (if not in core)
    for (const def of defaultSymptoms) {
      if (!coreIds.has(def.id)) {
        customizablePool.push(def);
        coreIds.add(def.id); // add to seen to avoid duplicates later
      }
    }

    // Add condition symptoms (if not in core or already in pool)
    for (const condition of medicalConditions) {
      const syms = CONDITION_SYMPTOMS[condition];
      if (syms) {
        for (const sym of syms) {
          if (!coreIds.has(sym.id)) {
            customizablePool.push({ id: sym.id, label: sym.label, emoji: sym.emoji });
            coreIds.add(sym.id);
          }
        }
      }
    }

    return {
      coreSymptoms,
      customizableSymptoms: customizablePool,
    };
  }

  // ─── Standard Trimester Pipeline ──────────────────────────────────────────
  const defaultIds = new Set(defaultSymptoms.map(s => s.id));

  // Step 1: Build round-robin picking structure
  const conditionQueues: ConditionSymptom[][] = [];
  const usedConditionSymptomIds = new Set<string>();

  for (const condition of medicalConditions) {
    const symptoms = CONDITION_SYMPTOMS[condition];
    if (symptoms) {
      const queue: ConditionSymptom[] = [];
      for (const sym of symptoms) {
        if (!defaultIds.has(sym.id) && !usedConditionSymptomIds.has(sym.id)) {
          queue.push(sym);
          usedConditionSymptomIds.add(sym.id);
        }
      }
      if (queue.length > 0) {
        conditionQueues.push(queue);
      }
    }
  }

  // Step 2: Pick symptoms round-robin to ensure fairness across medical conditions
  const conditionSymptomsToInject: ConditionSymptom[] = [];
  const conditionSymptomsToCustomizable: ConditionSymptom[] = [];

  let picking = true;
  while (picking) {
    let pickedInRound = false;
    for (const queue of conditionQueues) {
      if (conditionSymptomsToInject.length >= 6) {
        picking = false;
        break; // Max slots filled
      }
      if (queue.length > 0) {
        conditionSymptomsToInject.push(queue.shift()!);
        pickedInRound = true;
      }
    }
    if (!pickedInRound) {
      picking = false;
    }
  }

  // Step 3: Move all remaining condition symptoms to customizable pool
  for (const queue of conditionQueues) {
    while (queue.length > 0) {
      conditionSymptomsToCustomizable.push(queue.shift()!);
    }
  }

  // If no condition symptoms to inject, return defaults unchanged
  if (conditionSymptomsToInject.length === 0) {
    return {
      coreSymptoms: defaultSymptoms,
      customizableSymptoms: conditionSymptomsToCustomizable.map(s => ({
        id: s.id,
        label: s.label,
        emoji: s.emoji,
      })),
    };
  }

  // Step 4: Sort default symptoms by priority (ascending = higher priority)
  const sortedDefaults = [...defaultSymptoms].sort((a, b) => {
    const priorityA = SYMPTOM_PRIORITY[a.id] ?? 999;
    const priorityB = SYMPTOM_PRIORITY[b.id] ?? 999;
    return priorityA - priorityB;
  });

  // Calculate how many default symptoms to replace
  const symptomsToReplace = Math.min(conditionSymptomsToInject.length, sortedDefaults.length);

  // Remove lowest-priority symptoms
  const removedSymptoms: TrimesterSymptom[] = [];
  const keepCount = sortedDefaults.length - symptomsToReplace;
  const remainingDefaults = sortedDefaults.slice(0, keepCount);
  removedSymptoms.push(...sortedDefaults.slice(keepCount));

  // Step 5: Build final core symptoms
  const coreSymptoms: TrimesterSymptom[] = [...remainingDefaults];

  for (const conditionSymptom of conditionSymptomsToInject) {
    if (coreSymptoms.length < 6) {
      coreSymptoms.push({
        id: conditionSymptom.id,
        label: conditionSymptom.label,
        emoji: conditionSymptom.emoji,
      });
    }
  }

  // Ensure we have exactly 6 symptoms
  while (coreSymptoms.length < 6 && removedSymptoms.length > 0) {
    const restored = removedSymptoms.shift();
    if (restored) {
      coreSymptoms.push(restored);
    }
  }
  while (coreSymptoms.length > 6) {
    coreSymptoms.pop();
  }

  // Step 6: Build customizable symptoms pool (removed defaults + overflow condition symptoms)
  const customizableSymptoms: TrimesterSymptom[] = [
    ...removedSymptoms,
    ...conditionSymptomsToCustomizable.map(s => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
    })),
  ];

  return {
    coreSymptoms,
    customizableSymptoms,
  };
}

// ─── Helper Functions ───────────────────────────────────────────────────────────

/**
 * Get all condition-specific symptoms for a given medical condition
 */
export function getSymptomsForCondition(condition: string): ConditionSymptom[] {
  return CONDITION_SYMPTOMS[condition] ?? [];
}

/**
 * Check if a symptom ID is a condition-specific symptom
 */
export function isConditionSymptom(symptomId: string): boolean {
  for (const symptoms of Object.values(CONDITION_SYMPTOMS)) {
    if (symptoms.some(s => s.id === symptomId)) {
      return true;
    }
  }
  return false;
}

/**
 * Get the medical condition that produces a given symptom
 */
export function getConditionForSymptom(symptomId: string): string | null {
  for (const [condition, symptoms] of Object.entries(CONDITION_SYMPTOMS)) {
    if (symptoms.some(s => s.id === symptomId)) {
      return condition;
    }
  }
  return null;
}
