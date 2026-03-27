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
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="modal-panel relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#1a1a1e]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
              Show name
            </span>
            <input
              autoFocus
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0e0e12]/80 px-4 py-3 text-white placeholder:text-[#6b6b75] focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
              placeholder="e.g. The Bear"
            />
          </label>

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
  )
}
