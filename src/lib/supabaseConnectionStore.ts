import { supabase } from '@/integrations/supabase/client';
import type { ConnectionRequest, ConnectionStatus, PatientProfileData } from './connectionStore';

// ─── Supabase-backed Connection Store ────────────────────────────────────────
// Replaces the localStorage connectionStore for doctor-patient connections.
// Medical reports remain in localStorage (separate concern).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

// ── Map DB row → ConnectionRequest ────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): ConnectionRequest {
  return {
    id: row.id as string,
    patientName: row.patient_name as string,
    patientPhase: row.patient_phase as string,
    patientProfile: row.patient_profile as PatientProfileData | undefined,
    doctorCode: row.doctor_code as string,
    doctorId: row.doctor_id as string,
    status: row.status as ConnectionStatus,
    createdAt: row.created_at as string,
    pregnancyWeek: row.pregnancy_week as number | undefined,
    riskLevel: row.risk_level as string | undefined,
  };
}

// ── Look up a doctor by their unique 6-char code ──────────────────────────────
export async function lookupDoctorByCode(
  doctorCode: string,
): Promise<{ id: string; full_name: string; designation: string } | null> {
  const { data, error } = await db
    .from('doctor_profiles')
    .select('id, full_name, designation')
    .eq('doctor_code', doctorCode.trim())
    .maybeSingle();

  if (error || !data) return null;
  return data as { id: string; full_name: string; designation: string };
}

// ── Patient: send a connection request to a doctor ────────────────────────────
export async function createSupabaseRequest(
  doctorCode: string,
  patientId: string,
  profile?: PatientProfileData,
): Promise<ConnectionRequest | null> {
  // 1. Look up doctor
  const doctor = await lookupDoctorByCode(doctorCode);
  if (!doctor) return null;

  // 2. Check for existing request from this patient to this doctor
  const { data: existing } = await db
    .from('doctor_connections')
    .select('*')
    .eq('doctor_id', doctor.id)
    .eq('patient_id', patientId)
    .maybeSingle();

  if (existing) return mapRow(existing as Record<string, unknown>);

  // 3. Insert new request
  const { data: inserted, error } = await db
    .from('doctor_connections')
    .insert({
      doctor_id: doctor.id,
      doctor_code: doctorCode.trim(),
      patient_id: patientId,
      patient_name: profile?.fullName ?? 'Patient',
      patient_phase: profile?.lifeStage ?? 'Maternity',
      patient_profile: profile ?? null,
      status: 'pending',
      pregnancy_week: profile?.pregnancyWeek ?? null,
    })
    .select()
    .single();

  if (error || !inserted) {
    console.error('[ConnectionStore] Insert error:', error?.message);
    return null;
  }
  return mapRow(inserted as Record<string, unknown>);
}

// ── Patient: get their existing request to a doctor by code ───────────────────
export async function getSupabaseRequestByCode(
  doctorCode: string,
  patientId: string,
): Promise<ConnectionRequest | null> {
  const { data, error } = await db
    .from('doctor_connections')
    .select('*')
    .eq('doctor_code', doctorCode.trim())
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}

// ── Doctor: get all connection requests addressed to them ─────────────────────
export async function getSupabaseRequestsByDoctor(
  doctorId: string,
): Promise<ConnectionRequest[]> {
  const { data, error } = await db
    .from('doctor_connections')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}

// ── Doctor: accept or reject a connection request ─────────────────────────────
export async function updateSupabaseConnectionStatus(
  requestId: string,
  status: ConnectionStatus,
): Promise<boolean> {
  const { error } = await db
    .from('doctor_connections')
    .update({ status })
    .eq('id', requestId);

  return !error;
}
