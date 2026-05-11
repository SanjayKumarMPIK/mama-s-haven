-- Patient-published alerts + optional EDD / rich context for doctor dashboard popups.
-- Requires public.maternity_hillstation_alerts. If you see 42P01 "relation does not exist",
-- apply 20260512175000_ensure_maternity_hillstation_alerts_table.sql first (or run full `supabase db push`).
alter table public.maternity_hillstation_alerts
  add column if not exists patient_context jsonb;

alter table public.maternity_hillstation_alerts
  alter column due_date drop not null;

alter table public.maternity_hillstation_alerts
  alter column days_left drop not null;

drop policy if exists "Patients insert hillstation alerts" on public.maternity_hillstation_alerts;
create policy "Patients insert hillstation alerts"
  on public.maternity_hillstation_alerts
  for insert to authenticated
  with check (auth.uid() = patient_id);

drop policy if exists "Patients update own hillstation alerts" on public.maternity_hillstation_alerts;
create policy "Patients update own hillstation alerts"
  on public.maternity_hillstation_alerts
  for update to authenticated
  using (auth.uid() = patient_id)
  with check (auth.uid() = patient_id);

create unique index if not exists maternity_hillstation_one_active_alert_per_patient
  on public.maternity_hillstation_alerts (patient_id)
  where (status = 'active');
