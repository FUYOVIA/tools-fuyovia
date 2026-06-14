import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, generateImage } from '@/lib/api-helpers'

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

    // Kolors supports: 1024x1024, 768x1344, 864x1152, 1344x768, 1152x864
    const sizeMap: Record<string, string> = {
      '1024x1024': '1024x1024',
      '1024x1792': '768x1344',
      '1792x1024': '1344x768',
    }
    const selectedSize = sizeMap[size] || '1024x1024'

    const result = await generateImage(enhancedPrompt, 'Kwai-Kolors/Kolors', selectedSize)

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'ai-image-generator')

    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      revisedPrompt: result.revisedPrompt,
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
