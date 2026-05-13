/**
 * deficiencyRulesEngine.ts
 *
 * 8-step maternity deficiency scoring pipeline.
 * This is a WELLNESS INSIGHT engine, NOT a medical diagnosis tool.
 * All results are presented as "Possible deficiency indicators."
 *
 * Pipeline:
 * 1. Normalize & deduplicate symptoms
 * 2. Base score (symptom weights)
 * 3. Severity multiplier
 * 4. Frequency multiplier
 * 5. Pregnancy trimester modifiers
 * 6. Lifestyle modifiers (future)
 * 7. Confidence normalization (0–100)
 * 8. Ranking by confidence
 */

import type { AggregatedSymptom } from "./types";
import {
  NUTRIENT_WEIGHT_TABLES,
  PREGNANCY_MODIFIERS,
  SEVERITY_MULTIPLIERS,
  getFrequencyMultiplier,
  type NutrientWeightTable,
} from "./nutrientSymptomWeights";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ConfidenceLevel = "Low" | "Mild" | "Moderate" | "High";

export interface DeficiencyResult {
  nutrientId: string;
  label: string;
  emoji: string;
  /** Normalized confidence score 0–100 */
  confidence: number;
  /** Human-readable confidence level */
  confidenceLevel: ConfidenceLevel;
  /** Raw score before normalization */
  rawScore: number;
  /** Max possible raw score for this nutrient */
  maxPossible: number;
  /** Symptoms that contributed to this score */
  matchedSymptoms: {
    symptomId: string;
    symptomLabel: string;
    baseWeight: number;
    adjustedWeight: number;
  }[];
  /** Active trimester modifier applied */
  trimesterModifier: number;
  /** Explanation reasons for the user */
  reasons: string[];
  /** Recommended foods */
  foods: { name: string; emoji: string }[];
  /** Lifestyle tips */
  lifestyleTips: string[];
}

export interface DeficiencyAnalysis {
  hasData: boolean;
  results: DeficiencyResult[];
  topDeficiencies: DeficiencyResult[];
  overallScore: number;
  overallLevel: ConfidenceLevel;
  riskCounts: { high: number; moderate: number; mild: number; low: number };
  /** Unique symptoms that contributed to any deficiency */
  activeSymptomCount: number;
  loggedDays: number;
  lastUpdated: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getConfidenceLevel(score: number): ConfidenceLevel {
  if (score >= 75) return "High";
  if (score >= 50) return "Moderate";
  if (score >= 25) return "Mild";
  return "Low";
}

function getPregnancyStageKey(
  trimester: number | null,
  mode: string | null
): string | null {
  if (mode === "postpartum" || mode === "premature") return "postpartum";
  if (trimester === 1) return "trimester1";
  if (trimester === 2) return "trimester2";
  if (trimester === 3) return "trimester3";
  return null;
}

// ─── Main Scoring Pipeline ──────────────────────────────────────────────────

export function computeDeficiencyAnalysis(
  symptoms: AggregatedSymptom[],
  trimester: number | null,
  mode: string | null,
  totalLoggedDays: number
): DeficiencyAnalysis {
  const now = new Date().toISOString();

  // ── Step 1: Deduplicate symptoms by canonicalId ──────────────────────
  const deduped = new Map<string, AggregatedSymptom>();
  for (const s of symptoms) {
    const key = s.canonicalId.toLowerCase().trim();
    if (!deduped.has(key)) {
      deduped.set(key, s);
    }
    // If duplicate, keep the one with higher frequency/severity
    else {
      const existing = deduped.get(key)!;
      if (s.frequency > existing.frequency || s.severityScore > existing.severityScore) {
        deduped.set(key, s);
      }
    }
  }

  const uniqueSymptoms = Array.from(deduped.values());

  if (uniqueSymptoms.length === 0) {
    return {
      hasData: false,
      results: [],
      topDeficiencies: [],
      overallScore: 0,
      overallLevel: "Low",
      riskCounts: { high: 0, moderate: 0, mild: 0, low: 0 },
      activeSymptomCount: 0,
      loggedDays: totalLoggedDays,
      lastUpdated: now,
    };
  }

  const stageKey = getPregnancyStageKey(trimester, mode);
  const phaseModifiers = stageKey ? PREGNANCY_MODIFIERS[stageKey] ?? {} : {};

  // ── Steps 2–7: Score each nutrient ───────────────────────────────────
  const results: DeficiencyResult[] = [];

  for (const table of NUTRIENT_WEIGHT_TABLES) {
    const result = scoreNutrient(table, uniqueSymptoms, phaseModifiers, totalLoggedDays, stageKey);
    if (result) {
      results.push(result);
    }
  }

  // ── Step 8: Rank by confidence ───────────────────────────────────────
  results.sort((a, b) => b.confidence - a.confidence);

  const topDeficiencies = results.filter(r => r.confidenceLevel === "High" || r.confidenceLevel === "Moderate");

  // Overall score: weighted average of top deficiencies, not just average of all
  const overallScore = results.length > 0
    ? Math.round(
        results.slice(0, 5).reduce((s, r) => s + r.confidence, 0) /
        Math.max(results.slice(0, 5).length, 1)
      )
    : 0;

  return {
    hasData: true,
    results,
    topDeficiencies: topDeficiencies.slice(0, 5),
    overallScore,
    overallLevel: getConfidenceLevel(overallScore),
    riskCounts: {
      high: results.filter(r => r.confidenceLevel === "High").length,
      moderate: results.filter(r => r.confidenceLevel === "Moderate").length,
      mild: results.filter(r => r.confidenceLevel === "Mild").length,
      low: results.filter(r => r.confidenceLevel === "Low").length,
    },
    activeSymptomCount: uniqueSymptoms.length,
    loggedDays: totalLoggedDays,
    lastUpdated: now,
  };
}

// ─── Per-Nutrient Scoring ───────────────────────────────────────────────────

function scoreNutrient(
  table: NutrientWeightTable,
  symptoms: AggregatedSymptom[],
  phaseModifiers: Record<string, number>,
  totalLoggedDays: number,
  stageKey: string | null
): DeficiencyResult | null {
  const matchedSymptoms: DeficiencyResult["matchedSymptoms"] = [];
  let rawScore = 0;

  for (const symptom of symptoms) {
    const baseWeight = table.symptomWeights[symptom.canonicalId];
    if (baseWeight === undefined) continue;

    // Step 3: Severity multiplier
    const sevKey = symptom.severityScore >= 0.8 ? "severe"
      : symptom.severityScore >= 0.5 ? "moderate"
      : "mild";
    const severityMult = SEVERITY_MULTIPLIERS[sevKey] ?? 1.0;

    // Step 4: Frequency multiplier
    const freqMult = getFrequencyMultiplier(symptom.frequency, totalLoggedDays);

    const adjustedWeight = baseWeight * severityMult * freqMult;
    rawScore += adjustedWeight;

    matchedSymptoms.push({
      symptomId: symptom.canonicalId,
      symptomLabel: symptom.label,
      baseWeight,
      adjustedWeight: Math.round(adjustedWeight * 10) / 10,
    });
  }

  // No matching symptoms → don't include this nutrient
  if (matchedSymptoms.length === 0) return null;

  // Step 5: Pregnancy modifier
  const trimesterBoost = phaseModifiers[table.nutrientId] ?? 0;
  rawScore *= (1 + trimesterBoost);

  // Step 7: Normalize to 0–100
  // Use maxRaw as the ceiling. The maxRaw assumes ALL symptoms match with
  // moderate severity (x1.3) and weekly frequency (x1.2).
  // This means a single mild+occasional symptom can never exceed ~18-25%.
  const effectiveMax = table.maxRaw * 1.3 * 1.2; // moderate severity, weekly freq
  let confidence = Math.round((rawScore / effectiveMax) * 100);
  confidence = Math.max(0, Math.min(100, confidence));

  // Build explanation reasons
  const reasons: string[] = [];
  for (const m of matchedSymptoms) {
    reasons.push(m.symptomLabel);
  }
  if (trimesterBoost > 0 && stageKey) {
    const stageLabel = stageKey === "postpartum" ? "postpartum"
      : stageKey.replace("trimester", "Trimester ");
    reasons.push(`${stageLabel} ${table.label} demand increase (+${Math.round(trimesterBoost * 100)}%)`);
  }

  return {
    nutrientId: table.nutrientId,
    label: table.label,
    emoji: table.emoji,
    confidence,
    confidenceLevel: getConfidenceLevel(confidence),
    rawScore: Math.round(rawScore * 10) / 10,
    maxPossible: Math.round(effectiveMax),
    matchedSymptoms,
    trimesterModifier: trimesterBoost,
    reasons,
    foods: table.foods,
    lifestyleTips: table.lifestyleTips,
  };
}
