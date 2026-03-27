-- Last Watched core schema
-- Note: Policies below allow anon/authenticated access for rapid prototyping.
-- Tighten these before production.

create extension if not exists pgcrypto;

create table if not exists public.tv_shows (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  season integer not null default 1 check (season >= 1),
  episode integer not null default 1 check (episode >= 1),
  notes text,
  last_watched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tv_shows_last_watched_idx
  on public.tv_shows (last_watched_at desc);

create index if not exists tv_shows_title_search_idx
  on public.tv_shows (lower(title));

create table if not exists public.watch_progress_events (
  id bigint generated always as identity primary key,
  show_id uuid not null references public.tv_shows(id) on delete cascade,
  season integer not null check (season >= 1),
  episode integer not null check (episode >= 1),
  note text,
  noted_at timestamptz not null default now()
);

create index if not exists watch_progress_events_show_noted_idx
  on public.watch_progress_events (show_id, noted_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_tv_shows_updated_at on public.tv_shows;
create trigger set_tv_shows_updated_at
before update on public.tv_shows
for each row
execute procedure public.set_updated_at();

alter table public.tv_shows enable row level security;
alter table public.watch_progress_events enable row level security;

drop policy if exists "prototype_tv_shows_all" on public.tv_shows;
create policy "prototype_tv_shows_all"
on public.tv_shows
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "prototype_watch_events_all" on public.watch_progress_events;
create policy "prototype_watch_events_all"
on public.watch_progress_events
for all
to anon, authenticated
using (true)
with check (true);
