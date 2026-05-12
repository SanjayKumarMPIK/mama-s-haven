import { supabaseDoctorClient } from '@/lib/supabase-doctor';
import type { DoctorProfile, DoctorProfileInsert } from '../types/doctorProfile';

// ─── Doctor Code Generator ────────────────────────────────────────────────────
// Produces a deterministic 6-char alphanumeric code from a UUID.
// Charset excludes visually ambiguous chars (0/O, 1/I, l).
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateDoctorCode(userId: string): string {
  const hex = userId.replace(/-/g, '');
  let code = '';
  for (let i = 0; i < 6; i++) {
    const byte = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    code += CHARSET[byte % CHARSET.length];
  }
  return code;
}


export const DUMMY_DOCTOR_PROFILES: Record<string, Omit<DoctorProfileInsert, 'id'>> = {
  'priya@phc.in': {
    full_name: 'Dr Priya Sharma',
    doctor_code: 'A7h34l',
    designation: 'Gynecologist',
    phone_no: '9876543210',
    phc_center: 'Anna Nagar PHC',
    phc_location: 'Chennai, Tamil Nadu',
    specialization: 'Maternal Health',
    gender: 'Female',
    working_hours: '9 AM - 5 PM',
    email: 'priya@phc.in',
  },
  'arjun@phc.in': {
    full_name: 'Dr Arjun Menon',
    doctor_code: 'R3t84g',
    designation: 'Pediatrician',
    phone_no: '9988776655',
    phc_center: 'Anna Nagar PHC',
    phc_location: 'Chennai, Tamil Nadu',
    specialization: 'Child Care',
    gender: 'Male',
    working_hours: '10 AM - 6 PM',
    email: 'arjun@phc.in',
  },
};

// ─── Fetch (or seed) a doctor profile by their Supabase user ID ──────────────
export async function fetchOrSeedDoctorProfile(
  userId: string,
  email: string,
): Promise<DoctorProfile | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseDoctorClient as any;

  // 1. Try to fetch an existing row first
  const { data: existing, error: fetchError } = await db
    .from('doctor_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) {
    console.error('[DoctorAuth] Error fetching doctor profile:', fetchError.message);
  }

  if (existing) {
    // Backfill doctor_code if the row was seeded before the column was added
    if (!existing.doctor_code) {
      const norm = email.trim().toLowerCase();
      const dummy = DUMMY_DOCTOR_PROFILES[norm];
      const code = dummy?.doctor_code || generateDoctorCode(userId);
      await db.from('doctor_profiles').update({ doctor_code: code }).eq('id', userId);
      existing.doctor_code = code;
    }
    return existing as DoctorProfile;
  }

  // 2. No row found — check if this email has dummy seed data
  const normalizedEmail = email.trim().toLowerCase();
  const dummyData = DUMMY_DOCTOR_PROFILES[normalizedEmail];
  if (!dummyData) return null; // Not a known doctor account

  // 3. Insert the dummy profile
  const doctorCode = dummyData.doctor_code || generateDoctorCode(userId);
  const payload: DoctorProfileInsert = {
    id: userId,
    ...dummyData,
    doctor_code: doctorCode
  };
  const { data: inserted, error: insertError } = await db
    .from('doctor_profiles')
    .insert(payload)
    .select()
    .single();

  if (insertError) {
    console.error('[DoctorAuth] Error seeding doctor profile:', insertError.message);
    return null;
  }

  return inserted as DoctorProfile;
}

// ─── Generic fetch by user ID (no seeding) ───────────────────────────────────
export async function fetchDoctorProfile(userId: string): Promise<DoctorProfile | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabaseDoctorClient as any;
  const { data, error } = await db
    .from('doctor_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[DoctorAuth] Error fetching doctor profile:', error.message);
    return null;
  }
  return (data as DoctorProfile) ?? null;
}
