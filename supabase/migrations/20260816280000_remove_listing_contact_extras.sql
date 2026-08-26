-- Remove unused listing contact and location fields

alter table public.products
  drop column if exists phone,
  drop column if exists show_phone,
  drop column if exists website,
  drop column if exists loc;

alter table public.buy_requests
  drop column if exists phone,
  drop column if exists show_phone,
  drop column if exists website,
  drop column if exists loc;
