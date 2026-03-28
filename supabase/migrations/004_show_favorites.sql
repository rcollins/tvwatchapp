alter table public.tv_shows
  add column if not exists favorited boolean not null default false;

create index if not exists tv_shows_user_favorited_last_idx
  on public.tv_shows (user_id, favorited desc, last_watched_at desc);
