import { supabase } from '@/integrations/supabase/client';
import { supabaseUserClient } from '@/lib/supabase-user';

export type SOSStatus = 'pending' | 'acknowledged' | 'resolved';

const DEMO_ALERTS_KEY = 'mom_demo_sos_alerts';
const DEMO_COOLDOWN_KEY_PREFIX = 'mom_demo_sos_cooldown_';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getDemoAlerts(): Record<string, unknown>[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ALERTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDemoAlerts(alerts: Record<string, unknown>[]): void {
  localStorage.setItem(DEMO_ALERTS_KEY, JSON.stringify(alerts));
}

function getDemoDoctorConnection() {
  return {
    doctorId: 'demo-doctor-001',
    doctorCode: 'DR-PRIYA-001',
    patientPhase: 'maternity',
    pregnancyWeek: 32,
  };
}

function checkDemoCooldown(patientId: string): { allowed: boolean; daysRemaining?: number } {
  try {
    const lastTime = parseInt(localStorage.getItem(DEMO_COOLDOWN_KEY_PREFIX + patientId) || '0', 10);
    if (!lastTime) return { allowed: true };
    const diffMs = Date.now() - lastTime;
    if (diffMs < THIRTY_DAYS_MS) {
      const remainingMs = THIRTY_DAYS_MS - diffMs;
      const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      return { allowed: false, daysRemaining };
    }
    return { allowed: true };
  } catch {
    return { allowed: true };
  }
}

function setDemoCooldown(patientId: string): void {
  localStorage.setItem(DEMO_COOLDOWN_KEY_PREFIX + patientId, String(Date.now()));
}

export interface SOSAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientPhase: string;
  doctorId: string;
  doctorCode: string;
  emergencyMessage: string | null;
  pregnancyWeek: number | null;
  status: SOSStatus;
  location: Record<string, unknown> | null;
  createdAt: string;
  handledAt: string | null;
  updatedAt: string;
}

export interface CreateSOSPayload {
  patientId: string;
  patientName: string;
  patientPhase: string;
  doctorId: string;
  doctorCode: string;
  emergencyMessage?: string;
  pregnancyWeek?: number;
  location?: Record<string, unknown>;
}

function mapRow(row: Record<string, unknown>): SOSAlert {
  return {
    id: row.id as string,
    patientId: row.patient_id as string,
    patientName: row.patient_name as string,
    patientPhase: row.patient_phase as string,
    doctorId: row.doctor_id as string,
    doctorCode: row.doctor_code as string,
    emergencyMessage: (row.emergency_message as string | null) ?? null,
    pregnancyWeek: (row.pregnancy_week as number | null) ?? null,
    status: (row.status as SOSStatus) ?? 'pending',
    location: (row.location as Record<string, unknown> | null) ?? null,
    createdAt: row.created_at as string,
    handledAt: (row.handled_at as string | null) ?? null,
    updatedAt: row.updated_at as string,
  };
}

// ─── Table availability cache ────────────────────────────────────────────────
// Once we detect the sos_alerts table doesn't exist (404), skip future network
// calls permanently via localStorage so page reloads don't re-trigger 404s.
function isSOSTableMissing(): boolean {
  return localStorage.getItem('ss-sos-table-missing') === 'true';
}

function markSOSTableMissing() {
  localStorage.setItem('ss-sos-table-missing', 'true');
}

// Check once at boot time so the very first polling cycle never hits the
// network.  If the table is already known to be missing, we never even try.
ensureSOSTableState();

async function ensureSOSTableState() {
  if (isSOSTableMissing()) return;
  try {
    const { error } = await (supabase as any)
      .from('sos_alerts')
      .select('id')
      .limit(1);
    if (error) {
      markSOSTableMissing();
    }
  } catch {
    markSOSTableMissing();
  }
}

export async function canTriggerSOS(patientId: string): Promise<{ allowed: boolean; lastSOS?: SOSAlert; daysRemaining?: number }> {
  if (isSOSTableMissing()) return checkDemoCooldown(patientId);
  try {
    const { data, error } = await (supabase as any)
      .from('sos_alerts')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      markSOSTableMissing();
      return checkDemoCooldown(patientId);
    }

    if (!data || data.length === 0) return { allowed: true };

    const lastSOS = mapRow(data[0] as Record<string, unknown>);
    const lastCreated = new Date(lastSOS.createdAt).getTime();
    const now = Date.now();
    const diffMs = now - lastCreated;

    if (diffMs < THIRTY_DAYS_MS) {
      const remainingMs = THIRTY_DAYS_MS - diffMs;
      const daysRemaining = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      return { allowed: false, lastSOS, daysRemaining };
    }

    return { allowed: true };
  } catch {
    return checkDemoCooldown(patientId);
  }
}

export async function createSOSAlert(payload: CreateSOSPayload): Promise<SOSAlert | null> {
  if (isSOSTableMissing()) return createDemoSOSAlert(payload);
  try {
    const { data, error } = await (supabase as any)
      .from('sos_alerts')
      .insert({
        patient_id: payload.patientId,
        patient_name: payload.patientName,
        patient_phase: payload.patientPhase,
        doctor_id: payload.doctorId,
        doctor_code: payload.doctorCode,
        emergency_message: payload.emergencyMessage ?? null,
        pregnancy_week: payload.pregnancyWeek ?? null,
        location: payload.location ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      markSOSTableMissing();
      return createDemoSOSAlert(payload);
    }

    return mapRow(data as Record<string, unknown>);
  } catch {
    return createDemoSOSAlert(payload);
  }
}

function createDemoSOSAlert(payload: CreateSOSPayload): SOSAlert {
  const now = new Date().toISOString();
  const id = crypto.randomUUID?.() ?? `demo-${Date.now()}-${Math.random()}`;

  const dbRow: Record<string, unknown> = {
    id,
    patient_id: payload.patientId,
    patient_name: payload.patientName,
    patient_phase: payload.patientPhase,
    doctor_id: payload.doctorId,
    doctor_code: payload.doctorCode,
    emergency_message: payload.emergencyMessage ?? null,
    pregnancy_week: payload.pregnancyWeek ?? null,
    location: payload.location ?? null,
    status: 'pending',
    created_at: now,
    handled_at: null,
    updated_at: now,
  };

  const alerts = getDemoAlerts();
  alerts.push(dbRow);
  saveDemoAlerts(alerts);

  setDemoCooldown(payload.patientId);

  return mapRow(dbRow);
}

export async function getSOSAlertsByPatient(patientId: string): Promise<SOSAlert[]> {
  if (isSOSTableMissing()) return [];
  const { data, error } = await (supabase as any)
    .from('sos_alerts')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    markSOSTableMissing();
    return [];
  }
  return (data as Record<string, unknown>[]).map(mapRow);
}

export async function getSOSAlertsByDoctor(doctorId: string): Promise<SOSAlert[]> {
  if (isSOSTableMissing()) {
    const all = getDemoAlerts();
    return all.filter(a => a.doctor_id === doctorId).map(a => mapRow(a));
  }
  try {
    const { data, error } = await (supabase as any)
      .from('sos_alerts')
      .select('*')
      .eq('doctor_id', doctorId)
      .order('created_at', { ascending: false });

    if (error || !data) {
      markSOSTableMissing();
      const all = getDemoAlerts();
      return all.filter(a => a.doctor_id === doctorId).map(a => mapRow(a));
    }
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return [];
  }
}

export async function getPendingSOSAlertsByDoctor(doctorId: string): Promise<SOSAlert[]> {
  if (isSOSTableMissing()) {
    const all = getDemoAlerts();
    return all.filter(a => a.doctor_id === doctorId && a.status === 'pending').map(a => mapRow(a));
  }
  try {
    const { data, error } = await (supabase as any)
      .from('sos_alerts')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error || !data) {
      markSOSTableMissing();
      const all = getDemoAlerts();
      return all.filter(a => a.doctor_id === doctorId && a.status === 'pending').map(a => mapRow(a));
    }
    return (data as Record<string, unknown>[]).map(mapRow);
  } catch {
    return [];
  }
}

export async function updateSOSStatus(
  sosId: string,
  status: SOSStatus,
): Promise<boolean> {
  if (isSOSTableMissing()) return updateDemoSOSStatus(sosId, { status });
  const updates: Record<string, unknown> = { status };
  if (status === 'acknowledged' || status === 'resolved') {
    updates.handled_at = new Date().toISOString();
  }

  try {
    const { error } = await (supabase as any)
      .from('sos_alerts')
      .update(updates)
      .eq('id', sosId);

    if (error) {
      markSOSTableMissing();
      return updateDemoSOSStatus(sosId, updates);
    }
    return true;
  } catch {
    return updateDemoSOSStatus(sosId, updates);
  }
}

function updateDemoSOSStatus(sosId: string, updates: Record<string, unknown>): boolean {
  const alerts = getDemoAlerts();
  const idx = alerts.findIndex(a => a.id === sosId);
  if (idx === -1) return false;
  alerts[idx] = { ...alerts[idx], ...updates };
  saveDemoAlerts(alerts);
  return true;
}

export async function findActiveDoctorConnection(
  patientId: string,
): Promise<{ doctorId: string; doctorCode: string; patientPhase: string; pregnancyWeek?: number } | null> {
  try {
    const { data, error } = await (supabaseUserClient as any)
      .from('doctor_connections')
      .select('doctor_id, doctor_code, patient_phase, pregnancy_week, status')
      .eq('patient_id', patientId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) return getDemoDoctorConnection();

    if (!data || data.length === 0) return null;

    const row = data[0] as Record<string, unknown>;
    return {
      doctorId: row.doctor_id as string,
      doctorCode: row.doctor_code as string,
      patientPhase: row.patient_phase as string,
      pregnancyWeek: row.pregnancy_week as number | undefined,
    };
  } catch {
    return getDemoDoctorConnection();
  }
}
