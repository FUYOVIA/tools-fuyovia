import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'seo-blog-writer')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { topic, keywords, length } = body

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide a blog topic (at least 3 characters)' }, { status: 400 })
    }

    const lengthMap: Record<string, string> = {
      short: '800-1200 words',
      medium: '1500-2000 words',
      long: '2500-3500 words',
    }
    const targetLength = lengthMap[length] || lengthMap.medium

    const systemPrompt = `You are an expert SEO content writer who creates publish-ready blog posts that rank on Google.

Your blog posts MUST include:

1. **Compelling H1 title** - Include the primary keyword near the beginning. Make it click-worthy (8-12 words).

2. **Meta description** - Write a 150-160 character meta description that includes the keyword and drives clicks. Put this at the very top labeled "META DESCRIPTION:".

3. **Proper heading structure**:
   - H1: One only, the title
   - H2: 4-6 main sections
   - H3: 2-3 sub-sections under each H2
   - Use keywords naturally in headings

4. **SEO-optimized body**:
   - Keyword density: 0.5-1.5% (don't stuff)
   - Include related keywords (LSI) naturally
   - Internal linking suggestions in [brackets like this]
   - External authority link suggestions in {curly brackets like this}
   - First 100 words must hook the reader AND include primary keyword
   - Use short paragraphs (2-3 sentences max) for online readability

5. **Engagement elements**:
   - One original insight or actionable tip per section
   - A compelling conclusion with a clear CTA
   - FAQ section at the end (3-5 questions people actually ask)

6. **Formatting**:
   - Use **bold** for important points (not too much)
   - Use bullet points for lists
   - Include a "Key Takeaways" box at the top

Tone: Authoritative but accessible. Write like a top-tier industry publication.

Output the full blog post in Markdown format. Start with the meta description, then the H1 title, then the body.`

    const keywordsStr = keywords || 'research and include relevant keywords for this topic'
    const userPrompt = `Write a comprehensive, SEO-optimized blog post about: "${topic}"

Target keywords to include: ${keywordsStr}
Target length: ${targetLength}

Make this post genuinely valuable - not fluff, but actual insights a reader would bookmark and share. Include data points, examples, or frameworks where relevant.`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o', 0.7, 4000)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'seo-blog-writer')

    return NextResponse.json({
      success: true,
      data: result.content,
      topic,
      keywords: keywordsStr,
    })

  } catch (error) {
    console.error('SEO Blog Writer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'SEO Blog Writer API is running' })
}
