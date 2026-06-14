import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getStripe, STRIPE_PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const { planId, type } = body

    const stripe = getStripe()

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      // Save customer ID
      await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // Create Checkout Session
    const isSubscription = type !== 'credits'
    const sessionConfig: any = {
      customer: customerId,
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        type: isSubscription ? 'subscription' : 'credits',
        plan_id: planId || '',
      },
    }

    if (isSubscription) {
      const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
      }
      sessionConfig.line_items = [{
        price: plan.priceId,
        quantity: 1,
      }]
      sessionConfig.subscription_data = {
        metadata: { supabase_user_id: user.id, plan_id: planId },
      }
    } else {
      // Credit pack
      const pack = body.creditPack || 'medium'
      const packs: Record<string, { credits: number; price: number }> = {
        small: { credits: 100, price: 499 },
        medium: { credits: 300, price: 999 },
        large: { credits: 1000, price: 2499 },
      }
      const selectedPack = packs[pack] || packs.medium
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${selectedPack.credits} AI Credits Pack`,
            description: `One-time purchase of ${selectedPack.credits} credits`,
          },
          unit_amount: selectedPack.price,
        },
        quantity: 1,
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })

  } catch (error: any) {
    console.error('Stripe Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Stripe Checkout API is running' })
}
