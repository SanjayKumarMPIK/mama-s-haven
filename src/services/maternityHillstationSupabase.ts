import { supabaseUserClient } from '@/lib/supabase-user';
import { supabaseDoctorClient } from '@/lib/supabase-doctor';
import { loadStoredDoctorPhcProfiles, patientPhcMatchesDoctorPhc } from '@/lib/phcMatch';
import { HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE } from '@/lib/maternityHillstationConstants';
import { computeDaysLeftToDueDate } from '@/lib/maternityHillstationAlertWindow';
import type { MaternityHillstationAlert } from '@/services/maternityAlertStore';
import { logAlertAudit } from '@/services/maternityAlertAudit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userDb = supabaseUserClient as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doctorDb = supabaseDoctorClient as any;

function mapDbRowToAlert(row: Record<string, unknown>): MaternityHillstationAlert {
  const due = row.due_date != null ? String(row.due_date).split('T')[0] : '';
  const dl = row.days_left != null ? Number(row.days_left) : -1;
  const ctx = (row.patient_context as Record<string, unknown> | null) ?? {};
  return {
    id: String(row.id),
    patient_id: String(row.patient_id),
    patient_name: String(row.patient_name ?? 'Patient'),
    phc_location: String(row.phc_location ?? ''),
    village_town: String(row.village_town ?? ''),
    emergency_contact: String(row.emergency_contact ?? ''),
    days_left: Number.isFinite(dl) ? dl : -1,
    due_date: due,
    alert_message: String(row.alert_message ?? ''),
    priority: 'HIGH',
    type: 'maternity_hillstation_delivery_alert',
    status: (row.status as MaternityHillstationAlert['status']) ?? 'active',
    created_at: String(row.created_at ?? new Date().toISOString()),
    expires_at: String(row.expires_at ?? new Date().toISOString()),
    patient_age: typeof ctx.age === 'number' ? ctx.age : ctx.age != null ? Number(ctx.age) : undefined,
    blood_group: ctx.bloodGroup != null ? String(ctx.bloodGroup) : undefined,
    trimester: typeof ctx.trimester === 'number' ? ctx.trimester : ctx.trimester != null ? Number(ctx.trimester) : undefined,
    weeks_pregnant:
      typeof ctx.weeksPregnant === 'number' ? ctx.weeksPregnant : ctx.weeksPregnant != null ? Number(ctx.weeksPregnant) : undefined,
  };
}

export type PublishHillstationInput = {
  patientId: string;
  patientName: string;
  nearbyPhc: string;
  stateOrVillage: string;
  emergencyContact: string;
  /** Required for publish: EDD must be within 0..HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE days */
  expectedDueDate?: string;
  age?: number;
  bloodGroup?: string;
  trimester?: number;
  weeksPregnant?: number;
};

/**
 * True if any doctor in `doctor_profiles` (or local demo rows) matches the patient's
 * nearby PHC string (including comma-separated multiple PHCs). One shared alert row
 * is published; every doctor whose PHC matches sees it after login or poll.
 */
export async function hasDoctorForPatientPhc(nearbyPhc: string): Promise<boolean> {
  const local = loadStoredDoctorPhcProfiles();
  if (
    local.some((d) =>
      patientPhcMatchesDoctorPhc(nearbyPhc, d.phc_center || undefined, d.phc_location),
    )
  ) {
    return true;
  }

  const { data, error } = await userDb.from('doctor_profiles').select('id, phc_center, phc_location');
  if (error || !data?.length) return false;
  return (data as { phc_center?: string; phc_location?: string }[]).some((d) =>
    patientPhcMatchesDoctorPhc(nearbyPhc, d.phc_center, d.phc_location),
  );
}

/**
 * Check if the patient has an accepted doctor connection.
 * Returns the connected doctor's ID and code, or null.
 * This enables connection-aware routing (not just PHC matching).
 */
export async function findConnectedDoctorForPatient(
  patientId: string,
): Promise<{ doctorId: string; doctorCode: string } | null> {
  try {
    const { data, error } = await userDb
      .from('doctor_connections')
      .select('doctor_id, doctor_code')
      .eq('patient_id', patientId)
      .eq('status', 'accepted')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error || !data?.length) return null;
    const row = data[0] as { doctor_id: string; doctor_code: string };
    return { doctorId: row.doctor_id, doctorCode: row.doctor_code };
  } catch {
    return null;
  }
}

/**
 * Check if the patient has ANY doctor (connected or PHC-matched).
 * Returns true if the patient can safely publish an alert.
 */
export async function hasAnyDoctorForPatient(
  patientId: string,
  nearbyPhc: string,
): Promise<boolean> {
  // First check direct connection
  const connected = await findConnectedDoctorForPatient(patientId);
  if (connected) return true;
  // Fall back to PHC matching
  return hasDoctorForPatientPhc(nearbyPhc);
}

/** Insert or refresh an active hillstation delivery alert for this patient (Supabase). */
export async function publishPatientHillstationAlert(input: PublishHillstationInput): Promise<boolean> {
  const {
    patientId,
    patientName,
    nearbyPhc,
    stateOrVillage,
    emergencyContact,
    expectedDueDate,
    age,
    bloodGroup,
    trimester,
    weeksPregnant,
  } = input;

  const dueTrim = expectedDueDate && String(expectedDueDate).trim();
  if (!dueTrim) return false;

  const dueYmd = String(dueTrim).split('T')[0];
  const daysLeft = computeDaysLeftToDueDate(dueYmd);
  if (
    !Number.isFinite(daysLeft) ||
    daysLeft < 0 ||
    daysLeft > HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE
  ) {
    return false;
  }

  const hasDoctor = await hasDoctorForPatientPhc(nearbyPhc);
  if (!hasDoctor) return false;

  const dueDateSql = dueYmd;
  const daysLeftSql = daysLeft;

  const patientContext: Record<string, unknown> = {};
  if (age != null && Number.isFinite(age)) patientContext.age = age;
  if (bloodGroup) patientContext.bloodGroup = bloodGroup;
  if (trimester != null && Number.isFinite(trimester)) patientContext.trimester = trimester;
  if (weeksPregnant != null && Number.isFinite(weeksPregnant)) patientContext.weeksPregnant = weeksPregnant;

  const msgParts = [
    `Hillstation maternity alert: ${patientName}`,
    nearbyPhc ? `PHC: ${nearbyPhc}` : '',
    dueDateSql ? `EDD: ${dueDateSql}` : 'EDD: not on file',
    daysLeftSql != null && daysLeftSql >= 0 ? `≈ ${daysLeftSql} day(s) to due` : '',
  ];
  const alertMessage = msgParts.filter(Boolean).join(' · ');

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await userDb
    .from('maternity_hillstation_alerts')
    .select('id')
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing?.id) {
    const { error: upErr } = await userDb
      .from('maternity_hillstation_alerts')
      .update({
        patient_name: patientName,
        phc_location: nearbyPhc.trim(),
        village_town: stateOrVillage || null,
        emergency_contact: emergencyContact || null,
        days_left: daysLeftSql,
        due_date: dueDateSql,
        alert_message: alertMessage,
        patient_context: Object.keys(patientContext).length ? patientContext : null,
        expires_at: expiresAt,
      })
      .eq('id', existing.id);
    return !upErr;
  }

  const { error } = await userDb.from('maternity_hillstation_alerts').insert({
    patient_id: patientId,
    patient_name: patientName,
    phc_location: nearbyPhc.trim(),
    village_town: stateOrVillage || null,
    emergency_contact: emergencyContact || null,
    days_left: daysLeftSql,
    due_date: dueDateSql,
    alert_message: alertMessage,
    patient_context: Object.keys(patientContext).length ? patientContext : null,
    priority: 'HIGH',
    type: 'maternity_hillstation_delivery_alert',
    status: 'active',
    expires_at: expiresAt,
  });

  if (error) {
    console.error('[HillstationAlert] publish failed:', error.message);
    void logAlertAudit('alert_publish_failed', {
      actorId: patientId,
      actorRole: 'patient',
      detail: { error: error.message, nearbyPhc },
    });
    return false;
  }
  void logAlertAudit('alert_created', {
    actorId: patientId,
    actorRole: 'patient',
    detail: { nearbyPhc, daysLeft: daysLeftSql, dueDate: dueDateSql },
  });
  return true;
}

export async function revokePatientHillstationAlerts(patientId: string): Promise<void> {
  await userDb
    .from('maternity_hillstation_alerts')
    .update({ status: 'resolved' })
    .eq('patient_id', patientId)
    .eq('status', 'active');
  void logAlertAudit('alert_revoked', {
    actorId: patientId,
    actorRole: 'patient',
    detail: { reason: 'conditions_no_longer_met' },
  });
}

/** Active alerts for doctors whose PHC matches the alert row's PHC (normalized). */
export async function fetchActiveHillstationAlertsForDoctor(
  doctorPhcCenter: string | undefined,
  doctorPhcLocation: string | undefined,
): Promise<MaternityHillstationAlert[]> {
  const { data, error } = await doctorDb
    .from('maternity_hillstation_alerts')
    .select('*')
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('[HillstationAlert] fetch:', error.message);
    return [];
  }

  return (data as Record<string, unknown>[])
    .filter((row) =>
      patientPhcMatchesDoctorPhc(String(row.phc_location ?? ''), doctorPhcCenter, doctorPhcLocation),
    )
    .map(mapDbRowToAlert);
}

export async function fetchAcknowledgedAlertIdsForDoctor(doctorId: string): Promise<Set<string>> {
  const { data, error } = await doctorDb
    .from('maternity_hillstation_acknowledgments')
    .select('alert_id')
    .eq('doctor_id', doctorId);

  if (error || !data) return new Set();
  return new Set((data as { alert_id: string }[]).map((r) => r.alert_id));
}

export interface HillstationAcknowledgmentActivity {
  alertId: string;
  doctorId: string;
  acknowledgedAt: string;
}

export async function fetchHillstationAcknowledgmentsForPatient(
  patientId: string,
  doctorId?: string,
): Promise<HillstationAcknowledgmentActivity[]> {
  const { data: alerts, error: alertsError } = await userDb
    .from('maternity_hillstation_alerts')
    .select('id')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (alertsError || !alerts?.length) {
    if (alertsError) {
      console.error('[HillstationAlert] patient ack alerts fetch:', alertsError.message);
    }
    return [];
  }

  const alertIds = (alerts as { id: string }[]).map((row) => row.id);
  let query = userDb
    .from('maternity_hillstation_acknowledgments')
    .select('alert_id, doctor_id, acknowledged_at')
    .in('alert_id', alertIds)
    .order('acknowledged_at', { ascending: false });

  if (doctorId) {
    query = query.eq('doctor_id', doctorId);
  }

  const { data, error } = await query;
  if (error || !data) {
    if (error) {
      console.error('[HillstationAlert] patient ack fetch:', error.message);
    }
    return [];
  }

  return (data as { alert_id: string; doctor_id: string; acknowledged_at: string }[]).map((row) => ({
    alertId: row.alert_id,
    doctorId: row.doctor_id,
    acknowledgedAt: row.acknowledged_at,
  }));
}

export async function acknowledgeHillstationAlertOnServer(alertId: string, doctorId: string): Promise<boolean> {
  const { error } = await doctorDb.from('maternity_hillstation_acknowledgments').insert({
    alert_id: alertId,
    doctor_id: doctorId,
  });
  if (error && !String(error.message).includes('duplicate')) {
    console.error('[HillstationAlert] acknowledge:', error.message);
    return false;
  }
  void logAlertAudit('alert_acknowledged', {
    alertId,
    actorId: doctorId,
    actorRole: 'doctor',
    detail: { source: 'supabase_server' },
  });
  return true;
}
