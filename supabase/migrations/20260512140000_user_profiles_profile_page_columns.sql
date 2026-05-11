-- Columns used by http://localhost:8080/profile (StoredUserData ↔ public.user_profiles).
-- Full table shape (apply all migrations in order; this file adds profile-page extras):
--   id, full_name, age, dob, email, mobile, blood_group, weight, height,
--   region, state, nearby_phc, region_type, health_cycle_status,
--   last_period_date, cycle_length, haemoglobin, diet_type, known_conditions, medical_conditions,
--   registered_at, updated_at,
--   onboarding_completed, onboarding_step, onboarding_data, family_planning_goal,
--   pregnancy_due_date, pregnancy_status,
--   menarche_date, period_duration_days, activity_level, climate
--
-- Safe to re-run: IF NOT EXISTS / dropped checks before re-add.

alter table public.user_profiles
  add column if not exists menarche_date date,
  add column if not exists period_duration_days integer,
  add column if not exists activity_level text,
  add column if not exists climate text;

comment on column public.user_profiles.menarche_date is 'First period date (puberty); /profile personal health.';
comment on column public.user_profiles.period_duration_days is 'Typical period length in days (3–10); /profile cycle.';
comment on column public.user_profiles.activity_level is 'sedentary | moderate | active; lifestyle on /profile.';
comment on column public.user_profiles.climate is 'hot | moderate | cold; lifestyle on /profile.';

alter table public.user_profiles
  drop constraint if exists user_profiles_period_duration_days_check;
alter table public.user_profiles
  add constraint user_profiles_period_duration_days_check
    check (period_duration_days is null or (period_duration_days between 1 and 10));

alter table public.user_profiles
  drop constraint if exists user_profiles_activity_level_check;
alter table public.user_profiles
  add constraint user_profiles_activity_level_check
    check (activity_level is null or activity_level in ('sedentary', 'moderate', 'active'));

alter table public.user_profiles
  drop constraint if exists user_profiles_climate_check;
alter table public.user_profiles
  add constraint user_profiles_climate_check
    check (climate is null or climate in ('hot', 'moderate', 'cold'));
