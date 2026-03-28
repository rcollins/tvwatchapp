-- Poster art from TVmaze API (https://www.tvmaze.com/api) — attribute in UI per CC BY-SA.

alter table public.tv_shows
  add column if not exists poster_url text,
  add column if not exists tvmaze_show_id integer;

create index if not exists tv_shows_tvmaze_show_id_idx
  on public.tv_shows (tvmaze_show_id)
  where tvmaze_show_id is not null;
