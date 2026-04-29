/**
 * Postpartum Check-in API client
 * Follows the same pattern as symptomsApi.ts: API call + localStorage fallback.
 */

// ── Types ────────────────────────────────────────────────────────

export type Severity = 'MILD' | 'MODERATE' | 'SEVERE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface MentalAnswers {
  mood: Severity | null;
  anxiety: Severity | null;
  overwhelm: Severity | null;
  sleep: Severity | null;
  bonding: Severity | null;
}

export interface NormalPhysical {
  vaginal_pain: Severity | null;
  bleeding: Severity | null;
  energy: 'HIGH' | 'MEDIUM' | 'LOW' | null;
  back_pain: Severity | null;
}

export interface CSectionPhysical {
  incision_pain: Severity | null;
  wound_healing: 'GOOD' | 'CONCERNING' | null;
  mobility: 'EASY' | 'DIFFICULT' | 'VERY_DIFFICULT' | null;
  fever: 'YES' | 'NO' | null;
  swelling: Severity | null;
}

export interface CheckinPayload {
  deliveryType: 'normal' | 'c_section';
  mental: MentalAnswers;
  physical: NormalPhysical | CSectionPhysical;
}

export interface CareAction {
  title: string;
  actions: string[];
}

export interface Activity {
  name: string;
  type: 'mental' | 'physical';
  frequency: string;
  duration: string;
  notes: string;
}

export interface CarePlan {
  summary: {
    deliveryType: string;
    mentalRisk: RiskLevel;
    physicalRisk: RiskLevel;
  };
  emotionalCare: CareAction[];
  physicalCare: CareAction[];
  activities: Activity[];
}

export interface AlertItem {
  type: 'warning';
  message: string;
}

export interface CheckinResult {
  id: string;
  stage: 'RESULT';
  ui: { title: string; message: string; cta: string };
  carePlan: CarePlan;
  alerts: AlertItem[];
  disclaimer: string;
}

export interface CheckinHistoryItem {
  id: string;
  deliveryType: string;
  mentalRisk: RiskLevel;
  physicalRisk: RiskLevel;
  carePlan: CarePlan;
  alerts: AlertItem[];
  createdAt: string;
}

// ── localStorage ────────────────────────────────────────────────

const LS_KEY = 'ss-postpartum-checkins';

function readLS(): CheckinHistoryItem[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLS(items: CheckinHistoryItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items.slice(0, 30)));
  } catch { /* quota */ }
}

// ── Risk engine (client-side mirror for offline mode) ───────────

function computeMentalRisk(m: Record<string, string | null>): RiskLevel {
  const vals = Object.values(m).filter(Boolean) as string[];
  if (vals.some(v => v === 'SEVERE')) return 'HIGH';
  if (vals.filter(v => v === 'MODERATE').length >= 2) return 'MEDIUM';
  return 'LOW';
}

function computePhysicalRisk(
  p: Record<string, string | null>,
  deliveryType: 'normal' | 'c_section',
): RiskLevel {
  const vals = Object.values(p).filter(Boolean) as string[];
  if (vals.some(v => v === 'SEVERE')) return 'HIGH';
  if (deliveryType === 'c_section') {
    if (p.wound_healing === 'CONCERNING') return 'HIGH';
    if (p.fever === 'YES') return 'HIGH';
    if (p.mobility === 'VERY_DIFFICULT') return 'HIGH';
  }
  const modCount = vals.filter(v => v === 'MODERATE').length;
  if (modCount >= 2) return 'MEDIUM';
  if (deliveryType === 'c_section' && modCount >= 1) return 'MEDIUM';
  return 'LOW';
}

// ── API ─────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8081';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ── Client-side care plan generators (offline mirror) ───────────

function buildEmotionalCare(risk: RiskLevel): CareAction[] {
  if (risk === 'LOW') return [{
    title: 'Light Self-Care Routine',
    actions: [
      'Spend 10 minutes in natural sunlight each morning',
      'Practice 5 minutes of deep breathing before sleep',
      'Maintain a simple daily routine to stay grounded',
      'Celebrate small wins each day — you are doing great',
    ],
  }];
  if (risk === 'MEDIUM') return [
    {
      title: 'Structured Emotional Support',
      actions: [
        'Ask a family member to share baby duties for scheduled rest',
        'Write 3 things you are grateful for each evening (journaling)',
        'Set 2 structured rest blocks during the day (20 min each)',
        'Talk to someone you trust about how you feel — daily',
      ],
    },
    {
      title: 'Gentle Coping Strategies',
      actions: [
        'Listen to calming music or guided meditation for 10 min',
        'Limit screen time before bed to improve sleep quality',
        'Step outside for fresh air at least twice a day',
      ],
    },
  ];
  return [
    {
      title: '⚠️ Immediate Emotional Support Needed',
      actions: [
        'You are going through a lot, and that is okay — your feelings are valid',
        'Please talk to a doctor, counselor, or call a helpline today',
        'Ask family to take over baby care so you can rest fully',
        'Avoid being alone for long periods — stay with loved ones',
      ],
    },
    {
      title: 'Professional Resources',
      actions: [
        'PSI Helpline: 1-800-944-4773 (Postpartum Support International)',
        'Visit your nearest Primary Health Centre (PHC) for support',
        'Ask your doctor about postpartum depression screening',
      ],
    },
  ];
}

function buildPhysicalCare(deliveryType: string, risk: RiskLevel): CareAction[] {
  if (deliveryType === 'c_section') {
    const actions = [
      'Avoid lifting anything heavier than your baby for 6-8 weeks',
      'Support your incision area when coughing or laughing',
      'Keep the incision area clean and dry',
      'Watch for signs of infection: fever, redness, unusual discharge',
    ];
    if (risk === 'HIGH') actions.push('Seek medical attention today — your symptoms need professional evaluation', 'Rest is your top priority — delegate all household tasks');
    else if (risk === 'MEDIUM') actions.push('Start gentle walking indoors as tolerated', 'Resume driving only after doctor clearance (~4-6 weeks)');
    else actions.push('Begin gentle walks and gradually increase distance', 'Pelvic floor exercises can begin after 6 weeks with doctor approval');
    return [
      { title: 'C-Section Recovery', actions },
      {
        title: 'Nutrition for Healing',
        actions: [
          'High-protein diet to support wound healing (dal, eggs, paneer)',
          'Iron-rich foods to replenish blood loss (spinach, jaggery, dates)',
          'Stay hydrated — 10-12 glasses of water daily for breastfeeding',
          'Fiber-rich foods to prevent constipation (fruits, whole grains)',
        ],
      },
    ];
  }
  const actions = [
    'Rest as much as possible in the first 2 weeks',
    'Perineal care — keep the area clean and dry',
    'Sitz baths for comfort if needed (warm water, 15 min)',
    'Kegel exercises can begin within days to strengthen pelvic floor',
  ];
  if (risk === 'HIGH') actions.push('Please consult your doctor — your symptoms need attention', 'Prioritize rest and delegate chores to family members');
  else if (risk === 'MEDIUM') actions.push('Light walking is encouraged — listen to your body', 'Resume normal activities gradually after 4-6 weeks');
  else actions.push('Gradually increase physical activity as comfort allows', 'You are recovering well — keep it up!');
  return [
    { title: 'Natural Delivery Recovery', actions },
    {
      title: 'Postpartum Nutrition',
      actions: [
        'Balanced diet with extra 500 cal/day for breastfeeding',
        'Iron and folic acid supplements as prescribed',
        'Warm jaggery water or ginger tea for digestion',
        'Traditional postpartum foods (ajwain laddu, gond laddu) if available',
      ],
    },
  ];
}

function buildActivities(mentalRisk: RiskLevel, physicalRisk: RiskLevel): Activity[] {
  const overall = mentalRisk === 'HIGH' || physicalRisk === 'HIGH' ? 'HIGH' : mentalRisk === 'MEDIUM' || physicalRisk === 'MEDIUM' ? 'MEDIUM' : 'LOW';
  if (overall === 'LOW') return [
    { name: 'Morning Walk', type: 'physical', frequency: 'Daily', duration: '15-20 min', notes: 'Walk at a comfortable pace, enjoy the sunlight' },
    { name: 'Sunlight Exposure', type: 'physical', frequency: 'Daily', duration: '10 min', notes: 'Morning sun for Vitamin D and mood boost' },
    { name: 'Deep Breathing', type: 'mental', frequency: 'Twice daily', duration: '5 min', notes: '4-7-8 breathing: inhale 4s, hold 7s, exhale 8s' },
    { name: 'Light Stretching', type: 'physical', frequency: 'Daily', duration: '10 min', notes: 'Gentle stretches for neck, shoulders, and back' },
  ];
  if (overall === 'MEDIUM') return [
    { name: 'Guided Relaxation', type: 'mental', frequency: 'Daily', duration: '10-15 min', notes: 'Use a meditation app or YouTube guided session' },
    { name: 'Scheduled Rest Block', type: 'physical', frequency: 'Twice daily', duration: '20 min', notes: 'Set alarms — rest even if you do not feel tired' },
    { name: 'Gentle Indoor Walk', type: 'physical', frequency: 'Daily', duration: '10 min', notes: 'Walk within the house if outdoor walks feel too much' },
    { name: 'Gratitude Journaling', type: 'mental', frequency: 'Every evening', duration: '5 min', notes: 'Write 3 things you are grateful for today' },
  ];
  return [
    { name: 'Complete Rest', type: 'physical', frequency: 'Throughout the day', duration: 'As needed', notes: 'Rest is your medicine right now — let others help' },
    { name: 'Support Dependency', type: 'mental', frequency: 'Ongoing', duration: 'Continuous', notes: 'Stay with loved ones, avoid being alone' },
    { name: 'Minimal Tasks Only', type: 'physical', frequency: 'Daily', duration: 'As tolerated', notes: 'Only do what is absolutely necessary — delegate the rest' },
    { name: 'Talk Therapy / Helpline', type: 'mental', frequency: 'As soon as possible', duration: '30 min+', notes: 'Call PSI: 1-800-944-4773 or visit your PHC' },
  ];
}

function buildAlerts(mentalRisk: RiskLevel, physicalRisk: RiskLevel, physical: Record<string, string | null>, deliveryType: string): AlertItem[] {
  const alerts: AlertItem[] = [];
  if (mentalRisk === 'HIGH') alerts.push({ type: 'warning', message: 'Your emotional well-being needs attention. Please consider speaking with a healthcare provider or a trusted person. You are not alone, and support is available.' });
  if (physicalRisk === 'HIGH') alerts.push({ type: 'warning', message: 'Your physical recovery may need medical attention. Please consult your doctor or visit your nearest health centre soon.' });
  if (deliveryType === 'c_section') {
    if (physical.fever === 'YES') alerts.push({ type: 'warning', message: 'Fever after a C-section can indicate infection. Please seek medical attention promptly.' });
    if (physical.wound_healing === 'CONCERNING') alerts.push({ type: 'warning', message: 'Wound healing concerns after a C-section require medical evaluation. Please contact your doctor.' });
  }
  return alerts;
}

export async function submitPostpartumCheckin(
  payload: CheckinPayload,
): Promise<CheckinResult> {
  // Compute locally for offline fallback
  const mentalRisk = computeMentalRisk(payload.mental as any);
  const physicalRisk = computePhysicalRisk(payload.physical as any, payload.deliveryType);

  // Generate care content client-side
  const emotionalCare = buildEmotionalCare(mentalRisk);
  const physicalCare = buildPhysicalCare(payload.deliveryType, physicalRisk);
  const activities = buildActivities(mentalRisk, physicalRisk);
  const alerts = buildAlerts(mentalRisk, physicalRisk, payload.physical as any, payload.deliveryType);

  const localResult: CheckinResult = {
    id: crypto.randomUUID(),
    stage: 'RESULT',
    ui: {
      title: 'Your Personalized Care Plan',
      message: 'Based on your check-in, here is your tailored postpartum care guidance.',
      cta: 'Track again tomorrow',
    },
    carePlan: {
      summary: { deliveryType: payload.deliveryType, mentalRisk, physicalRisk },
      emotionalCare,
      physicalCare,
      activities,
    },
    alerts,
    disclaimer: 'This information is for wellness guidance only. It is NOT a medical diagnosis. Please consult a qualified healthcare provider for any medical concerns.',
  };

  // Persist locally
  const store = readLS();
  store.unshift({
    id: localResult.id,
    deliveryType: payload.deliveryType,
    mentalRisk,
    physicalRisk,
    carePlan: localResult.carePlan,
    alerts: localResult.alerts,
    createdAt: new Date().toISOString(),
  });
  writeLS(store);

  // Try remote
  try {
    return await apiFetch<CheckinResult>('/postpartum/checkin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    // Return local computation
    return localResult;
  }
}

export async function getCheckinHistory(): Promise<CheckinHistoryItem[]> {
  try {
    const res = await apiFetch<{ checkins: CheckinHistoryItem[] }>('/postpartum/checkin/history');
    return res.checkins;
  } catch {
    return readLS();
  }
}
