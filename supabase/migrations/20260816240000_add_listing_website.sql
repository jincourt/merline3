alter table public.products
  add column if not exists website text;

alter table public.buy_requests
  add column if not exists website text;
