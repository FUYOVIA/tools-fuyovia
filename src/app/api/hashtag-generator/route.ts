import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'hashtag-generator')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { content, platform, industry, audience } = body

    if (!content || content.trim().length < 3) {
      return NextResponse.json({ error: 'Please describe your post content (at least 3 characters)' }, { status: 400 })
    }

    const platformGuide: Record<string, string> = {
      instagram: `INSTAGRAM HASHTAG STRATEGY:
- Total: 20-30 hashtags (hide in first comment or caption end)
- Mix: 3-5 broad (1M+ posts), 10-15 niche (50K-500K), 5-10 micro-niche (under 50K)
- Format: Mix in caption AND first comment (algorithm sees both)
- Rotat: Never use the same set twice (Instagram shadowsban repetitive tags)
- Banned check: Avoid tags with "shadowban" reputation in your niche`,

      tiktok: `TIKTOK HASHTAG STRATEGY:
- Total: 3-5 hashtags ONLY (more hurts reach)
- Must include: #fyp (or #foryou) + #fypシ (localized)
- Strategy: 1 broad trending + 2 niche-specific + 1-2 branded
- Avoid: Overused tags like #fyp (everyone uses them, you get lost)
- Better: Niche hashtags where you can realistically rank in Top 10`,

      linkedin: `LINKEDIN HASHTAG STRATEGY:
- Total: 3-5 hashtags (more looks spammy on LinkedIn)
- Strategy: 2-3 broad industry tags + 1-2 niche expertise tags
- Format: Place at the END of the post, not scattered
- Use LinkedIn's own hashtag suggestions (they show follower count)
- Avoid: Generic tags like #business #marketing (too broad to be useful)`,

      twitter: `TWITTER/X HASHTAG STRATEGY:
- Total: 1-2 hashtags MAX (Twitter data shows engagement drops after 2)
- Strategy: Use ONLY when the hashtag is trending or highly specific to the conversation
- Better alternative: Use keywords in the text itself (Twitter search indexes text, not just hashtags)
- Avoid: #MondayMotivation #WednesdayWisdom (engagement bait, low value)`,
    }

    const selectedPlatform = platform && platformGuide[platform] ? platform : 'instagram'

    const systemPrompt = `You are a social media strategist who knows exactly which hashtags drive real reach (not just vanity metrics).

${platformGuide[selectedPlatform] || platformGuide.instagram}

For each hashtag you suggest, briefly note:
- Search volume: High / Medium / Low / Micro
- Competition: High / Medium / Low
- Why it works: One sentence

Also suggest: 2-3 "related hashtags" the user should consider testing in future posts.

Output format:
## Primary Hashtags (use these)
1. #hashtag - Volume: High | Competition: Medium | Why: [reason]

## Secondary Hashtags (test these)
...

## Hashtags to AVOID
... (explain why)

## Strategy Notes
... (2-3 tactical tips for this platform)`

    const industryStr = industry || 'infer from content'
    const audienceStr = audience || 'infer from content'
    const userPrompt = `Generate hashtags for a ${selectedPlatform} post.

Post content/topic: ${content}
Industry/niche: ${industryStr}
Target audience: ${audienceStr}

Focus on hashtags that actually drive discovery, not just ones that look impressive.`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.7, 1500)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'hashtag-generator')

    return NextResponse.json({
      success: true,
      data: result.content,
      platform: selectedPlatform,
    })

  } catch (error) {
    console.error('Hashtag Generator error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Hashtag Generator API is running' })
}
