export const EPISODES_PER_SEASON = 24
export const STORAGE_KEY = 'last-watched-shows'

export function loadShows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveShows(shows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shows))
}

export function createShowId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `show-${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
}

export function incrementEpisode(show) {
  let season = Number(show.season) || 1
  let episode = Number(show.episode) || 1
  episode += 1
  if (episode > EPISODES_PER_SEASON) {
    season += 1
    episode = 1
  }
  return {
    ...show,
    season,
    episode,
    lastWatched: new Date().toISOString(),
  }
}

export function sortShowsByRecent(shows) {
  return [...shows].sort((a, b) => {
    const ta = new Date(a.lastWatched || 0).getTime()
    const tb = new Date(b.lastWatched || 0).getTime()
    return tb - ta
  })
}
