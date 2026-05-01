import type { Phase } from "@/hooks/usePhase";
import type { SymptomDef, SymptomNutrientMapping, NutrientFoodEntry, PhaseConfig } from "./nutritionTypes";

// ─── Core Symptoms (shared across all phases) ─────────────────────────────
export const CORE_SYMPTOMS: SymptomDef[] = [
  { id: "fatigue", label: "Fatigue", emoji: "😴", category: "core" },
  { id: "dizziness", label: "Dizziness", emoji: "💫", category: "core" },
  { id: "weakness", label: "Weakness", emoji: "🫠", category: "core" },
  { id: "moodSwings", label: "Mood Swings", emoji: "🎭", category: "core" },
  { id: "anxiety", label: "Anxiety", emoji: "😰", category: "core" },
  { id: "brainFog", label: "Brain Fog", emoji: "🌫️", category: "core" },
  { id: "sleepIssues", label: "Sleep Issues", emoji: "🌙", category: "core" },
  { id: "backPain", label: "Back Pain", emoji: "🔙", category: "core" },
  { id: "headache", label: "Headache", emoji: "🤕", category: "core" },
  { id: "appetiteChanges", label: "Appetite Changes", emoji: "🍽️", category: "core" },
  { id: "bloating", label: "Bloating", emoji: "🫧", category: "core" },
  { id: "constipation", label: "Constipation", emoji: "😣", category: "core" },
  { id: "swelling", label: "Swelling", emoji: "🦶", category: "core" },
];

// ─── Phase-Specific Symptoms ──────────────────────────────────────────────
export const PHASE_SYMPTOMS: Record<Phase, SymptomDef[]> = {
  puberty: [
    { id: "cramps", label: "Cramps", emoji: "😖", category: "phase-specific" },
    { id: "acne", label: "Acne", emoji: "😤", category: "phase-specific" },
    { id: "breastTenderness", label: "Breast Tenderness", emoji: "💗", category: "phase-specific" },
    { id: "heavyPeriod", label: "Heavy Period", emoji: "🩸", category: "phase-specific" },
    { id: "irregularCycle", label: "Irregular Cycle", emoji: "📅", category: "phase-specific" },
    { id: "growthPain", label: "Growth Pain", emoji: "📏", category: "phase-specific" },
    { id: "hairChanges", label: "Hair Changes", emoji: "💇", category: "phase-specific" },
  ],
  maternity: [
    { id: "nausea", label: "Nausea", emoji: "🤢", category: "phase-specific" },
    { id: "vomiting", label: "Vomiting", emoji: "🤮", category: "phase-specific" },
    { id: "legCramps", label: "Leg Cramps", emoji: "🦵", category: "phase-specific" },
    { id: "heartburn", label: "Heartburn", emoji: "🔥", category: "phase-specific" },
    { id: "spotting", label: "Spotting", emoji: "🔴", category: "phase-specific" },
    { id: "breathlessness", label: "Breathlessness", emoji: "😮‍💨", category: "phase-specific" },
    { id: "pelvicPressure", label: "Pelvic Pressure", emoji: "⬇️", category: "phase-specific" },
    { id: "frequentUrination", label: "Frequent Urination", emoji: "🚻", category: "phase-specific" },
    { id: "cravings", label: "Cravings", emoji: "🍫", category: "phase-specific" },
    { id: "skinChanges", label: "Skin Changes", emoji: "✨", category: "phase-specific" },
    { id: "breastTenderness", label: "Breast Tenderness", emoji: "💗", category: "phase-specific" },
    { id: "foodAversions", label: "Food Aversions", emoji: "🙅", category: "phase-specific" },
    { id: "fetalMovement", label: "Fetal Movement", emoji: "👶", category: "phase-specific" },
    { id: "babyBumpGrowth", label: "Baby Bump Growth", emoji: "🤰", category: "phase-specific" },
    { id: "increasedAppetite", label: "Increased Appetite", emoji: "🍽️", category: "phase-specific" },
    { id: "practiceContractions", label: "Practice Contractions", emoji: "⏱️", category: "phase-specific" },
    { id: "sleepDifficulty", label: "Sleep Difficulty", emoji: "😴", category: "phase-specific" },
    { id: "irritability", label: "Irritability", emoji: "😤", category: "phase-specific" },
    // postpartum / lactation
    { id: "breastPain", label: "Breast Pain", emoji: "😣", category: "phase-specific" },
    { id: "nipplePain", label: "Nipple Pain", emoji: "😖", category: "phase-specific" },
    { id: "lowMilkSupply", label: "Low Milk Supply", emoji: "🍼", category: "phase-specific" },
    { id: "lowEnergy", label: "Low Energy", emoji: "🔋", category: "phase-specific" },
    { id: "sleepDeprivation", label: "Sleep Deprivation", emoji: "😵", category: "phase-specific" },
    { id: "bodyAche", label: "Body Ache", emoji: "🤕", category: "phase-specific" },
  ],
  "family-planning": [
    { id: "ovulationPain", label: "Ovulation Pain", emoji: "🎯", category: "phase-specific" },
    { id: "irregularCycle", label: "Irregular Cycle", emoji: "📅", category: "phase-specific" },
    { id: "moodChanges", label: "Mood Changes", emoji: "🌊", category: "phase-specific" },
    { id: "stress", label: "Stress", emoji: "😓", category: "phase-specific" },
  ],
  menopause: [
    { id: "hotFlashes", label: "Hot Flashes", emoji: "🥵", category: "phase-specific" },
    { id: "nightSweats", label: "Night Sweats", emoji: "🌡️", category: "phase-specific" },
    { id: "jointPain", label: "Joint Pain", emoji: "🦴", category: "phase-specific" },
    { id: "dryness", label: "Vaginal Dryness", emoji: "💧", category: "phase-specific" },
    { id: "weightGain", label: "Weight Gain", emoji: "⚖️", category: "phase-specific" },
    { id: "memoryIssues", label: "Memory Issues", emoji: "🧠", category: "phase-specific" },
    { id: "irritability", label: "Irritability", emoji: "😤", category: "phase-specific" },
    { id: "heartPalpitations", label: "Heart Palpitations", emoji: "💓", category: "phase-specific" },
    { id: "bonePain", label: "Bone Pain", emoji: "🦴", category: "phase-specific" },
    { id: "hairThinning", label: "Hair Thinning", emoji: "💇", category: "phase-specific" },
    { id: "urinaryIssues", label: "Urinary Issues", emoji: "🚻", category: "phase-specific" },
    { id: "lowLibido", label: "Low Libido", emoji: "💔", category: "phase-specific" },
  ],
};

// ─── Symptom → Nutrient Mapping ───────────────────────────────────────────
export const SYMPTOM_NUTRIENT_MAP: Record<string, SymptomNutrientMapping[]> = {
  fatigue: [
    { nutrientId: "iron", weight: 0.9, reason: { default: "Fatigue may be linked to low iron levels", maternity: "Pregnancy increases iron demand — fatigue may signal low stores", menopause: "Declining estrogen can affect iron absorption" } },
    { nutrientId: "b12", weight: 0.7, reason: { default: "B12 supports energy metabolism — low levels may cause tiredness" } },
    { nutrientId: "vitD", weight: 0.5, reason: { default: "Vitamin D deficiency is often linked to persistent fatigue" } },
  ],
  dizziness: [
    { nutrientId: "iron", weight: 0.9, reason: { default: "Dizziness may indicate iron-deficiency anemia" } },
    { nutrientId: "b12", weight: 0.6, reason: { default: "B12 deficiency can cause dizziness and lightheadedness" } },
  ],
  weakness: [
    { nutrientId: "iron", weight: 0.8, reason: { default: "Muscle weakness may be linked to low iron" } },
    { nutrientId: "protein", weight: 0.7, reason: { default: "Adequate protein is essential for muscle strength" } },
    { nutrientId: "magnesium", weight: 0.6, reason: { default: "Magnesium supports muscle and nerve function" } },
  ],
  moodSwings: [
    { nutrientId: "magnesium", weight: 0.8, reason: { default: "Magnesium may help stabilize mood", puberty: "Hormonal changes during puberty can deplete magnesium" } },
    { nutrientId: "omega3", weight: 0.7, reason: { default: "Omega-3 fatty acids support brain health and mood regulation" } },
    { nutrientId: "b12", weight: 0.5, reason: { default: "B12 plays a role in neurotransmitter production" } },
  ],
  anxiety: [
    { nutrientId: "magnesium", weight: 0.9, reason: { default: "Magnesium is known as nature's relaxant — low levels may worsen anxiety" } },
    { nutrientId: "omega3", weight: 0.6, reason: { default: "Omega-3s may support stress resilience" } },
    { nutrientId: "zinc", weight: 0.5, reason: { default: "Zinc plays a role in nervous system regulation" } },
  ],
  brainFog: [
    { nutrientId: "iron", weight: 0.7, reason: { default: "Brain fog may be linked to insufficient oxygen delivery from low iron" } },
    { nutrientId: "omega3", weight: 0.8, reason: { default: "DHA (omega-3) is critical for cognitive function" } },
    { nutrientId: "b12", weight: 0.7, reason: { default: "B12 supports nerve health and mental clarity" } },
  ],
  sleepIssues: [
    { nutrientId: "magnesium", weight: 0.9, reason: { default: "Magnesium supports relaxation and sleep quality" } },
    { nutrientId: "calcium", weight: 0.5, reason: { default: "Calcium helps the brain use tryptophan to produce melatonin" } },
  ],
  backPain: [
    { nutrientId: "calcium", weight: 0.7, reason: { default: "Calcium supports bone health — deficiency may contribute to pain" } },
    { nutrientId: "vitD", weight: 0.7, reason: { default: "Vitamin D aids calcium absorption and bone strength" } },
    { nutrientId: "magnesium", weight: 0.5, reason: { default: "Magnesium supports muscle relaxation" } },
  ],
  headache: [
    { nutrientId: "magnesium", weight: 0.8, reason: { default: "Magnesium deficiency is a common trigger for headaches" } },
    { nutrientId: "iron", weight: 0.6, reason: { default: "Low iron may cause headaches due to reduced oxygen supply" } },
  ],
  bloating: [
    { nutrientId: "fiber", weight: 0.7, reason: { default: "Adequate fiber supports digestive regularity" } },
    { nutrientId: "magnesium", weight: 0.5, reason: { default: "Magnesium may reduce water retention and bloating" } },
  ],
  constipation: [
    { nutrientId: "fiber", weight: 0.9, reason: { default: "Fiber is essential for healthy bowel movements" } },
    { nutrientId: "magnesium", weight: 0.6, reason: { default: "Magnesium helps relax the intestinal muscles" } },
  ],
  swelling: [
    { nutrientId: "potassium", weight: 0.8, reason: { default: "Potassium helps balance fluid levels in the body" } },
    { nutrientId: "magnesium", weight: 0.5, reason: { default: "Magnesium may help reduce fluid retention" } },
  ],
  cramps: [
    { nutrientId: "iron", weight: 0.8, reason: { default: "Menstrual cramps may worsen with low iron", puberty: "Heavy periods during puberty increase iron loss" } },
    { nutrientId: "magnesium", weight: 0.8, reason: { default: "Magnesium relaxes muscles and may ease cramps" } },
    { nutrientId: "calcium", weight: 0.5, reason: { default: "Calcium supports muscle contraction regulation" } },
  ],
  acne: [
    { nutrientId: "zinc", weight: 0.9, reason: { default: "Zinc has anti-inflammatory properties that may help with acne", puberty: "Hormonal acne during puberty may respond to zinc-rich foods" } },
    { nutrientId: "vitA", weight: 0.6, reason: { default: "Vitamin A supports skin cell renewal" } },
  ],
  heavyPeriod: [
    { nutrientId: "iron", weight: 1.0, reason: { default: "Heavy periods directly increase iron loss — replenishment is critical" } },
    { nutrientId: "vitC", weight: 0.5, reason: { default: "Vitamin C enhances iron absorption" } },
  ],
  nausea: [
    { nutrientId: "b6", weight: 0.9, reason: { default: "Vitamin B6 may help reduce nausea", maternity: "B6 is commonly recommended for pregnancy-related nausea" } },
    { nutrientId: "zinc", weight: 0.5, reason: { default: "Zinc may help settle the stomach" } },
  ],
  legCramps: [
    { nutrientId: "magnesium", weight: 0.9, reason: { default: "Magnesium deficiency is a common cause of leg cramps" } },
    { nutrientId: "potassium", weight: 0.7, reason: { default: "Potassium helps prevent muscle cramps" } },
    { nutrientId: "calcium", weight: 0.6, reason: { default: "Calcium supports proper muscle function" } },
  ],
  hotFlashes: [
    { nutrientId: "vitE", weight: 0.8, reason: { default: "Vitamin E may help reduce hot flash frequency", menopause: "Some studies show vitamin E can ease menopausal hot flashes" } },
    { nutrientId: "omega3", weight: 0.6, reason: { default: "Omega-3s may support temperature regulation" } },
    { nutrientId: "calcium", weight: 0.5, reason: { default: "Calcium metabolism changes during menopause" } },
  ],
  jointPain: [
    { nutrientId: "omega3", weight: 0.8, reason: { default: "Omega-3s have anti-inflammatory properties that may ease joint pain" } },
    { nutrientId: "vitD", weight: 0.7, reason: { default: "Vitamin D supports bone and joint health" } },
    { nutrientId: "calcium", weight: 0.6, reason: { default: "Calcium is essential for bone strength" } },
  ],
  nightSweats: [
    { nutrientId: "vitE", weight: 0.7, reason: { default: "Vitamin E may help manage night sweats" } },
    { nutrientId: "magnesium", weight: 0.6, reason: { default: "Magnesium supports temperature regulation during sleep" } },
  ],
  stress: [
    { nutrientId: "magnesium", weight: 0.9, reason: { default: "Magnesium is depleted by stress — replenishment may help" } },
    { nutrientId: "b12", weight: 0.6, reason: { default: "B vitamins support the nervous system under stress" } },
    { nutrientId: "omega3", weight: 0.5, reason: { default: "Omega-3s may support stress resilience" } },
  ],
  bonePain: [
    { nutrientId: "calcium", weight: 0.9, reason: { default: "Bone pain may indicate calcium deficiency" } },
    { nutrientId: "vitD", weight: 0.9, reason: { default: "Vitamin D is essential for calcium absorption and bone health" } },
  ],
  heartburn: [
    { nutrientId: "fiber", weight: 0.5, reason: { default: "Fiber-rich foods may help manage heartburn" } },
    { nutrientId: "calcium", weight: 0.4, reason: { default: "Calcium-rich foods can provide some relief" } },
  ],
  spotting: [
    { nutrientId: "iron", weight: 0.7, reason: { default: "Any bleeding increases iron needs" } },
    { nutrientId: "vitC", weight: 0.5, reason: { default: "Vitamin C supports tissue repair and iron absorption" } },
  ],
  ovulationPain: [
    { nutrientId: "omega3", weight: 0.7, reason: { default: "Omega-3s may reduce inflammation during ovulation" } },
    { nutrientId: "magnesium", weight: 0.6, reason: { default: "Magnesium may ease ovulation-related discomfort" } },
  ],
  hairThinning: [
    { nutrientId: "iron", weight: 0.8, reason: { default: "Iron deficiency is a leading cause of hair thinning" } },
    { nutrientId: "zinc", weight: 0.7, reason: { default: "Zinc supports hair growth and repair" } },
    { nutrientId: "protein", weight: 0.6, reason: { default: "Hair is made of protein — adequate intake supports growth" } },
  ],
  weightGain: [
    { nutrientId: "fiber", weight: 0.7, reason: { default: "Fiber helps with satiety and weight management" } },
    { nutrientId: "protein", weight: 0.6, reason: { default: "Protein supports metabolism and lean mass" } },
  ],

  // ─── Maternity Stage Symptoms ────────────────────────────────────────────
  breastTenderness: [
    { nutrientId: "vitE", weight: 0.8, reason: { default: "Vitamin E may help reduce breast tenderness and inflammation", maternity: "Hormonal changes in pregnancy can increase breast sensitivity — vitamin E may help" } },
    { nutrientId: "magnesium", weight: 0.6, reason: { default: "Magnesium may ease hormone-related tissue discomfort" } },
    { nutrientId: "omega3", weight: 0.5, reason: { default: "Omega-3s have anti-inflammatory properties that may reduce tenderness" } },
  ],
  foodAversions: [
    { nutrientId: "b6", weight: 0.9, reason: { default: "Vitamin B6 may help regulate appetite and reduce food aversions", maternity: "B6 is commonly recommended for pregnancy-related appetite issues" } },
    { nutrientId: "zinc", weight: 0.6, reason: { default: "Zinc plays a role in taste perception and appetite regulation" } },
    { nutrientId: "magnesium", weight: 0.5, reason: { default: "Magnesium deficiency may worsen appetite disturbances" } },
  ],
  fetalMovement: [
    { nutrientId: "omega3", weight: 0.8, reason: { default: "DHA (omega-3) supports fetal neurodevelopment and motor activity", maternity: "Fetal movement reflects growth — DHA is critical for brain development" } },
    { nutrientId: "protein", weight: 0.7, reason: { default: "Protein is essential for fetal tissue and muscle development" } },
    { nutrientId: "iron", weight: 0.6, reason: { default: "Iron supports oxygen delivery to the developing fetus" } },
  ],
  babyBumpGrowth: [
    { nutrientId: "protein", weight: 0.8, reason: { default: "Protein is the building block for rapid fetal and maternal tissue growth", maternity: "Increased protein demand supports baby bump growth and fetal development" } },
    { nutrientId: "calcium", weight: 0.7, reason: { default: "Calcium supports fetal skeletal development during growth phases" } },
    { nutrientId: "folate", weight: 0.6, reason: { default: "Folate supports cell division and tissue growth" } },
  ],
  increasedAppetite: [
    { nutrientId: "protein", weight: 0.8, reason: { default: "Balanced protein helps regulate hunger and satiety", maternity: "Increased appetite during pregnancy reflects higher nutrient demand" } },
    { nutrientId: "fiber", weight: 0.7, reason: { default: "Fiber promotes fullness and stabilizes blood sugar" } },
    { nutrientId: "magnesium", weight: 0.5, reason: { default: "Magnesium supports energy metabolism and appetite regulation" } },
  ],
  practiceContractions: [
    { nutrientId: "magnesium", weight: 0.9, reason: { default: "Magnesium supports muscle relaxation and contraction balance", maternity: "Magnesium may help manage Braxton Hicks contractions" } },
    { nutrientId: "potassium", weight: 0.7, reason: { default: "Potassium is an essential electrolyte for muscle function" } },
    { nutrientId: "calcium", weight: 0.6, reason: { default: "Calcium supports proper muscle contraction regulation" } },
  ],
  sleepDifficulty: [
    { nutrientId: "magnesium", weight: 0.9, reason: { default: "Magnesium supports relaxation and sleep quality", maternity: "Pregnancy-related discomfort may benefit from magnesium for better sleep" } },
    { nutrientId: "omega3", weight: 0.5, reason: { default: "Omega-3s support nervous system health and sleep regulation" } },
    { nutrientId: "vitD", weight: 0.5, reason: { default: "Vitamin D levels are linked to sleep quality" } },
  ],
  frequentUrination: [
    { nutrientId: "potassium", weight: 0.7, reason: { default: "Potassium helps maintain fluid and electrolyte balance", maternity: "Fluid balance becomes important as pregnancy increases urinary frequency" } },
    { nutrientId: "magnesium", weight: 0.5, reason: { default: "Magnesium supports fluid regulation" } },
  ],
  skinChanges: [
    { nutrientId: "vitE", weight: 0.7, reason: { default: "Vitamin E is an antioxidant that supports skin health" } },
    { nutrientId: "vitA", weight: 0.6, reason: { default: "Vitamin A supports skin cell renewal" } },
    { nutrientId: "zinc", weight: 0.5, reason: { default: "Zinc supports skin repair and inflammation control" } },
  ],
  breathlessness: [
    { nutrientId: "iron", weight: 0.9, reason: { default: "Breathlessness may indicate low iron and reduced oxygen delivery", maternity: "Increased blood volume in pregnancy raises iron demand" } },
    { nutrientId: "b12", weight: 0.6, reason: { default: "B12 deficiency can affect oxygen-carrying capacity" } },
  ],
  pelvicPressure: [
    { nutrientId: "magnesium", weight: 0.7, reason: { default: "Magnesium may ease pelvic muscle tension" } },
    { nutrientId: "calcium", weight: 0.5, reason: { default: "Calcium supports pelvic bone and muscle health" } },
  ],
  appetiteChanges: [
    { nutrientId: "b6", weight: 0.7, reason: { default: "Vitamin B6 may help regulate appetite" } },
    { nutrientId: "zinc", weight: 0.6, reason: { default: "Zinc plays a role in taste and appetite" } },
  ],
  vomiting: [
    { nutrientId: "b6", weight: 0.9, reason: { default: "Vitamin B6 is commonly used to manage vomiting", maternity: "B6 is a first-line recommendation for pregnancy vomiting" } },
    { nutrientId: "zinc", weight: 0.5, reason: { default: "Zinc may help settle the stomach" } },
    { nutrientId: "potassium", weight: 0.6, reason: { default: "Vomiting depletes electrolytes — potassium replenishment is important" } },
  ],
  irritability: [
    { nutrientId: "magnesium", weight: 0.8, reason: { default: "Magnesium supports nervous system calm and mood stability" } },
    { nutrientId: "omega3", weight: 0.6, reason: { default: "Omega-3s support emotional regulation" } },
    { nutrientId: "b12", weight: 0.5, reason: { default: "B12 supports neurotransmitter production" } },
  ],

  // ─── Postpartum / Lactation Symptoms ─────────────────────────────────────
  breastPain: [
    { nutrientId: "omega3", weight: 0.7, reason: { default: "Omega-3s have anti-inflammatory properties that may ease breast tissue pain" } },
    { nutrientId: "vitE", weight: 0.7, reason: { default: "Vitamin E supports tissue recovery and may reduce inflammation" } },
    { nutrientId: "protein", weight: 0.5, reason: { default: "Protein supports tissue repair" } },
  ],
  nipplePain: [
    { nutrientId: "protein", weight: 0.7, reason: { default: "Protein supports tissue healing and recovery" } },
    { nutrientId: "omega3", weight: 0.6, reason: { default: "Omega-3s may reduce inflammation and support healing" } },
    { nutrientId: "vitE", weight: 0.6, reason: { default: "Vitamin E promotes skin and tissue repair" } },
  ],
  lowMilkSupply: [
    { nutrientId: "protein", weight: 0.8, reason: { default: "Adequate protein intake supports milk production" } },
    { nutrientId: "calcium", weight: 0.7, reason: { default: "Calcium is a key component of breast milk" } },
    { nutrientId: "omega3", weight: 0.5, reason: { default: "Omega-3s support overall lactation health" } },
  ],
  lowEnergy: [
    { nutrientId: "iron", weight: 0.9, reason: { default: "Low energy is often linked to iron deficiency" } },
    { nutrientId: "b12", weight: 0.7, reason: { default: "B12 supports energy metabolism" } },
    { nutrientId: "protein", weight: 0.6, reason: { default: "Protein provides sustained energy" } },
  ],
  sleepDeprivation: [
    { nutrientId: "magnesium", weight: 0.8, reason: { default: "Magnesium supports nervous system recovery and sleep quality" } },
    { nutrientId: "b12", weight: 0.6, reason: { default: "B12 supports the nervous system under fatigue" } },
    { nutrientId: "omega3", weight: 0.5, reason: { default: "Omega-3s may support cognitive function during sleep loss" } },
  ],
  bodyAche: [
    { nutrientId: "magnesium", weight: 0.8, reason: { default: "Magnesium supports muscle relaxation and recovery" } },
    { nutrientId: "vitD", weight: 0.6, reason: { default: "Vitamin D deficiency can contribute to body aches" } },
    { nutrientId: "protein", weight: 0.5, reason: { default: "Protein supports tissue repair" } },
  ],
};
