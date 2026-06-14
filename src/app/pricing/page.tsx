import { Check } from 'lucide-react'
import CheckoutButton from '@/components/CheckoutButton'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out our free tools and getting a taste of AI.',
    features: [
      '10 free tools (unlimited)',
      '5 AI credits per day',
      'Basic support',
      'Community access',
    ],
    cta: 'Current Plan',
    planId: 'free',
    highlighted: false,
    btnStyle: 'outline' as const,
  },
  {
    name: 'Starter',
    price: '$9.9',
    period: '/month',
    description: 'For creators who need regular AI assistance for content creation.',
    features: [
      'All free tools',
      '500 AI credits/month',
      'Email support',
      'No daily limit',
      'Credit rollover (up to 200)',
    ],
    cta: 'Start Free Trial',
    planId: 'starter',
    highlighted: true,
    btnStyle: 'primary' as const,
  },
  {
    name: 'Pro',
    price: '$19.9',
    period: '/month',
    description: 'For power users, agencies, and small teams who need more.',
    features: [
      'All free tools',
      '1500 AI credits/month',
      'Priority support',
      'API access',
      'Team sharing (up to 3 users)',
      'Custom tool requests',
    ],
    cta: 'Start Free Trial',
    planId: 'pro',
    highlighted: false,
    btnStyle: 'warm' as const,
  },
]

const faqs = [
  {
    q: 'What are AI credits?',
    a: 'Credits are used for premium AI tools. Each tool use costs 1-5 credits depending on complexity. Free users get 5 credits daily. Paid users get monthly credits.',
  },
  {
    q: 'Do unused credits rollover?',
    a: 'Yes! On the Starter and Pro plans, unused credits rollover up to 200 (Starter) or 500 (Pro) per month.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. You can cancel your subscription at any time from your account settings. You\'ll keep access until the end of your billing period.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! All paid plans come with a 7-day free trial. No credit card required for the trial.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards via Stripe. PayPal and crypto payments coming soon.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fefdf8] px-4 sm:px-6 py-12 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight mb-3">
          Simple, Transparent
          <br />
          <span className="bg-gradient-to-r from-primary-500 to-warm-500 bg-clip-text text-transparent">
            Pricing
          </span>
        </h2>
        <p className="text-base text-neutral-500 max-w-lg mx-auto">
          Start with free tools. Upgrade when you need more AI power.
          No hidden fees, no surprises.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border-2 p-7 transition-all duration-300 ${
              plan.highlighted
                ? 'border-primary-300 bg-white shadow-medium scale-[1.02]'
                : 'border-neutral-100 bg-white hover:border-neutral-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-soft">
                MOST POPULAR
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-bold text-neutral-800 mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-4xl font-extrabold text-neutral-900">{plan.price}</span>
                <span className="text-neutral-500 mb-1">{plan.period}</span>
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <CheckoutButton
              planId={plan.planId}
              planName={plan.name}
              isCurrentPlan={false}
              btnStyle={plan.btnStyle}
            >
              {plan.cta}
            </CheckoutButton>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-8 mb-12 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h4 className="font-bold text-neutral-800 mb-1">7-Day Money-Back</h4>
            <p className="text-sm text-neutral-500">Not satisfied? Full refund within 7 days.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h4 className="font-bold text-neutral-800 mb-1">Secure Payments</h4>
            <p className="text-sm text-neutral-500">SSL encrypted. Stripe-secured. Your data is safe.</p>
          </div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <h4 className="font-bold text-neutral-800 mb-1">Cancel Anytime</h4>
            <p className="text-sm text-neutral-500">No contracts. No cancellation fees. Leave when you want.</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-2xl font-bold text-neutral-800 text-center mb-8">Frequently Asked Questions</h3>
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-neutral-100 p-5 transition-all duration-200 hover:border-neutral-200"
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-neutral-800 text-base">{faq.q}</span>
                <svg
                  className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform duration-200 flex-shrink-0 ml-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </summary>
              <div className="mt-4 pt-4 border-t border-neutral-50">
                <p className="text-neutral-600 leading-relaxed text-sm">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}
