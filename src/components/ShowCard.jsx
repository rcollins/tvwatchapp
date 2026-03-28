import { EPISODES_PER_SEASON } from '../utils/shows'

function formatLastWatched(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return '—'
  }
}

/** Cinematic kit style: S2 - E4 */
function formatBadge(season, episode) {
  const s = Math.max(1, Number(season) || 1)
  const e = Math.max(1, Number(episode) || 1)
  return `S${String(s).padStart(2, '0')} - E${String(e).padStart(2, '0')}`
}

function seasonProgressPercent(episode) {
  const e = Math.max(1, Number(episode) || 1)
  return Math.min(100, (e / EPISODES_PER_SEASON) * 100)
}

export default function ShowCard({
  show,
  index,
  onEdit,
  onIncrementEpisode,
  onToggleFavorite,
}) {
  const delayMs = Math.min(index, 12) * 55
  const progress = seasonProgressPercent(show.episode)
  const favorited = Boolean(show.favorited)

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onEdit(show)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit(show)
        }
      }}
      style={{ animationDelay: `${delayMs}ms` }}
      className={`card-enter group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-[#1a1a1e]/90 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-md transition duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f22b2b]/60 ${
        favorited
          ? 'border-amber-500/40 shadow-[0_12px_40px_rgba(245,158,11,0.12)] hover:border-amber-400/50 hover:shadow-[0_16px_48px_rgba(245,158,11,0.18)]'
          : 'border-white/[0.08] hover:border-[#f22b2b]/25 hover:shadow-[0_16px_48px_rgba(242,43,43,0.12)]'
      }`}
    >
      <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-[#0e0e12]">
        {show.posterUrl ? (
          <img
            src={show.posterUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#222226] to-[#0e0e12] px-4 text-center text-xs text-[#6b6b75]">
            No poster found
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1a1e] via-transparent to-transparent opacity-90" />
        <div className="absolute right-2 top-2 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(show.id)
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-black/50 text-amber-400 backdrop-blur-sm transition hover:border-amber-400/60 hover:bg-black/65 hover:text-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
            aria-pressed={favorited}
            aria-label={
              favorited ? 'Remove from favorites' : 'Add to favorites'
            }
          >
            {favorited ? (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-[#805ad5]/[0.04] opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col gap-3 p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
              {show.title}
            </h2>
            {show.subtitle ? (
              <p className="mt-1 truncate text-xs text-[#a0a0ab]">{show.subtitle}</p>
            ) : null}
          </div>
          <span
            className="shrink-0 rounded-lg border border-white/10 bg-[#0e0e12]/80 px-2.5 py-1 font-[family-name:var(--font-mono-badge)] text-[11px] font-semibold tracking-tight text-[#a0a0ab]"
            aria-label={`Season ${show.season}, episode ${show.episode}`}
          >
            {formatBadge(show.season, show.episode)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {favorited ? (
            <span className="rounded-md border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-200/95">
              Favorite
            </span>
          ) : null}
          <span className="rounded-md border border-[#00d166]/30 bg-[#00d166]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#4ade80]">
            In progress
          </span>
        </div>

        <p className="text-xs text-[#a0a0ab]">
          Last watched{' '}
          <time
            dateTime={show.lastWatched}
            className="font-[family-name:var(--font-mono-badge)] text-[11px] text-[#d4d4d8]"
          >
            {formatLastWatched(show.lastWatched)}
          </time>
        </p>

        {show.notes ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-[#a0a0ab]">
            {show.notes}
          </p>
        ) : (
          <p className="text-sm italic text-[#6b6b75]">No notes</p>
        )}

        {/* Progress within assumed season length (kit-style green bar) */}
        <div className="mt-1">
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-[#6b6b75]">
            <span>Season progress</span>
            <span className="font-[family-name:var(--font-mono-badge)] text-[#00d166]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-[#00d166] shadow-[0_0_12px_rgba(0,209,102,0.45)] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4 pb-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onIncrementEpisode(show.id)
            }}
            className="w-full rounded-xl border border-white/[0.1] bg-[#0e0e12]/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-[#f22b2b]/40 hover:bg-[#f22b2b]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f22b2b]/50"
          >
            +1 Episode
          </button>
        </div>
      </div>
    </article>
  )
}
