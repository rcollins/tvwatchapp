/**
 * TVmaze public API — https://api.tvmaze.com
 * Data is CC BY-SA; credit TVmaze in the app (see footer).
 */

const TVMAZE_BASE = 'https://api.tvmaze.com'

/**
 * @typedef {object} TvmazeShowPick
 * @property {number} tvmazeShowId
 * @property {string} name
 * @property {string | null} posterUrl
 * @property {string | null} subtitle  e.g. "2004 · Syfy"
 * @property {string | null} premiered ISO date
 */

/**
 * Search shows; each result is a distinct series (unique tvmaze id).
 * @param {string} query
 * @returns {Promise<TvmazeShowPick[]>}
 */
export async function searchShows(query) {
  const trimmed = query.trim()
  if (!trimmed) return []

  const url = `${TVMAZE_BASE}/search/shows?q=${encodeURIComponent(trimmed)}`
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) return []

  /** @type {Array<{ show?: Record<string, unknown> }>} */
  const data = await res.json()
  if (!Array.isArray(data)) return []

  const out = []
  for (const entry of data) {
    const pick = normalizeSearchHit(entry)
    if (pick) out.push(pick)
  }
  return out
}

/**
 * @param {{ show?: Record<string, unknown> }} entry
 * @returns {TvmazeShowPick | null}
 */
function normalizeSearchHit(entry) {
  const show = entry?.show
  if (!show || typeof show.id !== 'number') return null

  const name = typeof show.name === 'string' ? show.name : 'Unknown'
  const image = show.image && typeof show.image === 'object' ? show.image : null
  const posterUrl =
    (image && typeof image.medium === 'string' && image.medium) ||
    (image && typeof image.original === 'string' && image.original) ||
    null

  const premiered =
    typeof show.premiered === 'string' ? show.premiered : null
  const year = premiered && premiered.length >= 4 ? premiered.slice(0, 4) : null

  const network =
    show.network && typeof show.network === 'object' && show.network !== null
      ? /** @type {{ name?: string }} */ (show.network).name
      : null
  const webChannel =
    show.webChannel &&
    typeof show.webChannel === 'object' &&
    show.webChannel !== null
      ? /** @type {{ name?: string }} */ (show.webChannel).name
      : null
  const net = network || webChannel || null

  const subtitle = [year, net].filter(Boolean).join(' · ') || null

  return {
    tvmazeShowId: show.id,
    name,
    posterUrl,
    subtitle,
    premiered,
  }
}

/**
 * @deprecated Prefer searchShows + user pick. Kept for any legacy call sites.
 * @param {string} title
 * @returns {Promise<{ posterUrl: string | null, tvmazeShowId: number | null }>}
 */
export async function fetchPosterForShowTitle(title) {
  const results = await searchShows(title)
  const first = results[0]
  if (!first) {
    return { posterUrl: null, tvmazeShowId: null }
  }
  return {
    posterUrl: first.posterUrl,
    tvmazeShowId: first.tvmazeShowId,
  }
}
