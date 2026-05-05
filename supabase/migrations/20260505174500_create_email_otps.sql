create table if not exists public.email_otps (
  id bigint generated always as identity primary key,
  email text not null,
  otp_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_otps_email_created_idx
  on public.email_otps (email, created_at desc);

alter table public.email_otps enable row level security;

-- No direct client access. Only service-role Edge Functions should read/write OTPs.
drop policy if exists "no direct otp access" on public.email_otps;
create policy "no direct otp access"
on public.email_otps
for all
to authenticated
using (false)
with check (false);
