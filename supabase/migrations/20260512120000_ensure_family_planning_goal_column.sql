-- Idempotent: some environments never applied 20260507120000; PostgREST errors if the column is missing.
alter table public.user_profiles
  add column if not exists family_planning_goal text;
