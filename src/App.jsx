import { useCallback, useEffect, useMemo, useState } from 'react'
import EmptyState from './components/EmptyState.jsx'
import ShowCard from './components/ShowCard.jsx'
import ShowModal from './components/ShowModal.jsx'
import {
  createShowId,
  incrementEpisode,
  loadShows,
  saveShows,
  sortShowsByRecent,
} from './utils/shows.js'

export default function App() {
  const [shows, setShows] = useState(() => sortShowsByRecent(loadShows()))
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', show: null })

  useEffect(() => {
    saveShows(shows)
  }, [shows])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return shows
    return shows.filter((s) => s.title.toLowerCase().includes(q))
  }, [shows, search])

  const openAdd = useCallback(() => {
    setModal({ open: true, mode: 'add', show: null })
  }, [])

  const openEdit = useCallback((show) => {
    setModal({ open: true, mode: 'edit', show })
  }, [])

  const closeModal = useCallback(() => {
    setModal({ open: false, mode: 'add', show: null })
  }, [])

  const handleSave = useCallback(
    (data) => {
      const now = new Date().toISOString()
      if (modal.mode === 'add') {
        const id = createShowId()
        setShows((prev) =>
          sortShowsByRecent([
            ...prev,
            {
              id,
              ...data,
              lastWatched: now,
            },
          ]),
        )
      } else if (modal.show) {
        const id = modal.show.id
        setShows((prev) =>
          sortShowsByRecent(
            prev.map((s) =>
              s.id === id
                ? {
                    ...s,
                    ...data,
                    lastWatched: now,
                  }
                : s,
            ),
          ),
        )
      }
      closeModal()
    },
    [modal, closeModal],
  )

  const handleDelete = useCallback(() => {
    if (!modal.show) return
    const id = modal.show.id
    setShows((prev) => prev.filter((s) => s.id !== id))
    closeModal()
  }, [modal.show, closeModal])

  const handleIncrementEpisode = useCallback((id) => {
    setShows((prev) =>
      sortShowsByRecent(
        prev.map((s) => (s.id === id ? incrementEpisode(s) : s)),
      ),
    )
  }, [])

  return (
    <div className="relative min-h-dvh">
      <div className="grain" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-6 border-b border-white/[0.06] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 font-[family-name:var(--font-mono-badge)] text-xs font-semibold uppercase tracking-[0.2em] text-amber-500/80">
              Last Watched
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-[0.02em] text-zinc-50 sm:text-6xl">
              Your shows
            </h1>
            <p className="mt-2 max-w-lg text-sm text-zinc-500">
              Pick up exactly where you left off — one list, every series.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="shrink-0 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/20 to-amber-600/10 px-6 py-3.5 font-[family-name:var(--font-mono-badge)] text-sm font-semibold text-amber-50 shadow-[0_0_24px_rgba(245,158,11,0.15)] transition hover:border-amber-400/60 hover:from-amber-500/30 hover:shadow-[0_0_32px_rgba(245,158,11,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/70"
          >
            + Add Show
          </button>
        </header>

        <div className="mb-8">
          <label className="block">
            <span className="sr-only">Search shows</span>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your library…"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/25"
              />
            </div>
          </label>
        </div>

        {shows.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">
            No shows match &ldquo;{search.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((show, index) => (
              <li key={show.id} className="list-none">
                <ShowCard
                  show={show}
                  index={index}
                  onEdit={openEdit}
                  onIncrementEpisode={handleIncrementEpisode}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ShowModal
        key={
          modal.open
            ? `${modal.mode}-${
                modal.mode === 'edit' && modal.show ? modal.show.id : 'new'
              }`
            : 'closed'
        }
        open={modal.open}
        mode={modal.mode}
        initialShow={modal.show}
        onClose={closeModal}
        onSave={handleSave}
        onDelete={modal.mode === 'edit' ? handleDelete : undefined}
      />
    </div>
  )
}
