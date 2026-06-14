import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'social-media-writer')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { text, platform } = body

    if (!text || text.trim().length < 5) {
      return NextResponse.json({ error: 'Please provide a topic or content description (at least 5 characters)' }, { status: 400 })
    }

    const validPlatforms = ['instagram', 'tiktok', 'linkedin', 'twitter']
    const selectedPlatform = platform && validPlatforms.includes(platform) ? platform : 'instagram'

    const platformPrompts: Record<string, string> = {
      instagram: `You are creating an Instagram caption. Instagram users respond to authentic storytelling, relatable moments, and visually descriptive language.

Requirements:
- Write a compelling caption (150-220 words) that tells a story or shares a genuine insight
- Include 3-5 relevant emojis placed naturally (not at every sentence)
- End with a question or CTA to drive comments (Instagram's algorithm prioritizes conversations)
- Add 25-30 hashtags in a separate block below (mix of: 5 broad popular tags, 15 niche-specific, 5 branded/unique)
- Tone: warm, authentic, slightly aspirational but relatable
- Include line breaks for readability (Instagram users skim)

Hashtag strategy: Mix high-volume (#motivation, #lifestyle) with niche tags specific to the content. NO banned or spammy tags.`,

      tiktok: `You are creating a TikTok video concept + caption. TikTok success depends on the hook, trend alignment, and authenticity.

Requirements:
- Write a short, punchy caption (100-150 characters ideal, max 300)
- Start with the core hook idea (the first 3 seconds that make people stop scrolling)
- Suggest 1-2 trending sounds or effects that would fit this content
- Include 3-5 targeted hashtags (#fyp #foryou is enough, don't overdo it)
- Add a clear CTA: "follow for more", "comment if...", or "share if you agree"
- Tone: conversational, trend-aware, gen-Z friendly but not forced
- Include a "video concept" section: what should happen in the first 5 seconds?

Key: TikTok users value authenticity over polish. Suggest imperfect, relatable content ideas.`,

      linkedin: `You are creating a LinkedIn post for professionals. LinkedIn users value insight, expertise, and authentic professional growth content.

Requirements:
- Write a thoughtful post (200-400 words) that shares genuine insight, experience, or a lesson learned
- Start with a hook that makes professionals stop scrolling (a counterintuitive insight, a vulnerable confession, or a surprising stat)
- Use formatting for readability: short paragraphs (1-2 sentences each), bullet points for lists
- Include 3-5 professional hashtags (#leadership #marketing #careers)
- End with a question that sparks professional discussion
- Tone: authoritative but humble, insightful, no "bro marketing"
- NO clickbait, NO "I'm humbled to announce", NO excessive self-promotion
- If sharing a win, focus on the lesson/process, not just the achievement

Important: LinkedIn values substance over virality. Write like a thought leader, not a marketer.`,

      twitter: `You are creating a Twitter/X post. Twitter users value wit, brevity, and real-time relevance.

Requirements:
- Write a concise, engaging tweet (max 280 characters, ideally under 200)
- Lead with the most interesting/provocative/useful part
- Use 1-2 emojis max (Twitter users dislike emoji overload)
- Include 1-2 targeted hashtags only if truly relevant
- If the content warrants, suggest a thread structure (Tweet 1/5, 2/5, etc.)
- Add a subtle CTA: retweet if..., reply with..., or a thoughtful question
- Tone: witty, insightful, or usefully controversial (not rage-bait)
- NO "Please RT", NO "Like if you agree", NO long threads for simple ideas

Key: Twitter rewards replies and retweets. Write to spark conversation, not just broadcast.`,
    }

    const systemPrompt = platformPrompts[selectedPlatform] || platformPrompts.instagram
    const userPrompt = `Create a ${selectedPlatform} post about: ${text}\n\nIf you have specific goals (drive traffic, sell something, build audience), mention them. Otherwise, create the best possible post for this topic.`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.85, 1500)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'social-media-writer')

    return NextResponse.json({
      success: true,
      data: result.content,
      platform: selectedPlatform,
    })

  } catch (error) {
    console.error('Social Media Writer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Social Media Writer API is running' })
}
