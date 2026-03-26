export default function EmptyState() {
  return (
    <div
      className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="mb-8 text-amber-500/90">
        <svg
          className="h-40 w-40 drop-shadow-[0_0_28px_rgba(245,158,11,0.25)]"
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
            rx="6"
            stroke="currentColor"
            strokeWidth="2"
            className="opacity-80"
          />
          <path
            d="M12 44h96M44 28v-8a4 4 0 014-4h24a4 4 0 014 4v8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="opacity-80"
          />
          <circle cx="60" cy="60" r="14" stroke="currentColor" strokeWidth="2" />
          <path
            d="M56 60l4 4 8-8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M24 92c8-6 18-9 36-9s28 3 36 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-4xl tracking-wide text-zinc-100 sm:text-5xl">
        Your queue is empty
      </h2>
      <p className="mt-3 text-balance text-sm leading-relaxed text-zinc-500">
        Track where you left off — add a show and we&apos;ll remember the last
        episode you watched, with a timestamp you can trust next time you press
        play.
      </p>
    </div>
  )
}
