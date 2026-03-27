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
}) {
  const delayMs = Math.min(index, 12) * 55
  const progress = seasonProgressPercent(show.episode)

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
      className="card-enter group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1a1e]/90 shadow-[0_8px_40px_rgba(0,0,0,0.5)] backdrop-blur-md transition duration-300 ease-out hover:-translate-y-1 hover:border-[#f22b2b]/25 hover:shadow-[0_16px_48px_rgba(242,43,43,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f22b2b]/60"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-[#805ad5]/[0.04] opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col gap-3 p-5 pb-0">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
            {show.title}
          </h2>
          <span
            className="shrink-0 rounded-lg border border-white/10 bg-[#0e0e12]/80 px-2.5 py-1 font-[family-name:var(--font-mono-badge)] text-[11px] font-semibold tracking-tight text-[#a0a0ab]"
            aria-label={`Season ${show.season}, episode ${show.episode}`}
          >
            {formatBadge(show.season, show.episode)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
