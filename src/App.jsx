import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import EmptyState from './components/EmptyState.jsx'
import LoginPage from './components/LoginPage.jsx'
import ShowCard from './components/ShowCard.jsx'
import ShowModal from './components/ShowModal.jsx'
import {
  createShow,
  deleteShow,
  listShows,
  setShowFavorited,
  updateShow,
} from './data/showsRepository.js'
import {
  getCurrentSessionUser,
  hasSupabaseConfig,
  signInGuest,
  signInWithEmail,
  signOut,
  signUpWithEmail,
  supabase,
} from './lib/supabase.js'
import {
  incrementEpisode,
  loadShows,
  saveShows,
  sortShowsByRecent,
} from './utils/shows.js'

function LogoMark() {
  return (
    <div
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a1e] shadow-[0_0_20px_rgba(242,43,43,0.15)]"
      aria-hidden
    >
      <svg
        className="h-5 w-5 text-[#f22b2b]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm2.7-2h8.6l.8-4.4-3.3 2.8L12 8.5 9.8 12.4 6.5 9.6l.8 4.4z" />
      </svg>
    </div>
  )
}

export default function App() {
  const [shows, setShows] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', show: null })
  const [loading, setLoading] = useState(true)
  const [syncMode, setSyncMode] = useState(hasSupabaseConfig ? 'supabase' : 'local')
  const [statusMessage, setStatusMessage] = useState('')
  const [supabaseUserId, setSupabaseUserId] = useState(null)
  const [authMode, setAuthMode] = useState('signin')
  const [authActionLoading, setAuthActionLoading] = useState(false)
  const searchInputRef = useRef(null)

  const loadRemoteShows = useCallback(async () => {
    const rows = await listShows()
    setShows(rows)
    setStatusMessage('Synced with Supabase.')
  }, [])

  useEffect(() => {
    let active = true

    async function bootstrap() {
      setLoading(true)
      if (!hasSupabaseConfig) {
        setSyncMode('local')
        setShows(sortShowsByRecent(loadShows()))
        setStatusMessage(
          'Local mode enabled. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to sync with Supabase.',
        )
        setLoading(false)
        return
      }

      const { user, error: sessionError } = await getCurrentSessionUser()
      if (!active) return

      if (sessionError) {
        setSyncMode('local')
        setShows(sortShowsByRecent(loadShows()))
        setStatusMessage(
          'Supabase session check failed. Using local mode.',
        )
        setLoading(false)
        return
      }

      if (!user) {
        setSyncMode('supabase')
        setShows([])
        setSupabaseUserId(null)
        setStatusMessage('Sign in to sync your library.')
        setLoading(false)
        return
      }

      try {
        const rows = await listShows()
        if (!active) return
        setSupabaseUserId(user.id)
        setSyncMode('supabase')
        setShows(rows)
        setStatusMessage('Synced with Supabase.')
      } catch {
        if (!active) return
        setSyncMode('local')
        setShows(sortShowsByRecent(loadShows()))
        setStatusMessage('Supabase query failed. Using local mode.')
      } finally {
        if (active) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const userId = session?.user?.id ?? null
      setSupabaseUserId(userId)
      if (!userId) {
        setShows([])
        setStatusMessage('Signed out.')
      } else {
        loadRemoteShows().catch(() => {
          setStatusMessage('Failed to refresh data after sign in.')
        })
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [loadRemoteShows])

  useEffect(() => {
    if (syncMode === 'local') {
      saveShows(shows)
    }
  }, [shows, syncMode])

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

  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus()
    searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  const handleSignIn = useCallback(async (email, password) => {
    setAuthActionLoading(true)
    try {
      const { user, error } = await signInWithEmail(email, password)
      if (error || !user) {
        setStatusMessage(error?.message ?? 'Unable to sign in.')
        return
      }
      setSupabaseUserId(user.id)
      await loadRemoteShows()
    } finally {
      setAuthActionLoading(false)
    }
  }, [loadRemoteShows])

  const handleSignUp = useCallback(async (email, password) => {
    setAuthActionLoading(true)
    try {
      const { user, error } = await signUpWithEmail(email, password)
      if (error) {
        setStatusMessage(error.message)
        return
      }
      if (!user) {
        setStatusMessage('Check your email to confirm your account, then sign in.')
        return
      }
      setSupabaseUserId(user.id)
      await loadRemoteShows()
    } finally {
      setAuthActionLoading(false)
    }
  }, [loadRemoteShows])

  const handleGuestSignIn = useCallback(async () => {
    setAuthActionLoading(true)
    try {
      const { user, error } = await signInGuest()
      if (error || !user) {
        setStatusMessage(error?.message ?? 'Unable to continue as guest.')
        return
      }
      setSupabaseUserId(user.id)
      await loadRemoteShows()
    } finally {
      setAuthActionLoading(false)
    }
  }, [loadRemoteShows])

  const handleSignOut = useCallback(async () => {
    const { error } = await signOut()
    if (error) {
      setStatusMessage('Failed to sign out.')
      return
    }
    setSupabaseUserId(null)
    setShows([])
    setStatusMessage('Signed out.')
  }, [])

  const handleSave = useCallback(
    async (data) => {
      try {
        if (modal.mode === 'add') {
          const base = {
            title: data.title,
            season: data.season,
            episode: data.episode,
            notes: data.notes,
          }
          let payload = { ...base }
          if (data.skipTvmaze) {
            payload.posterUrl = null
            payload.tvmazeShowId = null
            payload.subtitle = null
          } else if (data.tvmazePick) {
            const p = data.tvmazePick
            payload.posterUrl = p.posterUrl
            payload.tvmazeShowId = p.tvmazeShowId
            payload.subtitle = p.subtitle ?? null
          }

          if (syncMode === 'supabase') {
            const created = await createShow(payload, supabaseUserId)
            setShows((prev) => sortShowsByRecent([created, ...prev]))
          } else {
            setShows((prev) =>
              sortShowsByRecent([
                ...prev,
                {
                  id:
                    globalThis.crypto?.randomUUID?.() ??
                    `show-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  ...payload,
                  favorited: false,
                  lastWatched: new Date().toISOString(),
                },
              ]),
            )
          }
        } else if (modal.show) {
          const id = modal.show.id
          const payload = {
            title: data.title,
            season: data.season,
            episode: data.episode,
            notes: data.notes,
          }
          if (data.tvmazePick) {
            const p = data.tvmazePick
            payload.posterUrl = p.posterUrl
            payload.tvmazeShowId = p.tvmazeShowId
            payload.subtitle = p.subtitle ?? null
          }

          if (syncMode === 'supabase') {
            const updated = await updateShow(id, payload)
            setShows((prev) =>
              sortShowsByRecent(prev.map((s) => (s.id === id ? updated : s))),
            )
          } else {
            setShows((prev) =>
              sortShowsByRecent(
                prev.map((s) =>
                  s.id === id
                    ? {
                        ...s,
                        ...payload,
                        lastWatched: new Date().toISOString(),
                      }
                    : s,
                ),
              ),
            )
          }
        } else {
          return
        }
        setStatusMessage(syncMode === 'supabase' ? 'Synced with Supabase.' : 'Saved locally.')
        closeModal()
      } catch {
        setStatusMessage('Save failed. Check Supabase auth and policies.')
      }
    },
    [modal, closeModal, syncMode, supabaseUserId],
  )

  const handleDelete = useCallback(async () => {
    try {
      if (!modal.show) return
      const id = modal.show.id
      if (syncMode === 'supabase') {
        await deleteShow(id)
      }
      setShows((prev) => prev.filter((s) => s.id !== id))
      setStatusMessage(syncMode === 'supabase' ? 'Deleted in Supabase.' : 'Deleted locally.')
      closeModal()
    } catch {
      setStatusMessage('Delete failed. Check Supabase auth and policies.')
    }
  }, [modal.show, closeModal, syncMode])

  const handleIncrementEpisode = useCallback(
    async (id) => {
      try {
        const current = shows.find((s) => s.id === id)
        if (!current) return
        const next = incrementEpisode(current)

        if (syncMode === 'supabase') {
          const updated = await updateShow(id, {
            title: current.title,
            season: next.season,
            episode: next.episode,
            notes: current.notes || '',
          })
          setShows((prev) =>
            sortShowsByRecent(prev.map((s) => (s.id === id ? updated : s))),
          )
          return
        }

        setShows((prev) =>
          sortShowsByRecent(prev.map((s) => (s.id === id ? incrementEpisode(s) : s))),
        )
      } catch {
        setStatusMessage('Update failed. Check Supabase auth and policies.')
      }
    },
    [shows, syncMode],
  )

  const handleToggleFavorite = useCallback(
    async (showId) => {
      const current = shows.find((s) => s.id === showId)
      if (!current) return
      const next = !current.favorited

      try {
        if (syncMode === 'supabase') {
          const updated = await setShowFavorited(showId, next)
          setShows((prev) =>
            sortShowsByRecent(
              prev.map((s) => (s.id === showId ? updated : s)),
            ),
          )
        } else {
          setShows((prev) =>
            sortShowsByRecent(
              prev.map((s) =>
                s.id === showId ? { ...s, favorited: next } : s,
              ),
            ),
          )
        }
      } catch {
        setStatusMessage('Could not update favorite.')
      }
    },
    [shows, syncMode],
  )

  if (
    !loading &&
    syncMode === 'supabase' &&
    hasSupabaseConfig &&
    !supabaseUserId
  ) {
    return (
      <div className="relative min-h-dvh">
        <div className="dot-grid" aria-hidden />
        <div className="grain" aria-hidden />
        <LoginPage
          loading={authActionLoading}
          mode={authMode}
          message={statusMessage}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onGuest={handleGuestSignIn}
          onToggleMode={() =>
            setAuthMode((prev) => (prev === 'signin' ? 'signup' : 'signin'))
          }
        />
      </div>
    )
  }

  return (
    <div className="relative min-h-dvh pb-24 md:pb-8">
      <div className="dot-grid" aria-hidden />
      <div className="grain" aria-hidden />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 sm:mb-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a0a0ab]">
                  Last Watched
                </p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Your library
                </h1>
              </div>
            </div>
            <button
              type="button"
              onClick={openAdd}
              className="btn-primary-glow hidden shrink-0 rounded-2xl bg-[#f22b2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff3d3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f22b2b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e12] sm:inline-flex"
            >
              + Add show
            </button>
            {syncMode === 'supabase' ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden rounded-xl border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#a0a0ab] transition hover:border-white/30 hover:text-white sm:inline-flex"
              >
                Sign out
              </button>
            ) : null}
          </div>

          <p className="max-w-xl text-sm leading-relaxed text-[#a0a0ab]">
            Cinema Flow — track every series in one place. Tap a card to edit, or
            bump your place with +1 episode.
          </p>
          <p className="text-xs text-[#6b6b75]">
            Sync: {syncMode === 'supabase' ? 'Supabase' : 'Local storage'}{' '}
            {statusMessage ? `- ${statusMessage}` : ''}
          </p>
          <p className="text-[11px] text-[#6b6b75]">
            Posters from{' '}
            <a
              href="https://www.tvmaze.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a0a0ab] underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              TVmaze
            </a>{' '}
            (CC BY-SA). Search API:{' '}
            <a
              href="https://api.tvmaze.com/search/shows?q=girls"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#a0a0ab] underline decoration-white/20 underline-offset-2 hover:text-white"
            >
              api.tvmaze.com
            </a>
            .
          </p>

          <div>
            <label className="block">
              <span className="sr-only">Search shows</span>
              <div className="relative">
                <svg
                  className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#a0a0ab]"
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
                  ref={searchInputRef}
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search titles, genres, or notes…"
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#1a1a1e]/80 py-3.5 pl-12 pr-4 text-sm text-white shadow-inner shadow-black/20 backdrop-blur-md placeholder:text-[#6b6b75] focus:border-[#f22b2b]/40 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
                />
              </div>
            </label>
          </div>
        </header>

        {loading ? (
          <p className="py-16 text-center text-[#a0a0ab]">Loading shows…</p>
        ) : shows.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2 border-b border-white/[0.06] pb-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Continue watching
                </h2>
                <p className="mt-0.5 text-xs text-[#a0a0ab]">
                  {filtered.length} of {shows.length} show
                  {shows.length !== 1 ? 's' : ''}
                  {search.trim() ? ` matching “${search.trim()}”` : ''}
                </p>
              </div>
              <span className="rounded-full border border-[#805ad5]/35 bg-[#805ad5]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#c4b5fd]">
                Tracking
              </span>
            </div>

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-[#a0a0ab]">
                No shows match &ldquo;{search.trim()}&rdquo;.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                {filtered.map((show, index) => (
                  <li key={show.id} className="list-none">
                    <ShowCard
                      show={show}
                      index={index}
                      onEdit={openEdit}
                      onIncrementEpisode={handleIncrementEpisode}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Mobile bottom bar — matches kit nav pattern */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0e0e12]/90 px-2 py-2 backdrop-blur-xl md:hidden"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around gap-1 pb-[env(safe-area-inset-bottom)]">
          <button
            type="button"
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[#f22b2b]"
            aria-current="page"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Library
            </span>
          </button>
          <button
            type="button"
            onClick={focusSearch}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[#a0a0ab] transition hover:text-white"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" strokeLinecap="round" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Search
            </span>
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[#a0a0ab] transition hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a1e] text-lg font-light leading-none text-white">
              +
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Add
            </span>
          </button>
        </div>
      </nav>

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
