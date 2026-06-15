import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Suppress Supabase auth warnings in browser console (they're not actionable for users)
if (typeof window !== 'undefined') {
  const origWarn = console.warn
  console.warn = (...args: unknown[]) => {
    const msg = args.join(' ')
    if (msg.includes('supabase') || msg.includes('auth') || msg.includes('Failed to fetch')) return
    origWarn(...args)
  }
}

// Only create client if URL and KEY are valid (not placeholder, not empty)
const hasValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'placeholder' &&
  supabaseAnonKey.length > 20

export const supabase = hasValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null as unknown as ReturnType<typeof createClient>

// Helper: check if Supabase auth is available (used by UI to show/hide login)
export function isSupabaseConfigured(): boolean {
  return !!hasValidConfig
}
