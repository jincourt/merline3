create policy "Allow public read on buy_requests"
  on public.buy_requests
  for select
  to anon, authenticated
  using (true);
