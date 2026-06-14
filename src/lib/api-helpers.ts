import { NextRequest, NextResponse } from 'next/server'

// Tool credit costs mapping
export const TOOL_CREDITS: Record<string, number> = {
  'ai-humanizer': 2,
  'social-media-writer': 1,
  'product-description': 1,
  'email-copy': 1,
  'seo-blog-writer': 3,
  'video-script': 2,
  'ai-image-generator': 5,
  'hashtag-generator': 1,
  'resume-optimizer': 2,
  'readability-optimizer': 1,
}

// Check if Supabase is configured
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder')

interface AuthResult {
  userId: string
  credits: number
  plan: string
  error?: string
  status?: number
}

/**
 * Authenticate user from request and check credits.
 * When Supabase is not configured, allows free trial mode.
 */
export async function authenticateAndCheckCredits(
  request: NextRequest,
  toolId: string
): Promise<AuthResult> {
  // Free trial mode: no auth required when Supabase isn't configured
  if (!isSupabaseConfigured) {
    return {
      userId: 'free-trial',
      credits: 999,
      plan: 'free-trial',
    }
  }

  // Production mode: require authentication
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { userId: '', credits: 0, plan: 'free', error: 'Authentication required', status: 401 }
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return { userId: '', credits: 0, plan: 'free', error: 'Invalid or expired token', status: 401 }
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits, plan')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { userId: user.id, credits: 0, plan: 'free', error: 'User profile not found', status: 404 }
    }

    const requiredCredits = TOOL_CREDITS[toolId] || 1
    if (profile.credits < requiredCredits) {
      return {
        userId: user.id,
        credits: profile.credits,
        plan: profile.plan,
        error: `Insufficient credits. You need ${requiredCredits} credits but have ${profile.credits}.`,
        status: 402,
      }
    }

    return { userId: user.id, credits: profile.credits, plan: profile.plan }
  } catch (error) {
    console.error('Auth error:', error)
    // Fallback to free trial on error
    return { userId: 'free-trial', credits: 999, plan: 'free-trial' }
  }
}

/**
 * Deduct credits after a successful tool use.
 * Skips deduction in free trial mode.
 */
export async function deductCredits(
  userId: string,
  toolId: string,
  inputLength?: number,
  outputLength?: number
): Promise<boolean> {
  // Skip in free trial mode
  if (userId === 'free-trial') {
    console.log(`[Free Trial] Tool used: ${toolId}`)
    return true
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const creditsRequired = TOOL_CREDITS[toolId] || 1

    const { data: success, error } = await supabase.rpc('deduct_credits', {
      p_user_id: userId,
      p_amount: creditsRequired,
    })

    if (error || !success) {
      console.error('Failed to deduct credits:', error)
      return false
    }

    await supabase.from('tool_usage').insert({
      user_id: userId,
      tool_id: toolId,
      tool_type: 'premium',
      credits_used: creditsRequired,
      input_length: inputLength || null,
      output_length: outputLength || null,
    })

    return true
  } catch (error) {
    console.error('Deduction error:', error)
    return false
  }
}

/**
 * Call OpenAI API with consistent error handling.
 */
export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  model: string = 'gpt-4o-mini',
  temperature: number = 0.7,
  maxTokens: number = 2000
): Promise<{ content: string; usage?: Record<string, number> } | { error: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'sk-placeholder') {
    return { error: 'AI API not configured. Please contact support.' }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return { error: `AI API error: ${err.error?.message || 'Unknown error'}` }
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
    }
  } catch (err) {
    console.error('OpenAI API call failed:', err)
    return { error: 'Failed to call AI API. Please try again.' }
  }
}
