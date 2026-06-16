'use client'

/* ============================================================
  【认证系统】AuthContext.tsx — 双通道认证上下文
  ------------------------------------------------------------
  核心策略：
  1. 海外用户：直连 Supabase（快，延迟低）
  2. 中国网络：直连超时后自动走 /api/auth/* 代理（绕墙）

  实现：
  - signIn/signUp 先尝试直连（3秒超时）
  - 超时/网络错误 → 自动 fallback 到服务端代理
  - 代理返回 session token → 前端用 supabase.auth.setSession() 恢复
  - 所有错误消息已映射为用户友好英文提示
  ============================================================ */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

// ---------- 直连超时时间（毫秒） ----------
const DIRECT_TIMEOUT = 3000

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

  // ---------- 获取用户 profile ----------
  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) return // users 表可能不存在，静默跳过
      setProfile(data as UserProfile)
    } catch {
      // 网络错误，静默跳过
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  // ---------- 初始化：恢复已有 session ----------
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // 尝试直连获取 session，超时则走代理
    const initSession = async () => {
      try {
        // 先尝试直连
        const result = await Promise.race([
          supabase.auth.getSession(),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), DIRECT_TIMEOUT)
          ),
        ])

        if (result && 'data' in result) {
          const session = result.data.session
          setUser(session?.user ?? null)
          if (session?.user) await fetchProfile(session.user.id).catch(() => {})
        }
      } catch {
        // 直连超时/失败，尝试代理获取 session
        try {
          const res = await fetch('/api/auth/session')
          if (res.ok) {
            const json = await res.json()
            if (json.success && json.session && supabase) {
              await supabase.auth.setSession({
                access_token: json.session.access_token,
                refresh_token: json.session.refresh_token,
              })
              setUser(json.session.user as User)
            }
          }
        } catch {
          // 代理也失败，静默处理（用户未登录状态）
        }
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // 监听 auth 状态变化（直连成功时才有效）
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

  // ---------- 通用：带超时的 fetch ----------
  function fetchWithTimeout(url: string, options: RequestInit, timeout = DIRECT_TIMEOUT): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeout)
      ),
    ])
  }

  // ---------- 登录（双通道） ----------
  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Authentication is not available right now. Please try again later.' }

    // 第一通道：直连 Supabase
    try {
      const result = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), DIRECT_TIMEOUT)
        ),
      ])

      if (result && 'error' in result) {
        if (result.error) return { error: mapAuthError(result.error.message, 'signin') }
        return { error: null }
      }
    } catch (directError) {
      // 第二通道：走 /api/auth/sign-in 代理
      try {
        const res = await fetch('/api/auth/sign-in', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const json = await res.json()

        if (!json.success) {
          return { error: mapAuthError(json.error, 'signin') }
        }

        // 代理返回了 session，恢复到 Supabase client
        if (json.session && supabase) {
          await supabase.auth.setSession({
            access_token: json.session.access_token,
            refresh_token: json.session.refresh_token,
          })
          setUser(json.session.user as User)
        }
        return { error: null }
      } catch {
        return { error: 'Unable to connect. Please check your internet and try again.' }
      }
    }

    return { error: null }
  }

  // ---------- 注册（双通道） ----------
  const signUp = async (email: string, password: string, displayName: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: 'Authentication is not available right now. Please try again later.' }

    // 第一通道：直连 Supabase
    try {
      const result = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: displayName } },
        }),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), DIRECT_TIMEOUT)
        ),
      ])

      if (result && 'error' in result) {
        if (result.error) return { error: mapAuthError(result.error.message, 'signup') }
        return { error: null }
      }
    } catch {
      // 第二通道：走 /api/auth/sign-up 代理
      try {
        const res = await fetch('/api/auth/sign-up', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName }),
        })
        const json = await res.json()

        if (!json.success) {
          return { error: mapAuthError(json.error, 'signup') }
        }

        // 代理返回了 session，恢复到 Supabase client
        if (json.session && supabase) {
          await supabase.auth.setSession({
            access_token: json.session.access_token,
            refresh_token: json.session.refresh_token,
          })
          setUser(json.session.user as User)
        } else if (json.user) {
          // 注册成功但需要邮箱确认（无 session）
          setUser(json.user as User)
        }
        return { error: null }
      } catch {
        return { error: 'Unable to connect. Please check your internet and try again.' }
      }
    }

    return { error: null }
  }

  // ---------- 登出 ----------
  const signOut = async () => {
    // 直连登出
    if (supabase) {
      try {
        await Promise.race([
          supabase.auth.signOut(),
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), DIRECT_TIMEOUT)
          ),
        ]).catch(() => {})
      } catch {
        // 直连超时，走代理
        try {
          const session = await supabase.auth.getSession()
          const accessToken = session.data.session?.access_token
          await fetch('/api/auth/sign-out', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken }),
          }).catch(() => {})
        } catch {}
      }
    }
    setUser(null)
    setProfile(null)
  }

  // ---------- OAuth（Google/Facebook） ----------
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

  // ---------- 获取 token ----------
  const getToken = async (): Promise<string | null> => {
    if (!supabase) return null
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token ?? null
    } catch {
      return null
    }
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

// ---------- 错误消息映射（用户友好英文） ----------
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
