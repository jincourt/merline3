-- Replace price/is_free with commission fields on products (sell listings)

alter table public.products
  add column commission_type text not null default 'chf'
    check (commission_type in ('chf', 'percent', 'negotiable')),
  add column commission_value numeric(10, 2)
    check (commission_value is null or commission_value >= 0);

update public.products
set
  commission_type = case
    when is_free or price is null then 'negotiable'
    else 'chf'
  end,
  commission_value = case
    when is_free or price is null then null
    else price
  end;

alter table public.products
  add constraint products_commission_value_required_check
  check (
    (commission_type = 'negotiable' and commission_value is null)
    or (commission_type in ('chf', 'percent') and commission_value is not null)
  );

alter table public.products
  add constraint products_commission_percent_range_check
  check (
    commission_type != 'percent'
    or (commission_value >= 0 and commission_value <= 100)
  );

alter table public.products
  drop column price,
  drop column is_free;
