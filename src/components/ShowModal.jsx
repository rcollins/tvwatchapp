import { useEffect, useMemo, useState } from 'react'
import { EPISODES_PER_SEASON } from '../utils/shows'
import { searchShows } from '../lib/tvmaze.js'

const emptyForm = {
  title: '',
  season: '1',
  episode: '1',
  notes: '',
}

function initialForm(mode, initialShow) {
  if (mode === 'edit' && initialShow) {
    return {
      title: initialShow.title ?? '',
      season: String(initialShow.season ?? 1),
      episode: String(initialShow.episode ?? 1),
      notes: initialShow.notes ?? '',
    }
  }
  return emptyForm
}

export default function ShowModal({
  open,
  mode,
  initialShow,
  onClose,
  onSave,
  onDelete,
}) {
  const [form, setForm] = useState(() => initialForm(mode, initialShow))
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [matchError, setMatchError] = useState('')
  const [selectedPick, setSelectedPick] = useState(null)
  const [skipNoTvmaze, setSkipNoTvmaze] = useState(false)
  /** Edit: new TV match when user searches again */
  const [replacementPick, setReplacementPick] = useState(null)
  const [editSearchOpen, setEditSearchOpen] = useState(false)

  const editShowKey = useMemo(
    () => (mode === 'edit' ? initialShow?.id ?? null : 'add'),
    [mode, initialShow?.id],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    setForm(initialForm(mode, initialShow))
    setSearchResults([])
    setSearchError('')
    setMatchError('')
    setSelectedPick(null)
    setSkipNoTvmaze(false)
    setReplacementPick(null)
    setEditSearchOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initialShow omitted to avoid identity churn; editShowKey scopes identity
  }, [open, mode, editShowKey])

  if (!open) return null

  const title = mode === 'add' ? 'Add show' : 'Edit show'

  async function runSearch() {
    const q = form.title.trim()
    if (!q) {
      setSearchError('Enter a show name to search.')
      return
    }
    setSearchLoading(true)
    setSearchError('')
    setMatchError('')
    try {
      const rows = await searchShows(q)
      setSearchResults(rows)
      if (rows.length === 0) {
        setSearchError('No matches. Try another spelling or add without TVmaze.')
      }
    } catch {
      setSearchError('Search failed. Try again in a moment.')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  function selectPick(pick) {
    setSelectedPick(pick)
    setSkipNoTvmaze(false)
    setForm((f) => ({ ...f, title: pick.name }))
    setMatchError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const t = form.title.trim()
    if (!t) return
    const season = Math.max(1, parseInt(form.season, 10) || 1)
    const episode = Math.max(1, parseInt(form.episode, 10) || 1)
    const notes = form.notes.trim()

    if (mode === 'add') {
      if (!skipNoTvmaze && !selectedPick) {
        setMatchError(
          'Search TVmaze and select the correct series, or check “Add without TVmaze”.',
        )
        return
      }
      onSave({
        title: t,
        season,
        episode,
        notes,
        tvmazePick: skipNoTvmaze ? null : selectedPick,
        skipTvmaze: skipNoTvmaze,
      })
      return
    }

    onSave({
      title: t,
      season,
      episode,
      notes,
      tvmazePick: replacementPick,
    })
  }

  function selectReplacementPick(pick) {
    setReplacementPick(pick)
    setForm((f) => ({ ...f, title: pick.name }))
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="show-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-panel relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1a1a1e]/95 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        <div className="shrink-0 border-b border-white/[0.06] p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#805ad5]">
                Last Watched
              </p>
              <h2
                id="show-modal-title"
                className="text-2xl font-bold tracking-tight text-white"
              >
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 p-2 text-[#a0a0ab] transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
                Show name
              </span>
              <input
                autoFocus={mode === 'add'}
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 px-4 py-3 text-white placeholder:text-[#6b6b75] focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
                placeholder="e.g. Battlestar Galactica"
              />
            </label>

            {mode === 'edit' && initialShow?.subtitle ? (
              <p className="text-xs text-[#6b6b75]">
                Matched listing:{' '}
                <span className="text-[#a0a0ab]">{initialShow.subtitle}</span>
              </p>
            ) : null}

            {mode === 'add' ? (
              <div className="rounded-xl border border-white/[0.08] bg-[#0e0e12]/50 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#a0a0ab]">
                    TVmaze match
                  </span>
                  <button
                    type="button"
                    onClick={runSearch}
                    disabled={searchLoading}
                    className="rounded-lg border border-[#f22b2b]/40 bg-[#f22b2b]/10 px-3 py-1.5 text-xs font-semibold text-[#fca5a5] transition hover:bg-[#f22b2b]/20 disabled:opacity-50"
                  >
                    {searchLoading ? 'Searching…' : 'Search'}
                  </button>
                </div>
                <p className="mb-3 text-[11px] leading-relaxed text-[#6b6b75]">
                  Same title can refer to different series (e.g. 1978 vs 2004). Search and
                  tap the correct row.
                </p>

                {searchError ? (
                  <p className="mb-2 text-xs text-amber-200/90">{searchError}</p>
                ) : null}

                <ul
                  className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#0e0e12]/80 p-2"
                  aria-label="TVmaze search results"
                >
                  {searchResults.length === 0 && !searchLoading ? (
                    <li className="px-2 py-3 text-center text-xs text-[#6b6b75]">
                      Results appear here after you search.
                    </li>
                  ) : null}
                  {searchResults.map((row) => {
                    const active = selectedPick?.tvmazeShowId === row.tvmazeShowId
                    return (
                      <li key={row.tvmazeShowId}>
                        <button
                          type="button"
                          onClick={() => selectPick(row)}
                          className={`flex w-full gap-3 rounded-lg border p-2 text-left transition ${
                            active
                              ? 'border-amber-500/50 bg-amber-500/10'
                              : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="h-14 w-10 shrink-0 overflow-hidden rounded bg-black/40">
                            {row.posterUrl ? (
                              <img
                                src={row.posterUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] text-[#6b6b75]">
                                —
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {row.name}
                            </p>
                            {row.subtitle ? (
                              <p className="truncate text-xs text-[#a0a0ab]">{row.subtitle}</p>
                            ) : (
                              <p className="text-xs text-[#6b6b75]">TVmaze ID {row.tvmazeShowId}</p>
                            )}
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <label className="mt-3 flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    checked={skipNoTvmaze}
                    onChange={(e) => {
                      setSkipNoTvmaze(e.target.checked)
                      if (e.target.checked) {
                        setSelectedPick(null)
                      }
                      setMatchError('')
                    }}
                    className="mt-1 rounded border-white/20"
                  />
                  <span className="text-xs leading-relaxed text-[#a0a0ab]">
                    Add without TVmaze (no poster; for obscure or incorrect listings)
                  </span>
                </label>

                {matchError ? (
                  <p className="mt-2 text-xs text-red-300/90">{matchError}</p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.08] bg-[#0e0e12]/40 p-4">
                <button
                  type="button"
                  onClick={() => setEditSearchOpen((o) => !o)}
                  className="text-xs font-semibold uppercase tracking-wider text-[#a0a0ab] underline decoration-white/20 underline-offset-2 hover:text-white"
                >
                  {editSearchOpen ? 'Hide' : 'Change'} TVmaze match
                </button>
                {editSearchOpen ? (
                  <div className="mt-3">
                    <div className="mb-2 flex flex-wrap justify-between gap-2">
                      <button
                        type="button"
                        onClick={runSearch}
                        disabled={searchLoading}
                        className="rounded-lg border border-[#f22b2b]/40 bg-[#f22b2b]/10 px-3 py-1.5 text-xs font-semibold text-[#fca5a5] transition hover:bg-[#f22b2b]/20 disabled:opacity-50"
                      >
                        {searchLoading ? 'Searching…' : 'Search with title above'}
                      </button>
                    </div>
                    {searchError ? (
                      <p className="mb-2 text-xs text-amber-200/90">{searchError}</p>
                    ) : null}
                    <ul className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#0e0e12]/80 p-2">
                      {searchResults.map((row) => {
                        const active =
                          replacementPick?.tvmazeShowId === row.tvmazeShowId
                        return (
                          <li key={row.tvmazeShowId}>
                            <button
                              type="button"
                              onClick={() => selectReplacementPick(row)}
                              className={`flex w-full gap-3 rounded-lg border p-2 text-left transition ${
                                active
                                  ? 'border-amber-500/50 bg-amber-500/10'
                                  : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                              }`}
                            >
                              <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-black/40">
                                {row.posterUrl ? (
                                  <img
                                    src={row.posterUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[10px] text-[#6b6b75]">
                                    —
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-white">
                                  {row.name}
                                </p>
                                {row.subtitle ? (
                                  <p className="truncate text-xs text-[#a0a0ab]">
                                    {row.subtitle}
                                  </p>
                                ) : null}
                              </div>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                    {replacementPick ? (
                      <p className="mt-2 text-xs text-[#4ade80]">
                        New match selected — save to apply poster and listing.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
                  Season
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.season}
                  onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 px-4 py-3 font-[family-name:var(--font-mono-badge)] text-sm text-white focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
                  Episode
                </span>
                <input
                  type="number"
                  min={1}
                  value={form.episode}
                  onChange={(e) => setForm((f) => ({ ...f, episode: e.target.value }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 px-4 py-3 font-[family-name:var(--font-mono-badge)] text-sm text-white focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
                />
              </label>
            </div>

            <p className="text-xs leading-relaxed text-[#6b6b75]">
              +1 Episode advances the count; when episode exceeds {EPISODES_PER_SEASON},
              season bumps and episode resets to 1.
            </p>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
                Notes <span className="font-normal text-[#6b6b75]">(optional)</span>
              </span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 px-4 py-3 text-sm text-white placeholder:text-[#6b6b75] focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
                placeholder="Cliffhanger ending, watch with subtitles…"
              />
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="order-3 rounded-xl border border-[#f22b2b]/35 bg-[#f22b2b]/10 px-4 py-3 text-sm font-medium text-[#fca5a5] transition hover:bg-[#f22b2b]/20 sm:order-1 sm:mr-auto"
                >
                  Delete show
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="order-2 rounded-xl border border-white/[0.12] px-4 py-3 text-sm font-medium text-[#a0a0ab] transition hover:border-white/25 hover:bg-white/5 hover:text-white sm:order-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-glow order-1 rounded-xl bg-[#f22b2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff3d3d] sm:order-3"
              >
                {mode === 'add' ? 'Add show' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
