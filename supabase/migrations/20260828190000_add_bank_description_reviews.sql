-- Agent bio / presentation
alter table public.profiles
  add column if not exists description text;

alter table public.profiles
  add column if not exists agent_setup_completed boolean not null default false;

-- Bank details kept in a separate table (not exposed by public profile RLS)
create table if not exists public.profile_bank_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  account_name text,
  iban text,
  bic text,
  bank_name text,
  updated_at timestamptz not null default now()
);

alter table public.profile_bank_accounts enable row level security;

drop policy if exists "Users manage own bank account" on public.profile_bank_accounts;
create policy "Users manage own bank account"
  on public.profile_bank_accounts
  for all
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Profile reviews (rating 1–5 + comment)
create table if not exists public.profile_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid,
  listing_src text check (listing_src is null or listing_src in ('prod', 'buy')),
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (profile_id, reviewer_id)
);

create index if not exists profile_reviews_profile_id_idx
  on public.profile_reviews (profile_id, created_at desc);

alter table public.profile_reviews enable row level security;

drop policy if exists "Public can read profile reviews" on public.profile_reviews;
create policy "Public can read profile reviews"
  on public.profile_reviews
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Users can insert profile reviews" on public.profile_reviews;
create policy "Users can insert profile reviews"
  on public.profile_reviews
  for insert
  to authenticated
  with check (
    reviewer_id = auth.uid()
    and profile_id <> auth.uid()
  );

drop policy if exists "Users can update own profile reviews" on public.profile_reviews;
create policy "Users can update own profile reviews"
  on public.profile_reviews
  for update
  to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid());

drop policy if exists "Users can delete own profile reviews" on public.profile_reviews;
create policy "Users can delete own profile reviews"
  on public.profile_reviews
  for delete
  to authenticated
  using (reviewer_id = auth.uid());

-- Mark existing agents as already onboarded
update public.profiles
set agent_setup_completed = true
where profile_type = 'agent';
