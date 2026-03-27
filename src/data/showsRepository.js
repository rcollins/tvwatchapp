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
  }
}

export async function listShows() {
  const { data, error } = await supabase
    .from('tv_shows')
    .select('id,title,season,episode,notes,last_watched_at,created_at,updated_at')
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
  }

  const { data, error } = await supabase
    .from('tv_shows')
    .insert(payload)
    .select('id,title,season,episode,notes,last_watched_at,created_at,updated_at')
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

  const { data, error } = await supabase
    .from('tv_shows')
    .update(payload)
    .eq('id', showId)
    .select('id,title,season,episode,notes,last_watched_at,created_at,updated_at')
    .single()

  if (error) throw error
  return mapRowToShow(data)
}

export async function deleteShow(showId) {
  const { error } = await supabase.from('tv_shows').delete().eq('id', showId)
  if (error) throw error
}
