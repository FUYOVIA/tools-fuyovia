/* ============================================================
  【认证代理】获取 session — /api/auth/session
  ------------------------------------------------------------
  用途：页面加载时，如果直连 Supabase 超时，
  通过此代理获取当前 session（基于 cookie 中的 refresh_token）
  ============================================================ */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: false, session: null })
    }

    // 尝试从 cookie 中获取 Supabase 的 refresh token
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Supabase 存储的 cookie 格式：sb-<project-ref>-auth-token
    const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
    const authCookieName = `sb-${projectRef}-auth-token`

    let refreshToken: string | null = null

    // 查找 auth cookie
    for (const cookie of allCookies) {
      if (cookie.name === authCookieName || cookie.name.includes('auth-token')) {
        try {
          const parsed = JSON.parse(decodeURIComponent(cookie.value))
          refreshToken = parsed.refresh_token || null
          break
        } catch {
          // cookie 格式不匹配，跳过
        }
      }
    }

    if (!refreshToken) {
      return NextResponse.json({ success: false, session: null })
    }

    // 用 refresh_token 换取新 session
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (error || !data.session) {
      return NextResponse.json({ success: false, session: null })
    }

    return NextResponse.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.session.user,
      },
    })
  } catch {
    return NextResponse.json({ success: false, session: null })
  }
}
