import { supabaseUserClient } from '@/lib/supabase-user';
import { supabaseDoctorClient } from '@/lib/supabase-doctor';

// ─── Schedule Store (Supabase-backed) ─────────────────────────────────────────
// Patient flows use supabaseUserClient (JWT in swasthya-user-auth).
// Doctor flows use supabaseDoctorClient (JWT in swasthya-doctor-auth).
// All functions are async now; callers that were sync will need to adapt.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patientDb = supabaseUserClient as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doctorDb = supabaseDoctorClient as any;

export type ScheduleRequestStatus = "pending" | "accepted" | "declined" | "confirmed" | "rescheduled" | "completed";
export type RequestType = "user_to_doctor" | "doctor_to_user";
export type AppointmentReason = "General Checkup" | "Pregnancy Consultation" | "Scan/Test Review" | "Emergency Concern" | "Medication Discussion" | "Follow-up";
export type ConsultationMode = "In-person" | "Online";
export type Priority = "Normal" | "Moderate" | "Urgent";

export interface ScheduleRequest {
  id: string;
  patientName: string;
  doctorName: string;
  phase: string;
  requestType: RequestType;
  appointmentReason: AppointmentReason;
  preferredDate: string;
  preferredTime: string;
  consultationMode: ConsultationMode;
  priority: Priority;
  notes: string;
  symptomsSummary?: string;
  status: ScheduleRequestStatus;
  doctorCode: string;
  createdAt: string;
  updatedAt?: string;
}

// ── Map DB row → ScheduleRequest ──────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): ScheduleRequest {
  return {
    id: row.id as string,
    patientName: row.patient_name as string,
    doctorName: row.doctor_name as string,
    phase: row.phase as string,
    requestType: row.request_type as RequestType,
    appointmentReason: row.appointment_reason as AppointmentReason,
    preferredDate: row.preferred_date as string,
    preferredTime: row.preferred_time as string,
    consultationMode: row.consultation_mode as ConsultationMode,
    priority: row.priority as Priority,
    notes: (row.notes as string) || '',
    symptomsSummary: row.symptoms_summary as string | undefined,
    status: row.status as ScheduleRequestStatus,
    doctorCode: row.doctor_code as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string | undefined,
  };
}

// ── Create a schedule request (from patient or doctor) ────────────────────────
export async function createScheduleRequest(
  data: Omit<ScheduleRequest, "id" | "createdAt" | "updatedAt">,
): Promise<ScheduleRequest | null> {
  // Choose the right client based on who is creating
  const db = data.requestType === 'doctor_to_user' ? doctorDb : patientDb;

  // Look up doctor_id from doctor_profiles if not already set
  let doctorId: string | null = null;
  if (data.doctorCode) {
    const { data: doctorRow } = await patientDb
      .from('doctor_profiles')
      .select('id')
      .ilike('doctor_code', data.doctorCode)
      .maybeSingle();
    if (doctorRow) doctorId = doctorRow.id;
  }

  // Get patient_id from the user client session
  let patientId: string | null = null;
  if (data.requestType === 'user_to_doctor') {
    const { data: sessionData } = await patientDb.auth.getSession();
    patientId = sessionData?.session?.user?.id ?? null;
  }

  const { data: inserted, error } = await db
    .from('schedule_requests')
    .insert({
      patient_id: patientId,
      patient_name: data.patientName,
      doctor_id: doctorId,
      doctor_name: data.doctorName,
      doctor_code: data.doctorCode,
      phase: data.phase,
      request_type: data.requestType,
      appointment_reason: data.appointmentReason,
      preferred_date: data.preferredDate,
      preferred_time: data.preferredTime,
      consultation_mode: data.consultationMode,
      priority: data.priority,
      notes: data.notes,
      symptoms_summary: data.symptomsSummary || null,
      status: data.status,
    })
    .select()
    .single();

  if (error || !inserted) {
    console.error('[ScheduleStore] createScheduleRequest error:', error?.message);
    return null;
  }
  return mapRow(inserted as Record<string, unknown>);
}

// ── Get schedule requests by doctor code (patient side) ───────────────────────
export async function getScheduleRequestsByCode(doctorCode: string): Promise<ScheduleRequest[]> {
  const { data, error } = await patientDb
    .from('schedule_requests')
    .select('*')
    .eq('doctor_code', doctorCode)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ScheduleStore] getScheduleRequestsByCode:', error.message);
    return [];
  }
  if (!data) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}

// ── Get schedule requests by doctor code (doctor side) ────────────────────────
export async function getDoctorScheduleRequestsByCode(doctorCode: string): Promise<ScheduleRequest[]> {
  const { data, error } = await doctorDb
    .from('schedule_requests')
    .select('*')
    .eq('doctor_code', doctorCode)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ScheduleStore] getDoctorScheduleRequestsByCode:', error.message);
    return [];
  }
  if (!data) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}

// ── Update a schedule request status (patient or doctor) ──────────────────────
export async function updateScheduleRequestStatus(
  requestId: string,
  status: ScheduleRequestStatus,
  asDoctorSide = false,
): Promise<ScheduleRequest | null> {
  const db = asDoctorSide ? doctorDb : patientDb;

  const { data, error } = await db
    .from('schedule_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    console.error('[ScheduleStore] updateScheduleRequestStatus:', error.message);
    return null;
  }
  return data ? mapRow(data as Record<string, unknown>) : null;
}

// ── Get filtered schedule requests ────────────────────────────────────────────
export async function getFilteredScheduleRequests(
  doctorCode: string,
  filterFn: (r: ScheduleRequest) => boolean,
): Promise<ScheduleRequest[]> {
  const all = await getScheduleRequestsByCode(doctorCode);
  return all.filter(filterFn);
}

// ── Get all schedule activity (limited) ───────────────────────────────────────
export async function getAllScheduleActivity(
  doctorCode: string,
  limit = 10,
): Promise<ScheduleRequest[]> {
  const { data, error } = await patientDb
    .from('schedule_requests')
    .select('*')
    .eq('doctor_code', doctorCode)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ScheduleStore] getAllScheduleActivity:', error.message);
    return [];
  }
  if (!data) return [];
  return (data as Record<string, unknown>[]).map(mapRow);
}
