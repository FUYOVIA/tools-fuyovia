import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'readability-optimizer')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { text, targetAudience } = body

    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: 'Please provide text to optimize (at least 30 characters)' }, { status: 400 })
    }

    const audienceGuide: Record<string, string> = {
      general: `GENERAL AUDIENCE (8th-10th grade reading level)
- Target: Average adult readers, broad audience content
- Sentence length: 15-20 words average
- Vocab: Common words, avoid jargon unless explained
- Structure: Short paragraphs (2-3 sentences), clear transitions
- Goal: Easy to skim on mobile, accessible to non-native speakers`,

      academic: `ACADEMIC/TECHNICAL AUDIENCE (college+ reading level)
- Target: Researchers, professionals, technically literate readers
- Allow: Complex sentences, domain-specific terminology
- Structure: Logical flow with clear section breaks
- Goal: Precision and completeness over simplicity
- Note: Keep it clear, but don't oversimplify concepts`,

      business: `BUSINESS PROFESSIONAL AUDIENCE (10th-12th grade reading level)
- Target: Managers, entrepreneurs, business professionals
- Sentence length: 18-22 words average
- Vocab: Business terms OK, but explain unusual ones
- Structure: Executive summary style, scannable with bullets
- Goal: Respectful of busy readers' time, get to the point`,

      children: `CHILDREN/YOUNG ADULT AUDIENCE (5th-8th grade reading level)
- Target: Ages 10-16, or adult content for young readers
- Sentence length: 10-15 words average
- Vocab: Simple, concrete words. No idioms without explanation
- Structure: Very short paragraphs, lots of visual breaks
- Goal: Fun and engaging, not "textbook boring"`,
    }

    const selectedAudience = targetAudience && audienceGuide[targetAudience] ? targetAudience : 'general'

    const systemPrompt = `You are an expert writing editor who improves readability without losing meaning or nuance.

${audienceGuide[selectedAudience] || audienceGuide.general}

Your optimization process:
1. **Identify complex sentences** - Flag sentences with 25+ words or 3+ clauses. Rewrite them by splitting or simplifying structure
2. **Replace difficult words** - Swap obscure vocab for clearer alternatives (but keep precision)
3. **Improve transitions** - Add sublte connectors between ideas. Remove abrupt jumps
4. **Fix passive voice** - Convert to active voice where it doesn't change meaning
5. **Add clarity cues** - Use "for example", "in other words", "specifically" to signal explanations
6. **PRESERVE** - Technical terms (if audience expects them), proper nouns, core arguments, tone (formal → stay formal, casual → stay casual)

Output format:
## Optimized Text
[Full rewritten text]

## Key Improvements Made
- [specific change 1: "Changed X to Y because..."]
- [specific change 2]
...

## Readability Metrics (estimated)
- Original: ~X grade level, ~Y words/sentence
- Optimized: ~X grade level, ~Y words/sentence
- Reading time: X minutes

Do NOT over-simplify. The goal is "clear and engaging", not "written for a 5-year-old".`

    const userPrompt = `Improve the readability of this text for a ${selectedAudience} audience.

Text to optimize:
"${text}"

Make it significantly easier to read while keeping ALL original meaning intact. If something is already clear, leave it alone - only change what needs improvement.`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.5, 3000)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'readability-optimizer')

    return NextResponse.json({
      success: true,
      data: result.content,
      originalLength: text.length,
      targetAudience: selectedAudience,
    })

  } catch (error) {
    console.error('Readability Optimizer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Readability Optimizer API is running' })
}
