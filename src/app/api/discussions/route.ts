{/* ============================================================
  【社区API】route.ts — 讨论区 API 路由（GET + POST）
  ------------------------------------------------------------
  文件用途：/api/discussions 接口的服务器端逻辑
  - GET：获取讨论列表（支持分类/排序/分页/搜索）
  - POST：创建新讨论（需要登录）

  对应的前端组件：CommunityClient.tsx
  最后更新：2026-06-15
  ============================================================ */}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Graceful: if no Supabase config, return empty data (frontend will use seed data)
const supabase = (!supabaseUrl || supabaseUrl.includes('placeholder'))
  ? null
  : createClient(supabaseUrl, supabaseAnonKey!)

export async function GET(request: NextRequest) {
  try {
    // No Supabase configured — return empty so frontend uses seed data
    if (!supabase) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const sort = searchParams.get('sort') || 'latest'
    const search = searchParams.get('search') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('discussions')
      .select('*', { count: 'exact' })
      .order(sort === 'popular' ? 'votes_count' : 'created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Discussions fetch error:', error)
      // Graceful fallback: return empty data → frontend shows seed discussions
      return NextResponse.json({ success: true, data: [], total: 0 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
    })
  } catch (err) {
    console.error('Discussions API error:', err)
    // Graceful fallback: return empty data → frontend shows seed discussions
    return NextResponse.json({ success: true, data: [], total: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
    }

    const body = await request.json()
    const { title, content, category, author_id, author_name, author_avatar } = body

    if (!title?.trim() || !content?.trim() || !author_id) {
      return NextResponse.json(
        { success: false, error: 'Title, content, and author are required' },
        { status: 400 }
      )
    }

    // Verify user has a valid session
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 })
    }

    if (user.id !== author_id) {
      return NextResponse.json({ success: false, error: 'User ID mismatch' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('discussions')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category: category || 'general',
        author_id: user.id,
        author_name: author_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        author_avatar: author_avatar || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        status: 'open',
        votes_count: 0,
        comments_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Discussion create error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create discussion' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Create discussion error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
