import Stripe from 'stripe'

// Initialize Stripe with the secret key
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey || secretKey === 'sk_test_placeholder') {
    throw new Error('Stripe secret key not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2023-10-16',
  })
}

// Plan configurations
export const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
    credits: 500,
    price: 990, // $9.90 in cents
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    credits: 1500,
    price: 1990, // $19.90 in cents
  },
}

export const CREDIT_PACKS = {
  small: { credits: 100, price: 499 }, // $4.99
  medium: { credits: 300, price: 999 }, // $9.99
  large: { credits: 1000, price: 2499 }, // $24.99
}
