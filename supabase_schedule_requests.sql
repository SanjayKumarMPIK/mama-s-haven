-- Schedule Requests Table
-- Run this in the Supabase SQL Editor to create the table.

CREATE TABLE IF NOT EXISTS schedule_requests (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name  text NOT NULL DEFAULT 'Patient',
  doctor_id     uuid,
  doctor_name   text NOT NULL DEFAULT 'Doctor',
  doctor_code   text NOT NULL,
  phase         text NOT NULL DEFAULT 'Maternity',
  request_type  text NOT NULL DEFAULT 'user_to_doctor',  -- 'user_to_doctor' | 'doctor_to_user'
  appointment_reason text NOT NULL DEFAULT 'General Checkup',
  preferred_date     date NOT NULL,
  preferred_time     text NOT NULL,
  consultation_mode  text NOT NULL DEFAULT 'In-person',  -- 'In-person' | 'Online'
  priority           text NOT NULL DEFAULT 'Normal',     -- 'Normal' | 'Moderate' | 'Urgent'
  notes              text DEFAULT '',
  symptoms_summary   text,
  status             text NOT NULL DEFAULT 'pending',    -- 'pending' | 'accepted' | 'declined' | 'confirmed' | 'rescheduled' | 'completed'
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz
);

-- Index for fast lookups by doctor_code (most common query)
CREATE INDEX IF NOT EXISTS idx_schedule_requests_doctor_code ON schedule_requests(doctor_code);
-- Index for fast lookups by patient_id
CREATE INDEX IF NOT EXISTS idx_schedule_requests_patient_id ON schedule_requests(patient_id);

-- Enable RLS
ALTER TABLE schedule_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can see their own schedule requests
CREATE POLICY "Patients can view own schedule requests"
  ON schedule_requests FOR SELECT
  USING (auth.uid() = patient_id);

-- Policy: Patients can insert schedule requests
CREATE POLICY "Patients can insert schedule requests"
  ON schedule_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Policy: Doctors can see schedule requests addressed to them
CREATE POLICY "Doctors can view their schedule requests"
  ON schedule_requests FOR SELECT
  USING (auth.uid() = doctor_id);

-- Policy: Doctors can update schedule request status
CREATE POLICY "Doctors can update schedule request status"
  ON schedule_requests FOR UPDATE
  USING (auth.uid() = doctor_id);

-- Policy: Doctors can insert schedule proposals (doctor_to_user)
CREATE POLICY "Doctors can insert schedule proposals"
  ON schedule_requests FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

-- Policy: Patients can update their own requests (accept incoming proposals)
CREATE POLICY "Patients can update own schedule requests"
  ON schedule_requests FOR UPDATE
  USING (auth.uid() = patient_id);

-- Allow reading by doctor_code for cross-session matching (both sides need this)
CREATE POLICY "Read by doctor_code"
  ON schedule_requests FOR SELECT
  USING (
    doctor_code IN (
      SELECT doctor_code FROM doctor_connections
      WHERE patient_id = auth.uid() OR doctor_id = auth.uid()
    )
  );
