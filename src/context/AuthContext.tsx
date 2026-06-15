'use client'

/* ============================================================
  【认证系统】AuthContext.tsx — 全局认证上下文
  ------------------------------------------------------------
  文件用途：用户登录/注册/登出的完整状态管理
  - signIn: 邮箱+密码登录
  - signUp: 邮箱+密码注册
  - signInWithGoogle / signInWithFacebook: OAuth 登录
  - signOut: 登出
  - getToken: 获取 JWT Token（用于 API 认证）
  - 错误消息已本地化（不再显示原始 Supabase 技术错误）
  ============================================================ */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
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
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to fetch profile:', error)
        return
      }
      setProfile(data as UserProfile)
    } catch (err) {
      console.error('Profile fetch error:', err)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    }).catch(() => {
      // Supabase not configured — treat as signed out
      setUser(null)
      setProfile(null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Map raw Supabase errors to user-friendly messages
      if (error.message.includes('Invalid API key') || error.message.includes('api_key'))
        return { error: 'Authentication service is temporarily unavailable. Please try again later.' }
      if (error.message.includes('Invalid login credentials') || error.message === 'Invalid email or password')
        return { error: 'Invalid email or password. Please check and try again.' }
      if (error.message.includes('Email not confirmed'))
        return { error: 'Please confirm your email before signing in.' }
      if (error.message.includes('password'))
        return { error: 'Invalid email or password combination.' }
      // Generic fallback for other errors
      return { error: error.message.length > 80 ? 'Sign in failed. Please try again.' : error.message }
    }
    return { error: null }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
      },
    })
    if (error) {
      // Map raw Supabase errors to user-friendly messages
      if (error.message.includes('Invalid API key') || error.message.includes('api_key'))
        return { error: 'Authentication service is temporarily unavailable. Please try again later.' }
      if (error.message.includes('already registered') || error.message.includes('already been registered'))
        return { error: 'This email is already registered. Please sign in instead.' }
      if (error.message.includes('password') || error.message.includes('Password'))
        return { error: 'Password must be at least 6 characters.' }
      // Generic fallback for other errors
      return { error: error.message.length > 80 ? 'Registration failed. Please try again.' : error.message }
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/community`,
      },
    })
  }

  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/community`,
      },
    })
  }

  const getToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signInWithGoogle, signInWithFacebook, signOut, refreshProfile, getToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
