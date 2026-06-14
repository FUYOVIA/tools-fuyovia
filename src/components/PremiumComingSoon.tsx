interface PremiumComingSoonProps {
  toolName: string
  toolIcon: string
  credits: number
}

export default function PremiumComingSoon({ toolName, toolIcon, credits }: PremiumComingSoonProps) {
  return (
    <div className="animate-fade-in text-center py-12">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-6 shadow-soft">
        <span className="text-5xl">{toolIcon}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-neutral-800 mb-3">{toolName}</h3>
      <p className="text-neutral-500 mb-2 max-w-md mx-auto">
        This premium AI tool is being fine-tuned to deliver exceptional results.
      </p>
      <p className="text-sm text-amber-600 font-semibold mb-8">
        {credits} credit{credits > 1 ? 's' : ''} per use · Powered by GPT-4o
      </p>

      <div className="flex items-center justify-center gap-4">
        <a
          href="/pricing"
          className="btn-primary text-sm px-6 py-2.5"
        >
          🔔 Upgrade to Access
        </a>
        <a
          href="/#premium-tools"
          className="btn-outline text-sm px-6 py-2.5"
        >
          ← All Tools
        </a>
      </div>

      {/* 功能预览列表 */}
      <div className="max-w-sm mx-auto mt-10 p-5 bg-neutral-50/50 rounded-2xl border border-neutral-100">
        <p className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">What to Expect</p>
        <ul className="space-y-2 text-sm text-neutral-600 text-left">
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            AI-powered high-quality output
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Multiple style/tone options
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            One-click copy & download
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Credit-efficient pricing
          </li>
        </ul>
      </div>

      {/* 装饰动画点 */}
      <div className="flex items-center justify-center gap-1.5 mt-10">
        <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: '300ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" style={{ animationDelay: '600ms' }}></div>
      </div>

      <p className="text-xs text-neutral-400 mt-4">Estimated launch: Q3 2026</p>
    </div>
  )
}
