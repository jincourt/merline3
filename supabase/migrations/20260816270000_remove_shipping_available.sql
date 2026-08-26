-- Remove shipping_available from listings

alter table public.products
  drop column if exists shipping_available;

alter table public.buy_requests
  drop column if exists shipping_available;
