import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Shoplazza Webhook Handler
 * 
 * Receives "orders/paid" events from Shoplazza store.
 * When a customer buys a course/product with a specific SKU,
 * this webhook unlocks the corresponding AI tools and adds credits.
 * 
 * Setup in Shoplazza Admin:
 * 1. Go to Settings → Notifications → Webhooks
 * 2. Add webhook URL: https://tools.fuyovia.com/api/shoplazza/webhook
 * 3. Select event: "Order payment" (orders/paid)
 * 4. Copy the webhook signing secret to SHOPLAZZA_WEBHOOK_SECRET env var
 */

// SKU → Tool/Credits mapping
// Configure these based on your Shoplazza product SKUs
const SKU_MAPPINGS: Record<string, { tools: string[]; credits: number; plan: string }> = {
  // Example: When user buys "ai-starter-course" SKU on Shoplazza
  'ai-starter-course': {
    tools: ['ai-humanizer', 'social-media-writer', 'hashtag-generator'],
    credits: 100,
    plan: 'starter',
  },
  'ai-pro-course': {
    tools: ['*'], // all tools
    credits: 500,
    plan: 'pro',
  },
  'social-media-bundle': {
    tools: ['social-media-writer', 'hashtag-generator', 'video-script'],
    credits: 200,
    plan: 'starter',
  },
  'seo-bundle': {
    tools: ['seo-blog-writer', 'readability-optimizer', 'meta-tag-generator'],
    credits: 200,
    plan: 'starter',
  },
  // Add more SKU mappings as needed
}

function verifyShoplazzaWebhook(rawBody: string, signature: string, secret: string): boolean {
  // Shoplazza uses HMAC-SHA256 for webhook verification
  const crypto = require('crypto')
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64')
  return signature === expectedSig
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.SHOPLAZZA_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('SHOPLAZZA_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    // Get raw body and verify signature
    const rawBody = await request.text()
    const signature = request.headers.get('x-shoplazza-signature') || 
                     request.headers.get('x-shopify-signature') || ''

    if (!verifyShoplazzaWebhook(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the order
    const order = JSON.parse(rawBody)
    
    // Shoplazza order format (varies, handle both common formats)
    const orderData = order.order || order
    const email = orderData.email || orderData.customer?.email || ''
    const lineItems = orderData.line_items || orderData.items || []

    if (!email) {
      console.error('No email in order data')
      return NextResponse.json({ error: 'No customer email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Find user by email
    const { data: users } = await supabase
      .from('users')
      .select('id, credits, plan')
      .eq('email', email)
      .limit(1)

    if (!users || users.length === 0) {
      console.error(`No user found with email: ${email}`)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = users[0].id
    let totalCreditsToAdd = 0
    let toolsToUnlock: string[] = []
    let bestPlan = users[0].plan || 'free'

    // Process each line item
    for (const item of lineItems) {
      const sku = item.sku || item.product_id?.toString() || ''
      const mapping = SKU_MAPPINGS[sku]

      if (mapping) {
        totalCreditsToAdd += mapping.credits
        if (mapping.tools.includes('*')) {
          toolsToUnlock = ['*'] // all tools
        } else {
          toolsToUnlock = [...toolsToUnlock, ...mapping.tools]
        }
        // Upgrade plan if better
        if (mapping.plan === 'pro' || (mapping.plan === 'starter' && bestPlan === 'free')) {
          bestPlan = mapping.plan
        }
      }
    }

    if (totalCreditsToAdd === 0 && toolsToUnlock.length === 0) {
      return NextResponse.json({ message: 'No matching SKU found, skipping' })
    }

    // Update user credits
    const newCredits = (users[0].credits || 0) + totalCreditsToAdd
    await supabase
      .from('users')
      .update({ credits: newCredits, plan: bestPlan })
      .eq('id', userId)

    // Log tool unlocks
    for (const toolId of toolsToUnlock) {
      await supabase.from('course_unlocks').insert({
        user_id: userId,
        course_sku: toolId,
        unlocked_at: new Date().toISOString(),
        order_id: orderData.id || orderData.order_id || '',
      })
    }

    // Log the purchase
    await supabase.from('credit_purchases').insert({
      user_id: userId,
      credits: totalCreditsToAdd,
      amount_paid: orderData.total_price ? parseFloat(orderData.total_price) * 100 : 0,
      type: 'shoplazza_course',
      stripe_session_id: orderData.id || orderData.order_id || 'shoplazza',
    })

    return NextResponse.json({
      success: true,
      creditsAdded: totalCreditsToAdd,
      toolsUnlocked: toolsToUnlock,
      plan: bestPlan,
    })

  } catch (error: any) {
    console.error('Shoplazza Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Shoplazza Webhook is running' })
}
