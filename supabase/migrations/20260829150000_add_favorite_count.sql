-- Denormalized favorite counter on listings (maintained by triggers).

alter table public.products
  add column if not exists favorite_count integer not null default 0;

alter table public.buy_requests
  add column if not exists favorite_count integer not null default 0;

create index if not exists favorites_listing_idx
  on public.favorites (listing_id, src);

create or replace function public.preserve_favorite_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
    and new.favorite_count is distinct from old.favorite_count
    and current_user in ('authenticated', 'anon')
  then
    new.favorite_count := old.favorite_count;
  end if;
  return new;
end;
$$;

drop trigger if exists products_preserve_favorite_count on public.products;
create trigger products_preserve_favorite_count
  before update on public.products
  for each row
  execute function public.preserve_favorite_count();

drop trigger if exists buy_requests_preserve_favorite_count on public.buy_requests;
create trigger buy_requests_preserve_favorite_count
  before update on public.buy_requests
  for each row
  execute function public.preserve_favorite_count();

create or replace function public.sync_favorite_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.src = 'prod' then
      update public.products
      set favorite_count = favorite_count + 1
      where id = new.listing_id;
    elsif new.src = 'buy' then
      update public.buy_requests
      set favorite_count = favorite_count + 1
      where id = new.listing_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.src = 'prod' then
      update public.products
      set favorite_count = greatest(0, favorite_count - 1)
      where id = old.listing_id;
    elsif old.src = 'buy' then
      update public.buy_requests
      set favorite_count = greatest(0, favorite_count - 1)
      where id = old.listing_id;
    end if;
    return old;
  end if;

  return null;
end;
$$;

drop trigger if exists favorites_sync_count on public.favorites;
create trigger favorites_sync_count
  after insert or delete on public.favorites
  for each row
  execute function public.sync_favorite_count();

update public.products p
set favorite_count = coalesce(
  (
    select count(*)::int
    from public.favorites f
    where f.listing_id = p.id
      and f.src = 'prod'
  ),
  0
);

update public.buy_requests b
set favorite_count = coalesce(
  (
    select count(*)::int
    from public.favorites f
    where f.listing_id = b.id
      and f.src = 'buy'
  ),
  0
);
