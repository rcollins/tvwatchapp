import { useState } from 'react'

export default function LoginPage({
  loading,
  mode,
  message,
  onSignIn,
  onSignUp,
  onGuest,
  onToggleMode,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isSignUp = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    if (!email.trim() || !password) return
    if (isSignUp) {
      await onSignUp(email.trim(), password)
      return
    }
    await onSignIn(email.trim(), password)
  }

  return (
    <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1a1e]/90 p-6 shadow-[0_16px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#805ad5]">
          Last Watched
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          {isSignUp ? 'Create your account' : 'Sign in'}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#a0a0ab]">
          {isSignUp
            ? 'Create an account to securely sync your TV progress across devices.'
            : 'Continue where you left off. Your watch history syncs to Supabase.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0e0e12]/80 px-4 py-3 text-white placeholder:text-[#6b6b75] focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
              placeholder="you@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#a0a0ab]">
              Password
            </span>
            <input
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0e0e12]/80 px-4 py-3 text-white placeholder:text-[#6b6b75] focus:border-[#f22b2b]/45 focus:outline-none focus:ring-2 focus:ring-[#f22b2b]/20"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-glow mt-2 rounded-xl bg-[#f22b2b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff3d3d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading
              ? 'Please wait...'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onToggleMode}
            className="text-xs font-medium text-[#a0a0ab] transition hover:text-white disabled:opacity-70"
          >
            {isSignUp ? 'Have an account? Sign in' : 'Need an account? Sign up'}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onGuest}
            className="text-xs font-semibold text-[#4ade80] transition hover:text-[#86efac] disabled:opacity-70"
          >
            Continue as guest
          </button>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-white/10 bg-[#0e0e12]/60 px-3 py-2 text-xs text-[#a0a0ab]">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  )
}
