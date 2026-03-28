-- Disambiguation line (e.g. premiere year · network) when the same title exists for multiple series.
alter table public.tv_shows
  add column if not exists subtitle text;
