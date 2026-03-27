export default function EmptyState({ onAdd }) {
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center sm:py-16"
      role="status"
      aria-live="polite"
    >
      <div className="mb-8 text-[#f22b2b]">
        <svg
          className="h-36 w-36 drop-shadow-[0_0_32px_rgba(242,43,43,0.35)] sm:h-40 sm:w-40"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <rect
            x="12"
            y="28"
            width="96"
            height="64"
            rx="8"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-90"
          />
          <path
            d="M12 44h96M44 28v-8a4 4 0 014-4h24a4 4 0 014 4v8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-90"
          />
          <circle cx="60" cy="60" r="14" stroke="#00d166" strokeWidth="2" />
          <path
            d="M56 60l4 4 8-8"
            stroke="#00d166"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 92c8-6 18-9 36-9s28 3 36 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
          />
        </svg>
      </div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#805ad5]">
        Cinema Flow
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Nothing queued yet
      </h2>
      <p className="mt-3 text-balance text-sm leading-relaxed text-[#a0a0ab]">
        Add a show to log the last episode you watched — we&apos;ll keep the time
        stamp so you can dive back in like a premium home screen.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="btn-primary-glow mt-8 rounded-2xl bg-[#f22b2b] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#ff3d3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f22b2b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0e12]"
      >
        + Add your first show
      </button>
    </div>
  )
}
