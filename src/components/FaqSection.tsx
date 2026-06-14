const faqs = [
  {
    q: 'Are the free tools really free?',
    a: 'Yes! All 10 free tools are completely free. No login required, no credit card, no usage limits. They run 100% in your browser.',
  },
  {
    q: 'What are AI credits?',
    a: 'Credits are used for premium AI tools. Each tool use costs 1-5 credits depending on the complexity. You get daily free credits, or you can upgrade for more.',
  },
  {
    q: 'Is my data safe?',
    a: 'Free tools run entirely in your browser - your files never leave your device. For premium tools, we process text through secure AI APIs but never store your content permanently.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a 7-day money-back guarantee for all new subscriptions. If you\'re not satisfied, contact us within 7 days for a full refund.',
  },
]

export default function FaqSection() {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-neutral-800 tracking-tight mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-neutral-500">
          Can\'t find what you\'re looking for? <a href="mailto:support@fuyovia.com" className="text-primary-600 hover:underline">Contact our support team</a>.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <details
            key={idx}
            className="group bg-white rounded-2xl border border-neutral-100 p-5 transition-all duration-200 hover:border-neutral-200"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none">
              <span className="font-semibold text-neutral-800 text-base">
                {faq.q}
              </span>
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
              <p className="text-neutral-600 leading-relaxed text-sm">
                {faq.a}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
