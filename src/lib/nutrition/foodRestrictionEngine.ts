/**
 * foodRestrictionEngine.ts
 *
 * Dynamic food restriction engine for pregnancy nutrition.
 * Analyzes symptoms, trimester, and severity to generate personalized
 * food avoidance and reduction recommendations.
 */

import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";

export type Trimester = 1 | 2 | 3;

export interface FoodRestrictionResult {
  avoid: string[];
  reduce: string[];
  explanation: string;
  hasData: boolean;
}

interface RestrictionRule {
  id: string;
  targetSymptoms: string[];
  targetTrimesters?: Trimester[];
  avoid: string[];
  reduce: string[];
  explanation: string;
}

// ─── Restriction Rules ───────────────────────────────────────────────────────

const RESTRICTION_RULES: RestrictionRule[] = [
  // Nausea / Vomiting (Trimester 1 focus)
  {
    id: "nausea",
    targetSymptoms: ["nausea", "vomiting"],
    targetTrimesters: [1],
    avoid: ["Strong-smelling foods", "Oily/greasy foods", "Raw seafood"],
    reduce: ["Fried foods", "Spicy foods", "Heavy dairy", "Excess caffeine"],
    explanation: "To manage nausea and vomiting, avoid strong smells and oily foods. Reduce fried and spicy items that may trigger discomfort.",
  },
  // Bloating / Constipation
  {
    id: "bloating",
    targetSymptoms: ["bloating", "constipation"],
    avoid: ["Highly refined carbs", "Excessive processed snacks"],
    reduce: ["Processed foods", "Excess cheese", "Sugary snacks", "Refined grains"],
    explanation: "To ease bloating and constipation, avoid refined carbs and reduce processed foods that can slow digestion.",
  },
  // Anemia / Fatigue (Iron absorption blockers)
  {
    id: "anemia",
    targetSymptoms: ["fatigue", "dizziness", "weakness"],
    avoid: ["High sugar processed snacks", "Excessive alcohol"],
    reduce: ["Tea immediately after meals", "Excess coffee", "Calcium-rich foods during iron intake"],
    explanation: "To support iron absorption, avoid sugar-heavy snacks and reduce tea/coffee with meals. Separate calcium and iron intake timing.",
  },
  // Swelling / Water Retention
  {
    id: "swelling",
    targetSymptoms: ["swelling", "waterRetention"],
    avoid: ["Excess salty packaged items", "Highly processed salty foods"],
    reduce: ["High sodium foods", "Processed snacks", "Fast food", "Canned soups"],
    explanation: "To reduce swelling, avoid excess salt and reduce high-sodium processed foods that contribute to water retention.",
  },
  // Heartburn (Trimester 3 focus)
  {
    id: "heartburn",
    targetSymptoms: ["heartburn", "acidReflux"],
    targetTrimesters: [3],
    avoid: ["Late-night heavy meals", "Chocolate", "Mint"],
    reduce: ["Citrus excess", "Spicy foods", "Carbonated drinks", "Fried foods"],
    explanation: "To manage heartburn, avoid late heavy meals and reduce acidic, spicy, and carbonated foods that can trigger reflux.",
  },
  // General pregnancy precautions (all trimesters)
  {
    id: "pregnancySafety",
    targetSymptoms: [], // Always applies
    targetTrimesters: [1, 2, 3],
    avoid: ["Raw or undercooked meat", "Raw eggs", "Unpasteurized dairy", "High-mercury fish", "Alcohol"],
    reduce: ["Caffeine (limit to 200mg/day)", "Processed meats", "Excess sugar"],
    explanation: "Pregnancy safety: avoid raw/undercooked foods and alcohol. Limit caffeine and processed items for optimal health.",
  },
];

// ─── Engine Function ─────────────────────────────────────────────────────────

export function calculateFoodRestrictions(
  logs: HealthLogs,
  trimester: Trimester
): FoodRestrictionResult {
  const todayISO = new Date().toISOString().slice(0, 10);
  const d7 = getDaysAgoISO(7);

  const symptomGivenLast7d = new Set<string>();
  let hasLoggedDays = false;

  // Process logs to extract symptoms
  for (const [dateISO, entryRaw] of Object.entries(logs)) {
    if (entryRaw.phase !== "maternity") continue;
    if (dateISO > todayISO || dateISO < d7) continue;

    hasLoggedDays = true;
    const entry = entryRaw as MaternityEntry;

    if (entry.fatigueLevel === "Medium" || entry.fatigueLevel === "High") {
      symptomGivenLast7d.add("fatigue");
    }

    if (entry.symptoms) {
      Object.entries(entry.symptoms).forEach(([sym, isTrue]) => {
        if (isTrue) symptomGivenLast7d.add(sym);
      });
    }
  }

  // Collect all restrictions
  const avoidSet = new Set<string>();
  const reduceSet = new Set<string>();
  const explanations: string[] = [];

  // Apply pregnancy safety rules (always)
  const safetyRule = RESTRICTION_RULES.find((r) => r.id === "pregnancySafety");
  if (safetyRule) {
    safetyRule.avoid.forEach((item) => avoidSet.add(item));
    safetyRule.reduce.forEach((item) => reduceSet.add(item));
    explanations.push(safetyRule.explanation);
  }

  // Apply symptom-based rules
  RESTRICTION_RULES.forEach((rule) => {
    if (rule.id === "pregnancySafety") return; // Already handled

    // Check trimester match
    if (rule.targetTrimesters && !rule.targetTrimesters.includes(trimester)) {
      return;
    }

    // Check symptom match
    const matchedSymptoms = rule.targetSymptoms.filter((sym) =>
      symptomGivenLast7d.has(sym)
    );

    if (matchedSymptoms.length > 0) {
      rule.avoid.forEach((item) => avoidSet.add(item));
      rule.reduce.forEach((item) => reduceSet.add(item));
      explanations.push(rule.explanation);
    }
  });

  // If no symptom data, return empty state
  if (!hasLoggedDays) {
    return {
      avoid: [],
      reduce: [],
      explanation: "No specific food restrictions detected yet.",
      hasData: false,
    };
  }

  return {
    avoid: Array.from(avoidSet),
    reduce: Array.from(reduceSet),
    explanation: explanations.length > 0 ? explanations.join(" ") : "Follow general pregnancy nutrition guidelines.",
    hasData: true,
  };
}

// ─── Helper Functions ───────────────────────────────────────────────────────

function getDaysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
