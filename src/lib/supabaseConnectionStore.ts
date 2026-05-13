import { supabaseUserClient } from '@/lib/supabase-user';
import { supabaseDoctorClient } from '@/lib/supabase-doctor';
import type { ConnectionRequest, ConnectionStatus, PatientProfileData } from './connectionStore';

// ─── Supabase-backed Connection Store ────────────────────────────────────────
// Patient flows use supabaseUserClient (JWT in swasthya-user-auth).
// Doctor flows use supabaseDoctorClient (JWT in swasthya-doctor-auth).
// The shared integration client uses a different storage key and has no user JWT — do not use it here.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patientDb = supabaseUserClient as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doctorDb = supabaseDoctorClient as any;

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

// ── Look up a doctor by their unique code (case-insensitive) ─────────────────
export async function lookupDoctorByCode(
  doctorCode: string,
): Promise<{ id: string; full_name: string; designation: string; doctor_code: string } | null> {
  const raw = doctorCode.trim();
  if (!raw) return null;

  const { data, error } = await patientDb
    .from('doctor_profiles')
    .select('id, full_name, designation, doctor_code')
    .ilike('doctor_code', raw)
    .maybeSingle();

  if (error) {
    console.error('[ConnectionStore] lookupDoctorByCode:', error.message);
    return null;
  }
  if (!data) return null;
  return data as { id: string; full_name: string; designation: string; doctor_code: string };
}

// ── Patient: send a connection request to a doctor ────────────────────────────
export async function createSupabaseRequest(
  doctorCode: string,
  patientId: string,
  profile?: PatientProfileData,
): Promise<ConnectionRequest | null> {
  const doctor = await lookupDoctorByCode(doctorCode);
  if (!doctor) return null;

  const canonicalCode = doctor.doctor_code || doctorCode.trim();

  const { data: existing, error: existingErr } = await patientDb
    .from('doctor_connections')
    .select('*')
    .eq('doctor_id', doctor.id)
    .eq('patient_id', patientId)
    .maybeSingle();

  if (existingErr) {
    console.error('[ConnectionStore] existing check:', existingErr.message);
  }
  if (existing) return mapRow(existing as Record<string, unknown>);

  const { data: inserted, error } = await patientDb
    .from('doctor_connections')
    .insert({
      doctor_id: doctor.id,
      doctor_code: canonicalCode,
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
    console.error('[ConnectionStore] Insert error:', error?.message, error?.details, error?.hint);
    return null;
  }
  return mapRow(inserted as Record<string, unknown>);
}

// ── Patient: get their existing request to a doctor by code ───────────────────
export async function getSupabaseRequestByCode(
  doctorCode: string,
  patientId: string,
): Promise<ConnectionRequest | null> {
  const raw = doctorCode.trim();
  if (!raw) return null;

  const { data, error } = await patientDb
    .from('doctor_connections')
    .select('*')
    .ilike('doctor_code', raw)
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error) {
    console.error('[ConnectionStore] getSupabaseRequestByCode:', error.message);
    return null;
  }
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}

// ── Doctor: get all connection requests addressed to them ─────────────────────
export async function getSupabaseRequestsByDoctor(
  doctorId: string,
): Promise<ConnectionRequest[]> {
  const { data, error } = await doctorDb
    .from('doctor_connections')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ConnectionStore] getSupabaseRequestsByDoctor:', error.message);
    return [];
  }
  if (!data) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}

// ── Doctor: accept or reject a connection request ─────────────────────────────
export async function updateSupabaseConnectionStatus(
  requestId: string,
  status: ConnectionStatus,
): Promise<boolean> {
  const { error } = await doctorDb
    .from('doctor_connections')
    .update({ status })
    .eq('id', requestId);

  if (error) {
    console.error('[ConnectionStore] updateSupabaseConnectionStatus:', error.message);
    return false;
  }
  return true;
}

// ── Patient: fetch the connected doctor's full profile from Supabase ──────────
export interface ConnectedDoctorProfile {
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  phone: string;
  workingHours: string;
  gender: string | null;
}

export async function fetchDoctorProfileByCode(
  doctorCode: string,
): Promise<ConnectedDoctorProfile | null> {
  const raw = doctorCode.trim();
  if (!raw) return null;

  const { data, error } = await patientDb
    .from('doctor_profiles')
    .select('full_name, designation, specialization, phc_center, phc_location, phone_no, working_hours, gender')
    .ilike('doctor_code', raw)
    .maybeSingle();

  if (error) {
    console.error('[ConnectionStore] fetchDoctorProfileByCode:', error.message);
    return null;
  }
  if (!data) return null;

  return {
    name: data.full_name || 'Your Doctor',
    specialty: data.designation || 'Healthcare Provider',
    hospital: data.phc_center || 'Registered Healthcare Facility',
    location: data.phc_location || '',
    phone: data.phone_no || '',
    workingHours: data.working_hours || '',
    gender: data.gender || null,
  };
}

// ── Patient: find their existing connection (if any) on login ─────────────────
// Returns the most recent accepted/pending connection for this specific patient_id.
// This is user-scoped: user1 sees Dr. Anita, user2 sees Dr. Shymala.
export async function getExistingConnectionForPatient(
  patientId: string,
): Promise<ConnectionRequest | null> {
  if (!patientId) return null;

  const { data, error } = await patientDb
    .from('doctor_connections')
    .select('*')
    .eq('patient_id', patientId)
    .in('status', ['accepted', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[ConnectionStore] getExistingConnectionForPatient:', error.message);
    return null;
  }
  if (!data) return null;
  return mapRow(data as Record<string, unknown>);
}
