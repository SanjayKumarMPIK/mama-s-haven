create table if not exists public.doctor_symptom_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  phc_location text not null,
  symptom_name text,
  trigger_type text not null,
  priority text not null,
  symptom_count integer not null,
  consecutive_days integer not null,
  maternity_phase text not null,
  status text not null default 'active' check (status in ('active', 'reviewed', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_doctor_symptom_alerts_phc
  on public.doctor_symptom_alerts (phc_location);

create index if not exists idx_doctor_symptom_alerts_status
  on public.doctor_symptom_alerts (status);

alter table public.doctor_symptom_alerts enable row level security;

-- Authenticated users (doctors and patients) can read alerts
create policy "Anyone can read symptom alerts"
  on public.doctor_symptom_alerts
  for select
  to authenticated
  using (true);

-- Patients can insert their own alerts
create policy "Patients can insert symptom alerts"
  on public.doctor_symptom_alerts
  for insert
  to authenticated
  with check (auth.uid() = patient_id);

-- Doctors can update alert status (mark as reviewed/resolved)
create policy "Doctors can update symptom alerts"
  on public.doctor_symptom_alerts
  for update
  to authenticated
  using (true);
