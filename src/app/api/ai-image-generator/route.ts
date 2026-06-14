import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'ai-image-generator')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { prompt, style, size, mood } = body

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide an image description (at least 3 characters)' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || apiKey === 'sk-placeholder') {
      return NextResponse.json({ error: 'AI Image API not configured. Please set OPENAI_API_KEY in .env.local' }, { status: 500 })
    }

    // Build enhanced prompt based on style and mood
    const styleEnhancements: Record<string, string> = {
      realistic: `Photorealistic, high-quality professional photography. Sharp focus, natural lighting, realistic textures. DSLR quality, 8K resolution.`,
      illustration: `Beautiful digital illustration. Clean lines, vibrant colors, artistic style. Commercial illustration quality, trending on Dribbble.`,
      'digital-art': `Modern digital art. Detailed, atmospheric, visually stunning. Concept art style, Unreal Engine 5 render quality.`,
      'pixel-art': `Retro pixel art style. 16-bit aesthetic, nostalgic video game art. Clean pixel edges, limited but vibrant color palette.`,
    }

    const moodEnhancements: Record<string, string> = {
      bright: 'Bright, cheerful, vibrant colors, sunny atmosphere.',
      dark: 'Dark, moody, dramatic lighting, cinematic atmosphere.',
      warm: 'Warm color palette, cozy atmosphere, golden hour lighting.',
      cool: 'Cool color palette, calm atmosphere, blue/green tones.',
      neutral: 'Balanced, natural colors, clean and minimal.',
    }

    const selectedStyle = style && styleEnhancements[style] ? style : 'realistic'
    const selectedMood = mood && moodEnhancements[mood] ? mood : 'neutral'

    const enhancedPrompt = `${styleEnhancements[selectedStyle]}

Subject/Scene: ${prompt}

Mood/Atmosphere: ${moodEnhancements[selectedMood]}

Quality: Masterpiece quality, highly detailed, professional composition, rule of thirds. NO text, NO watermarks, NO blurry, NO distorted.`

    const sizeMap: Record<string, string> = {
      '1024x1024': '1024x1024',
      '1024x1792': '1024x1792',
      '1792x1024': '1792x1024',
    }
    const selectedSize = sizeMap[size] || '1024x1024'

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: selectedSize,
        quality: 'standard',
        style: 'natural',
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return NextResponse.json(
        { error: `Image generation failed: ${err.error?.message || 'Unknown error'}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url
    const revisedPrompt = data.data?.[0]?.revised_prompt

    if (!imageUrl) {
      return NextResponse.json({ error: 'Failed to generate image - no URL returned' }, { status: 500 })
    }

    await deductCredits(auth.userId, 'ai-image-generator')

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt,
      prompt: enhancedPrompt,
      style: selectedStyle,
      size: selectedSize,
    })

  } catch (error) {
    console.error('AI Image Generator error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'AI Image Generator API is running' })
}
