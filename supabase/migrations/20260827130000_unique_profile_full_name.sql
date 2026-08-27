create unique index if not exists profiles_full_name_unique_idx
  on public.profiles (lower(trim(full_name)))
  where full_name is not null and trim(full_name) <> '';
