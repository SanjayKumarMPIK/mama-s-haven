/**
 * Postpartum Care — Stateless State Machine Engine
 *
 * Pure function: receives ALL accumulated user data → returns structured JSON response.
 * Matches strict API contract. Frontend renders directly from this output.
 */

// ── Types ────────────────────────────────────────────────────────

export type Severity = 'MILD' | 'MODERATE' | 'SEVERE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type Stage = 'CONGRATS' | 'DELIVERY_TYPE' | 'MENTAL' | 'PHYSICAL' | 'RESULT';

export interface PostpartumInput {
  stage: Stage;
  deliveryConfirmed: boolean;
  deliveryType: 'NORMAL' | 'C_SECTION' | null;
  mental: {
    mood: Severity | null;
    anxiety: Severity | null;
    overwhelm: Severity | null;
    sleep: Severity | null;
    bonding: Severity | null;
  };
  physical: Record<string, string | null>;
}

export interface QuestionOption {
  label: string;
  value: string;
  desc: string;
}

export interface Question {
  id: string;
  label: string;
  type: 'single_select';
  options: QuestionOption[];
}

export interface Alert {
  type: 'warning';
  message: string;
}

export interface CarePlan {
  summary: {
    deliveryType: string;
    mentalRisk: RiskLevel;
    physicalRisk: RiskLevel;
  };
  emotionalCare: { level: string; actions: string[] }[];
  physicalCare: { focus: string; actions: string[] }[];
  activities: {
    name: string;
    type: 'mental' | 'physical';
    frequency: string;
    duration: string;
    notes: string;
  }[];
}

export interface PostpartumOutput {
  stage: Stage | string;
  ui: { title: string; message: string; cta: string };
  questions: Question[];
  dataSchema: { requiredFields: string[]; nextExpected: string };
  carePlan: CarePlan | null;
  alerts: Alert[];
}

// ── Question Definitions ────────────────────────────────────────

const SEVERITY_OPTIONS: QuestionOption[] = [
  { label: 'Mild', value: 'MILD', desc: 'Manageable' },
  { label: 'Moderate', value: 'MODERATE', desc: 'Affecting routine' },
  { label: 'Severe', value: 'SEVERE', desc: 'Hard to cope' },
];

const DELIVERY_TYPE_QUESTION: Question = {
  id: 'delivery_type',
  label: 'How was your delivery?',
  type: 'single_select',
  options: [
    { label: 'Normal Delivery', value: 'NORMAL', desc: 'Vaginal birth' },
    { label: 'Cesarean (C-section)', value: 'C_SECTION', desc: 'Surgical delivery' },
  ],
};

const MENTAL_QUESTIONS: { id: string; label: string }[] = [
  { id: 'mood', label: 'How has your overall mood been?' },
  { id: 'anxiety', label: 'Are you feeling anxious or worried?' },
  { id: 'overwhelm', label: 'Do you feel overwhelmed?' },
  { id: 'sleep', label: 'How has your sleep quality been?' },
  { id: 'bonding', label: 'How do you feel about bonding with your baby?' },
];

const NORMAL_PHYSICAL_QUESTIONS: Question[] = [
  { id: 'vaginal_pain', label: 'How is your vaginal pain or discomfort?', type: 'single_select', options: SEVERITY_OPTIONS },
  { id: 'bleeding', label: 'How is your postpartum bleeding?', type: 'single_select', options: SEVERITY_OPTIONS },
  {
    id: 'energy', label: 'How are your energy levels?', type: 'single_select',
    options: [
      { label: 'High', value: 'HIGH', desc: 'Feeling energetic' },
      { label: 'Medium', value: 'MEDIUM', desc: 'Somewhat tired' },
      { label: 'Low', value: 'LOW', desc: 'Very fatigued' },
    ],
  },
  { id: 'back_pain', label: 'Are you experiencing back pain?', type: 'single_select', options: SEVERITY_OPTIONS },
];

const CSECTION_PHYSICAL_QUESTIONS: Question[] = [
  { id: 'incision_pain', label: 'How is your incision pain?', type: 'single_select', options: SEVERITY_OPTIONS },
  {
    id: 'wound_healing', label: 'How does your wound look?', type: 'single_select',
    options: [
      { label: 'Good', value: 'GOOD', desc: 'Healing well, no redness' },
      { label: 'Concerning', value: 'CONCERNING', desc: 'Redness, swelling, or discharge' },
    ],
  },
  {
    id: 'mobility', label: 'How is your mobility?', type: 'single_select',
    options: [
      { label: 'Easy', value: 'EASY', desc: 'Moving around comfortably' },
      { label: 'Difficult', value: 'DIFFICULT', desc: 'Some pain when moving' },
      { label: 'Very Difficult', value: 'VERY_DIFFICULT', desc: 'Significant pain, need help' },
    ],
  },
  {
    id: 'fever', label: 'Do you have fever?', type: 'single_select',
    options: [
      { label: 'No', value: 'NO', desc: 'No fever' },
      { label: 'Yes', value: 'YES', desc: 'Feeling feverish or temperature above normal' },
    ],
  },
  { id: 'swelling', label: 'Any swelling around the incision or legs?', type: 'single_select', options: SEVERITY_OPTIONS },
];

// ── Risk Computation ────────────────────────────────────────────

export function computeMentalRisk(mental: PostpartumInput['mental']): RiskLevel {
  const vals = Object.values(mental).filter(Boolean) as string[];
  if (vals.some(v => v === 'SEVERE')) return 'HIGH';
  if (vals.filter(v => v === 'MODERATE').length >= 2) return 'MEDIUM';
  return 'LOW';
}

export function computePhysicalRisk(
  physical: Record<string, string | null>,
  deliveryType: 'NORMAL' | 'C_SECTION',
): RiskLevel {
  const vals = Object.values(physical).filter(Boolean) as string[];
  if (vals.some(v => v === 'SEVERE')) return 'HIGH';

  if (deliveryType === 'C_SECTION') {
    if (physical.wound_healing === 'CONCERNING') return 'HIGH';
    if (physical.fever === 'YES') return 'HIGH';
    if (physical.mobility === 'VERY_DIFFICULT') return 'HIGH';
  }

  const modCount = vals.filter(v => v === 'MODERATE').length;
  if (modCount >= 2) return 'MEDIUM';
  if (deliveryType === 'C_SECTION' && modCount >= 1) return 'MEDIUM';
  return 'LOW';
}

// ── Alert Generation ────────────────────────────────────────────

function generateAlerts(
  mentalRisk: RiskLevel,
  physicalRisk: RiskLevel,
  physical: Record<string, string | null>,
  deliveryType: 'NORMAL' | 'C_SECTION',
): Alert[] {
  const alerts: Alert[] = [];
  if (mentalRisk === 'HIGH') {
    alerts.push({ type: 'warning', message: 'Your emotional well-being needs attention. Please consider speaking with a healthcare provider or a trusted person. You are not alone.' });
  }
  if (physicalRisk === 'HIGH') {
    alerts.push({ type: 'warning', message: 'Your physical recovery may need medical attention. Please consult your doctor or visit your nearest health centre.' });
  }
  if (deliveryType === 'C_SECTION') {
    if (physical.fever === 'YES') alerts.push({ type: 'warning', message: 'Fever after a C-section can indicate infection. Please seek medical attention promptly.' });
    if (physical.wound_healing === 'CONCERNING') alerts.push({ type: 'warning', message: 'Wound healing concerns require medical evaluation. Please contact your doctor.' });
  }
  return alerts;
}

// ── Care Plan Generation ────────────────────────────────────────

function buildEmotionalCare(risk: RiskLevel): CarePlan['emotionalCare'] {
  if (risk === 'LOW') return [{ level: 'LOW — Self-Care', actions: [
    'Spend 10 minutes in natural sunlight each morning',
    'Practice 5 minutes of deep breathing before sleep',
    'Maintain a light daily routine to stay grounded',
    'Celebrate small wins every day',
  ]}];
  if (risk === 'MEDIUM') return [{ level: 'MEDIUM — Structured Support', actions: [
    'Ask a family member to share baby duties for scheduled rest',
    'Write 3 things you are grateful for each evening (journaling)',
    'Set 2 structured rest blocks during the day (20 min each)',
    'Talk to someone you trust about how you feel — daily',
    'Listen to calming music or guided meditation for 10 min',
  ]}];
  return [{ level: 'HIGH — Professional Help Recommended', actions: [
    'Your feelings are valid — you are going through a lot and that is okay',
    'Please talk to a doctor, counselor, or call a helpline today',
    'Ask family to take over baby care so you can rest fully',
    'Avoid being alone for long periods — stay with loved ones',
    'PSI Helpline: 1-800-944-4773 (Postpartum Support International)',
    'Visit your nearest Primary Health Centre (PHC) for support',
  ]}];
}

function buildPhysicalCare(deliveryType: 'NORMAL' | 'C_SECTION', risk: RiskLevel): CarePlan['physicalCare'] {
  if (deliveryType === 'C_SECTION') {
    const actions = [
      'Avoid lifting anything heavier than your baby for 6–8 weeks',
      'Support your incision area when coughing or laughing',
      'Keep the incision area clean and dry',
      'Watch for signs of infection: fever, redness, unusual discharge',
    ];
    if (risk === 'HIGH') actions.push('Seek medical attention today', 'Rest is your top priority — delegate all tasks');
    else if (risk === 'MEDIUM') actions.push('Start gentle walking indoors as tolerated', 'Resume driving only after doctor clearance (~4–6 weeks)');
    else actions.push('Begin gentle walks and gradually increase distance', 'Pelvic floor exercises can begin after 6 weeks with approval');
    return [
      { focus: 'C-Section Incision & Movement', actions },
      { focus: 'Nutrition for Wound Healing', actions: [
        'High-protein foods (dal, eggs, paneer) for wound repair',
        'Iron-rich foods (spinach, jaggery, dates) to replenish blood',
        'Stay hydrated — 10–12 glasses of water daily',
        'Fiber-rich foods to prevent constipation',
      ]},
    ];
  }

  const actions = [
    'Rest as much as possible in the first 2 weeks',
    'Perineal care — keep the area clean and dry',
    'Sitz baths for comfort if needed (warm water, 15 min)',
    'Kegel exercises can begin within days to strengthen pelvic floor',
  ];
  if (risk === 'HIGH') actions.push('Please consult your doctor — your symptoms need attention', 'Prioritize rest and delegate chores');
  else if (risk === 'MEDIUM') actions.push('Light walking is encouraged — listen to your body', 'Resume normal activities gradually after 4–6 weeks');
  else actions.push('Gradually increase physical activity as comfort allows', 'You are recovering well — keep it up!');
  return [
    { focus: 'Pelvic Recovery & Bleeding Care', actions },
    { focus: 'Postpartum Nutrition & Hydration', actions: [
      'Balanced diet with extra 500 cal/day for breastfeeding',
      'Iron and folic acid supplements as prescribed',
      'Warm jaggery water or ginger tea for digestion',
      'Traditional postpartum foods (ajwain laddu, gond laddu) if available',
    ]},
  ];
}

function buildActivities(mentalRisk: RiskLevel, physicalRisk: RiskLevel): CarePlan['activities'] {
  const overall = mentalRisk === 'HIGH' || physicalRisk === 'HIGH' ? 'HIGH'
    : mentalRisk === 'MEDIUM' || physicalRisk === 'MEDIUM' ? 'MEDIUM' : 'LOW';

  if (overall === 'LOW') return [
    { name: 'Morning Walk', type: 'physical', frequency: 'Daily', duration: '15–20 min', notes: 'Walk at a comfortable pace, enjoy the sunlight' },
    { name: 'Sunlight Exposure', type: 'physical', frequency: 'Daily', duration: '10 min', notes: 'Morning sun for Vitamin D and mood boost' },
    { name: 'Deep Breathing', type: 'mental', frequency: 'Twice daily', duration: '5 min', notes: '4-7-8 breathing: inhale 4s, hold 7s, exhale 8s' },
    { name: 'Light Stretching', type: 'physical', frequency: 'Daily', duration: '10 min', notes: 'Gentle neck, shoulder, and back stretches' },
  ];
  if (overall === 'MEDIUM') return [
    { name: 'Guided Relaxation', type: 'mental', frequency: 'Daily', duration: '10–15 min', notes: 'Use a meditation app or YouTube guided session' },
    { name: 'Scheduled Rest Block', type: 'physical', frequency: 'Twice daily', duration: '20 min', notes: 'Set alarms — rest even if you do not feel tired' },
    { name: 'Gentle Indoor Walk', type: 'physical', frequency: 'Daily', duration: '10 min', notes: 'Walk within the house if outdoor walks feel too much' },
    { name: 'Gratitude Journaling', type: 'mental', frequency: 'Every evening', duration: '5 min', notes: 'Write 3 things you are grateful for today' },
  ];
  return [
    { name: 'Complete Rest', type: 'physical', frequency: 'Throughout the day', duration: 'As needed', notes: 'Rest is your medicine right now — let others help' },
    { name: 'Stay with Loved Ones', type: 'mental', frequency: 'Ongoing', duration: 'Continuous', notes: 'Avoid being alone for long periods' },
    { name: 'Minimal Tasks Only', type: 'physical', frequency: 'Daily', duration: 'As tolerated', notes: 'Only do what is absolutely necessary' },
    { name: 'Talk Therapy / Helpline', type: 'mental', frequency: 'As soon as possible', duration: '30 min+', notes: 'Call PSI: 1-800-944-4773 or visit your PHC' },
  ];
}

// ── State Machine ───────────────────────────────────────────────

export function processState(input: PostpartumInput): PostpartumOutput {
  // ── Stage 1: CONGRATS ──
  if (input.stage === 'CONGRATS') {
    return {
      stage: 'CONGRATS',
      ui: {
        title: 'Congratulations, Mama! 🎉',
        message: 'Your baby is here! You have done something incredible. Now let us take care of you.',
        cta: 'Start My Care Check-in',
      },
      questions: [],
      dataSchema: { requiredFields: [], nextExpected: 'DELIVERY_TYPE' },
      carePlan: null,
      alerts: [],
    };
  }

  // ── Stage 2: DELIVERY_TYPE ──
  if (!input.deliveryType) {
    return {
      stage: 'DELIVERY_TYPE',
      ui: {
        title: 'Delivery Type',
        message: 'This helps us customize your physical recovery plan.',
        cta: 'Select your delivery type',
      },
      questions: [DELIVERY_TYPE_QUESTION],
      dataSchema: { requiredFields: ['deliveryType'], nextExpected: 'MENTAL' },
      carePlan: null,
      alerts: [],
    };
  }

  // ── Stage 3: MENTAL ──
  const mentalKeys = ['mood', 'anxiety', 'overwhelm', 'sleep', 'bonding'] as const;
  const nextMentalKey = mentalKeys.find(k => input.mental[k] === null);

  if (nextMentalKey) {
    const qDef = MENTAL_QUESTIONS.find(q => q.id === nextMentalKey)!;
    const answeredCount = mentalKeys.filter(k => input.mental[k] !== null).length;
    return {
      stage: 'MENTAL',
      ui: {
        title: `Mental Health Check (${answeredCount + 1}/${mentalKeys.length})`,
        message: 'Select the option that best describes your experience.',
        cta: '',
      },
      questions: [{
        id: qDef.id,
        label: qDef.label,
        type: 'single_select',
        options: SEVERITY_OPTIONS,
      }],
      dataSchema: {
        requiredFields: [nextMentalKey],
        nextExpected: answeredCount + 1 < mentalKeys.length ? 'MENTAL' : 'PHYSICAL',
      },
      carePlan: null,
      alerts: [],
    };
  }

  // ── Stage 4: PHYSICAL ──
  const physQuestions = input.deliveryType === 'C_SECTION'
    ? CSECTION_PHYSICAL_QUESTIONS
    : NORMAL_PHYSICAL_QUESTIONS;

  const nextPhysQ = physQuestions.find(q => !(q.id in input.physical) || input.physical[q.id] === null);

  if (nextPhysQ) {
    const answeredCount = physQuestions.filter(q => q.id in input.physical && input.physical[q.id] !== null).length;
    return {
      stage: 'PHYSICAL',
      ui: {
        title: `Physical Health Check (${answeredCount + 1}/${physQuestions.length})`,
        message: 'Select the option that best describes your current state.',
        cta: '',
      },
      questions: [nextPhysQ],
      dataSchema: {
        requiredFields: [nextPhysQ.id],
        nextExpected: answeredCount + 1 < physQuestions.length ? 'PHYSICAL' : 'RESULT',
      },
      carePlan: null,
      alerts: [],
    };
  }

  // ── Stage 5: RESULT ──
  const mentalRisk = computeMentalRisk(input.mental);
  const physicalRisk = computePhysicalRisk(input.physical, input.deliveryType);
  const alerts = generateAlerts(mentalRisk, physicalRisk, input.physical, input.deliveryType);

  return {
    stage: 'RESULT',
    ui: {
      title: 'Your Personalized Care Plan',
      message: 'Based on your check-in, here is your tailored postpartum care guidance.',
      cta: 'Track again tomorrow',
    },
    questions: [],
    dataSchema: { requiredFields: [], nextExpected: 'DAILY_LOOP' },
    carePlan: {
      summary: {
        deliveryType: input.deliveryType,
        mentalRisk,
        physicalRisk,
      },
      emotionalCare: buildEmotionalCare(mentalRisk),
      physicalCare: buildPhysicalCare(input.deliveryType, physicalRisk),
      activities: buildActivities(mentalRisk, physicalRisk),
    },
    alerts,
  };
}

// ── Initial state factory ───────────────────────────────────────

export function createInitialInput(): PostpartumInput {
  return {
    stage: 'CONGRATS',
    deliveryConfirmed: true,
    deliveryType: null,
    mental: { mood: null, anxiety: null, overwhelm: null, sleep: null, bonding: null },
    physical: {},
  };
}
