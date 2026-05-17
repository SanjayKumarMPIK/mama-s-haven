import { supabaseUserClient } from '@/lib/supabase-user';
import { supabaseDoctorClient } from '@/lib/supabase-doctor';
import { patientPhcMatchesDoctorPhc } from '@/lib/phcMatch';
import type { AlertPriority, AlertStatus, DoctorAlert } from '@/hooks/useMaternitySymptomWarning';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userDb = supabaseUserClient as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doctorDb = supabaseDoctorClient as any;

export interface PublishSymptomAlertInput {
  patientId: string;
  patientName: string;
  phcLocation: string;
  symptomName: string | null;
  triggerType: string;
  priority: string;
  symptomCount: number;
  consecutiveDays: number;
  maternityPhase: string;
}

export async function publishSymptomAlert(input: PublishSymptomAlertInput): Promise<boolean> {
  const { error } = await userDb.from('doctor_symptom_alerts').insert({
    patient_id: input.patientId,
    patient_name: input.patientName,
    phc_location: input.phcLocation,
    symptom_name: input.symptomName,
    trigger_type: input.triggerType,
    priority: input.priority,
    symptom_count: input.symptomCount,
    consecutive_days: input.consecutiveDays,
    maternity_phase: input.maternityPhase,
    status: 'active'
  });

  if (error) {
    console.error('[SymptomAlert] publish failed:', error.message);
    return false;
  }
  return true;
}

export async function fetchSymptomAlertsForDoctor(
  doctorPhcCenter: string | undefined,
  doctorPhcLocation: string | undefined,
): Promise<DoctorAlert[]> {
  const { data, error } = await doctorDb
    .from('doctor_symptom_alerts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (error) console.error('[SymptomAlert] fetch:', error.message);
    return [];
  }

  return (data as Record<string, unknown>[])
    .filter((row) =>
      patientPhcMatchesDoctorPhc(String(row.phc_location ?? ''), doctorPhcCenter, doctorPhcLocation),
    )
    .map((row) => ({
      id: String(row.id),
      patientName: String(row.patient_name),
      symptomName: row.symptom_name ? String(row.symptom_name) : null,
      triggerType: String(row.trigger_type),
      priority: String(row.priority) as AlertPriority,
      symptomCount: Number(row.symptom_count),
      consecutiveDays: Number(row.consecutive_days),
      timestamp: new Date(String(row.created_at)).getTime(),
      maternityPhase: String(row.maternity_phase),
      alertStatus: String(row.status) as AlertStatus,
    }));
}

export async function updateSymptomAlertStatus(alertId: string, status: AlertStatus): Promise<boolean> {
  const { error } = await doctorDb
    .from('doctor_symptom_alerts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) {
    console.error('[SymptomAlert] update status failed:', error.message);
    return false;
  }
  return true;
}
