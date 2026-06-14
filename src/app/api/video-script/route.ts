import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'video-script')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { topic, platform, duration } = body

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide a video topic' }, { status: 400 })
    }

    const platformGuide: Record<string, string> = {
      youtube: `YOUUBE SCRIPT (long-form, 8-20 minutes)
- Hook (0:00-0:45): Pattern interrupt + promise + preview
- Intro: Branded but quick (under 30s), subscribe nudge early
- Sections: 3-5 main chapters, each with a clear point + B-rol suggestion
- Retention tricks: "But before we get into that..." (curiosity loops), visual variety every 5-8s
- CTA: "Subscribe", "Comment below", "Watch this next" (end screen)
- Include timestamp suggestions for chapters
- Tone: Educational entertainment, authoritative but accessible`,

      tiktok: `TIKTOK SCRIPT (15s-3min, optimize for 15-60s)
- Hook (0:00-0:03): Visual + verbal pattern interrupt. Show the outcome or ask a provocative question in first 2 seconds
- Body: Fast-paced, one point per 5-10 seconds. Use "text overlay" cues
- Ending: CTA for comment/follow, or loop back to hook for replay
- Platform tactics: Use trending sounds reference, Green screen effect suggestion, Duet/Stitch potential
- Include: [Visual: ...] and [Text overlay: ...] cues for every section
- Tone: Authentic, conversational, slightly aspirational`,

      'instagram-reels': `INSTAGRAM REELS SCRIPT (15-90s, optimize for 15-30s)
- Hook: Show the most visual moment in first 2 seconds (before text even appears)
- Structure: Hook → Quick value/insight → CTA
- Visual variety: Cut every 2-3 seconds (Reels algorithm prefers this)
- Text overlay: Minimal, branded font, appears 1-2 seconds after the visual
- Audio: Use trending audio OR original audio with captions
- CTA: "Save this post", "Share to stories", or "Follow for more"
- Tone: Aesthetic, aspirational, lifestyle-focused`,
    }

    const selectedPlatform = platform && platformGuide[platform] ? platform : 'youtube'
    const durationGuide = duration || 'medium'

    const systemPrompt = `You are an expert video script writer who creates scripts that retain viewers and drive engagement.

${platformGuide[selectedPlatform] || platformGuide.youtube}

General principles for ALL video scripts:
- Every script needs a strong HOOK (first 3-5 seconds determine 60% of retention)
- Use the "BBB" structure: Bridge (familiar) → Body (new value) → Bridge (back to familiar + CTA)
- Write VISUAL descriptions in [brackets] - what the viewer sees
- Write AUDIO/SPOKEN text in plain text - what the creator says
- Include "retention notes" - specific moments to change camera angle, add B-rol, or use a sound effect
- For longer videos: include chapter markers with timestamps
- For short videos: include "loop potential" notes (how to make viewers watch twice)

Output format:
=== HOOK (0:00-0:XX) ===
[Visual: ...]
Spoken: "..."

=== SECTION 1: [Title] (0:XX-0:XX) ===
[Visual: ...]
Spoken: "..."
Retention note: ...

=== CTA (0:XX-end) ===
[Visual: ...]
Spoken: "..."
`

    const userPrompt = `Write a video script for: "${topic}"

Platform: ${selectedPlatform}
Target duration: ${durationGuide} (short: under 60s, medium: 2-8min, long: 10min+)

Include specific visual directions, spoken text, and retention tactics. Make it actually producible (not just a list of ideas).`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.8, 3000)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'video-script')

    return NextResponse.json({
      success: true,
      data: result.content,
      platform: selectedPlatform,
    })

  } catch (error) {
    console.error('Video Script Writer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Video Script Writer API is running' })
}
