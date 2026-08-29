-- Sale price for sell listings (fixed CHF price or average price when commission is %)

alter table public.products
  add column if not exists price numeric(10, 2)
  check (price is null or price >= 0);
