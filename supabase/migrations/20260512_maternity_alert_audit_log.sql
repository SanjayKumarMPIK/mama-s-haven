-- Migration: Create maternity_alert_audit_log table
-- Purpose: Immutable audit trail for hillstation delivery alert lifecycle events
-- Safe: Uses IF NOT EXISTS, won't break if run twice

CREATE TABLE IF NOT EXISTS public.maternity_alert_audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id   UUID REFERENCES public.maternity_hillstation_alerts(id) ON DELETE SET NULL,
  actor_id   UUID,                 -- patient_id or doctor_id who performed the action
  actor_role TEXT NOT NULL CHECK (actor_role IN ('patient', 'doctor', 'system')),
  action     TEXT NOT NULL,        -- alert_created, alert_acknowledged, alert_revoked, etc.
  detail     JSONB,                -- extensible metadata (error messages, context, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_alert_id
  ON public.maternity_alert_audit_log (alert_id);

CREATE INDEX IF NOT EXISTS idx_audit_actor_id
  ON public.maternity_alert_audit_log (actor_id);

CREATE INDEX IF NOT EXISTS idx_audit_action
  ON public.maternity_alert_audit_log (action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_created_at
  ON public.maternity_alert_audit_log (created_at DESC);

-- RLS: Enable row level security
ALTER TABLE public.maternity_alert_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert audit entries
DROP POLICY IF EXISTS "Users can insert audit entries" ON public.maternity_alert_audit_log;
CREATE POLICY "Users can insert audit entries"
  ON public.maternity_alert_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can read audit entries
DROP POLICY IF EXISTS "Users can read audit entries" ON public.maternity_alert_audit_log;
CREATE POLICY "Users can read audit entries"
  ON public.maternity_alert_audit_log
  FOR SELECT
  TO authenticated
  USING (true);
