-- Optional native columns for maternity EDD (app also stores EDD in onboarding_data.expectedDueDate).
alter table public.user_profiles
  add column if not exists pregnancy_due_date date;

alter table public.user_profiles
  add column if not exists pregnancy_status text default 'active';
