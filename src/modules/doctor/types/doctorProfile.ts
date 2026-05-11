// ─── Doctor Profile Types ─────────────────────────────────────────────────────
// Mirrors the `doctor_profiles` Supabase table.

export type DoctorDesignation =
  | 'Doctor'
  | 'Gynecologist'
  | 'Pediatrician'
  | 'PHC Staff'
  | 'Counselor';

export type DoctorGender = 'Male' | 'Female' | 'Other';

export interface DoctorProfile {
  id: string;
  full_name: string;
  doctor_code: string;
  designation: DoctorDesignation;
  phone_no: string;
  phc_center: string;
  phc_location: string;
  specialization: string | null;
  gender: DoctorGender | null;
  working_hours: string;
  email: string;
  created_at: string | null;
}

export type DoctorProfileInsert = Omit<DoctorProfile, 'created_at'>;
