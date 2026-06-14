import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'product-description')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { productName, features, audience, tone } = body

    if (!productName || productName.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide a product name' }, { status: 400 })
    }

    const toneGuide: Record<string, string> = {
      professional: 'professional, authoritative, premium-feeling',
      casual: 'friendly, conversational, approachable',
      luxury: 'sophisticated, exclusive, aspirationl',
      playful: 'fun, energetic, brand-with-personality',
      minimal: 'clean, direct, no-nonse',
    }
    const selectedTone = tone && toneGuide[tone] ? tone : 'professional'

    const systemPrompt = `You are an expert e-commerce copywriter who writes product descriptions that convert browsers into buyers.

A great product description:
- Leads with the MOST compelling benefit (not just features)
- Uses sensory words (for physical products: how it feels, smells, looks, sounds)
- Addresses the "What's in it for me?" question immediately
- Uses social proof language ("Join 10,000+ happy customers")
- Handles objections subtly within the description
- Ends with a clear, low-friction CTA

Structure to follow:
1. **Headline** - Benefit-focused, not just product name (e.g., "Quinoa Power Bowl - Sustained Energy for Busy Mornings" → "The Travel Mug That Keeps Coffee Hot for 12 Hours")
2. **Opening hook** - One sentence that identifies the core pain point
3. **Benefit bulletes** (3-5 key benefits, each with a micro-outcome)
4. **Sensory/technical details** - What it's like to use
5. **Social proof nudge** - "Why 10K+ customers love it"
6. **CTA** - Clear next step (not just "Buy Now")

Tone for this request: ${selectedTone}

${toneGuide[tone] || toneGuide.professional}

Output in Markdown. Write for an English-speaking audience (US/SE Asia).`

    const featuresStr = features || 'infer appropriate features based on product name'
    const audienceStr = audience || 'infer the most likely target audience'

    const userPrompt = `Write a conversion-focused product description for:

Product: ${productName}
Key features: ${featuresStr}
Target audience: ${audienceStr}

Include: compelling headline, 3-5 benefit bullets, sensory details, and a clear CTA. Make it scannable (online shoppers scan, they don't read).`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.7, 1200)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'product-description')

    return NextResponse.json({
      success: true,
      data: result.content,
      productName,
    })

  } catch (error) {
    console.error('Product Description Writer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Product Description Writer API is running' })
}
