// ─── Pregnancy Dashboard Data ────────────────────────────────────────────────
// Daily checklist, ANC schedule, and milestone definitions aligned with
// Indian government maternal health guidelines (NHM / MCP card).

// ─── Daily Health Checklist ──────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  label: string;
  emoji: string;
  category: "supplement" | "nutrition" | "hydration" | "activity" | "rest";
}

export const DAILY_CHECKLIST: ChecklistItem[] = [
  { id: "folic-acid",    label: "Folic Acid (400 mcg)",    emoji: "💊", category: "supplement" },
  { id: "ifa-tablet",    label: "IFA Tablet (Iron + Folic Acid)", emoji: "💊", category: "supplement" },
  { id: "calcium",       label: "Calcium Supplement",      emoji: "🦴", category: "supplement" },
  { id: "balanced-meal", label: "Balanced Meals (3+)",     emoji: "🍱", category: "nutrition" },
  { id: "fruits-vegs",   label: "Fruits & Vegetables",     emoji: "🥬", category: "nutrition" },
  { id: "protein",       label: "Protein-rich Food",       emoji: "🥚", category: "nutrition" },
  { id: "water-8",       label: "Water (8+ glasses)",      emoji: "💧", category: "hydration" },
  { id: "morning-walk",  label: "Morning Walk (20 min)",   emoji: "🚶‍♀️", category: "activity" },
  { id: "prenatal-yoga", label: "Prenatal Yoga / Stretch", emoji: "🧘", category: "activity" },
  { id: "sleep-8hr",     label: "Rest / Sleep (8 hrs)",    emoji: "😴", category: "rest" },
];

// ─── Antenatal Care Visit Schedule ───────────────────────────────────────────
// Aligned with Government of India / NHM ANC guidelines & MCP card
export interface ANCVisit {
  id: string;
  week: number;
  title: string;
  description: string;
  tests: string[];
}

export const ANC_SCHEDULE: ANCVisit[] = [
  {
    id: "anc-1",
    week: 12,
    title: "First ANC Registration",
    description: "Register pregnancy at the nearest PHC/CHC. Receive your MCP card (Mother-Child Protection Card).",
    tests: [
      "Blood group & Rh typing",
      "Hemoglobin (Hb) test",
      "Urine test (protein, sugar)",
      "HIV, HBsAg, VDRL screening",
      "Blood pressure measurement",
      "Weight & height recording",
      "First ultrasound (dating scan)",
    ],
  },
  {
    id: "anc-2",
    week: 20,
    title: "Anomaly Scan Visit",
    description: "Mid-pregnancy checkup with detailed anatomy scan to check baby's growth and organ development.",
    tests: [
      "Anomaly scan (Level 2 ultrasound)",
      "Blood pressure check",
      "Urine test",
      "Weight monitoring",
      "Fundal height measurement",
      "Review IFA compliance",
    ],
  },
  {
    id: "anc-3",
    week: 26,
    title: "Third ANC Visit",
    description: "Monitor fetal growth and maternal health. Address any pregnancy complications early.",
    tests: [
      "Hemoglobin recheck",
      "Blood pressure",
      "Weight gain assessment",
      "Fetal heart rate",
      "Urine protein/sugar",
      "TT-2 / Td booster if due",
    ],
  },
  {
    id: "anc-4",
    week: 30,
    title: "Fourth ANC Visit",
    description: "Third trimester check. Plan for institutional delivery. Discuss birth preparedness.",
    tests: [
      "Blood pressure",
      "Fetal position check",
      "Hemoglobin check",
      "Weight monitoring",
      "Edema check",
      "Birth preparedness plan review",
    ],
  },
  {
    id: "anc-5",
    week: 34,
    title: "Fifth ANC Visit",
    description: "Close monitoring as delivery approaches. Confirm fetal presentation and delivery plan.",
    tests: [
      "Fetal position (head-down check)",
      "Blood pressure",
      "Weight",
      "Urine test",
      "NST (Non-Stress Test) if advised",
      "Hospital pre-registration",
    ],
  },
  {
    id: "anc-6",
    week: 36,
    title: "Weekly Monitoring Begins",
    description: "Weekly visits start. GBS screening. Baby is near-term. Finalize delivery preparations.",
    tests: [
      "GBS screening",
      "Blood pressure",
      "Cervical assessment if indicated",
      "Fetal heart rate monitoring",
      "Weight check",
      "Hospital bag readiness",
    ],
  },
  {
    id: "anc-7",
    week: 38,
    title: "Pre-Delivery Check",
    description: "Near due date. Assess readiness for delivery. Discuss labor signs and when to go to hospital.",
    tests: [
      "Fetal movement count",
      "Blood pressure",
      "Cervical check if indicated",
      "Review emergency transport plan",
      "Confirm JSY/PMMVY documents",
    ],
  },
  {
    id: "anc-8",
    week: 40,
    title: "Due Date Visit",
    description: "Due date week. Assess if induction is needed. Close monitoring for post-dates.",
    tests: [
      "NST (Non-Stress Test)",
      "Amniotic fluid check",
      "Blood pressure",
      "Discuss induction options",
      "Emergency signs review",
    ],
  },
];

// ─── Pregnancy Milestones ────────────────────────────────────────────────────
export interface Milestone {
  id: string;
  week: number;
  title: string;
  description: string;
  type: "vaccination" | "checkup" | "preparation" | "government";
  emoji: string;
}

export const MILESTONES: Milestone[] = [
  {
    id: "ms-register",
    week: 8,
    title: "ASHA/ANM Registration",
    description: "Register with your local ASHA worker or ANM for home visits and health monitoring.",
    type: "government",
    emoji: "🏥",
  },
  {
    id: "ms-tt1",
    week: 12,
    title: "TT-1 Vaccination",
    description: "First tetanus toxoid injection to protect mother and newborn.",
    type: "vaccination",
    emoji: "💉",
  },
  {
    id: "ms-mcp",
    week: 12,
    title: "MCP Card Issuance",
    description: "Obtain your Mother-Child Protection card — required for all government scheme benefits.",
    type: "government",
    emoji: "📋",
  },
  {
    id: "ms-anomaly",
    week: 20,
    title: "Anomaly Scan",
    description: "Detailed ultrasound to check baby's organs, spine, heart, and overall development.",
    type: "checkup",
    emoji: "🔍",
  },
  {
    id: "ms-tt2",
    week: 24,
    title: "TT-2 Vaccination",
    description: "Second tetanus toxoid injection (or Td booster if previously vaccinated).",
    type: "vaccination",
    emoji: "💉",
  },
  {
    id: "ms-glucose",
    week: 26,
    title: "Glucose Tolerance Test",
    description: "Screen for gestational diabetes. Drink glucose solution, blood drawn after 1-2 hours.",
    type: "checkup",
    emoji: "🩸",
  },
  {
    id: "ms-tdap",
    week: 28,
    title: "Tdap Vaccination",
    description: "Whooping cough vaccine to protect the newborn in the first months of life.",
    type: "vaccination",
    emoji: "💉",
  },
  {
    id: "ms-hospital-bag",
    week: 35,
    title: "Hospital Bag Prep",
    description: "Pack essentials: MCP card, ID, baby clothes, sanitary pads, snacks, emergency contacts.",
    type: "preparation",
    emoji: "🎒",
  },
  {
    id: "ms-gbs",
    week: 36,
    title: "GBS Screening",
    description: "Group B Streptococcus test — determines if antibiotics are needed during labor.",
    type: "checkup",
    emoji: "🧪",
  },
  {
    id: "ms-birth-plan",
    week: 37,
    title: "Birth Plan Ready",
    description: "Finalize your birth plan: hospital choice, transport, emergency contacts, ASHA worker number.",
    type: "preparation",
    emoji: "📝",
  },
  {
    id: "ms-jsy",
    week: 37,
    title: "JSY/PMMVY Documents",
    description: "Ensure Janani Suraksha Yojana and PMMVY paperwork is ready for institutional delivery benefits.",
    type: "government",
    emoji: "🏛️",
  },
];
