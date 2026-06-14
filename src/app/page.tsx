'use client'

import { useState, useMemo } from 'react'
import FreeToolsGrid from '@/components/FreeToolsGrid'
import PremiumToolsGrid from '@/components/PremiumToolsGrid'

// ===== DATA =====

const FREE_TOOLS = [
  { id: 'image-compressor', name: 'Image Compressor', description: 'Compress images in your browser. No upload needed.', icon: '🖼️', color: 'from-emerald-400 to-teal-500', tag: 'Popular' },
  { id: 'pdf-tools', name: 'PDF Toolkit', description: 'Merge, split, compress PDF files. 100% in-browser.', icon: '📄', color: 'from-red-400 to-pink-500', tag: 'Popular' },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate customizable QR codes instantly.', icon: '📱', color: 'from-blue-400 to-indigo-500', tag: null },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate and beautify JSON instantly.', icon: '🧩', color: 'from-amber-400 to-orange-500', tag: null },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure passwords with custom options.', icon: '🔐', color: 'from-violet-400 to-purple-500', tag: null },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences and paragraphs.', icon: '📝', color: 'from-sky-400 to-cyan-500', tag: null },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, HSL formats.', icon: '🎨', color: 'from-pink-400 to-rose-500', tag: null },
  { id: 'base64-tool', name: 'Base64 Encode/Decode', description: 'Encode or decode Base64 strings instantly.', icon: '🔤', color: 'from-lime-400 to-green-500', tag: null },
  { id: 'markdown-preview', name: 'Markdown Preview', description: 'Write Markdown on left, preview on right.', icon: '📄', color: 'from-neutral-400 to-neutral-600', tag: null },
  { id: 'meta-tag-generator', name: 'Meta Tag Generator', description: 'Generate SEO-friendly meta tags for your site.', icon: '🔍', color: 'from-fuchsia-400 to-pink-500', tag: null },
]

const PREMIUM_TOOLS = [
  { id: 'ai-humanizer', name: 'AI Humanizer', description: 'Make AI text sound natural and human.', icon: '✨', color: 'from-violet-400 to-purple-600', popular: true, credits: 2 },
  { id: 'social-media-generator', name: 'Social Media Writer', description: 'Optimized captions for Instagram, TikTok, LinkedIn.', icon: '📲', color: 'from-pink-400 to-rose-600', popular: true, credits: 1 },
  { id: 'product-description', name: 'Product Description', description: 'Compelling e-commerce product descriptions.', icon: '🛍️', color: 'from-emerald-400 to-teal-600', popular: false, credits: 1 },
  { id: 'email-copy-generator', name: 'Email Copy Writer', description: 'High-converting email marketing copy.', icon: '📧', color: 'from-blue-400 to-indigo-600', popular: false, credits: 1 },
  { id: 'seo-blog-generator', name: 'SEO Blog Writer', description: 'Long-form SEO-optimized blog posts.', icon: '📊', color: 'from-amber-400 to-orange-600', popular: true, credits: 3 },
  { id: 'video-script-generator', name: 'Video Script Writer', description: 'Scripts for TikTok, YouTube, Shorts.', icon: '🎬', color: 'from-red-400 to-pink-600', popular: false, credits: 2 },
  { id: 'ai-image-generator', name: 'AI Image Generator', description: 'Generate images from text descriptions.', icon: '🎨', color: 'from-cyan-400 to-blue-600', popular: false, credits: 5 },
  { id: 'hashtag-generator', name: 'Hashtag Generator', description: 'Optimal hashtags for social media.', icon: '🏷️', color: 'from-green-400 to-emerald-600', popular: false, credits: 1 },
  { id: 'resume-optimizer', name: 'Resume & Cover Letter', description: 'Optimize resume + tailored cover letters.', icon: '💼', color: 'from-slate-400 to-slate-600', popular: false, credits: 2 },
  { id: 'readability-optimizer', name: 'Readability Optimizer', description: 'Improve writing clarity and flow.', icon: '📖', color: 'from-yellow-400 to-amber-600', popular: false, credits: 1 },
]

const ALL_TOOLS = [...FREE_TOOLS.map(t => ({ ...t, type: 'free' })), ...PREMIUM_TOOLS.map(t => ({ ...t, type: 'premium' }))]

const TABS = [
  { id: 'all', label: 'All Tools', count: ALL_TOOLS.length },
  { id: 'free', label: 'Free Tools', count: FREE_TOOLS.length },
  { id: 'popular', label: 'Popular', count: [...FREE_TOOLS.filter(t => t.tag === 'Popular'), ...PREMIUM_TOOLS.filter(t => t.popular)].length },
  { id: 'ai-write', label: 'AI Write', count: PREMIUM_TOOLS.filter(t => ['ai-humanizer','social-media-generator','email-copy-generator','seo-blog-generator','video-script-generator','resume-optimizer','readability-optimizer'].includes(t.id)).length },
  { id: 'image', label: 'Image', count: FREE_TOOLS.filter(t => ['image-compressor','qr-generator','color-converter'].includes(t.id)).length + (PREMIUM_TOOLS.find(t => t.id === 'ai-image-generator') ? 1 : 0) },
  { id: 'dev', label: 'Developer', count: FREE_TOOLS.filter(t => ['json-formatter','base64-tool','markdown-preview','meta-tag-generator','word-counter','password-generator'].includes(t.id)).length },
]

const STATS = [
  { value: '20+', label: 'AI Tools', accent: '#0ea5e9' },
  { value: 'Free', label: 'No Signup', accent: '#10b981' },
  { value: 'GPT-4o', label: 'Powered By', accent: '#f97316' },
  { value: '10M+', label: 'Generated', accent: '#8b5cf6' },
]

// ===== FLOATING PARTICLES COMPONENT =====
function FloatingParticles() {
  const particles = [
    // Triangles
    { type: 'triangle', size: 18, color: '#f97316', left: '6%', top: '12%', anim: 'float1', dur: '7s', rot: '-15deg' },
    { type: 'triangle', size: 12, color: '#0ea5e9', left: '88%', top: '18%', anim: 'float2', dur: '9s', rot: '25deg' },
    { type: 'triangle', size: 14, color: '#ec4899', left: '75%', top: '65%', anim: 'float4', dur: '8s', rot: '-30deg' },
    // Circles
    { type: 'circle', size: 10, color: '#8b5cf6', left: '12%', top: '55%', anim: 'float3', dur: '6s' },
    { type: 'circle', size: 7, color: '#f97316', left: '92%', top: '42%', anim: 'float1', dur: '10s' },
    { type: 'circle', size: 14, color: '#06b6d4', left: '45%', top: '8%', anim: 'float2', dur: '11s' },
    { type: 'circle', size: 6, color: '#ec4899', left: '58%', top: '72%', anim: 'float3', dur: '7s' },
    { type: 'circle', size: 8, color: '#facc15', left: '25%', top: '78%', anim: 'float4', dur: '9s' },
    // Squares / Diamonds
    { type: 'square', size: 11, color: '#0ea5e9', left: '82%', top: '28%', anim: 'float3', dur: '8s', rot: '20deg' },
    { type: 'square', size: 8, color: '#f97316', left: '18%', top: '35%', anim: 'float1', dur: '12s', rot: '-15deg' },
    { type: 'square', size: 13, color: '#8b5cf6', left: '68%', top: '82%', anim: 'float2', dur: '10s', rot: '35deg' },
    // Plus signs
    { type: 'plus', size: 14, color: '#10b981', left: '4%', top: '70%', anim: 'float4', dur: '9s' },
    { type: 'plus', size: 10, color: '#ec4899', left: '95%', top: '58%', anim: 'float1', dur: '7s' },
    // Extra small dots
    { type: 'circle', size: 5, color: '#f97316', left: '35%', top: '22%', anim: 'drift-slow', dur: '8s' },
    { type: 'circle', size: 4, color: '#0ea5e9', left: '55%', top: '38%', anim: 'drift-slow', dur: '11s' },
    { type: 'circle', size: 5, color: '#a78bfa', left: '78%', top: '52%', anim: 'drift-slow', dur: '9s' },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.type === 'plus' ? p.size : p.type === 'triangle' ? 0 : p.size,
            ...(p.type === 'triangle' && {
              borderLeftWidth: p.size / 2,
              borderRightWidth: p.size / 2,
              borderBottomWidth: p.size * 0.85,
              borderColor: 'transparent transparent currentColor',
              color: p.color,
            }),
            ...(p.type === 'circle' && {
              backgroundColor: p.color,
              borderRadius: '50%',
            }),
            ...(p.type === 'square' && {
              backgroundColor: p.color,
              borderRadius: 2,
              transform: `rotate(${p.rot || '0deg'})`,
            }),
            animation: `${p.anim} ${p.dur} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ===== MAIN PAGE =====
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const filteredTools = useMemo(() => {
    let tools = ALL_TOOLS
    
    // Tab filter
    if (activeTab === 'free') {
      tools = tools.filter(t => t.type === 'free')
    } else if (activeTab === 'popular') {
      tools = tools.filter(t => ('tag' in t && t.tag === 'Popular') || ('popular' in t && t.popular))
    } else if (activeTab === 'ai-write') {
      tools = tools.filter(t => ['ai-humanizer','social-media-generator','email-copy-generator','seo-blog-generator','video-script-generator','resume-optimizer','readability-optimizer'].includes(t.id))
    } else if (activeTab === 'image') {
      tools = tools.filter(t => ['image-compressor','qr-generator','color-converter','ai-image-generator'].includes(t.id))
    } else if (activeTab === 'dev') {
      tools = tools.filter(t => ['json-formatter','base64-tool','markdown-preview','meta-tag-generator','word-counter','password-generator'].includes(t.id))
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q)
      )
    }
    
    return tools
  }, [searchQuery, activeTab])

  const filteredFree = filteredTools.filter(t => t.type === 'free').map(({ type, ...rest }) => rest)
  const filteredPremium = filteredTools.filter(t => t.type === 'premium').map(({ type, ...rest }) => rest)

  return (
    <div className="min-h-screen bg-white relative">
      {/* ============================================ */}
      {/* HERO SECTION — Floating Particles + Headline */}
      {/* ============================================ */}
      <section className="relative pt-8 pb-6 sm:pt-12 sm:pb-10 overflow-hidden min-h-[520px] flex items-center">
        {/* Particle layer */}
        <FloatingParticles />

        <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 text-center z-10">
          {/* Main headline — TinyWow-style bold text */}
          <h1 className="text-[2rem] sm:text-[3.2rem] lg:text-[3.8rem] leading-[1.1] font-black tracking-tight text-[#1a1a2e]">
            Free AI Tools to Make{' '}
            <span className="highlight-box" style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff' }}>
              Everything
            </span>{' '}
            Simple
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#64748b] max-w-2xl mx-auto font-medium leading-relaxed">
            PDF, image, writing, and more online tools for creators.
            <br className="hidden sm:block" />
            No signup required for free tools.
          </p>

          {/* Search Bar — prominent like TinyWow */}
          <div className="mt-7 sm:mt-8 max-w-xl mx-auto relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <input
              type="text"
              placeholder="Search tools... e.g. PDF, Image, AI Humanizer"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Quick stats bar — TinyWow style numbers */}
          <div className="mt-8 flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black" style={{ color: stat.accent }}>{stat.value}</span>
                <span className="text-[11px] text-[#94a3b8] font-semibold uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="mt-7 flex items-center justify-center gap-3 flex-wrap">
            <a href="#tools-section" className="btn-primary text-sm">
              🚀 Explore All Tools
            </a>
            <a href="#free-tools" className="px-7 py-3 rounded-full text-sm font-bold text-[#334155] bg-white border-2 border-[#e2e8f0] hover:border-[#cbd5e1] hover:bg-[#f8fafc] transition-all duration-200 active:scale-[0.97]">
              ✨ Try Free First
            </a>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TOOLS SECTION — Tabs + Grid */}
      {/* ============================================ */}
      <section id="tools-section" className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Tab navigation bar */}
          <div className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                  <span className={`ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-md text-[10px] font-bold ${
                    activeTab === tab.id 
                      ? 'bg-white/80 text-primary-600' 
                      : 'bg-neutral-100 text-neutral-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            
            {searchQuery && (
              <p className="mt-3 text-sm text-[#64748b] font-medium">
                Showing {filteredTools.length} result{filteredTools.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="ml-2 text-primary-500 hover:text-primary-700 font-semibold underline"
                >
                  Clear
                </button>
              </p>
            )}
          </div>

          {/* ====== FREE TOOLS ====== */}
          {filteredFree.length > 0 && (
            <div id="free-tools" className="mb-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-100">
                  <span className="text-white text-base">🆓</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a2e]">Free Browser Tools</h2>
                  <p className="text-xs text-[#94a3b8] font-medium mt-0.5">No login required • Works offline</p>
                </div>
                <span className="ml-auto hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {filteredFree.length} Tools
                </span>
              </div>
              <FreeToolsGrid tools={filteredFree} />
            </div>
          )}

          {/* ====== PREMIUM TOOLS ====== */}
          {filteredPremium.length > 0 && (
            <div id="premium-tools">
              {/* Divider between free & premium */}
              {filteredFree.length > 0 && (
                <div className="relative flex items-center gap-4 my-10 mb-10">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent"></div>
                  <div className="flex items-center gap-2 shrink-0 px-4 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-full border border-orange-200">
                    <span className="text-base">⚡</span>
                    <span className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Powered by GPT-4o</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent"></div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-md shadow-orange-100">
                  <span className="text-white text-base">⭐</span>
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#1a1a2e]">Premium AI Tools</h2>
                  <p className="text-xs text-[#94a3b8] font-medium mt-0.5">AI-powered • Pay-per-use credits</p>
                </div>
                <span className="ml-auto hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                  {filteredPremium.length} Tools
                </span>
              </div>
              <PremiumToolsGrid tools={filteredPremium} />
            </div>
          )}

          {/* Empty state */}
          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-[#334155]">No tools found</h3>
              <p className="text-sm text-[#94a3b8] mt-1">Try a different search term or category.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
                className="mt-4 btn-primary text-sm"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================ */}
      {/* BOTTOM TRUST BANNER */}
      {/* ============================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative p-8 sm:p-10 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
          {/* Glow effects */}
          <div className="absolute top-[-60px] right-[-40px] w-[280px] h-[280px] bg-primary-500/[0.08] rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-40px] left-[-30px] w-[220px] h-[220px] bg-warm-500/[0.08] rounded-full blur-3xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-black text-white">
                Supercharge your creator workflow today
              </h3>
              <p className="mt-1.5 text-sm text-slate-400 font-medium">
                Start with free tools → upgrade when you need AI power.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <a href="#free-tools" className="px-6 py-2.5 text-sm font-bold text-white border border-white/15 rounded-full hover:bg-white/10 transition-all duration-200">
                Get Started Free →
              </a>
              <a href="/pricing" className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-orange-500/25">
                View Plans
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
