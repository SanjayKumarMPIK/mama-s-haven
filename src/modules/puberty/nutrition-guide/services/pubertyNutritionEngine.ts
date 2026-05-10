import type { Phase } from "@/hooks/usePhase";
import type { HealthLogs } from "@/hooks/useHealthLog";
import type { ProfileData } from "@/hooks/useProfile";
import type {
  NutritionIntelligenceResult, NutrientNeedResult, DetectedSymptom,
  SafetyWarning, SymptomAnalysisResult, NutrientFoodEntry,
} from "@/lib/nutrition/nutritionTypes";
import { CORE_SYMPTOMS, PHASE_SYMPTOMS, SYMPTOM_NUTRIENT_MAP } from "@/lib/nutrition/nutritionSymptomRegistry";
import { NUTRIENT_FOOD_MAP, PHASE_CONFIGS, CRITICAL_SYMPTOMS } from "@/lib/nutrition/nutritionFoodRegistry";

// ─── Severity weights ─────────────────────────────────────────────────────
const SEVERITY_WEIGHT: Record<string, number> = {
  Mild: 0.7,
  Moderate: 1.0,
  Severe: 1.5,
};

// ─── Condition → nutrient boosts ──────────────────────────────────────────
const CONDITION_NUTRIENT_BOOSTS: Record<string, Record<string, { multiplier: number; reason: string }>> = {
  anemia: {
    iron: { multiplier: 1.5, reason: "Anemia increases iron demand — prioritize iron-rich foods" },
    vitC: { multiplier: 1.2, reason: "Vitamin C enhances iron absorption, important for anemia management" },
  },
  pcos: {
    fiber: { multiplier: 1.3, reason: "PCOS benefits from high-fiber foods for hormonal balance" },
    omega3: { multiplier: 1.2, reason: "Omega-3s help manage PCOS-related inflammation" },
    magnesium: { multiplier: 1.1, reason: "Magnesium supports hormonal balance in PCOS" },
  },
  pcod: {
    fiber: { multiplier: 1.3, reason: "PCOD benefits from high-fiber foods for insulin balance" },
    omega3: { multiplier: 1.2, reason: "Omega-3s help manage PCOD-related inflammation" },
  },
  diabetes: {
    fiber: { multiplier: 1.3, reason: "Diabetes requires high-fiber foods for blood sugar control" },
  },
  hypothyroidism: {
    zinc: { multiplier: 1.2, reason: "Hypothyroidism may require additional zinc for thyroid function" },
  },
  hyperthyroidism: {
    calcium: { multiplier: 1.3, reason: "Hyperthyroidism increases calcium needs" },
    vitD: { multiplier: 1.2, reason: "Vitamin D supports calcium absorption in hyperthyroidism" },
  },
  osteoporosis: {
    calcium: { multiplier: 1.4, reason: "Osteoporosis risk requires increased calcium intake" },
    vitD: { multiplier: 1.3, reason: "Vitamin D is critical for bone health in osteoporosis" },
  },
};

// ─── Severity-aware symptom extraction ────────────────────────────────────

interface SymptomData {
  dates: string[];
  severities: Record<string, "Mild" | "Moderate" | "Severe">;
}

function extractSymptomsWithSeverity(logs: [string, any][]): Map<string, SymptomData> {
  const symptomData = new Map<string, SymptomData>();
  for (const [date, entry] of logs) {
    const symptoms = entry.symptoms;
    const severityLabels: Record<string, string> = entry.symptomSeverityLabels ?? {};
    if (!symptoms) continue;
    for (const [key, val] of Object.entries(symptoms)) {
      if (val === true) {
        const existing = symptomData.get(key) ?? { dates: [], severities: {} };
        existing.dates.push(date);
        if (severityLabels[key]) {
          existing.severities[date] = severityLabels[key] as "Mild" | "Moderate" | "Severe";
        }
        symptomData.set(key, existing);
      }
    }
    // Also check fatigue via fatigueLevel
    if (entry.fatigueLevel && entry.fatigueLevel !== "Low") {
      const existing = symptomData.get("fatigue") ?? { dates: [], severities: {} };
      if (!existing.dates.includes(date)) {
        existing.dates.push(date);
        existing.severities[date] = entry.fatigueLevel === "High" ? "Severe" : "Moderate";
        symptomData.set("fatigue", existing);
      }
    }
    // Check mood for mood-related symptoms
    if (entry.mood === "Low") {
      const existing = symptomData.get("moodSwings") ?? { dates: [], severities: {} };
      if (!existing.dates.includes(date)) {
        existing.dates.push(date);
        existing.severities[date] = "Moderate";
        symptomData.set("moodSwings", existing);
      }
    }
    // Check sleep
    if (entry.sleepQuality === "Poor" || (entry.sleepHours !== null && entry.sleepHours < 6)) {
      const existing = symptomData.get("sleepIssues") ?? { dates: [], severities: {} };
      if (!existing.dates.includes(date)) {
        existing.dates.push(date);
        existing.severities[date] = entry.sleepQuality === "Poor" ? "Severe" : "Moderate";
        symptomData.set("sleepIssues", existing);
      }
    }
  }
  return symptomData;
}

function getRecentLogs(logs: HealthLogs, days: number = 30): [string, any][] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  return Object.entries(logs).filter(([date]) => date >= cutoffISO).sort((a, b) => b[0].localeCompare(a[0]));
}

function getAllSymptomDefs(phase: Phase) {
  return [...CORE_SYMPTOMS, ...(PHASE_SYMPTOMS[phase] ?? [])];
}

function findSymptomDef(id: string, phase: Phase) {
  return getAllSymptomDefs(phase).find(s => s.id === id);
}

// ─── Main Engine: computeNutritionIntelligence ────────────────────────────

export function computeNutritionIntelligence(
  logs: HealthLogs,
  phase: Phase,
  profile?: ProfileData,
): NutritionIntelligenceResult {
  const recentLogs = getRecentLogs(logs, 30);
  const symptomData = extractSymptomsWithSeverity(recentLogs);
  const phaseConfig = PHASE_CONFIGS[phase];

  if (recentLogs.length === 0 || symptomData.size === 0) {
    return {
      hasData: false,
      detectedSymptoms: [],
      nutrientNeeds: [],
      foodRecommendations: [],
      deficiencyScore: 0,
      deficiencySeverity: "Good",
      safetyWarnings: [],
      priorityNutrient: null,
      riskCounts: { high: 0, moderate: 0, low: 0, good: 0 },
    };
  }

  // 1. Detected Symptoms (with severity info)
  const phaseSymptomIds = new Set(phaseConfig.symptoms);
  const detectedSymptoms: DetectedSymptom[] = [];
  for (const [symptomId, data] of symptomData.entries()) {
    if (!phaseSymptomIds.has(symptomId)) continue;
    const def = findSymptomDef(symptomId, phase);
    if (!def) continue;
    detectedSymptoms.push({
      id: symptomId,
      label: def.label,
      emoji: def.emoji,
      count: data.dates.length,
      recentDates: data.dates.slice(0, 5),
    });
  }
  detectedSymptoms.sort((a, b) => b.count - a.count);

  // 2. Nutrient Scoring (severity-weighted)
  const nutrientScores = new Map<string, { score: number; reasons: string[]; symptomSources: string[] }>();
  for (const detected of detectedSymptoms) {
    const mappings = SYMPTOM_NUTRIENT_MAP[detected.id] ?? [];
    const frequency = Math.min(detected.count / recentLogs.length, 1);
    const symData = symptomData.get(detected.id);
    // Compute average severity multiplier for this symptom
    let severityMultiplier = 1.0;
    if (symData) {
      const sevValues = Object.values(symData.severities);
      if (sevValues.length > 0) {
        const avg = sevValues.reduce((sum, s) => sum + (SEVERITY_WEIGHT[s] ?? 1.0), 0) / sevValues.length;
        severityMultiplier = avg;
      }
    }
    for (const mapping of mappings) {
      const reason = mapping.reason[phase] ?? mapping.reason.default;
      const phaseBoost = phaseConfig.nutrientPriorities[mapping.nutrientId] ?? 1.0;
      const rawScore = mapping.weight * frequency * phaseBoost * severityMultiplier;
      const existing = nutrientScores.get(mapping.nutrientId) ?? { score: 0, reasons: [], symptomSources: [] };
      existing.score += rawScore;
      if (!existing.reasons.includes(reason)) existing.reasons.push(reason);
      if (!existing.symptomSources.includes(detected.label)) existing.symptomSources.push(detected.label);
      nutrientScores.set(mapping.nutrientId, existing);
    }
  }

  // 3. Medical condition nutrient boosts
  const conditions = (profile?.medicalConditions ?? [])
    .map((c: string) => c.trim().toLowerCase())
    .filter(Boolean);

  for (const cond of conditions) {
    const boosts = CONDITION_NUTRIENT_BOOSTS[cond];
    if (!boosts) continue;
    for (const [nutrientId, boost] of Object.entries(boosts)) {
      const existing = nutrientScores.get(nutrientId);
      if (existing) {
        existing.score *= boost.multiplier;
        if (!existing.reasons.includes(boost.reason)) existing.reasons.push(boost.reason);
        if (!existing.symptomSources.includes(`Medical: ${cond}`)) existing.symptomSources.push(`Medical: ${cond}`);
        nutrientScores.set(nutrientId, existing);
      } else {
        nutrientScores.set(nutrientId, {
          score: 0.2 * boost.multiplier,
          reasons: [boost.reason],
          symptomSources: [`Medical: ${cond}`],
        });
      }
    }
  }

  // 4. Priority Detection (2+ symptom sources → same nutrient)
  const nutrientNeeds: NutrientNeedResult[] = [];
  for (const [nutrientId, data] of nutrientScores.entries()) {
    const nutrientDef = NUTRIENT_FOOD_MAP[nutrientId];
    if (!nutrientDef) continue;
    const isPriority = data.symptomSources.length >= 2;
    const finalScore = isPriority ? data.score * 1.3 : data.score;
    nutrientNeeds.push({
      nutrientId,
      label: nutrientDef.label,
      emoji: nutrientDef.emoji,
      score: Math.round(finalScore * 100) / 100,
      isPriority,
      reasons: data.reasons,
      symptomSources: data.symptomSources,
      foods: nutrientDef.foods,
    });
  }
  nutrientNeeds.sort((a, b) => b.score - a.score);

  // 5. Food Recommendations (deduplicated from top nutrients)
  const foodSet = new Set<string>();
  const foodRecommendations: NutrientFoodEntry[] = [];
  for (const need of nutrientNeeds.slice(0, 5)) {
    for (const food of need.foods) {
      if (!foodSet.has(food.name)) {
        foodSet.add(food.name);
        foodRecommendations.push(food);
      }
    }
  }

  // 6. Deficiency Score
  const maxPossible = nutrientNeeds.length * 1.5;
  const totalScore = nutrientNeeds.reduce((s, n) => s + n.score, 0);
  const deficiencyScore = maxPossible > 0 ? Math.min(100, Math.round((totalScore / maxPossible) * 100)) : 0;

  const deficiencySeverity: NutritionIntelligenceResult["deficiencySeverity"] =
    deficiencyScore >= 75 ? "Critical" : deficiencyScore >= 55 ? "High" : deficiencyScore >= 35 ? "Moderate" : deficiencyScore >= 15 ? "Mild" : "Good";

  // 7. Risk Counts
  const riskCounts = { high: 0, moderate: 0, low: 0, good: 0 };
  for (const need of nutrientNeeds) {
    if (need.score >= 0.7) riskCounts.high++;
    else if (need.score >= 0.4) riskCounts.moderate++;
    else if (need.score >= 0.15) riskCounts.low++;
    else riskCounts.good++;
  }

  // 8. Safety Warnings
  const safetyWarnings: SafetyWarning[] = detectCriticalSymptoms(detectedSymptoms, phase);

  // 9. Priority Nutrient
  const priorityNutrient = nutrientNeeds.length > 0 ? nutrientNeeds[0].label : null;

  return {
    hasData: true,
    detectedSymptoms,
    nutrientNeeds,
    foodRecommendations: foodRecommendations.slice(0, 12),
    deficiencyScore,
    deficiencySeverity,
    safetyWarnings,
    priorityNutrient,
    riskCounts,
  };
}

// ─── Critical Symptom Detection ───────────────────────────────────────────

export function detectCriticalSymptoms(symptoms: DetectedSymptom[], phase: Phase): SafetyWarning[] {
  const warnings: SafetyWarning[] = [];
  for (const s of symptoms) {
    const critDef = CRITICAL_SYMPTOMS[s.id];
    if (critDef && critDef.phases.includes(phase) && s.count >= 2) {
      warnings.push({
        symptomId: s.id,
        label: s.label,
        emoji: s.emoji,
        message: critDef.message,
        severity: critDef.severity,
      });
    }
  }
  return warnings;
}

// ─── Single Symptom Analysis (for search feature) ─────────────────────────

export function analyzeSymptom(
  symptomId: string,
  phase: Phase,
  logs: HealthLogs,
): SymptomAnalysisResult | null {
  const def = findSymptomDef(symptomId, phase);
  if (!def) return null;

  const recentLogs = getRecentLogs(logs, 30);
  const symptomMap = extractSymptoms(recentLogs);
  const dates = symptomMap.get(symptomId) ?? [];

  const mappings = SYMPTOM_NUTRIENT_MAP[symptomId] ?? [];
  const helpfulNutrients = mappings.map(m => {
    const nDef = NUTRIENT_FOOD_MAP[m.nutrientId];
    return nDef ? { nutrientId: m.nutrientId, label: nDef.label, emoji: nDef.emoji } : null;
  }).filter(Boolean) as { nutrientId: string; label: string; emoji: string }[];

  const foodRecommendations: NutrientFoodEntry[] = [];
  const foodSet = new Set<string>();
  for (const m of mappings) {
    const nDef = NUTRIENT_FOOD_MAP[m.nutrientId];
    if (!nDef) continue;
    for (const food of nDef.foods.slice(0, 2)) {
      if (!foodSet.has(food.name)) { foodSet.add(food.name); foodRecommendations.push(food); }
    }
  }

  const possibleReasons = mappings.map(m => m.reason[phase] ?? m.reason.default);

  return {
    symptomId,
    label: def.label,
    emoji: def.emoji,
    detected: dates.length > 0,
    count: dates.length,
    possibleReasons,
    helpfulNutrients,
    foodRecommendations: foodRecommendations.slice(0, 6),
  };
}

// ─── Symptom Search ───────────────────────────────────────────────────────

export function searchSymptoms(query: string, phase: Phase): { id: string; label: string; emoji: string }[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const allDefs = getAllSymptomDefs(phase);
  const phaseSymptomIds = new Set(PHASE_CONFIGS[phase].symptoms);
  return allDefs
    .filter(s => phaseSymptomIds.has(s.id) && s.label.toLowerCase().includes(q))
    .map(s => ({ id: s.id, label: s.label, emoji: s.emoji }))
    .slice(0, 8);
}

// ─── Get Phase Suggested Symptoms ─────────────────────────────────────────

export function getPhaseSuggestedSymptoms(phase: Phase): { id: string; label: string; emoji: string }[] {
  const phaseConfig = PHASE_CONFIGS[phase];
  const allDefs = getAllSymptomDefs(phase);
  // Return first 8 phase-relevant symptoms as suggestions
  return phaseConfig.symptoms.slice(0, 8).map(id => {
    const def = allDefs.find(s => s.id === id);
    return def ? { id: def.id, label: def.label, emoji: def.emoji } : null;
  }).filter(Boolean) as { id: string; label: string; emoji: string }[];
}

export { PHASE_CONFIGS, NUTRIENT_FOOD_MAP };
