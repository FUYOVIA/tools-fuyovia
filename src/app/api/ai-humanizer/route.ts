import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'ai-humanizer')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { text } = body

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Please provide at least 50 characters of text to humanize' }, { status: 400 })
    }

    const systemPrompt = `You are an expert writing editor who specializes in making AI-generated text indistinguishable from human writing.

Your task: Rewrite the provided text so it sounds completely natural, human, and authentic.

Key principles:
- Vary sentence length and structure naturally (mix short, medium, long sentences)
- Replace overly formal or academic transitions ("Furthermore", "In addition", "It is important to note") with natural alternatives
- Remove repetitive AI patterns: excessive use of em-dashes, perfect parallelism, overly balanced bullet points
- Use contractions naturally (don't → don't, it is → it's) where appropriate
- Add subtle imperfections: occasional sentence fragments, natural hesitations, conversational asides
- Adjust tone to match the content context (casual blog → conversational; business → professional but warm)
- Preserve ALL original meaning, facts, and key points exactly

What to AVOID:
- Do NOT add new facts or claims
- Do NOT change technical terms or proper nouns
- Do NOT make it sound slangy or unprofessional unless the context calls for it
- Do NOT over-humanize (keep it readable and clear)

Output ONLY the humanized text. No explanations, no "Here's the humanized version:", just the rewritten text.`

    const userPrompt = `Humanize this text:\n\n${text}`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.85, 3000)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'ai-humanizer')

    return NextResponse.json({
      success: true,
      data: result.content,
      originalLength: text.length,
      humanizedLength: result.content.length,
    })

  } catch (error) {
    console.error('AI Humanizer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'AI Humanizer API is running' })
}
