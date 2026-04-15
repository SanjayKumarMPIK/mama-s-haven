/**
 * Weekly Guidance Engine
 *
 * Pure-logic module. Computes personalized weekly guidance from:
 *   1. User DOB  →  age  →  age group
 *   2. Last-7-day period-phase symptom logs  →  top 2-3 symptoms
 *   3. Combines both to generate experience, nutrition, and emotional-care text
 *
 * No side-effects — usable on both client and server (Supabase Edge Function).
 */

// ─── Age helpers ─────────────────────────────────────────────────────────────

export type AgeGroup =
  | "Early Puberty"
  | "Peak Puberty"
  | "Identity Phase"
  | "Maturity Phase"
  | "Adult";

export function calculateAge(dobISO: string, now: Date = new Date()): number {
  const dob = new Date(dobISO);
  if (isNaN(dob.getTime())) return -1;
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function classifyAgeGroup(age: number): AgeGroup {
  if (age >= 10 && age <= 12) return "Early Puberty";
  if (age >= 13 && age <= 14) return "Peak Puberty";
  if (age >= 15 && age <= 16) return "Identity Phase";
  if (age >= 17 && age <= 18) return "Maturity Phase";
  return "Adult";
}

// ─── Symptom frequency ──────────────────────────────────────────────────────

export type SymptomKey =
  | "cramps"
  | "fatigue"
  | "moodSwings"
  | "headache"
  | "acne"
  | "breastTenderness"
  | "bloating";

const SYMPTOM_LABELS: Record<SymptomKey, string> = {
  cramps: "Cramps",
  fatigue: "Fatigue",
  moodSwings: "Mood Swings",
  headache: "Headache",
  acne: "Acne",
  breastTenderness: "Breast Tenderness",
  bloating: "Bloating",
};

export interface SymptomFrequency {
  key: SymptomKey;
  label: string;
  count: number;
}

/**
 * Given the raw HealthLogs (from localStorage), filter to PERIOD-phase entries
 * within the last `daysBack` days and count each boolean symptom.
 */
export function countPeriodSymptoms(
  logs: Record<string, any>,
  daysBack: number = 7,
  today: Date = new Date()
): SymptomFrequency[] {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - daysBack);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const todayISO = today.toISOString().slice(0, 10);

  const counts: Record<string, number> = {};

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (dateISO < cutoffISO || dateISO > todayISO) continue;
    // Only puberty entries count as "period phase" in this app
    if (!entry || entry.phase !== "puberty") continue;

    const symptoms = entry.symptoms;
    if (!symptoms || typeof symptoms !== "object") continue;

    for (const [key, value] of Object.entries(symptoms)) {
      if (value === true) {
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([key, count]) => ({
      key: key as SymptomKey,
      label: SYMPTOM_LABELS[key as SymptomKey] ?? key,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getTopSymptoms(
  frequencies: SymptomFrequency[],
  topN: number = 3
): SymptomFrequency[] {
  return frequencies.slice(0, topN);
}

// ─── Guidance generation ─────────────────────────────────────────────────────

export interface WeeklyGuidanceResult {
  ageGroup: AgeGroup;
  topSymptoms: string[];
  experience: string;
  nutrition: string[];
  emotionalCare: string[];
}

// ── Experience text (age-adaptive) ───────────────────────────────────────────

const EXPERIENCE_BY_SYMPTOM: Record<
  string,
  Record<AgeGroup, string>
> = {
  cramps: {
    "Early Puberty":
      "Your body is still getting used to menstruation — cramps happen because your uterus contracts to shed its lining. This is completely normal and will likely ease over time as your cycle becomes more regular.",
    "Peak Puberty":
      "Cramps are one of the most common period experiences at your age. Your body releases prostaglandins that cause your uterus to contract, and some months can feel stronger than others. It's nothing to worry about.",
    "Identity Phase":
      "Period cramps are your body's natural response to your cycle. By now you might be noticing a pattern in how intense they get — tracking them helps you prepare and manage better.",
    "Maturity Phase":
      "Cramps are a well-known part of your cycle. Understanding that they're caused by prostaglandins gives you the power to manage them proactively with heat, movement, and the right nutrition.",
    Adult:
      "Menstrual cramps are caused by uterine contractions and prostaglandin release. The intensity can vary cycle to cycle and may be influenced by stress, diet, and activity levels.",
  },
  fatigue: {
    "Early Puberty":
      "If you're feeling more tired than usual during your period, that's your body working hard. Hormonal shifts and iron loss through menstruation can drain your energy — rest is not laziness, it's recovery.",
    "Peak Puberty":
      "Period fatigue is real and very common at your age. Between school, growth spurts, and your cycle, your body needs more energy. Listen to it — extra rest and good nutrition make a big difference.",
    "Identity Phase":
      "Feeling exhausted during your period? Dropping estrogen and progesterone levels combined with iron loss can leave you wiped out. Prioritising sleep and iron-rich foods this week can really help.",
    "Maturity Phase":
      "Fatigue during your period often comes from hormonal dips and nutrient depletion. It's your body signalling that it needs support — not a sign of weakness.",
    Adult:
      "Period-related fatigue stems from hormonal fluctuations, particularly the drop in estrogen beyond mid-cycle, and iron loss. Supporting your body with rest and nutrition is essential during this phase.",
  },
  moodSwings: {
    "Early Puberty":
      "If your emotions feel like a rollercoaster right now, that's completely normal. Hormonal changes during your period can make you feel happy one moment and teary the next — you're not being dramatic, your body is adjusting.",
    "Peak Puberty":
      "Mood swings during your period are driven by hormone fluctuations. It can feel overwhelming, but knowing that everyone experiences this differently can help you feel less alone.",
    "Identity Phase":
      "Your hormonal cycle directly affects neurotransmitters like serotonin, which is why your mood can shift during your period. Self-awareness is your best tool — notice the patterns without judging yourself.",
    "Maturity Phase":
      "Mood changes during menstruation are linked to hormone-driven shifts in brain chemistry. Recognising that these are temporary physiological responses helps you respond with intention rather than reaction.",
    Adult:
      "Premenstrual and menstrual mood shifts are well-documented and driven by estrogen and progesterone fluctuations affecting serotonin pathways. Awareness and proactive coping strategies make a real difference.",
  },
  headache: {
    "Early Puberty":
      "Headaches around your period can happen because of hormone changes — especially the drop in estrogen. Staying hydrated and resting in a quiet space usually helps.",
    "Peak Puberty":
      "Menstrual headaches are linked to the hormonal dip that triggers your period. Dehydration, skipped meals, and screen time can make them worse, so taking care of the basics really matters.",
    "Identity Phase":
      "Period headaches are tied to estrogen withdrawal. If you notice them consistently right before or during your period, tracking that pattern can help you stay ahead with prevention.",
    "Maturity Phase":
      "Hormonal headaches are a recognised pattern. Understanding your personal triggers — whether it's dehydration, caffeine, or sleep changes — puts you in control.",
    Adult:
      "Menstrual headaches and migraines are associated with estrogen withdrawal. If they follow a predictable pattern, preventive strategies and lifestyle adjustments can significantly reduce their impact.",
  },
  acne: {
    "Early Puberty":
      "Breakouts around your period are super common and happen because of hormone shifts that increase oil production. It doesn't mean you're doing anything wrong — it's just your body adjusting.",
    "Peak Puberty":
      "Period acne is driven by a rise in androgens before menstruation. A gentle, consistent skincare routine is far more effective than harsh products or picking.",
    "Identity Phase":
      "Hormonal acne around your period is a pattern many people deal with. Understanding that it's cyclical helps — what works is consistency in skincare, not chasing quick fixes.",
    "Maturity Phase":
      "Period-related breakouts come from pre-menstrual androgen spikes. Keeping a simple, gentle routine and avoiding over-treating your skin leads to better results over time.",
    Adult:
      "Cyclical acne is driven by androgen fluctuations in the luteal phase. Consistent gentle cleansing and targeted treatments work better than reactive measures.",
  },
  breastTenderness: {
    "Early Puberty":
      "If your breasts feel sore or tender before or during your period, that's very normal — especially when your body is still developing. Hormonal shifts cause breast tissue to swell slightly.",
    "Peak Puberty":
      "Breast tenderness during your period is caused by estrogen and progesterone changes. A well-fitting, supportive bra and gentle cold or warm compresses can provide real relief.",
    "Identity Phase":
      "Cyclical breast tenderness is linked to hormonal changes in the second half of your cycle. It's common and usually resolves once your period starts.",
    "Maturity Phase":
      "Breast tenderness before your period is driven by progesterone-related fluid retention. Comfortable support wear and reducing caffeine can ease the discomfort.",
    Adult:
      "Cyclical mastalgia (breast tenderness) is associated with progesterone fluctuations. It typically peaks in the luteal phase and resolves with menstruation.",
  },
  bloating: {
    "Early Puberty":
      "Feeling puffy or bloated around your period is totally normal. Hormone changes cause your body to retain water temporarily — it's not weight gain, it passes.",
    "Peak Puberty":
      "Period bloating is caused by progesterone slowing down digestion and making your body hold onto water. It's temporary and very common — you're not alone in feeling this way.",
    "Identity Phase":
      "Bloating during your period is a hormonal response — progesterone affects digestion and fluid balance. Staying hydrated and reducing salt can actually help your body let go of the excess water.",
    "Maturity Phase":
      "Menstrual bloating comes from progesterone's effect on your GI tract and fluid retention. Understanding the mechanism can help you manage it calmly and proactively.",
    Adult:
      "Period bloating is mediated by progesterone-driven fluid retention and gastrointestinal slowing. Dietary adjustments (reduced sodium, adequate hydration) and gentle movement are effective strategies.",
  },
};

function buildExperienceText(
  ageGroup: AgeGroup,
  topSymptomKeys: SymptomKey[]
): string {
  if (topSymptomKeys.length === 0) {
    return "No specific period symptoms were logged this week. Keep tracking — even quiet weeks tell your body's story.";
  }

  const parts: string[] = [];
  for (const key of topSymptomKeys.slice(0, 2)) {
    const map = EXPERIENCE_BY_SYMPTOM[key];
    if (map) {
      parts.push(map[ageGroup]);
    }
  }

  return parts.join(" ") || "Your logged symptoms this week are part of your body's natural cycle. Keep tracking for deeper insights.";
}

// ── Nutrition advice (symptom-based) ─────────────────────────────────────────

const NUTRITION_BY_SYMPTOM: Record<string, string[]> = {
  cramps: [
    "Focus on iron and magnesium — try spinach, bananas, dark chocolate, and pumpkin seeds.",
    "Warm ginger or turmeric tea can help relax uterine muscles and reduce cramping.",
  ],
  fatigue: [
    "Boost iron and protein — eggs, dates, legumes (dal, chana), and leafy greens are your friends.",
    "Pair iron-rich foods with vitamin C (lemon, amla, orange) to improve absorption.",
  ],
  moodSwings: [
    "Omega-3 fatty acids support brain chemistry — include flaxseeds, walnuts, or fish if you eat it.",
    "Stay hydrated and maintain steady blood sugar with small, frequent meals instead of skipping them.",
  ],
  headache: [
    "Dehydration is a common trigger — aim for at least 8 glasses of water throughout the day.",
    "Magnesium-rich foods like almonds, sesame seeds, and bananas may reduce headache frequency.",
  ],
  acne: [
    "Zinc-rich foods like pumpkin seeds, chickpeas, and whole grains support skin healing.",
    "Reduce refined sugar and processed snacks which can worsen hormonal breakouts.",
  ],
  breastTenderness: [
    "Reduce caffeine intake — tea, coffee, and cola can worsen breast tenderness.",
    "Evening-primrose-oil-rich foods and seeds (flax, sunflower) may ease cyclical breast discomfort.",
  ],
  bloating: [
    "Reduce salt intake and drink more water — counterintuitive, but hydration helps reduce water retention.",
    "Potassium-rich foods like bananas, coconut water, and sweet potatoes help balance fluids.",
  ],
};

function buildNutritionAdvice(topSymptomKeys: SymptomKey[]): string[] {
  if (topSymptomKeys.length === 0) {
    return [
      "Maintain a balanced diet with whole grains, vegetables, and adequate protein.",
      "Stay hydrated — water supports every phase of your menstrual cycle.",
    ];
  }

  const advice: string[] = [];
  const seen = new Set<string>();

  for (const key of topSymptomKeys) {
    const items = NUTRITION_BY_SYMPTOM[key];
    if (items) {
      for (const item of items) {
        if (!seen.has(item)) {
          seen.add(item);
          advice.push(item);
        }
      }
    }
  }

  // Cap at 4 items for readability
  return advice.slice(0, 4);
}

// ── Emotional care (age-sensitive) ───────────────────────────────────────────

const EMOTIONAL_CARE_BASE: Record<AgeGroup, string[]> = {
  "Early Puberty": [
    "Everything you're feeling is normal — your body is doing something incredible right now.",
    "If you feel confused or overwhelmed, that's okay. Talk to someone you trust — a parent, older sibling, or school counsellor.",
    "You don't need to 'handle it' perfectly. Just being aware of how you feel is a great start.",
  ],
  "Peak Puberty": [
    "Avoid comparing your body or cycle to others — everyone's experience is different and valid.",
    "Mood swings don't define you. They're a temporary hormonal response, not your personality.",
    "Create a small comfort kit for period days — a heat pack, your favourite snack, a playlist that calms you.",
  ],
  "Identity Phase": [
    "Self-awareness is your superpower. Try journaling how you feel each day of your cycle — patterns emerge that help you plan.",
    "Give yourself permission to slow down during your period without feeling guilty about productivity.",
    "If you notice consistent low mood or anxiety during your period, that's worth tracking and discussing with someone you trust.",
  ],
  "Maturity Phase": [
    "You're at an age where understanding your cycle gives you real control. Use that knowledge to set boundaries around rest and work.",
    "Stress management matters — even 5 minutes of breathing or stretching can shift your nervous system.",
    "Your period is not a weakness. Knowing how to work with your cycle is a strength most people never develop.",
  ],
  Adult: [
    "Honour your body's rhythms — scheduling lighter workloads during your period isn't indulgence, it's strategy.",
    "If PMS symptoms feel overwhelming, consider speaking with a healthcare professional about personalised support.",
    "Build micro-rituals of care into your period week — a warm drink, a walk, an early night. Small things compound.",
  ],
};

const EMOTIONAL_CARE_SYMPTOM_EXTRAS: Record<string, Record<AgeGroup, string>> = {
  moodSwings: {
    "Early Puberty": "When big feelings hit, try naming them out loud — 'I feel frustrated' — it actually helps your brain calm down.",
    "Peak Puberty": "Social media can make mood swings feel worse. Consider a short break from your phone on tough days.",
    "Identity Phase": "Track your mood alongside your cycle — seeing the pattern takes away the feeling of losing control.",
    "Maturity Phase": "Channel emotional energy into something creative or physical — it processes feelings without bottling them up.",
    Adult: "Cognitive-behavioural techniques like thought reframing can be especially effective for cyclical mood changes.",
  },
  fatigue: {
    "Early Puberty": "It's okay to rest more during your period. Your body needs it, and pushing through isn't always the answer.",
    "Peak Puberty": "If you're exhausted, choose rest over guilt. Your body is doing a lot of work behind the scenes.",
    "Identity Phase": "Fatigue can make everything feel heavier emotionally. Separate tiredness from sadness — they're different.",
    "Maturity Phase": "Build rest into your schedule proactively during your period rather than waiting until you crash.",
    Adult: "Recognise that fatigue-driven irritability is physiological, not personal. Give yourself grace and adjust expectations.",
  },
  cramps: {
    "Early Puberty": "Pain can be scary when it's new. Remember — cramps are normal and temporary. Comfort yourself like you would a friend.",
    "Peak Puberty": "You don't have to push through pain silently. Ask for help, take a break, or use a heat pack — caring for yourself is valid.",
    "Identity Phase": "Managing pain teaches you self-advocacy. Know what helps you (heat, rest, movement) and communicate your needs clearly.",
    "Maturity Phase": "Cramp management is part of self-care, not a sign of weakness. Build a proactive toolkit: heat, hydration, timing of relief.",
    Adult: "Severe cramps that interfere with daily life are worth discussing with a healthcare provider — effective options exist.",
  },
};

function buildEmotionalCare(
  ageGroup: AgeGroup,
  topSymptomKeys: SymptomKey[]
): string[] {
  const base = [...EMOTIONAL_CARE_BASE[ageGroup]];

  // Add symptom-specific extras (up to 1)
  for (const key of topSymptomKeys.slice(0, 1)) {
    const extras = EMOTIONAL_CARE_SYMPTOM_EXTRAS[key];
    if (extras?.[ageGroup]) {
      base.push(extras[ageGroup]);
    }
  }

  return base.slice(0, 4);
}

// ─── Main entry point ────────────────────────────────────────────────────────

export function generateWeeklyGuidance(
  dobISO: string,
  logs: Record<string, any>,
  today: Date = new Date()
): WeeklyGuidanceResult {
  const age = calculateAge(dobISO, today);
  const ageGroup = classifyAgeGroup(age);
  const frequencies = countPeriodSymptoms(logs, 7, today);
  const top = getTopSymptoms(frequencies, 3);
  const topKeys = top.map((s) => s.key);
  const topLabels = top.map((s) => s.label);

  return {
    ageGroup,
    topSymptoms: topLabels,
    experience: buildExperienceText(ageGroup, topKeys),
    nutrition: buildNutritionAdvice(topKeys),
    emotionalCare: buildEmotionalCare(ageGroup, topKeys),
  };
}
