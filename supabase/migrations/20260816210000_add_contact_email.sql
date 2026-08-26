alter table public.contact_requests
  add column email text;

update public.contact_requests
set email = 'legacy@merline.local'
where email is null or trim(email) = '';

alter table public.contact_requests
  alter column email set not null;

alter table public.contact_requests
  add constraint contact_requests_email_check
  check (char_length(trim(email)) >= 3);
