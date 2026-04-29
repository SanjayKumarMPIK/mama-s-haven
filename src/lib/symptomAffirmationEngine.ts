/**
 * symptomAffirmationEngine.ts
 *
 * Generates short, supportive one-line affirmations based on the user's
 * recent logged symptoms. Phase-aware, never diagnostic.
 */

import type { Phase } from "@/hooks/usePhase";
import type { HealthLogs } from "@/hooks/useHealthLog";

// ─── Affirmation Pools ───────────────────────────────────────────────────

interface AffirmationRule {
  /** Symptom IDs that trigger this affirmation (any match) */
  symptoms: string[];
  /** The supportive message (max 1 line) */
  message: string;
  /** Optional phase filter — if set, only shows for these phases */
  phases?: Phase[];
}

const SYMPTOM_AFFIRMATIONS: AffirmationRule[] = [
  // Fatigue / energy
  {
    symptoms: ["fatigue", "weakness", "sleepIssues"],
    message: "Your body needs rest. Small nourishing steps can help restore your energy. 💛",
  },
  // Mood
  {
    symptoms: ["moodSwings", "moodChanges", "anxiety", "irritability"],
    message: "Your emotions matter. Taking care of your body also supports your mind. 🌸",
  },
  // Pain
  {
    symptoms: ["cramps", "headache", "backPain", "jointPain", "ovulationPain"],
    message: "Pain is your body communicating. Gentle care and good nutrition can make a difference. 🌿",
  },
  // Digestive
  {
    symptoms: ["nausea", "bloating", "constipation", "heartburn", "appetiteChanges"],
    message: "Digestive changes are common. Small, frequent meals and hydration can help. 🍃",
  },
  // Sleep
  {
    symptoms: ["sleepIssues", "nightSweats", "sleepDisturbance"],
    message: "Better sleep starts with small habits. You're taking the right steps by tracking. 🌙",
  },
  // Hot flashes (menopause)
  {
    symptoms: ["hotFlashes", "nightSweats"],
    message: "Your body is adapting to change. Staying cool and hydrated can bring comfort. 💧",
    phases: ["menopause"],
  },
  // Pregnancy-specific
  {
    symptoms: ["nausea", "vomiting", "cravings", "frequentUrination"],
    message: "Your body is doing amazing work. Nourishing yourself is nourishing your baby too. 🤱",
    phases: ["maternity"],
  },
  // Puberty-specific
  {
    symptoms: ["acne", "growthPain", "heavyPeriod", "irregularCycle"],
    message: "Your body is growing and changing. Each day is a step toward understanding yourself better. 🌱",
    phases: ["puberty"],
  },
  // Fertility-specific
  {
    symptoms: ["irregularCycle", "ovulationPain", "stress"],
    message: "You're actively listening to your body. Knowledge is power on your journey. 🎯",
    phases: ["family-planning"],
  },
  // General cognitive
  {
    symptoms: ["brainFog", "memoryIssues"],
    message: "Mental clarity comes and goes. Good nutrition and rest are your best allies. 🧠",
  },
];

const GENERIC_AFFIRMATIONS: string[] = [
  "You're doing great by tracking your health. Every small step matters. 💪",
  "Taking time for your well-being shows real strength. Keep going. 🌟",
  "Your health journey is unique. Small consistent steps lead to big changes. ✨",
  "Listening to your body is the first step to feeling better. 🌺",
  "You're building healthy habits one day at a time. That's powerful. 💫",
];

const NO_DATA_AFFIRMATIONS: string[] = [
  "Start logging your daily symptoms to get personalized encouragement. 🌸",
  "Your wellness journey begins with awareness. Log your first day today. 🌟",
  "Tracking how you feel is the first step to feeling better. ✨",
];

// ─── Engine ──────────────────────────────────────────────────────────────

function getRecentSymptomIds(logs: HealthLogs, phase: Phase, days: number = 7): string[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const todayISO = new Date().toISOString().slice(0, 10);

  const symptomCounts = new Map<string, number>();

  for (const [date, entry] of Object.entries(logs)) {
    if (date < cutoffISO || date > todayISO) continue;
    if (entry.phase !== phase) continue;
    if (!entry.symptoms) continue;

    for (const [key, val] of Object.entries(entry.symptoms)) {
      if (val === true) {
        symptomCounts.set(key, (symptomCounts.get(key) || 0) + 1);
      }
    }
  }

  // Sort by frequency, return IDs
  return Array.from(symptomCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

/**
 * Generate a single supportive affirmation based on recent symptoms.
 * Returns { message, hasData }.
 */
export function generateAffirmation(
  logs: HealthLogs,
  phase: Phase,
): { message: string; hasData: boolean } {
  const recentSymptoms = getRecentSymptomIds(logs, phase, 7);

  if (recentSymptoms.length === 0) {
    // Check if there's any data at all
    const hasAnyData = Object.values(logs).some((e) => e.phase === phase);
    if (!hasAnyData) {
      return {
        message: NO_DATA_AFFIRMATIONS[Math.floor(Math.random() * NO_DATA_AFFIRMATIONS.length)],
        hasData: false,
      };
    }
    return {
      message: GENERIC_AFFIRMATIONS[Math.floor(Math.random() * GENERIC_AFFIRMATIONS.length)],
      hasData: true,
    };
  }

  // Find the best matching affirmation
  const recentSet = new Set(recentSymptoms);

  // Score each affirmation rule
  let bestMatch: AffirmationRule | null = null;
  let bestScore = 0;

  for (const rule of SYMPTOM_AFFIRMATIONS) {
    // Phase filter
    if (rule.phases && !rule.phases.includes(phase)) continue;

    // Count matching symptoms
    const matchCount = rule.symptoms.filter((s) => recentSet.has(s)).length;
    if (matchCount === 0) continue;

    // Phase-specific rules get a bonus
    const phaseBonus = rule.phases ? 0.5 : 0;
    const score = matchCount + phaseBonus;

    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (bestMatch) {
    return { message: bestMatch.message, hasData: true };
  }

  // Fallback to generic
  return {
    message: GENERIC_AFFIRMATIONS[Math.floor(Math.random() * GENERIC_AFFIRMATIONS.length)],
    hasData: true,
  };
}
