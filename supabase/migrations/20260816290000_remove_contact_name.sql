-- Remove contact_name from listings

alter table public.products
  drop column if exists contact_name;

alter table public.buy_requests
  drop column if exists contact_name;
