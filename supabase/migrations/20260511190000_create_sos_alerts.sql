-- SOS Alerts table for emergency SOS functionality
create table if not exists public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  patient_name text not null,
  patient_phase text not null,
  doctor_id uuid not null references doctor_profiles(id) on delete cascade,
  doctor_code text not null,
  emergency_message text,
  pregnancy_week integer,
  status text not null default 'pending' check (status in ('pending', 'acknowledged', 'resolved')),
  location jsonb,
  created_at timestamptz not null default now(),
  handled_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists sos_alerts_patient_id_idx on public.sos_alerts (patient_id);
create index if not exists sos_alerts_doctor_id_idx on public.sos_alerts (doctor_id);
create index if not exists sos_alerts_doctor_code_idx on public.sos_alerts (doctor_code);
create index if not exists sos_alerts_status_idx on public.sos_alerts (status);
create index if not exists sos_alerts_created_at_idx on public.sos_alerts (created_at desc);

alter table public.sos_alerts enable row level security;

-- Patients can insert their own SOS
drop policy if exists "Patients can insert own SOS" on public.sos_alerts;
create policy "Patients can insert own SOS"
on public.sos_alerts
for insert
to authenticated
with check (auth.uid() = patient_id);

-- Patients can view their own SOS
drop policy if exists "Patients can view own SOS" on public.sos_alerts;
create policy "Patients can view own SOS"
on public.sos_alerts
for select
to authenticated
using (auth.uid() = patient_id);

-- Doctors can view SOS assigned to them
drop policy if exists "Doctors can view SOS assigned to them" on public.sos_alerts;
create policy "Doctors can view SOS assigned to them"
on public.sos_alerts
for select
to authenticated
using (
  doctor_id in (
    select id from public.doctor_profiles where id = auth.uid()
  )
);

-- Doctors can update SOS status
drop policy if exists "Doctors can update SOS status" on public.sos_alerts;
create policy "Doctors can update SOS status"
on public.sos_alerts
for update
to authenticated
using (
  doctor_id in (
    select id from public.doctor_profiles where id = auth.uid()
  )
)
with check (
  doctor_id in (
    select id from public.doctor_profiles where id = auth.uid()
  )
);

-- Updated at trigger
create or replace function public.touch_sos_alerts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_sos_alerts_updated_at on public.sos_alerts;
create trigger trg_touch_sos_alerts_updated_at
before update on public.sos_alerts
for each row
execute function public.touch_sos_alerts_updated_at();
