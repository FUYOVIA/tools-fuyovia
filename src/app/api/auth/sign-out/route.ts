/* ============================================================
  【认证代理】登出 — /api/auth/sign-out
  ============================================================ */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ success: true })
    }

    const body = await request.json().catch(() => ({}))
    const { accessToken } = body

    if (accessToken) {
      // 用用户的 token 来登出（服务端无状态，不需要这么做，但保持一致）
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      await supabase.auth.admin.signOut(accessToken).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
