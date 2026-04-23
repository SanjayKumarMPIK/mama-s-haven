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

// ─── Baby Supportive Helper ─────────────────────────────────────────────────────

export interface BabyHelperQuestion {
  id: string;
  emoji: string;
  question: string;
  yesGuidance: string[];
  noGuidance: string[];
  skippable?: boolean;
}

export const BABY_HELPER_QUESTIONS: BabyHelperQuestion[] = [
  {
    id: "feeding",
    emoji: "🍼",
    question: "Is the baby feeding well?",
    yesGuidance: [
      "Continue feeding every 2–3 hours.",
      "Maintain hydration and monitor feeding comfort.",
    ],
    noGuidance: [
      "Try smaller frequent feeds.",
      "Ensure proper latch positioning.",
      "Burp baby after feeding.",
      "Consult a healthcare provider if feeding refusal continues.",
    ],
  },
  {
    id: "activity",
    emoji: "👶",
    question: "Is the baby active and responsive?",
    yesGuidance: [
      "Baby responsiveness appears healthy.",
      "Continue monitoring activity.",
    ],
    noGuidance: [
      "Monitor feeding intake and sleeping duration.",
      "Observe if reduced activity continues.",
      "Contact a healthcare provider if symptoms worsen.",
    ],
    skippable: true,
  },
  {
    id: "temperature",
    emoji: "🌡️",
    question: "Is the baby temperature normal?",
    yesGuidance: [
      "Continue maintaining warm surroundings.",
      "Avoid sudden temperature changes.",
    ],
    noGuidance: [
      "Keep baby wrapped warmly.",
      "Avoid cold exposure.",
      "Monitor body temperature regularly.",
      "Seek medical guidance if temperature remains unstable.",
    ],
  },
  {
    id: "sleeping",
    emoji: "😴",
    question: "Is the baby sleeping comfortably?",
    yesGuidance: [
      "Maintain safe sleep positioning.",
      "Keep sleep environment calm.",
    ],
    noGuidance: [
      "Observe sleep duration.",
      "Reduce environmental disturbances.",
      "Track sleeping patterns.",
    ],
  },
  {
    id: "crying",
    emoji: "😢",
    question: "Is the baby crying unusually?",
    yesGuidance: [
      "Check feeding, diaper comfort, and temperature.",
      "Monitor whether crying becomes persistent.",
    ],
    noGuidance: [
      "Continue normal observation.",
      "Maintain routine care.",
    ],
  },
  {
    id: "breathing",
    emoji: "💨",
    question: "Is the baby breathing comfortably?",
    yesGuidance: [
      "Breathing appears stable.",
      "Continue daily monitoring.",
    ],
    noGuidance: [
      "Watch for pauses in breathing.",
      "Observe chest movement.",
      "Seek immediate medical support if breathing difficulty persists.",
    ],
  },
  {
    id: "latching",
    emoji: "🤱",
    question: "Is the baby having difficulty latching?",
    yesGuidance: [
      "Continue feeding support.",
      "Monitor feeding duration.",
    ],
    noGuidance: [
      "Try skin-to-skin contact.",
      "Adjust feeding position.",
      "Consult lactation support if needed.",
    ],
  },
];

export interface GuidanceRecommendation {
  type: "immediate" | "feeding" | "monitoring" | "escalation";
  text: string;
}

export function generateGuidance(
  answers: Record<string, boolean | null>,
): GuidanceRecommendation[] {
  const recommendations: GuidanceRecommendation[] = [];
  const negativeAnswers = Object.entries(answers).filter(([_, value]) => value === false);

  // Priority: Immediate care for critical issues
  if (answers["breathing"] === false) {
    recommendations.push({
      type: "immediate",
      text: "Watch for pauses in breathing. Observe chest movement. Seek immediate medical support if breathing difficulty persists.",
    });
  }

  if (answers["feeding"] === false) {
    recommendations.push({
      type: "immediate",
      text: "Focus on feeding support. Try smaller frequent feeds and ensure proper latch positioning.",
    });
  }

  if (answers["temperature"] === false) {
    recommendations.push({
      type: "immediate",
      text: "Maintain baby warmth. Keep baby wrapped warmly and avoid cold exposure.",
    });
  }

  // Feeding advice
  if (answers["feeding"] === false || answers["latching"] === false) {
    recommendations.push({
      type: "feeding",
      text: "Monitor feeding closely. Consult lactation support if difficulties continue.",
    });
  }

  // Monitoring advice
  if (answers["activity"] === false || answers["sleeping"] === false) {
    recommendations.push({
      type: "monitoring",
      text: "Monitor activity level and sleep patterns closely. Track any changes.",
    });
  }

  // Escalation warning
  if (negativeAnswers.length >= 2) {
    recommendations.push({
      type: "escalation",
      text: "Contact healthcare provider if symptoms continue or worsen.",
    });
  }

  // If all answers are positive
  if (negativeAnswers.length === 0 && Object.keys(answers).length === BABY_HELPER_QUESTIONS.length) {
    recommendations.push({
      type: "immediate",
      text: "All checks passed! Continue routine care and daily monitoring.",
    });
  }

  return recommendations;
}

// ─── Structured Care Guide Generator ─────────────────────────────────────

export interface StructuredCareGuide {
  immediateCare: string[];
  feedingGuidance: string[];
  comfortGuidance: string[];
  monitoringAdvice: string[];
  medicalHelp: string[];
  priorityFocus: string;
}

export function generateStructuredGuide(
  answers: Record<string, boolean | null>,
): StructuredCareGuide {
  const guide: StructuredCareGuide = {
    immediateCare: [],
    feedingGuidance: [],
    comfortGuidance: [],
    monitoringAdvice: [],
    medicalHelp: [],
    priorityFocus: "",
  };

  // Determine priority focus
  const priorities: string[] = [];
  if (answers["feeding"] === false) priorities.push("feeding support");
  if (answers["temperature"] === false) priorities.push("body temperature regulation");
  if (answers["breathing"] === false) priorities.push("breathing comfort");
  if (answers["activity"] === false) priorities.push("activity monitoring");
  if (answers["sleeping"] === false) priorities.push("sleep care");
  if (answers["latching"] === false) priorities.push("latching support");

  if (priorities.length === 0) {
    guide.priorityFocus = "Continue routine care and daily monitoring.";
  } else if (priorities.length === 1) {
    guide.priorityFocus = `Focus on ${priorities[0]}.`;
  } else {
    guide.priorityFocus = `Focus on ${priorities.slice(0, -1).join(", ")} and ${priorities[priorities.length - 1]}.`;
  }

  // Immediate Care Priority
  if (answers["breathing"] === false) {
    guide.immediateCare.push("Watch for pauses in breathing");
    guide.immediateCare.push("Observe chest movement");
    guide.immediateCare.push("Seek immediate medical support if breathing difficulty persists");
  }
  if (answers["feeding"] === false) {
    guide.immediateCare.push("Try smaller frequent feeds");
    guide.immediateCare.push("Keep feeding intervals short");
    guide.immediateCare.push("Burp after feeds");
    guide.immediateCare.push("Monitor intake carefully");
  }
  if (answers["temperature"] === false) {
    guide.immediateCare.push("Keep baby wrapped warmly");
    guide.immediateCare.push("Avoid cold exposure");
    guide.immediateCare.push("Monitor room temperature");
  }

  // Feeding Guidance
  if (answers["feeding"] === false) {
    guide.feedingGuidance.push("Try smaller frequent feeds");
    guide.feedingGuidance.push("Ensure proper latch positioning");
    guide.feedingGuidance.push("Burp baby after feeding");
    guide.feedingGuidance.push("Consult a healthcare provider if feeding refusal continues");
  } else {
    guide.feedingGuidance.push("Continue feeding every 2–3 hours");
    guide.feedingGuidance.push("Maintain hydration and monitor feeding comfort");
  }

  if (answers["latching"] === false) {
    guide.feedingGuidance.push("Try skin-to-skin contact");
    guide.feedingGuidance.push("Adjust feeding position");
    guide.feedingGuidance.push("Consult lactation support if needed");
  } else {
    guide.feedingGuidance.push("Continue feeding support");
    guide.feedingGuidance.push("Monitor feeding duration");
  }

  // Comfort & Recovery Guidance
  if (answers["sleeping"] === false) {
    guide.comfortGuidance.push("Reduce noise and bright light");
    guide.comfortGuidance.push("Keep sleeping area warm");
    guide.comfortGuidance.push("Observe sleep duration");
    guide.comfortGuidance.push("Track sleeping patterns");
  } else {
    guide.comfortGuidance.push("Maintain safe sleep positioning");
    guide.comfortGuidance.push("Keep sleep environment calm");
  }

  if (answers["temperature"] === false) {
    guide.comfortGuidance.push("Keep baby wrapped warmly");
    guide.comfortGuidance.push("Avoid cold exposure");
    guide.comfortGuidance.push("Monitor body temperature regularly");
  } else {
    guide.comfortGuidance.push("Continue maintaining warm surroundings");
    guide.comfortGuidance.push("Avoid sudden temperature changes");
  }

  if (answers["crying"] === false) {
    guide.comfortGuidance.push("Continue normal observation");
    guide.comfortGuidance.push("Maintain routine care");
  } else {
    guide.comfortGuidance.push("Check feeding, diaper comfort, and temperature");
    guide.comfortGuidance.push("Monitor whether crying becomes persistent");
  }

  // Monitoring Advice
  if (answers["activity"] === false) {
    guide.monitoringAdvice.push("Monitor feeding intake and sleeping duration");
    guide.monitoringAdvice.push("Observe if reduced activity continues");
    guide.monitoringAdvice.push("Contact a healthcare provider if symptoms worsen");
  } else {
    guide.monitoringAdvice.push("Baby responsiveness appears healthy");
    guide.monitoringAdvice.push("Continue monitoring activity");
  }

  guide.monitoringAdvice.push("Monitor feeding consistency");
  guide.monitoringAdvice.push("Monitor breathing comfort");
  guide.monitoringAdvice.push("Monitor activity levels");
  guide.monitoringAdvice.push("Monitor temperature stability");

  // When To Seek Medical Help
  if (answers["breathing"] === false) {
    guide.medicalHelp.push("Seek medical support if breathing remains uncomfortable");
  }
  if (answers["feeding"] === false && answers["activity"] === false) {
    guide.medicalHelp.push("Persistent feeding refusal and low activity require medical attention");
  }
  if (answers["temperature"] === false) {
    guide.medicalHelp.push("Seek medical guidance if temperature remains unstable");
  }
  if (answers["feeding"] === false) {
    guide.medicalHelp.push("Consult a healthcare provider if feeding refusal continues");
  }

  // If all positive
  const allPositive = Object.values(answers).every((v) => v === true);
  if (allPositive && Object.keys(answers).length === BABY_HELPER_QUESTIONS.length) {
    guide.priorityFocus = "Your baby seems to be doing well. Continue routine care.";
    guide.medicalHelp.push("Continue regular check-ups as advised by your doctor");
  }

  return guide;
}
