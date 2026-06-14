"use client"

import { useState } from 'react'

interface MetaFields {
  title: string
  description: string
  keywords: string
  author: string
  url: string
  ogImage: string
  robots: string
  twitterCard: 'summary' | 'summary_large_image'
}

const DEFAULT_FIELDS: MetaFields = {
  title: '',
  description: '',
  keywords: '',
  author: '',
  url: '',
  ogImage: '',
  robots: 'index, follow',
  twitterCard: 'summary_large_image',
}

function generateMetaTags(fields: MetaFields): string {
  const tags: string[] = []

  if (fields.title) {
    tags.push(`<title>${fields.title}</title>`)
    tags.push(`<meta name="title" content="${fields.title}">`)
    tags.push(`<meta property="og:title" content="${fields.title}">`)
    tags.push(`<meta name="twitter:title" content="${fields.title}">`)
  }

  if (fields.description) {
    tags.push(`<meta name="description" content="${fields.description}">`)
    tags.push(`<meta property="og:description" content="${fields.description}">`)
    tags.push(`<meta name="twitter:description" content="${fields.description}">`)
  }

  if (fields.keywords) {
    tags.push(`<meta name="keywords" content="${fields.keywords}">`)
  }

  if (fields.author) {
    tags.push(`<meta name="author" content="${fields.author}">`)
  }

  if (fields.robots) {
    tags.push(`<meta name="robots" content="${fields.robots}">`)
  }

  if (fields.url) {
    tags.push(`<link rel="canonical" href="${fields.url}">`)
    tags.push(`<meta property="og:url" content="${fields.url}">`)
    tags.push(`<meta name="twitter:url" content="${fields.url}">`)
  }

  if (fields.ogImage) {
    tags.push(`<meta property="og:image" content="${fields.ogImage}">`)
    tags.push(`<meta name="twitter:image" content="${fields.ogImage}">`)
  }

  tags.push(`<meta property="og:type" content="website">`)
  tags.push(`<meta name="twitter:card" content="${fields.twitterCard}">`)
  tags.push(`<meta name="viewport" content="width=device-width, initial-scale=1.0">`)
  tags.push(`<meta charset="UTF-8">`)

  return tags.join('\n')
}

export default function MetaTagGeneratorClient() {
  const [fields, setFields] = useState<MetaFields>(DEFAULT_FIELDS)
  const [copied, setCopied] = useState(false)

  const output = generateMetaTags(fields)
  const hasContent = Object.values(fields).some((v) => v.trim() !== '' && v !== 'index, follow' && v !== 'summary_large_image')

  const update = (key: keyof MetaFields, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => setFields(DEFAULT_FIELDS)

  const descLen = fields.description.length
  const titleLen = fields.title.length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-5">
          <h3 className="font-bold text-neutral-700 text-sm uppercase tracking-wider">Page Details</h3>

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-neutral-700">Page Title *</label>
              <span className={`text-xs font-medium ${titleLen > 60 ? 'text-red-500' : titleLen > 50 ? 'text-amber-500' : 'text-neutral-400'}`}>
                {titleLen}/60
              </span>
            </div>
            <input
              type="text"
              value={fields.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="My Awesome Page - Brand Name"
              className="input-field text-sm"
            />
            {titleLen > 60 && <p className="text-xs text-red-500 mt-1">⚠ Title too long. Keep under 60 characters for best SEO.</p>}
          </div>

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-neutral-700">Meta Description *</label>
              <span className={`text-xs font-medium ${descLen > 160 ? 'text-red-500' : descLen > 140 ? 'text-amber-500' : 'text-neutral-400'}`}>
                {descLen}/160
              </span>
            </div>
            <textarea
              value={fields.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="A brief description of this page. Keep it compelling and under 160 characters."
              rows={3}
              className="input-field text-sm resize-none"
            />
            {descLen > 160 && <p className="text-xs text-red-500 mt-1">⚠ Description too long. Keep under 160 characters.</p>}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Keywords</label>
            <input
              type="text"
              value={fields.keywords}
              onChange={(e) => update('keywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
              className="input-field text-sm"
            />
            <p className="text-xs text-neutral-400 mt-1">Separate keywords with commas. Less important for modern SEO but still good practice.</p>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Author</label>
            <input
              type="text"
              value={fields.author}
              onChange={(e) => update('author', e.target.value)}
              placeholder="Your Name or Brand"
              className="input-field text-sm"
            />
          </div>

          {/* URL */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">Canonical URL</label>
            <input
              type="url"
              value={fields.url}
              onChange={(e) => update('url', e.target.value)}
              placeholder="https://yoursite.com/page"
              className="input-field text-sm"
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              OG Image URL
              <span className="ml-2 text-xs text-neutral-400 font-normal">(Recommended: 1200×630px)</span>
            </label>
            <input
              type="url"
              value={fields.ogImage}
              onChange={(e) => update('ogImage', e.target.value)}
              placeholder="https://yoursite.com/og-image.jpg"
              className="input-field text-sm"
            />
          </div>

          {/* Robots + Twitter Card */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Robots</label>
              <select
                value={fields.robots}
                onChange={(e) => update('robots', e.target.value)}
                className="input-field text-sm"
              >
                <option value="index, follow">index, follow</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="index, nofollow">index, nofollow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Twitter Card</label>
              <select
                value={fields.twitterCard}
                onChange={(e) => update('twitterCard', e.target.value as MetaFields['twitterCard'])}
                className="input-field text-sm"
              >
                <option value="summary_large_image">Large Image</option>
                <option value="summary">Summary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Output */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-neutral-700 text-sm uppercase tracking-wider">Generated Tags</h3>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="text-xs text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleCopy}
                disabled={!hasContent}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  copied
                    ? 'bg-emerald-50 text-emerald-600'
                    : hasContent
                    ? 'bg-primary-500 text-white hover:bg-primary-600'
                    : 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-500'
                }`}
              >
                {copied ? '✓ Copied!' : 'Copy All Tags'}
              </button>
            </div>
          </div>

          <div className="relative">
            <pre className="bg-neutral-900 text-green-400 font-mono text-xs leading-relaxed p-5 rounded-2xl overflow-auto whitespace-pre-wrap" style={{ minHeight: '400px' }}>
              {output || (
                <span className="text-neutral-600">// Fill in the fields on the left to generate your meta tags...</span>
              )}
            </pre>
          </div>

          {/* Checklist */}
          {hasContent && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 mb-3">SEO Checklist</p>
              <ul className="space-y-1.5">
                {[
                  [fields.title.length > 0 && fields.title.length <= 60, 'Title (10-60 chars)'],
                  [fields.description.length > 0 && fields.description.length <= 160, 'Description (50-160 chars)'],
                  [fields.url.length > 0, 'Canonical URL set'],
                  [fields.ogImage.length > 0, 'OG Image for social sharing'],
                  [fields.keywords.length > 0, 'Keywords defined'],
                ].map(([pass, label]) => (
                  <li key={label as string} className={`flex items-center gap-2 text-xs font-medium ${pass ? 'text-emerald-700' : 'text-neutral-400'}`}>
                    {pass ? (
                      <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5 text-neutral-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    )}
                    {label as string}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
