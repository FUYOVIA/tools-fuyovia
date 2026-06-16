/* ============================================================
  【认证代理】注册 — /api/auth/sign-up
  ------------------------------------------------------------
  用途：中国网络被墙时，前端通过 Vercel 服务端代理访问 Supabase
  流程：浏览器 → /api/auth/sign-up → Vercel(海外) → Supabase
  返回：session 信息（access_token, refresh_token, user）
  ============================================================ */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Authentication service is not configured.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password, displayName } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // 服务端调用 Supabase（Vercel 在海外，不受中国防火墙影响）
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName || '' } },
    })

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    // 返回 session 信息，前端可以用来恢复登录状态
    return NextResponse.json({
      success: true,
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        user: data.session.user,
      } : null,
      user: data.user,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}
