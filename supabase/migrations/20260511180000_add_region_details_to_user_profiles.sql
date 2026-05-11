-- Extend existing user_profiles table with additional region details.
-- This migration is data-safe: add nullable columns, backfill existing rows, then enforce NOT NULL + checks.

alter table public.user_profiles
  add column if not exists state text,
  add column if not exists nearby_phc text,
  add column if not exists region_type text;

update public.user_profiles
set
  state = coalesce(
    state,
    case region
      when 'south' then 'Tamil Nadu'
      when 'north' then 'Delhi'
      when 'east' then 'West Bengal'
      when 'west' then 'Maharashtra'
      else 'Tamil Nadu'
    end
  ),
  nearby_phc = coalesce(nearby_phc, 'Anna Nagar PHC'),
  region_type = coalesce(region_type, 'urban')
where state is null
   or nearby_phc is null
   or region_type is null;

alter table public.user_profiles
  alter column state set not null,
  alter column nearby_phc set not null,
  alter column region_type set not null;

alter table public.user_profiles
  drop constraint if exists user_profiles_state_check,
  add constraint user_profiles_state_check
    check (
      state = any (
        array[
          'Andhra Pradesh'::text,
          'Arunachal Pradesh'::text,
          'Assam'::text,
          'Bihar'::text,
          'Chhattisgarh'::text,
          'Goa'::text,
          'Gujarat'::text,
          'Haryana'::text,
          'Himachal Pradesh'::text,
          'Jharkhand'::text,
          'Karnataka'::text,
          'Kerala'::text,
          'Madhya Pradesh'::text,
          'Maharashtra'::text,
          'Manipur'::text,
          'Meghalaya'::text,
          'Mizoram'::text,
          'Nagaland'::text,
          'Odisha'::text,
          'Punjab'::text,
          'Rajasthan'::text,
          'Sikkim'::text,
          'Tamil Nadu'::text,
          'Telangana'::text,
          'Tripura'::text,
          'Uttar Pradesh'::text,
          'Uttarakhand'::text,
          'West Bengal'::text
        ]
      )
    ),
  drop constraint if exists user_profiles_nearby_phc_check,
  add constraint user_profiles_nearby_phc_check
    check (
      nearby_phc = any (
        array[
          'Anna Nagar PHC'::text,
          'Tambaram PHC'::text
        ]
      )
    ),
  drop constraint if exists user_profiles_region_type_check,
  add constraint user_profiles_region_type_check
    check (
      region_type = any (
        array[
          'rural'::text,
          'urban'::text,
          'hillstation'::text
        ]
      )
    );

alter table public.user_profiles
  drop constraint if exists user_profiles_age_check,
  add constraint user_profiles_age_check
    check (
      age >= 8
      and age <= 120
    );
