-- Patient ↔ doctor connection requests (/connect). Requires public.doctor_profiles to exist.
create table if not exists public.doctor_connections (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctor_profiles (id) on delete cascade,
  doctor_code text not null,
  patient_id uuid not null references auth.users (id) on delete cascade,
  patient_name text not null,
  patient_phase text not null,
  patient_profile jsonb,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  pregnancy_week integer,
  risk_level text,
  created_at timestamptz not null default now()
);

create index if not exists doctor_connections_doctor_id_idx on public.doctor_connections (doctor_id);
create index if not exists doctor_connections_patient_id_idx on public.doctor_connections (patient_id);
create index if not exists doctor_connections_doctor_code_idx on public.doctor_connections (doctor_code);

alter table public.doctor_connections enable row level security;

drop policy if exists "doctor_connections_patient_insert" on public.doctor_connections;
create policy "doctor_connections_patient_insert"
  on public.doctor_connections for insert to authenticated
  with check (auth.uid() = patient_id);

drop policy if exists "doctor_connections_patient_select" on public.doctor_connections;
create policy "doctor_connections_patient_select"
  on public.doctor_connections for select to authenticated
  using (auth.uid() = patient_id);

drop policy if exists "doctor_connections_doctor_select" on public.doctor_connections;
create policy "doctor_connections_doctor_select"
  on public.doctor_connections for select to authenticated
  using (auth.uid() = doctor_id);

drop policy if exists "doctor_connections_doctor_update" on public.doctor_connections;
create policy "doctor_connections_doctor_update"
  on public.doctor_connections for update to authenticated
  using (auth.uid() = doctor_id)
  with check (auth.uid() = doctor_id);

-- doctor_profiles: directory read for connect + each doctor manages their own row.
alter table public.doctor_profiles enable row level security;

drop policy if exists "doctor_profiles_authenticated_select" on public.doctor_profiles;
create policy "doctor_profiles_authenticated_select"
  on public.doctor_profiles for select to authenticated
  using (true);

drop policy if exists "doctor_profiles_doctor_self_manage" on public.doctor_profiles;
create policy "doctor_profiles_doctor_self_manage"
  on public.doctor_profiles for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
