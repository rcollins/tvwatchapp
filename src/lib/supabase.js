import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Base URL for email confirmation / magic links (must match Supabase redirect allowlist). */
export const siteUrl =
  (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '')

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

const SUPABASE_SINGLETON_KEY = '__last_watched_supabase_client__'

function getSupabaseSingleton() {
  if (!hasSupabaseConfig) return null

  const globalScope = globalThis
  if (globalScope[SUPABASE_SINGLETON_KEY]) {
    return globalScope[SUPABASE_SINGLETON_KEY]
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  globalScope[SUPABASE_SINGLETON_KEY] = client
  return client
}

export const supabase = getSupabaseSingleton()

export async function getCurrentSessionUser() {
  if (!supabase) {
    return { user: null, error: new Error('Supabase env vars are not configured.') }
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) return { user: null, error: sessionError }
  return { user: session?.user ?? null, error: null }
}

export async function signInWithEmail(email, password) {
  if (!supabase) return { user: null, error: new Error('Supabase is not configured.') }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user ?? null, error }
}

export async function signUpWithEmail(email, password) {
  if (!supabase) return { user: null, error: new Error('Supabase is not configured.') }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/`,
    },
  })
  return { user: data.user ?? null, error }
}

export async function signInGuest() {
  if (!supabase) return { user: null, error: new Error('Supabase is not configured.') }
  const { data, error } = await supabase.auth.signInAnonymously()
  return { user: data.user ?? null, error }
}

export async function signOut() {
  if (!supabase) return { error: null }
  const { error } = await supabase.auth.signOut()
  return { error }
}
