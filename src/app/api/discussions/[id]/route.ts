{/* ============================================================
  【社区API】route.ts — 单条讨论 API 路由（GET/PUT/DELETE）
  ------------------------------------------------------------
  文件用途：/api/discussions/[id] 接口的服务器端逻辑
  - GET：获取讨论详情 + 评论列表
  - PUT：编辑讨论（仅作者）
  - DELETE：删除讨论（仅作者）

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })
    }
    const { id } = await params

    const { data, error } = await supabase
      .from('discussions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'Discussion not found' }, { status: 404 })
    }

    // Increment view count
    await supabase
      .from('discussions')
      .update({ views_count: (data.views_count || 0) + 1 })
      .eq('id', id)

    // Fetch comments for this discussion
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('discussion_id', id)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      success: true,
      data: { ...data, views_count: (data.views_count || 0) + 1 },
      comments: comments || [],
    })
  } catch (err) {
    console.error('Get discussion error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
    }
    const { id } = await params
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })
    }

    // Check ownership or admin role
    const { data: existing } = await supabase
      .from('discussions')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existing || existing.author_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to edit this discussion' }, { status: 403 })
    }

    // Only allow updating title, content, category, status (for admin)
    const updates: Record<string, unknown> = {}
    if (body.title !== undefined) updates.title = body.title.trim()
    if (body.content !== undefined) updates.content = body.content.trim()
    if (body.category !== undefined) updates.category = body.category
    if (body.status !== undefined) updates.status = body.status

    const { data, error } = await supabase
      .from('discussions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to update discussion' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Update discussion error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 503 })
    }
    const { id } = await params
    const authHeader = request.headers.get('Authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })
    }

    // Check ownership
    const { data: existing } = await supabase
      .from('discussions')
      .select('author_id')
      .eq('id', id)
      .single()

    if (!existing || existing.author_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Not authorized to delete this discussion' }, { status: 403 })
    }

    // Delete comments first (cascade), then the discussion
    await supabase.from('comments').delete().eq('discussion_id', id)
    const { error } = await supabase.from('discussions').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete discussion' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete discussion error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
