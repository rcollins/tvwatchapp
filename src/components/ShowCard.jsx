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

function formatBadge(season, episode) {
  const s = Math.max(1, Number(season) || 1)
  const e = Math.max(1, Number(episode) || 1)
  return `S${String(s).padStart(2, '0')} E${String(e).padStart(2, '0')}`
}

export default function ShowCard({
  show,
  index,
  onEdit,
  onIncrementEpisode,
}) {
  const delayMs = Math.min(index, 12) * 55

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
      className="card-enter group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition duration-300 ease-out hover:-translate-y-1 hover:border-amber-500/35 hover:bg-white/[0.06] hover:shadow-[0_12px_48px_rgba(245,158,11,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/[0.03] via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-[1.65rem] leading-[1.05] tracking-[0.02em] text-zinc-50 sm:text-[1.85rem]">
            {show.title}
          </h2>
          <span
            className="shrink-0 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-1 font-[family-name:var(--font-mono-badge)] text-xs font-semibold tracking-tight text-amber-200/95"
            aria-label={`Season ${show.season}, episode ${show.episode}`}
          >
            {formatBadge(show.season, show.episode)}
          </span>
        </div>

        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Last watched{' '}
          <time dateTime={show.lastWatched} className="text-zinc-400">
            {formatLastWatched(show.lastWatched)}
          </time>
        </p>

        {show.notes ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">
            {show.notes}
          </p>
        ) : (
          <p className="text-sm italic text-zinc-600">No notes</p>
        )}

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onIncrementEpisode(show.id)
            }}
            className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 font-[family-name:var(--font-mono-badge)] text-sm font-semibold text-amber-100 transition hover:border-amber-400/50 hover:bg-amber-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
          >
            +1 Episode
          </button>
        </div>
      </div>
    </article>
  )
}
