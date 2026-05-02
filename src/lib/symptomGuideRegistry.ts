/**
 * symptomGuideRegistry.ts
 *
 * Central encyclopedia of symptoms used by the Symptom Guide search feature.
 * Each entry provides a short description, possible causes, and phase tags.
 *
 * IMPORTANT: All content uses neutral, non-diagnostic language.
 * We never diagnose — we educate.
 */

import type { Phase } from "@/hooks/usePhase";

export interface SymptomGuideEntry {
  id: string;
  name: string;
  emoji: string;
  shortDescription: string;
  possibleCauses: string[];
  phaseTags: Phase[];
  category: "core" | "phase-specific";
}

// ─── Full Symptom Guide Registry ──────────────────────────────────────────

export const SYMPTOM_GUIDE_REGISTRY: SymptomGuideEntry[] = [
  // ── Core Symptoms (shared across phases) ──
  {
    id: "fatigue",
    name: "Fatigue",
    emoji: "😴",
    shortDescription:
      "Feeling unusually tired or low on energy. This can be linked to sleep quality, nutrition, or hormonal changes.",
    possibleCauses: [
      "Low iron or B12 levels",
      "Poor or insufficient sleep",
      "Hormonal fluctuations",
      "Dehydration or poor nutrition",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "dizziness",
    name: "Dizziness",
    emoji: "💫",
    shortDescription:
      "A sensation of lightheadedness or feeling unsteady. Often temporary and may be linked to hydration or iron levels.",
    possibleCauses: [
      "Low blood pressure or dehydration",
      "Iron-deficiency anemia",
      "Standing up too quickly",
      "Skipping meals",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "weakness",
    name: "Weakness",
    emoji: "🫠",
    shortDescription:
      "A feeling of reduced physical strength or energy. May indicate nutritional gaps or lack of rest.",
    possibleCauses: [
      "Low protein or iron intake",
      "Insufficient sleep or recovery",
      "Magnesium deficiency",
      "Prolonged stress",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "moodSwings",
    name: "Mood Swings",
    emoji: "🎭",
    shortDescription:
      "Rapid or unexpected changes in emotional state. Often associated with hormonal shifts or stress.",
    possibleCauses: [
      "Hormonal changes during the cycle",
      "Sleep deprivation",
      "Stress or emotional pressure",
      "Nutritional imbalances (magnesium, omega-3)",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "anxiety",
    name: "Anxiety",
    emoji: "😰",
    shortDescription:
      "Persistent worry, nervousness, or unease. May be influenced by stress, hormones, or lifestyle factors.",
    possibleCauses: [
      "Stress or overthinking",
      "Hormonal fluctuations",
      "Low magnesium levels",
      "Caffeine or poor sleep",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "brainFog",
    name: "Brain Fog",
    emoji: "🌫️",
    shortDescription:
      "Difficulty concentrating, forgetfulness, or mental cloudiness. Often linked to sleep or nutritional gaps.",
    possibleCauses: [
      "Poor sleep quality",
      "Low iron or B12",
      "Dehydration",
      "Hormonal changes",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "sleepIssues",
    name: "Sleep Issues",
    emoji: "🌙",
    shortDescription:
      "Trouble falling asleep, staying asleep, or waking up feeling unrefreshed. Can affect overall well-being.",
    possibleCauses: [
      "Stress or anxiety",
      "Screen time before bed",
      "Hormonal changes",
      "Irregular sleep schedule",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "backPain",
    name: "Back Pain",
    emoji: "🔙",
    shortDescription:
      "Discomfort or aching in the back area. May be related to posture, physical strain, or nutritional needs.",
    possibleCauses: [
      "Poor posture or prolonged sitting",
      "Low calcium or vitamin D",
      "Physical strain or heavy lifting",
      "Hormonal changes during pregnancy",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "headache",
    name: "Headache",
    emoji: "🤕",
    shortDescription:
      "Pain or pressure in the head. Can range from mild to severe and may be triggered by various factors.",
    possibleCauses: [
      "Dehydration",
      "Stress or tension",
      "Magnesium deficiency",
      "Screen strain or poor sleep",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "appetiteChanges",
    name: "Appetite Changes",
    emoji: "🍽️",
    shortDescription:
      "Increased or decreased appetite. Often associated with hormonal shifts, stress, or emotional state.",
    possibleCauses: [
      "Hormonal fluctuations",
      "Stress or emotional changes",
      "Nutritional deficiencies",
      "Changes in activity level",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "bloating",
    name: "Bloating",
    emoji: "🫧",
    shortDescription:
      "A feeling of fullness or swelling in the abdomen. Often related to digestion, diet, or hormonal changes.",
    possibleCauses: [
      "Dietary triggers (gas-producing foods)",
      "Menstrual cycle changes",
      "Low fiber intake",
      "Eating too quickly",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "constipation",
    name: "Constipation",
    emoji: "😣",
    shortDescription:
      "Infrequent or difficult bowel movements. May be influenced by diet, hydration, or hormonal changes.",
    possibleCauses: [
      "Low fiber or water intake",
      "Hormonal changes (especially in pregnancy)",
      "Lack of physical activity",
      "Iron supplements",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },
  {
    id: "swelling",
    name: "Swelling",
    emoji: "🦶",
    shortDescription:
      "Puffiness in hands, feet, or legs. May be related to fluid retention, posture, or diet.",
    possibleCauses: [
      "Prolonged standing or sitting",
      "High salt intake",
      "Hormonal changes",
      "Hot weather",
    ],
    phaseTags: ["puberty", "maternity", "family-planning", "menopause"],
    category: "core",
  },

  // ── Puberty-Specific ──
  {
    id: "cramps",
    name: "Cramps",
    emoji: "😖",
    shortDescription:
      "Pain in the lower abdomen during or before menstruation. A very common experience during puberty.",
    possibleCauses: [
      "Uterine muscle contractions during periods",
      "Hormonal changes",
      "Low magnesium or calcium",
      "Stress or tension",
    ],
    phaseTags: ["puberty", "family-planning"],
    category: "phase-specific",
  },
  {
    id: "acne",
    name: "Acne",
    emoji: "😤",
    shortDescription:
      "Breakouts on the face, back, or shoulders. Often linked to hormonal changes during puberty.",
    possibleCauses: [
      "Hormonal fluctuations",
      "Excess oil production",
      "Stress",
      "Diet high in processed foods",
    ],
    phaseTags: ["puberty"],
    category: "phase-specific",
  },
  {
    id: "breastTenderness",
    name: "Breast Tenderness",
    emoji: "💗",
    shortDescription:
      "Soreness or sensitivity in the breast area. Often associated with hormonal changes during the cycle.",
    possibleCauses: [
      "Hormonal fluctuations before periods",
      "Puberty-related growth",
      "Pregnancy-related changes",
      "Caffeine sensitivity",
    ],
    phaseTags: ["puberty", "maternity"],
    category: "phase-specific",
  },
  {
    id: "heavyPeriod",
    name: "Heavy Period",
    emoji: "🩸",
    shortDescription:
      "Menstrual flow that is heavier than usual. May increase iron needs and affect energy levels.",
    possibleCauses: [
      "Hormonal imbalances",
      "Early cycles during puberty",
      "Low iron stores",
      "Stress",
    ],
    phaseTags: ["puberty"],
    category: "phase-specific",
  },
  {
    id: "irregularCycle",
    name: "Irregular Cycle",
    emoji: "📅",
    shortDescription:
      "Menstrual cycles that vary significantly in length or timing. Common during puberty and perimenopause.",
    possibleCauses: [
      "Hormonal maturation (puberty)",
      "Stress or lifestyle changes",
      "Weight changes",
      "Hormonal transition (perimenopause)",
    ],
    phaseTags: ["puberty", "family-planning"],
    category: "phase-specific",
  },
  {
    id: "growthPain",
    name: "Growth Pain",
    emoji: "📏",
    shortDescription:
      "Aching or discomfort in legs or joints during rapid growth. Common in early puberty.",
    possibleCauses: [
      "Rapid bone and muscle growth",
      "Calcium or vitamin D needs",
      "Physical activity during growth spurts",
    ],
    phaseTags: ["puberty"],
    category: "phase-specific",
  },
  {
    id: "hairChanges",
    name: "Hair Changes",
    emoji: "💇",
    shortDescription:
      "Changes in hair texture, oiliness, or growth patterns. Often related to hormonal shifts.",
    possibleCauses: [
      "Hormonal changes during puberty",
      "Nutritional deficiencies (iron, zinc)",
      "Stress",
    ],
    phaseTags: ["puberty"],
    category: "phase-specific",
  },

  // ── Maternity-Specific ──
  {
    id: "nausea",
    name: "Nausea",
    emoji: "🤢",
    shortDescription:
      "A queasy feeling or urge to vomit. Very common in early pregnancy and often called 'morning sickness.'",
    possibleCauses: [
      "Hormonal changes (hCG levels)",
      "Empty stomach",
      "Strong smells or food aversions",
      "Low B6 levels",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "vomiting",
    name: "Vomiting",
    emoji: "🤮",
    shortDescription:
      "Throwing up, often alongside nausea. If persistent, it's important to stay hydrated.",
    possibleCauses: [
      "Severe morning sickness",
      "Food sensitivity",
      "Hormonal surges",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "legCramps",
    name: "Leg Cramps",
    emoji: "🦵",
    shortDescription:
      "Sudden, painful tightening of leg muscles, especially at night. Common in the 2nd and 3rd trimesters.",
    possibleCauses: [
      "Low magnesium or potassium",
      "Increased body weight",
      "Poor circulation",
      "Dehydration",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "heartburn",
    name: "Heartburn",
    emoji: "🔥",
    shortDescription:
      "A burning sensation in the chest or throat. Often occurs after meals during pregnancy.",
    possibleCauses: [
      "Hormonal relaxation of the stomach valve",
      "Growing uterus pressing on the stomach",
      "Spicy or fatty foods",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "spotting",
    name: "Spotting",
    emoji: "🔴",
    shortDescription:
      "Light bleeding outside of a regular period. During pregnancy, it can have various causes.",
    possibleCauses: [
      "Implantation bleeding (early pregnancy)",
      "Cervical sensitivity",
      "Hormonal changes",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "breathlessness",
    name: "Breathlessness",
    emoji: "😮‍💨",
    shortDescription:
      "Feeling short of breath, especially during exertion. Common as pregnancy progresses.",
    possibleCauses: [
      "Growing uterus pressing on the diaphragm",
      "Increased blood volume",
      "Low iron levels",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "frequentUrination",
    name: "Frequent Urination",
    emoji: "🚻",
    shortDescription:
      "Needing to use the bathroom more often. Common in early and late pregnancy.",
    possibleCauses: [
      "Pressure on the bladder from the uterus",
      "Increased blood flow to the kidneys",
      "Hormonal changes",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "cravings",
    name: "Cravings",
    emoji: "🍫",
    shortDescription:
      "Strong desire for specific foods. May reflect nutritional needs or hormonal influences.",
    possibleCauses: [
      "Hormonal shifts during pregnancy",
      "Nutritional deficiencies",
      "Emotional comfort seeking",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "skinChanges",
    name: "Skin Changes",
    emoji: "✨",
    shortDescription:
      "Changes in skin tone, texture, or sensitivity. Can include darkening, dryness, or increased oiliness.",
    possibleCauses: [
      "Hormonal changes",
      "Increased blood circulation",
      "Sun sensitivity during pregnancy",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },
  {
    id: "pelvicPressure",
    name: "Pelvic Pressure",
    emoji: "⬇️",
    shortDescription:
      "A heavy or pressing sensation in the pelvic area. Common as the baby grows and descends.",
    possibleCauses: [
      "Baby's weight pressing on the pelvis",
      "Loosening of pelvic ligaments",
      "Third trimester preparation",
    ],
    phaseTags: ["maternity"],
    category: "phase-specific",
  },

  // ── Family Planning-Specific ──
  {
    id: "ovulationPain",
    name: "Ovulation Pain",
    emoji: "🎯",
    shortDescription:
      "A brief, sharp pain on one side of the lower abdomen around mid-cycle. Also known as 'mittelschmerz.'",
    possibleCauses: [
      "Egg release from the ovary",
      "Follicle stretching before ovulation",
      "Mild inflammation during ovulation",
    ],
    phaseTags: ["family-planning"],
    category: "phase-specific",
  },
  {
    id: "moodChanges",
    name: "Mood Changes",
    emoji: "🌊",
    shortDescription:
      "Shifts in emotional state that may follow cycle patterns. Often linked to hormonal transitions.",
    possibleCauses: [
      "Luteal phase hormonal shifts",
      "Stress and lifestyle factors",
      "Sleep quality changes",
    ],
    phaseTags: ["family-planning"],
    category: "phase-specific",
  },
  {
    id: "stress",
    name: "Stress",
    emoji: "😓",
    shortDescription:
      "Feeling overwhelmed, tense, or pressured. Can affect both mental and physical well-being.",
    possibleCauses: [
      "Work or life pressures",
      "Fertility concerns",
      "Sleep deprivation",
      "Nutritional depletion (magnesium)",
    ],
    phaseTags: ["family-planning", "menopause"],
    category: "phase-specific",
  },

  // ── Menopause-Specific ──
  {
    id: "hotFlashes",
    name: "Hot Flashes",
    emoji: "🥵",
    shortDescription:
      "Sudden waves of heat, often with sweating and flushing. One of the most common menopause symptoms.",
    possibleCauses: [
      "Declining estrogen levels",
      "Changes in the body's temperature regulation",
      "Triggered by heat, stress, or caffeine",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "nightSweats",
    name: "Night Sweats",
    emoji: "🌡️",
    shortDescription:
      "Episodes of heavy sweating during sleep, often disrupting rest. Related to hot flashes.",
    possibleCauses: [
      "Hormonal fluctuations",
      "Body temperature dysregulation",
      "Warm sleeping environment",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "jointPain",
    name: "Joint Pain",
    emoji: "🦴",
    shortDescription:
      "Stiffness, aching, or discomfort in joints. May increase during menopause due to hormonal changes.",
    possibleCauses: [
      "Declining estrogen (affects joint lubrication)",
      "Low vitamin D or calcium",
      "Reduced physical activity",
      "Inflammation",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "dryness",
    name: "Vaginal Dryness",
    emoji: "💧",
    shortDescription:
      "Reduced moisture in the vaginal area. A common but often undiscussed menopause symptom.",
    possibleCauses: [
      "Declining estrogen levels",
      "Hormonal changes during menopause",
      "Dehydration",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "weightGain",
    name: "Weight Gain",
    emoji: "⚖️",
    shortDescription:
      "Gradual increase in body weight, especially around the midsection. Often associated with metabolic changes.",
    possibleCauses: [
      "Slowing metabolism with age",
      "Hormonal shifts",
      "Reduced physical activity",
      "Changes in appetite or eating patterns",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "memoryIssues",
    name: "Memory Issues",
    emoji: "🧠",
    shortDescription:
      "Forgetfulness or difficulty recalling things. Sometimes called 'menopause brain fog.'",
    possibleCauses: [
      "Hormonal changes affecting cognition",
      "Poor sleep quality",
      "Stress and multitasking",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "irritability",
    name: "Irritability",
    emoji: "😤",
    shortDescription:
      "Feeling easily annoyed or frustrated. May be linked to hormonal shifts, sleep loss, or stress.",
    possibleCauses: [
      "Hormonal fluctuations",
      "Sleep disruption from night sweats",
      "Accumulated stress",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "heartPalpitations",
    name: "Heart Palpitations",
    emoji: "💓",
    shortDescription:
      "A feeling of rapid, fluttering, or pounding heartbeat. Can feel alarming but is often benign.",
    possibleCauses: [
      "Hormonal changes during menopause",
      "Anxiety or stress",
      "Caffeine or stimulants",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "bonePain",
    name: "Bone Pain",
    emoji: "🦴",
    shortDescription:
      "Deep aching in the bones. May be linked to calcium and vitamin D levels, especially during menopause.",
    possibleCauses: [
      "Calcium or vitamin D deficiency",
      "Declining estrogen (affects bone density)",
      "Lack of weight-bearing exercise",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "hairThinning",
    name: "Hair Thinning",
    emoji: "💇",
    shortDescription:
      "Gradual reduction in hair volume or thickness. Often related to hormonal or nutritional changes.",
    possibleCauses: [
      "Hormonal shifts (declining estrogen)",
      "Iron or zinc deficiency",
      "Stress",
      "Low protein intake",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "urinaryIssues",
    name: "Urinary Issues",
    emoji: "🚻",
    shortDescription:
      "Increased urgency, frequency, or mild incontinence. Often related to pelvic floor changes.",
    possibleCauses: [
      "Weakened pelvic floor muscles",
      "Declining estrogen",
      "Urinary tract sensitivity",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
  {
    id: "lowLibido",
    name: "Low Libido",
    emoji: "💔",
    shortDescription:
      "Reduced interest in intimacy. A common experience during menopause, influenced by multiple factors.",
    possibleCauses: [
      "Hormonal changes (declining estrogen and testosterone)",
      "Fatigue or sleep issues",
      "Emotional or relationship factors",
      "Vaginal dryness causing discomfort",
    ],
    phaseTags: ["menopause"],
    category: "phase-specific",
  },
];

// ─── Postpartum / Premature Symptom Guide Entries ─────────────────────────
// Appended separately for clarity — these are part of SYMPTOM_GUIDE_REGISTRY

SYMPTOM_GUIDE_REGISTRY.push(
  {
    id: "breastPain",
    name: "Breast Pain",
    emoji: "💗",
    shortDescription:
      "Pain or soreness in the breasts, common during breastfeeding or when milk comes in. Usually temporary and improves with proper technique.",
    possibleCauses: [
      "Breast engorgement (milk buildup)",
      "Improper latch during breastfeeding",
      "Blocked milk duct",
      "Hormonal changes post-delivery",
    ],
    phaseTags: ["maternity"],
    category: "core",
  },
  {
    id: "nipplePain",
    name: "Nipple Pain",
    emoji: "⚡",
    shortDescription:
      "Soreness, cracking, or sensitivity in the nipples, often experienced during the early days of breastfeeding.",
    possibleCauses: [
      "Shallow latch during breastfeeding",
      "Dry or cracked skin",
      "Tongue-tie in baby affecting latch",
      "Sensitivity due to hormonal changes",
    ],
    phaseTags: ["maternity"],
    category: "core",
  },
  {
    id: "lowMilkSupply",
    name: "Low Milk Supply",
    emoji: "🍼",
    shortDescription:
      "Feeling that breast milk production is insufficient. Often related to feeding frequency, hydration, or stress levels.",
    possibleCauses: [
      "Infrequent feeding or pumping",
      "Dehydration or poor nutrition",
      "Stress or fatigue",
      "Hormonal imbalances post-delivery",
    ],
    phaseTags: ["maternity"],
    category: "core",
  },
  {
    id: "lowEnergy",
    name: "Low Energy",
    emoji: "🔋",
    shortDescription:
      "Feeling persistently drained or lacking physical energy. Very common in the postpartum and premature recovery period.",
    possibleCauses: [
      "Sleep deprivation from newborn care",
      "Iron or B12 deficiency",
      "Insufficient caloric intake",
      "Hormonal shifts after delivery",
    ],
    phaseTags: ["maternity"],
    category: "core",
  },
  {
    id: "sleepDeprivation",
    name: "Sleep Deprivation",
    emoji: "🥱",
    shortDescription:
      "Chronic lack of adequate sleep, commonly caused by newborn feeding schedules and night waking.",
    possibleCauses: [
      "Frequent nighttime feedings",
      "Baby's irregular sleep patterns",
      "Anxiety or hypervigilance about the baby",
      "Physical discomfort post-delivery",
    ],
    phaseTags: ["maternity"],
    category: "core",
  },
);

// ─── Search & Lookup Utilities ────────────────────────────────────────────

/**
 * Fuzzy search across symptom guide entries.
 * Matches on name, description, and causes.
 */
export function searchSymptomGuide(
  query: string,
  phase?: Phase,
): SymptomGuideEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();

  return SYMPTOM_GUIDE_REGISTRY.filter((entry) => {
    // Phase filter (if provided)
    if (phase && !entry.phaseTags.includes(phase)) return false;

    // Fuzzy match on name, description, and causes
    if (entry.name.toLowerCase().includes(q)) return true;
    if (entry.shortDescription.toLowerCase().includes(q)) return true;
    if (entry.possibleCauses.some((c) => c.toLowerCase().includes(q)))
      return true;

    return false;
  }).slice(0, 10);
}

/**
 * Get a single symptom guide entry by ID.
 */
export function getSymptomGuideEntry(
  id: string,
): SymptomGuideEntry | undefined {
  return SYMPTOM_GUIDE_REGISTRY.find((e) => e.id === id);
}

/**
 * Get popular/common symptoms for a given phase.
 * Returns the most relevant symptoms for chip display.
 */
export function getPopularSymptoms(phase: Phase): SymptomGuideEntry[] {
  // Phase-specific first, then core — limited to 8
  const phaseSpecific = SYMPTOM_GUIDE_REGISTRY.filter(
    (e) => e.phaseTags.includes(phase) && e.category === "phase-specific",
  );
  const core = SYMPTOM_GUIDE_REGISTRY.filter(
    (e) => e.phaseTags.includes(phase) && e.category === "core",
  );
  return [...phaseSpecific.slice(0, 5), ...core.slice(0, 3)];
}

/**
 * Get phase tag display label.
 */
export function getPhaseTagLabel(phase: Phase): string {
  switch (phase) {
    case "puberty":
      return "Common in puberty";
    case "maternity":
      return "Seen in pregnancy";
    case "family-planning":
      return "Relevant for fertility";
    case "menopause":
      return "Common in menopause";
    default:
      return "";
  }
}
