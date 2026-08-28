alter table public.convs
  drop constraint if exists convs_src_check;

alter table public.convs
  add constraint convs_src_check
  check (src in ('prod', 'buy', 'profile'));
