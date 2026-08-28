alter table public.profiles
  add column if not exists website text,
  add column if not exists address text,
  add column if not exists npa text,
  add column if not exists canton text;

alter table public.profiles
  drop constraint if exists profiles_canton_check;

alter table public.profiles
  add constraint profiles_canton_check
  check (
    canton is null
    or trim(canton) = ''
    or canton in (
      'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
      'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
      'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
    )
  );

alter table public.profiles
  drop constraint if exists profiles_npa_check;

alter table public.profiles
  add constraint profiles_npa_check
  check (
    npa is null
    or trim(npa) = ''
    or npa ~ '^[1-9][0-9]{3}$'
  );
