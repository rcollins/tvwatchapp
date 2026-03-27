-- Strict RLS migration (per-user ownership)
-- Requires Supabase Auth JWT context (auth.uid()).

alter table public.tv_shows
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists tv_shows_user_last_watched_idx
  on public.tv_shows (user_id, last_watched_at desc);

create index if not exists tv_shows_user_title_search_idx
  on public.tv_shows (user_id, lower(title));

drop policy if exists "prototype_tv_shows_all" on public.tv_shows;
drop policy if exists "prototype_watch_events_all" on public.watch_progress_events;

drop policy if exists "tv_shows_select_own" on public.tv_shows;
create policy "tv_shows_select_own"
on public.tv_shows
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "tv_shows_insert_own" on public.tv_shows;
create policy "tv_shows_insert_own"
on public.tv_shows
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "tv_shows_update_own" on public.tv_shows;
create policy "tv_shows_update_own"
on public.tv_shows
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "tv_shows_delete_own" on public.tv_shows;
create policy "tv_shows_delete_own"
on public.tv_shows
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "watch_events_select_own_show" on public.watch_progress_events;
create policy "watch_events_select_own_show"
on public.watch_progress_events
for select
to authenticated
using (
  exists (
    select 1
    from public.tv_shows s
    where s.id = watch_progress_events.show_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "watch_events_insert_own_show" on public.watch_progress_events;
create policy "watch_events_insert_own_show"
on public.watch_progress_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tv_shows s
    where s.id = watch_progress_events.show_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "watch_events_update_own_show" on public.watch_progress_events;
create policy "watch_events_update_own_show"
on public.watch_progress_events
for update
to authenticated
using (
  exists (
    select 1
    from public.tv_shows s
    where s.id = watch_progress_events.show_id
      and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tv_shows s
    where s.id = watch_progress_events.show_id
      and s.user_id = auth.uid()
  )
);

drop policy if exists "watch_events_delete_own_show" on public.watch_progress_events;
create policy "watch_events_delete_own_show"
on public.watch_progress_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.tv_shows s
    where s.id = watch_progress_events.show_id
      and s.user_id = auth.uid()
  )
);
