import type { Tool } from '@/types'

interface FreeToolsGridProps {
  tools: Tool[]
}

export default function FreeToolsGrid({ tools }: FreeToolsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
      {tools.map((tool, idx) => (
        <a
          key={tool.id}
          href={`/free/${tool.id}`}
          className="tool-card group block bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:border-primary-200 transition-all duration-300 animate-fade-in"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          {/* 图标区 */}
          <div className={`h-28 bg-gradient-to-br ${tool.color} flex items-center justify-center relative overflow-hidden`}>
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {tool.icon}
            </span>
            {tool.tag && (
              <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold px-2.5 py-0.5 rounded-lg text-neutral-700 shadow-soft">
                {tool.tag}
              </span>
            )}
            {/* 装饰圆圈 */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/10"></div>
          </div>

          {/* 内容区 */}
          <div className="p-5">
            <h3 className="font-bold text-neutral-800 text-base mb-2 group-hover:text-primary-600 transition-colors duration-200">
              {tool.name}
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
              {tool.description}
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-emerald-600 font-semibold">
              <span>FREE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
