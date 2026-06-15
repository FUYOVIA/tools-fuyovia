{/* ============================================================
  【社区API】route.ts — 投票 API 路由（POST）
  ------------------------------------------------------------
  文件用途：/api/vote 接口的服务器端逻辑
  - POST：点赞/取消点赞讨论（toggle 逻辑）
  - 原子操作：防止并发导致票数错误

  对应的前端组件：CommunityClient.tsx
  最后更新：2026-06-15
  ============================================================ */}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { discussion_id, user_id } = body

    if (!discussion_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Discussion ID and user ID are required' },
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
    if (authError || !user || user.id !== user_id) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 })
    }

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('discussion_id', discussion_id)
      .eq('user_id', user_id)
      .single()

    if (existingVote) {
      // Unvote (toggle off)
      await supabase.from('votes').delete().eq('id', existingVote.id)

      const { data } = await supabase.rpc('decrement_votes_count', { disc_id: discussion_id })

      return NextResponse.json({ success: true, voted: false, votes_count: data || 0 })
    } else {
      // Vote (toggle on)
      await supabase.from('votes').insert({
        discussion_id,
        user_id: user.id,
      })

      const { data } = await supabase.rpc('increment_votes_count', { disc_id: discussion_id })

      return NextResponse.json({ success: true, voted: true, votes_count: data || 0 })
    }
  } catch (err) {
    console.error('Vote error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
