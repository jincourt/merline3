-- Public contact visibility preferences (email synced from auth on save)
alter table public.profiles
  add column if not exists contact_email text,
  add column if not exists show_email boolean not null default false,
  add column if not exists show_phone boolean not null default false,
  add column if not exists show_website boolean not null default false,
  add column if not exists show_address boolean not null default false;

alter table public.profiles
  drop constraint if exists profiles_contact_email_check;

alter table public.profiles
  add constraint profiles_contact_email_check
  check (contact_email is null or char_length(trim(contact_email)) >= 3);

-- Allow optional description for annonceur profiles (agents already use this column)
comment on column public.profiles.description is 'Optional bio; shown publicly when relevant (agents on profile, annonceurs in contact dialog).';
