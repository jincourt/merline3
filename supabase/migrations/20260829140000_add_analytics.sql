-- Analytics: unique visitors, 30-min sessions, per-session listing views.
-- Listing public counters (products.session_views) increment once per session.

alter table public.products
  add column if not exists session_views integer not null default 0;

alter table public.buy_requests
  add column if not exists session_views integer not null default 0;

create table if not exists public.analytics_visitors (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete set null,
  username text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  session_count integer not null default 0
);

create table if not exists public.analytics_sessions (
  id uuid primary key,
  visitor_id uuid not null references public.analytics_visitors (id) on delete cascade,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  duration_seconds integer not null default 0,
  landing_path text not null default '/',
  referrer text,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  user_agent text,
  user_id uuid references auth.users (id) on delete set null,
  username text
);

create table if not exists public.analytics_pageviews (
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  path text not null,
  page_kind text not null default 'other'
    check (page_kind in ('home', 'listing', 'other')),
  listing_id uuid,
  listing_src text check (listing_src is null or listing_src in ('prod', 'buy')),
  visitor_id uuid not null references public.analytics_visitors (id) on delete cascade,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  hits integer not null default 1,
  primary key (session_id, path)
);

create table if not exists public.analytics_listing_session_views (
  listing_id uuid not null,
  listing_src text not null check (listing_src in ('prod', 'buy')),
  session_id uuid not null references public.analytics_sessions (id) on delete cascade,
  visitor_id uuid not null references public.analytics_visitors (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (listing_id, listing_src, session_id)
);

create index if not exists analytics_visitors_last_seen_idx
  on public.analytics_visitors (last_seen_at desc);

create index if not exists analytics_visitors_user_id_idx
  on public.analytics_visitors (user_id)
  where user_id is not null;

create index if not exists analytics_sessions_visitor_id_idx
  on public.analytics_sessions (visitor_id, started_at desc);

create index if not exists analytics_sessions_started_at_idx
  on public.analytics_sessions (started_at desc);

create index if not exists analytics_pageviews_kind_idx
  on public.analytics_pageviews (page_kind);

create index if not exists analytics_pageviews_visitor_idx
  on public.analytics_pageviews (visitor_id);

create index if not exists analytics_listing_views_listing_idx
  on public.analytics_listing_session_views (listing_id, listing_src);

create or replace function public.preserve_session_views()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE'
    and new.session_views is distinct from old.session_views
    and current_user in ('authenticated', 'anon')
  then
    new.session_views := old.session_views;
  end if;
  return new;
end;
$$;

drop trigger if exists products_preserve_session_views on public.products;
create trigger products_preserve_session_views
  before update on public.products
  for each row
  execute function public.preserve_session_views();

drop trigger if exists buy_requests_preserve_session_views on public.buy_requests;
create trigger buy_requests_preserve_session_views
  before update on public.buy_requests
  for each row
  execute function public.preserve_session_views();

create or replace function public.analytics_ingest(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_visitor_id uuid;
  v_session_id uuid;
  v_path text;
  v_page_kind text;
  v_listing_id uuid;
  v_listing_src text;
  v_user_id uuid;
  v_username text;
  v_is_heartbeat boolean;
  v_owner_id uuid;
begin
  v_visitor_id := (payload->>'visitor_id')::uuid;
  v_session_id := (payload->>'session_id')::uuid;
  v_path := coalesce(nullif(payload->>'path', ''), '/');
  v_page_kind := coalesce(nullif(payload->>'page_kind', ''), 'other');
  v_is_heartbeat := coalesce((payload->>'is_heartbeat')::boolean, false);
  v_username := nullif(left(trim(coalesce(payload->>'username', '')), 80), '');

  if payload ? 'user_id' and nullif(payload->>'user_id', '') is not null then
    v_user_id := (payload->>'user_id')::uuid;
  end if;

  if payload ? 'listing_id' and nullif(payload->>'listing_id', '') is not null then
    v_listing_id := (payload->>'listing_id')::uuid;
  end if;

  v_listing_src := nullif(payload->>'listing_src', '');

  if v_page_kind not in ('home', 'listing', 'other') then
    v_page_kind := 'other';
  end if;

  insert into public.analytics_visitors (
    id, user_id, username, first_seen_at, last_seen_at, session_count
  )
  values (v_visitor_id, v_user_id, v_username, v_now, v_now, 0)
  on conflict (id) do update set
    last_seen_at = v_now,
    user_id = coalesce(excluded.user_id, public.analytics_visitors.user_id),
    username = coalesce(excluded.username, public.analytics_visitors.username);

  if v_is_heartbeat then
    update public.analytics_sessions set
      last_seen_at = v_now,
      duration_seconds = least(
        14400,
        greatest(0, floor(extract(epoch from (v_now - started_at)))::int)
      ),
      user_id = coalesce(v_user_id, user_id),
      username = coalesce(v_username, username)
    where id = v_session_id;

    return jsonb_build_object('ok', true, 'heartbeat', true);
  end if;

  insert into public.analytics_sessions (
    id, visitor_id, started_at, last_seen_at, duration_seconds,
    landing_path, referrer, referrer_host, utm_source, utm_medium, utm_campaign,
    user_agent, user_id, username
  )
  values (
    v_session_id,
    v_visitor_id,
    v_now,
    v_now,
    0,
    v_path,
    nullif(payload->>'referrer', ''),
    nullif(payload->>'referrer_host', ''),
    nullif(payload->>'utm_source', ''),
    nullif(payload->>'utm_medium', ''),
    nullif(payload->>'utm_campaign', ''),
    nullif(left(coalesce(payload->>'user_agent', ''), 400), ''),
    v_user_id,
    v_username
  )
  on conflict (id) do nothing;

  if found then
    update public.analytics_visitors
    set session_count = session_count + 1
    where id = v_visitor_id;
  else
    update public.analytics_sessions set
      last_seen_at = v_now,
      duration_seconds = least(
        14400,
        greatest(0, floor(extract(epoch from (v_now - started_at)))::int)
      ),
      user_id = coalesce(v_user_id, user_id),
      username = coalesce(v_username, username)
    where id = v_session_id;
  end if;

  insert into public.analytics_pageviews (
    session_id, path, page_kind, listing_id, listing_src, visitor_id,
    first_seen_at, last_seen_at, hits
  )
  values (
    v_session_id, v_path, v_page_kind, v_listing_id, v_listing_src, v_visitor_id,
    v_now, v_now, 1
  )
  on conflict (session_id, path) do update set
    last_seen_at = v_now,
    hits = public.analytics_pageviews.hits + 1;

  if v_listing_id is not null and v_listing_src in ('prod', 'buy') then
    if v_listing_src = 'prod' then
      select user_id into v_owner_id from public.products where id = v_listing_id;
    else
      select user_id into v_owner_id from public.buy_requests where id = v_listing_id;
    end if;

    if v_owner_id is null or v_user_id is distinct from v_owner_id then
      insert into public.analytics_listing_session_views (
        listing_id, listing_src, session_id, visitor_id, viewed_at
      )
      values (v_listing_id, v_listing_src, v_session_id, v_visitor_id, v_now)
      on conflict do nothing;

      if found then
        if v_listing_src = 'prod' then
          update public.products
          set session_views = session_views + 1
          where id = v_listing_id;
        else
          update public.buy_requests
          set session_views = session_views + 1
          where id = v_listing_id;
        end if;
      end if;
    end if;
  end if;

  return jsonb_build_object('ok', true);
exception
  when others then
    return jsonb_build_object('ok', false, 'error', sqlerrm);
end;
$$;

create or replace function public.analytics_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'unique_visitors', (select count(*)::int from public.analytics_visitors),
    'total_sessions', (select count(*)::int from public.analytics_sessions),
    'sessions_24h', (
      select count(*)::int from public.analytics_sessions
      where started_at > now() - interval '24 hours'
    ),
    'visitors_24h', (
      select count(*)::int from public.analytics_visitors
      where last_seen_at > now() - interval '24 hours'
    ),
    'avg_duration_seconds', (
      select coalesce(avg(duration_seconds), 0)::int
      from public.analytics_sessions
      where duration_seconds > 0
    ),
    'home_sessions', (
      select count(*)::int from public.analytics_pageviews where page_kind = 'home'
    ),
    'home_visitors', (
      select count(distinct visitor_id)::int
      from public.analytics_pageviews
      where page_kind = 'home'
    ),
    'listing_session_views', (
      select coalesce(sum(session_views), 0)::int from public.products
    ),
    'listings_count', (select count(*)::int from public.products),
    'listings_active', (
      select count(*)::int from public.products where status = 'active'
    ),
    'users_count', (select count(*)::int from public.profiles),
    'top_sources', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      from (
        select
          coalesce(
            nullif(utm_source, ''),
            nullif(referrer_host, ''),
            'Direct'
          ) as source,
          count(*)::int as sessions
        from public.analytics_sessions
        group by 1
        order by sessions desc
        limit 8
      ) t
    ),
    'top_pages', (
      select coalesce(jsonb_agg(row_to_json(t)), '[]'::jsonb)
      from (
        select path, count(*)::int as sessions
        from public.analytics_pageviews
        group by path
        order by sessions desc
        limit 10
      ) t
    )
  ) into result;

  return result;
end;
$$;

alter table public.analytics_visitors enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_pageviews enable row level security;
alter table public.analytics_listing_session_views enable row level security;

revoke all on table public.analytics_visitors from anon, authenticated;
revoke all on table public.analytics_sessions from anon, authenticated;
revoke all on table public.analytics_pageviews from anon, authenticated;
revoke all on table public.analytics_listing_session_views from anon, authenticated;

revoke all on function public.analytics_ingest(jsonb) from public, anon, authenticated;
revoke all on function public.analytics_overview() from public, anon, authenticated;
grant execute on function public.analytics_ingest(jsonb) to service_role;
grant execute on function public.analytics_overview() to service_role;

notify pgrst, 'reload schema';
