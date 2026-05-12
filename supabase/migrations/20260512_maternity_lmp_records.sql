-- Migration: Create maternity_lmp_records table
-- Purpose: Immutable store for LMP (Last Menstrual Period) dates
-- Once a patient saves their LMP, it cannot be changed (no UPDATE policy)

CREATE TABLE IF NOT EXISTS public.maternity_lmp_records (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lmp_date    DATE NOT NULL,
  edd_date    DATE NOT NULL,   -- Computed: LMP + 280 days
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- One LMP record per user (immutable once created)
  CONSTRAINT uq_maternity_lmp_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_lmp_records_user
  ON public.maternity_lmp_records (user_id);

-- RLS: Enable row level security
ALTER TABLE public.maternity_lmp_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can INSERT their own LMP (one time only, enforced by UNIQUE constraint)
DROP POLICY IF EXISTS "Users can insert own LMP" ON public.maternity_lmp_records;
CREATE POLICY "Users can insert own LMP"
  ON public.maternity_lmp_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can read their own LMP
DROP POLICY IF EXISTS "Users can read own LMP" ON public.maternity_lmp_records;
CREATE POLICY "Users can read own LMP"
  ON public.maternity_lmp_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- NO UPDATE policy = LMP cannot be changed once saved
-- NO DELETE policy = LMP record is permanent

-- Doctors can read LMP for their connected patients (for alerts)
DROP POLICY IF EXISTS "Doctors can read connected patient LMP" ON public.maternity_lmp_records;
CREATE POLICY "Doctors can read connected patient LMP"
  ON public.maternity_lmp_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.doctor_connections dc
      WHERE dc.patient_id = maternity_lmp_records.user_id
        AND dc.doctor_id = auth.uid()
        AND dc.status = 'accepted'
    )
  );
