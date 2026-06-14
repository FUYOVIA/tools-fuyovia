import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'email-copy')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { productName, goal, emailType, audience } = body

    if (!goal || goal.trim().length < 5) {
      return NextResponse.json({ error: 'Please describe the email goal (at least 5 characters)' }, { status: 400 })
    }

    const typeGuide: Record<string, string> = {
      welcome: `WELCOME EMAIL - Send immediately after signup. Goal: reduce buyer's remorse, set expectations, deliver quick win.
- Subject: warm, not salesy. "Welcome to [Brand]" or "Your [X] journey starts here"
- Structure: Welcome → Quick win (what they can do first) → Set expectation (what emails to expect) → Soft CTA
- Tone: warm, personal (use "I" or "we" not "the team"), no hard sell
- Length: 150-250 words ideal`,

      promotional: `PROMOTIONAL EMAIL - Drive sales for a specific offer.
- Subject: curiosity or clear benefit (avoid "50% OFF" spam triggers). Test: question vs. benefit vs. curiosity
- Structure: Hook (why now?) → Offer details (clear, specific) → Social proof → Urgency (limited time/quantity) → Clear CTA button
- Avoid: "Act now", "Limited time", "Don't miss out" (spam triggers)
- Length: 200-350 words, scannable`,

      newsletter: `NEWSLETTER - Nurture sequence, share value, stay top-of-mind.
- Subject: tease the value inside, not clickbait. "5 ways to [benefit]", "This week: [insight]"
- Structure: Personal intro/observation → 2-3 valuable content pieces (not all about you) → Soft CTA (reply, read more, try something)
- Tone: like an email from a smart friend, not a brand
- Length: 300-500 words, or 150-200 for "short and sweet"`,

      followup: `FOLLOW-UP EMAIL - Re-engage non-buyers or post-purchase.
- For non-buyers: "Did you get stuck?" / "Here's what others did" / "Special offer to help you decide"
- For post-purchase: "How is it?" / "You might also like" / "Quick tip for [product]"
- Subject: reference their action (or lack of). "Still thinking about [product]?" / "Quick question"
- Tone: helpful, low-pressure
- Length: 100-200 words, very focused`,
    }

    const selectedType = emailType && typeGuide[emailType] ? emailType : 'promotional'
    const systemPrompt = `You are an expert email copywriter who writes emails that get opened, read, and clicked.

This is a ${selectedType.toUpperCase()} email.

Guidelines for ALL emails:
- Subject line: Write 3 options (ranked best to ok). Keep under 50 chars for mobile. Avoid spam triggers (ALL CAPS, excessive punctuation, "FREE", "Buy now")
- Preview text: Write a compelling 40-90 char preview (shows after subject in inbox)
- Mobile-first: 50% of emails opened on mobile. Short paragraphs (1-2 sentences). CTA button, not tiny text link
- One clear goal per email (don't ask for 3 things)
- Personalization tokens: use [Name], [Product], [Date] where appropriate

Specific requirements for this email type:
${typeGuide[selectedType] || typeGuide.promotional}

Output format:
SUBJECT LINE OPTIONS:
1. [option 1 - best]
2. [option 2]
3. [option 3]

PREVIEW TEXT: [preview text]

EMAIL BODY:
[Full email in Markdown]

Key: Write emails people actually want to open. Not "marketing emails." Conversations.`

    const productStr = productName || 'the product/service being promoted'
    const audienceStr = audience || 'infer the likely audience from the goal'
    const userPrompt = `Write a ${selectedType} email.

Context:
- Goal: ${goal}
- Product/service: ${productStr}
- Target audience: ${audienceStr}

Make it genuinely useful or interesting to receive. Not spam.`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.75, 1500)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'email-copy')

    return NextResponse.json({
      success: true,
      data: result.content,
      emailType: selectedType,
    })

  } catch (error) {
    console.error('Email Copy Writer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Email Copy Writer API is running' })
}
