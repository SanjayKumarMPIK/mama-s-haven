-- Self-contained base for hillstation alerts if 20260511193000 was skipped or failed
-- before later migrations. Safe when the table already exists (IF NOT EXISTS / IF NOT EXISTS indexes).

create table if not exists public.maternity_hillstation_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  phc_location text not null,
  village_town text,
  emergency_contact text,
  days_left integer,
  due_date date,
  alert_message text not null,
  priority text not null default 'HIGH',
  type text not null default 'maternity_hillstation_delivery_alert',
  status text not null default 'active' check (status in ('active', 'expired', 'resolved')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  patient_context jsonb
);

create index if not exists idx_maternity_hillstation_alerts_phc
  on public.maternity_hillstation_alerts (phc_location);

create index if not exists idx_maternity_hillstation_alerts_status
  on public.maternity_hillstation_alerts (status);

create index if not exists idx_maternity_hillstation_alerts_patient
  on public.maternity_hillstation_alerts (patient_id, created_at desc);

create table if not exists public.maternity_hillstation_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.maternity_hillstation_alerts(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique(alert_id, doctor_id)
);

alter table public.maternity_hillstation_alerts enable row level security;
alter table public.maternity_hillstation_acknowledgments enable row level security;

drop policy if exists "Doctors can read alerts by PHC" on public.maternity_hillstation_alerts;
create policy "Doctors can read alerts by PHC"
  on public.maternity_hillstation_alerts
  for select
  to authenticated
  using (true);

drop policy if exists "Doctors can acknowledge alerts" on public.maternity_hillstation_acknowledgments;
create policy "Doctors can acknowledge alerts"
  on public.maternity_hillstation_acknowledgments
  for insert
  to authenticated
  with check (auth.uid() = doctor_id);

drop policy if exists "Doctors can read acknowledgments" on public.maternity_hillstation_acknowledgments;
create policy "Doctors can read acknowledgments"
  on public.maternity_hillstation_acknowledgments
  for select
  to authenticated
  using (true);
