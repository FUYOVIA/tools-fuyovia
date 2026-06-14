interface ComingSoonProps {
  toolName: string
  toolIcon: string
}

export default function ComingSoon({ toolName, toolIcon }: ComingSoonProps) {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-10 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">{toolIcon}</span>
        </div>
        
        <h3 className="text-xl font-bold text-neutral-800 mb-2">{toolName}</h3>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
          This tool is being polished to perfection. 
          <span className="font-semibold text-primary-600">Sign up</span> to get notified when it launches!
        </p>

        <div className="flex items-center justify-center gap-3">
          <a
            href="/pricing"
            className="btn-primary text-sm px-6 py-2.5"
          >
            🔔 Notify Me
          </a>
          <a
            href="/#free-tools"
            className="btn-outline text-sm px-6 py-2.5"
          >
            ← Back to Tools
          </a>
        </div>

        {/* 装饰点 */}
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <div className="w-2 h-2 rounded-full bg-primary-200 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary-300 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary-200 animate-pulse" style={{ animationDelay: '600ms' }}></div>
        </div>

        <p className="text-xs text-neutral-400 mt-4">Estimated launch: Soon™</p>
      </div>
    </div>
  )
}
