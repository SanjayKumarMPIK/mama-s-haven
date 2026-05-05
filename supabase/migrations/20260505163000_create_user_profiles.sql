-- User profile table for structured signup storage
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  age integer not null check (age >= 1 and age <= 120),
  dob date not null,
  email text not null,
  mobile text,
  blood_group text,
  region text not null check (region in ('north', 'south', 'east', 'west')),
  health_cycle_status text not null check (health_cycle_status in ('pre-puberty', 'puberty', 'maternity')),
  last_period_date date,
  cycle_length integer,
  haemoglobin numeric(4, 1),
  diet_type text,
  known_conditions text,
  medical_conditions text[] not null default '{}',
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_email_idx on public.user_profiles (email);
create index if not exists user_profiles_health_cycle_status_idx on public.user_profiles (health_cycle_status);

alter table public.user_profiles enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.touch_user_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_user_profiles_updated_at on public.user_profiles;
create trigger trg_touch_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.touch_user_profiles_updated_at();

-- Helpful queries:
-- select * from public.user_profiles where id = auth.uid();
-- select id, full_name, age, health_cycle_status, region, updated_at from public.user_profiles order by updated_at desc;
