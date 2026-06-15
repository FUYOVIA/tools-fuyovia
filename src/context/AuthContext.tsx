'use client'

/* ============================================================
  【认证系统】AuthContext.tsx — 全局认证上下文
  ------------------------------------------------------------
  文件用途：用户登录/注册/登出的完整状态管理
  - supabase 为 null 时（未配置）自动降级，不报错
  - 所有 Supabase 原始错误已映射为用户友好提示
  - 2026-06-15 修复：Failed to fetch / users 表不存在 / 网络错误
  ============================================================ */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  plan: 'free' | 'starter' | 'pro' | 'studio'
  credits: number
  credits_refreshed_at: string | null
  plan_expires_at: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        // users 表可能不存在，静默跳过（不影响登录）
        return
      }
      setProfile(data as UserProfile)
    } catch {
      // 网络错误，静默跳过
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id).catch(() => {})
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) await fetchProfile(session.user.id).catch(() => {})
        else setProfile(null)
        setLoading(false)
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  // ---------- 登录 ----------
  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Authentication is not available right now. Please try again later.' }
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: mapAuthError(error.message, 'signin') }
      return { error: null }
    } catch {
      return { error: 'Network error. Please check your connection and try again.' }
    }
  }

  // ---------- 注册 ----------
  const signUp = async (email: string, password: string, displayName: string) => {
    if (!supabase) return { error: 'Authentication is not available right now. Please try again later.' }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: displayName } },
      })
      if (error) return { error: mapAuthError(error.message, 'signup') }
      return { error: null }
    } catch {
      return { error: 'Network error. Please check your connection and try again.' }
    }
  }

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut().catch(() => {})
    setUser(null)
    setProfile(null)
  }

  const signInWithGoogle = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/community` },
      })
    }
  }

  const signInWithFacebook = async () => {
    if (supabase) {
      await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo: `${window.location.origin}/auth/callback?next=/community` },
      })
    }
  }

  const getToken = async (): Promise<string | null> => {
    if (!supabase) return null
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signIn, signUp,
      signInWithGoogle, signInWithFacebook,
      signOut, refreshProfile, getToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// ---------- 错误消息本地化 ----------
function mapAuthError(msg: string, mode: 'signin' | 'signup'): string {
  const m = (msg || '').toLowerCase()
  if (m.includes('invalid api key') || m.includes('api_key'))
    return 'Authentication service is temporarily unavailable. Please try again later.'
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('load failed'))
    return 'Unable to connect. Please check your internet and try again.'
  if (m.includes('invalid login credentials') || m.includes('invalid email or password'))
    return 'Invalid email or password. Please check and try again.'
  if (m.includes('email not confirmed'))
    return 'Please confirm your email before signing in.'
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'This email is already registered. Please sign in instead.'
  if (m.includes('password'))
    return 'Password must be at least 6 characters.'
  return msg.length > 80 ? `Unable to ${mode === 'signin' ? 'sign in' : 'register'}. Please try again.` : msg
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
