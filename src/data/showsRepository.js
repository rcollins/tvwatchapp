import { supabase } from '../lib/supabase'

function mapRowToShow(row) {
  return {
    id: row.id,
    title: row.title,
    season: row.season,
    episode: row.episode,
    notes: row.notes ?? '',
    lastWatched: row.last_watched_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    posterUrl: row.poster_url ?? null,
    tvmazeShowId: row.tvmaze_show_id ?? null,
    favorited: Boolean(row.favorited),
    subtitle: row.subtitle ?? null,
  }
}

const SHOW_COLUMNS =
  'id,title,season,episode,notes,last_watched_at,created_at,updated_at,poster_url,tvmaze_show_id,favorited,subtitle'

export async function listShows() {
  const { data, error } = await supabase
    .from('tv_shows')
    .select(SHOW_COLUMNS)
    .order('favorited', { ascending: false })
    .order('last_watched_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapRowToShow)
}

export async function createShow(show, userId) {
  const payload = {
    title: show.title,
    season: show.season,
    episode: show.episode,
    notes: show.notes || null,
    last_watched_at: new Date().toISOString(),
    user_id: userId,
    poster_url: show.posterUrl ?? null,
    tvmaze_show_id: show.tvmazeShowId ?? null,
    favorited: show.favorited ?? false,
    subtitle: show.subtitle ?? null,
  }

  const { data, error } = await supabase
    .from('tv_shows')
    .insert(payload)
    .select(SHOW_COLUMNS)
    .single()

  if (error) throw error
  return mapRowToShow(data)
}

export async function updateShow(showId, updates) {
  const payload = {
    title: updates.title,
    season: updates.season,
    episode: updates.episode,
    notes: updates.notes || null,
    last_watched_at: new Date().toISOString(),
  }

  if (updates.posterUrl !== undefined) {
    payload.poster_url = updates.posterUrl
  }
  if (updates.tvmazeShowId !== undefined) {
    payload.tvmaze_show_id = updates.tvmazeShowId
  }
  if (updates.favorited !== undefined) {
    payload.favorited = updates.favorited
  }
  if (updates.subtitle !== undefined) {
    payload.subtitle = updates.subtitle
  }

  const { data, error } = await supabase
    .from('tv_shows')
    .update(payload)
    .eq('id', showId)
    .select(SHOW_COLUMNS)
    .single()

  if (error) throw error
  return mapRowToShow(data)
}

/** Toggle favorite without changing last_watched_at (keeps sort honest for “recent”). */
export async function setShowFavorited(showId, favorited) {
  const { data, error } = await supabase
    .from('tv_shows')
    .update({ favorited })
    .eq('id', showId)
    .select(SHOW_COLUMNS)
    .single()

  if (error) throw error
  return mapRowToShow(data)
}

export async function deleteShow(showId) {
  const { error } = await supabase.from('tv_shows').delete().eq('id', showId)
  if (error) throw error
}
