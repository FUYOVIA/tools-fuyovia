{/* ============================================================
  【社区API】route.ts — 评论 API 路由（GET + POST）
  ------------------------------------------------------------
  文件用途：/api/comments 接口的服务器端逻辑
  - GET：获取某讨论下的所有评论（按 discussion_id 筛选）
  - POST：添加新评论（需要登录）

  对应的前端组件：CommunityClient.tsx
  最后更新：2026-06-15
  ============================================================ */}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = (!supabaseUrl || supabaseUrl.includes('placeholder'))
  ? null
  : createClient(supabaseUrl, supabaseAnonKey!)

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: true, data: [], total: 0 })
    }
    const { searchParams } = new URL(request.url)
    const discussionId = searchParams.get('discussion_id')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!discussionId) {
      return NextResponse.json({ success: false, error: 'discussion_id is required' }, { status: 400 })
    }

    const { data, error, count } = await supabase
      .from('comments')
      .select('*', { count: 'exact' })
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Comments fetch error:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch comments' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
    })
  } catch (err) {
    console.error('Comments API error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
    }
    const body = await request.json()
    const { discussion_id, content, author_id, author_name, author_avatar } = body

    if (!discussion_id || !content?.trim() || !author_id) {
      return NextResponse.json(
        { success: false, error: 'Discussion ID, content, and author are required' },
        { status: 400 }
      )
    }

    // Auth check
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user || user.id !== author_id) {
      return NextResponse.json({ success: false, error: 'Invalid session or user mismatch' }, { status: 401 })
    }

    // Verify the discussion exists
    const { data: discussion, error: discError } = await supabase
      .from('discussions')
      .select('id')
      .eq('id', discussion_id)
      .single()

    if (discError || !discussion) {
      return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })
    }

    // Create comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        discussion_id,
        content: content.trim(),
        author_id: user.id,
        author_name: author_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        author_avatar: author_avatar || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Comment create error:', error)
      return NextResponse.json({ success: false, error: 'Failed to create comment' }, { status: 500 })
    }

    // Update comment count on discussion
    await supabase.rpc('increment_comments_count', { disc_id: discussion_id })

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Create comment error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
