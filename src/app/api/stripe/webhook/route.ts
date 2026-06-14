import { NextResponse, type NextRequest } from 'next/server'
import { getStripe, STRIPE_PLANS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe()
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret || webhookSecret === 'whsec_placeholder') {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 })
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const { supabase_user_id, type, plan_id } = session.metadata || {}

        if (!supabase_user_id) {
          console.error('No supabase_user_id in session metadata')
          break
        }

        if (type === 'subscription') {
          const plan = STRIPE_PLANS[plan_id as keyof typeof STRIPE_PLANS]
          if (plan) {
            await supabase
              .from('users')
              .update({
                plan: plan_id,
                credits: plan.credits,
                stripe_subscription_id: session.subscription,
                subscription_status: 'active',
              })
              .eq('id', supabase_user_id)
          }
        } else {
          const packCredits: Record<string, number> = {
            small: 100,
            medium: 300,
            large: 1000,
          }
          const creditsToAdd = packCredits[type as string] || 300
          const { data: currentUser } = await supabase
            .from('users')
            .select('credits')
            .eq('id', supabase_user_id)
            .single()

          await supabase
            .from('users')
            .update({ credits: (currentUser?.credits || 0) + creditsToAdd })
            .eq('id', supabase_user_id)

          await supabase.from('credit_purchases').insert({
            user_id: supabase_user_id,
            stripe_session_id: session.id,
            credits: creditsToAdd,
            amount_paid: session.amount_total || 0,
            type: 'one_time',
          })
        }
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object as any
        const subscriptionId = invoice.subscription
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.supabase_user_id
          const planId = subscription.metadata?.plan_id
          const plan = STRIPE_PLANS[planId as keyof typeof STRIPE_PLANS]
          if (userId && plan) {
            await supabase
              .from('users')
              .update({
                credits: plan.credits,
                subscription_status: 'active',
              })
              .eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const userId = subscription.metadata?.supabase_user_id
        if (userId) {
          await supabase
            .from('users')
            .update({
              plan: 'free',
              subscription_status: 'canceled',
            })
            .eq('id', userId)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Stripe Webhook endpoint is running' })
}
