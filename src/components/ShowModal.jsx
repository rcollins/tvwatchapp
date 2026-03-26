import { useEffect, useState } from 'react'
import { EPISODES_PER_SEASON } from '../utils/shows'

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

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const title = mode === 'add' ? 'Add show' : 'Edit show'

  function handleSubmit(e) {
    e.preventDefault()
    const t = form.title.trim()
    if (!t) return
    const season = Math.max(1, parseInt(form.season, 10) || 1)
    const episode = Math.max(1, parseInt(form.episode, 10) || 1)
    onSave({
      title: t,
      season,
      episode,
      notes: form.notes.trim(),
    })
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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-panel relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#14141a]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2
            id="show-modal-title"
            className="font-[family-name:var(--font-display)] text-3xl tracking-wide text-zinc-50"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Show name
            </span>
            <input
              autoFocus
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="e.g. The Bear"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Season
              </span>
              <input
                type="number"
                min={1}
                value={form.season}
                onChange={(e) => setForm((f) => ({ ...f, season: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-[family-name:var(--font-mono-badge)] text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Episode
              </span>
              <input
                type="number"
                min={1}
                value={form.episode}
                onChange={(e) => setForm((f) => ({ ...f, episode: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-[family-name:var(--font-mono-badge)] text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </label>
          </div>

          <p className="text-xs text-zinc-600">
            +1 Episode advances the count; when episode exceeds {EPISODES_PER_SEASON},
            season bumps and episode resets to 1.
          </p>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Notes <span className="font-normal text-zinc-600">(optional)</span>
            </span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full resize-y rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              placeholder="Cliffhanger ending, watch with subtitles…"
            />
          </label>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="order-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 sm:order-1 sm:mr-auto"
              >
                Delete show
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="order-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/5 sm:order-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="order-1 rounded-xl border border-amber-500/40 bg-amber-500/15 px-5 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25 sm:order-3"
            >
              {mode === 'add' ? 'Add show' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
