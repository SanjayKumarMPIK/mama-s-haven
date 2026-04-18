/**
 * prematureCareData.ts
 *
 * Static content for the Premature Baby Care Guide sections.
 * No medical diagnosis — educational and actionable.
 */

// ─── Feeding Guidance ────────────────────────────────────────────────────────

export const FEEDING_GUIDANCE = {
  schedule: "Feed your baby every 2–3 hours, even if they seem sleepy.",
  tips: [
    { emoji: "🤱", text: "Breast milk is the best nutrition for premature babies — it has special antibodies." },
    { emoji: "🍼", text: "If baby can't latch, express and feed with a small cup or syringe (as advised by doctor)." },
    { emoji: "⏰", text: "Set alarms — premature babies may not wake up for feeds on their own." },
    { emoji: "📏", text: "Track how long each feed lasts — aim for at least 10–15 minutes per session." },
  ],
  poorFeedingSigns: [
    "Baby sleeps through feeds and is hard to wake",
    "Baby takes less than 5 minutes to feed",
    "Fewer than 6 wet diapers in 24 hours",
    "Baby seems too tired or weak to suck",
  ],
};

// ─── Temperature Care ────────────────────────────────────────────────────────

export const TEMPERATURE_CARE = {
  tips: [
    { emoji: "🧣", text: "Keep baby wrapped in warm clothes — use layers and a cap." },
    { emoji: "🏠", text: "Maintain room temperature between 25–28°C." },
    { emoji: "👶", text: "Kangaroo Mother Care (skin-to-skin contact) helps regulate body temperature naturally." },
    { emoji: "🚫", text: "Avoid bathing in cold water — use warm water and keep baths brief." },
    { emoji: "🛏️", text: "Avoid placing baby near windows, fans, or AC vents." },
  ],
  warningSigns: [
    "Cold hands, feet, or body",
    "Baby feels limp or unusually still",
    "Pale or bluish skin color",
    "Shivering or not moving actively",
  ],
};

// ─── Infection Prevention ────────────────────────────────────────────────────

export const INFECTION_PREVENTION = {
  tips: [
    { emoji: "🧼", text: "Wash hands with soap before touching the baby — every single time." },
    { emoji: "🚷", text: "Limit visitors for the first few weeks — premature babies have weaker immunity." },
    { emoji: "😷", text: "Anyone with cold, cough, or fever should NOT hold the baby." },
    { emoji: "👕", text: "Use clean, washed clothes and bedding daily." },
    { emoji: "🍼", text: "Sterilize all feeding equipment before every use." },
    { emoji: "💉", text: "Follow all vaccination schedules as advised by your doctor." },
  ],
};

// ─── Warning Signs (Critical) ───────────────────────────────────────────────

export interface WarningSign {
  emoji: string;
  title: string;
  description: string;
  severity: "critical" | "warning";
}

export const WARNING_SIGNS: WarningSign[] = [
  {
    emoji: "😤",
    title: "Difficulty Breathing",
    description: "Fast breathing, grunting sounds, or chest pulling inward with each breath.",
    severity: "critical",
  },
  {
    emoji: "💙",
    title: "Blue or Pale Lips/Skin",
    description: "Bluish color around lips, fingers, or toes — indicates low oxygen.",
    severity: "critical",
  },
  {
    emoji: "🍼",
    title: "Refusing to Feed",
    description: "Baby consistently refuses feeds or vomits after every feed.",
    severity: "critical",
  },
  {
    emoji: "🌡️",
    title: "Fever or Very Low Temperature",
    description: "Temperature above 38°C or below 36°C — both need immediate medical attention.",
    severity: "critical",
  },
  {
    emoji: "😴",
    title: "Excessive Sleepiness",
    description: "Baby is very difficult to wake up, even for feeds.",
    severity: "warning",
  },
  {
    emoji: "🤒",
    title: "Yellowish Skin (Jaundice)",
    description: "Yellow tint on skin or eyes — common but needs monitoring.",
    severity: "warning",
  },
  {
    emoji: "💧",
    title: "Few Wet Diapers",
    description: "Fewer than 6 wet diapers in 24 hours may indicate dehydration.",
    severity: "warning",
  },
];

// ─── Daily Check Questions ───────────────────────────────────────────────────

export interface DailyCheckQuestion {
  id: string;
  emoji: string;
  question: string;
  positiveLabel: string;
  negativeLabel: string;
  alertMessage: string;
}

export const DAILY_CHECK_QUESTIONS: DailyCheckQuestion[] = [
  {
    id: "feeding",
    emoji: "🍼",
    question: "Is baby feeding well today?",
    positiveLabel: "Yes, feeding okay",
    negativeLabel: "No, not feeding well",
    alertMessage: "Poor feeding in premature babies can be serious. Please consult your doctor if this continues.",
  },
  {
    id: "activity",
    emoji: "👶",
    question: "Is baby active and responsive?",
    positiveLabel: "Yes, baby is active",
    negativeLabel: "No, baby seems inactive",
    alertMessage: "Low activity may indicate a problem. Monitor closely and consult a doctor if baby remains inactive.",
  },
  {
    id: "temperature",
    emoji: "🌡️",
    question: "Is baby's temperature normal?",
    positiveLabel: "Yes, feels warm",
    negativeLabel: "No, feels cold/hot",
    alertMessage: "Abnormal temperature in premature babies needs attention. Ensure warmth and consult your doctor.",
  },
];

// ─── Weight Tracking ─────────────────────────────────────────────────────────

/** Expected weekly weight gain for premature babies: ~150–250g per week */
export const EXPECTED_WEEKLY_GAIN_GRAMS = 150;

export function getWeightTrend(
  entries: { date: string; weight: number }[],
): "gaining" | "slow" | "losing" | "insufficient" {
  if (entries.length < 2) return "insufficient";
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const diff = last.weight - prev.weight;
  if (diff >= EXPECTED_WEEKLY_GAIN_GRAMS) return "gaining";
  if (diff > 0) return "slow";
  return "losing";
}
