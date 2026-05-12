-- Idempotent: older projects may lack onboarding columns from 20260507120000.
alter table public.user_profiles
  add column if not exists onboarding_data jsonb default '{}'::jsonb;

alter table public.user_profiles
  add column if not exists onboarding_completed boolean not null default false;

alter table public.user_profiles
  add column if not exists onboarding_step text default 'phase_selection';
