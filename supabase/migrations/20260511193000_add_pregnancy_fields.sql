-- Add pregnancy-specific columns to user_profiles
-- These support the Hillstation Pregnancy Alert System

alter table public.user_profiles
  add column if not exists pregnancy_due_date date,
  add column if not exists pregnancy_status text default 'active';

-- Relax nearby_phc constraint to support hillstation PHCs
alter table public.user_profiles
  drop constraint if exists user_profiles_nearby_phc_check;

alter table public.user_profiles
  add constraint user_profiles_nearby_phc_check
    check (length(nearby_phc) > 0);

-- Create maternity hillstation alerts table
create table if not exists public.maternity_hillstation_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  phc_location text not null,
  village_town text,
  emergency_contact text,
  days_left integer not null,
  due_date date not null,
  alert_message text not null,
  priority text not null default 'HIGH',
  type text not null default 'maternity_hillstation_delivery_alert',
  status text not null default 'active' check (status in ('active', 'expired', 'resolved')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_maternity_hillstation_alerts_phc
  on public.maternity_hillstation_alerts (phc_location);

create index if not exists idx_maternity_hillstation_alerts_status
  on public.maternity_hillstation_alerts (status);

create index if not exists idx_maternity_hillstation_alerts_patient
  on public.maternity_hillstation_alerts (patient_id, created_at desc);

-- Alert acknowledgments (per-doctor)
create table if not exists public.maternity_hillstation_acknowledgments (
  id uuid primary key default gen_random_uuid(),
  alert_id uuid not null references public.maternity_hillstation_alerts(id) on delete cascade,
  doctor_id uuid not null references auth.users(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  unique(alert_id, doctor_id)
);

alter table public.maternity_hillstation_alerts enable row level security;
alter table public.maternity_hillstation_acknowledgments enable row level security;

-- Allow doctors to read alerts for their PHC
drop policy if exists "Doctors can read alerts by PHC" on public.maternity_hillstation_alerts;
create policy "Doctors can read alerts by PHC"
  on public.maternity_hillstation_alerts
  for select
  to authenticated
  using (true); -- filtered in application layer by PHC

-- Allow doctors to insert acknowledgments
drop policy if exists "Doctors can acknowledge alerts" on public.maternity_hillstation_acknowledgments;
create policy "Doctors can acknowledge alerts"
  on public.maternity_hillstation_acknowledgments
  for insert
  to authenticated
  with check (auth.uid() = doctor_id);

-- Allow doctors to read acknowledgments
drop policy if exists "Doctors can read acknowledgments" on public.maternity_hillstation_acknowledgments;
create policy "Doctors can read acknowledgments"
  on public.maternity_hillstation_acknowledgments
  for select
  to authenticated
  using (true);
