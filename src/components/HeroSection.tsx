export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 gradient-hero"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-warm-200/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center">
        {/* 标签 */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-full px-5 py-2 mb-8 shadow-soft animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-sm font-medium text-neutral-600">10 Free Tools · 10 Premium AI Tools</span>
        </div>

        {/* 主标题 */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-neutral-900 tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          AI Tools for
          <br />
          <span className="bg-gradient-to-r from-primary-500 via-primary-600 to-warm-500 bg-clip-text text-transparent">
            Creators & Makers
          </span>
        </h1>

        {/* 副标题 */}
        <p className="text-lg sm:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          Free image tools, PDF toolkit, and premium AI writing tools. 
          No credit card required for free tools. Start creating instantly.
        </p>

        {/* CTA 按钮 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <a
            href="#free-tools"
            className="btn-primary text-base px-8 py-3.5 shadow-medium hover:shadow-large transition-all duration-300"
          >
            Try Free Tools
          </a>
          <a
            href="#premium-tools"
            className="btn-outline text-base px-8 py-3.5"
          >
            Explore Premium
          </a>
        </div>

        {/* 信任标识 */}
        <div className="flex items-center justify-center gap-6 mt-12 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>No signup required</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>SSL secured</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Instant access</span>
          </div>
        </div>
      </div>
    </section>
  )
}
