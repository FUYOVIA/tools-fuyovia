export default function PricingPreview() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out our free tools.',
      features: [
        '10 free tools (unlimited)',
        '5 AI credits/day',
        'Basic support',
      ],
      cta: 'Current Plan',
      ctaStyle: 'outline',
      highlighted: false,
    },
    {
      name: 'Starter',
      price: '$9.9',
      period: '/month',
      description: 'For creators who need regular AI assistance.',
      features: [
        'All free tools',
        '500 AI credits/month',
        'Email support',
        'No daily limit',
      ],
      cta: 'Upgrade',
      ctaStyle: 'primary',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '$19.9',
      period: '/month',
      description: 'For power users and small teams.',
      features: [
        'All free tools',
        '1200 AI credits/month',
        'Priority support',
        'API access',
      ],
      cta: 'Upgrade',
      ctaStyle: 'warm',
      highlighted: false,
    },
  ]

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight mb-3">
          Simple, Transparent Pricing
        </h2>
        <p className="text-neutral-500 max-w-lg mx-auto">
          Start free. Upgrade when you need more AI power. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl border-2 p-8 transition-all duration-300 hover:shadow-large ${
              plan.highlighted
                ? 'border-primary-300 bg-primary-50/30 shadow-medium scale-[1.02]'
                : 'border-neutral-100 bg-white hover:border-neutral-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-soft">
                MOST POPULAR
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-800 mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-3">
                <span className="text-4xl font-extrabold text-neutral-900">{plan.price}</span>
                <span className="text-neutral-500 mb-1">{plan.period}</span>
              </div>
              <p className="text-sm text-neutral-500">{plan.description}</p>
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

            <button
              className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
                plan.ctaStyle === 'primary'
                  ? 'btn-primary'
                  : plan.ctaStyle === 'warm'
                  ? 'btn-warm'
                  : 'btn-outline'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-neutral-400 mt-8">
        All paid plans include a 7-day free trial. Cancel anytime.
      </p>
    </div>
  )
}
