import type { Tool } from '@/types'

interface PremiumToolsGridProps {
  tools: Tool[]
}

export default function PremiumToolsGrid({ tools }: PremiumToolsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {tools.map((tool, idx) => (
        <a
          key={tool.id}
          href={`/premium/${tool.id}`}
          className="tool-card group block bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:border-amber-200 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          {/* 图标区 */}
          <div className={`h-28 bg-gradient-to-br ${tool.color} flex items-center justify-center relative overflow-hidden`}>
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {tool.icon}
            </span>
            {tool.popular && (
              <span className="absolute top-3 right-3 bg-amber-400/90 backdrop-blur-sm text-xs font-bold px-2.5 py-0.5 rounded-lg text-white shadow-soft">
                Popular
              </span>
            )}
            {/* 装饰 */}
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white/10"></div>
          </div>

          {/* 内容区 */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-neutral-800 text-base group-hover:text-amber-600 transition-colors duration-200">
                {tool.name}
              </h3>
            </div>
            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3 mb-3">
              {tool.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
                <span>PREMIUM</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <span className="text-xs text-neutral-400 font-medium">
                {tool.credits ?? 0} credit{(tool.credits ?? 0) > 1 ? 's' : ''} / use
              </span>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
