'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface SeoBlogWriterClientProps {
  previewMode?: boolean
}

export default function SeoBlogWriterClient({ previewMode = false }: SeoBlogWriterClientProps) {
  const { authFetch } = useAuthFetch()
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [length, setLength] = useState('medium')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await authFetch('/api/seo-blog-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords, length }),
      })

      if (res.status === 401) {
        setError('Please sign in to use this tool.')
        return
      }
      if (res.status === 402) {
        setError('Insufficient credits. You need 3 credits to use this tool.')
        return
      }

      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setOutput(data.blogPost || data.content || 'No content generated.')
      }
    } catch {
      setError('Failed to generate blog post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Blog topic (e.g., &quot;Best AI Tools for Content Creators&quot;)"
            className="input-field"
            disabled
          />
          <input
            type="text"
            placeholder="Target keywords (comma separated)"
            className="input-field"
            disabled
          />
        </div>
        <select className="input-field" disabled>
          <option>Medium (~1000 words)</option>
        </select>
        <button className="btn-primary w-full" disabled>Generate SEO Blog Post</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Blog Topic *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Best AI Tools for Content Creators in 2026"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Keywords</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., AI tools, content creation, AI writing"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Article Length</label>
        <select
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className="input-field"
        >
          <option value="short">Short (~500 words)</option>
          <option value="medium">Medium (~1000 words)</option>
          <option value="long">Long (~1500-2000 words)</option>
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          'Generate SEO Blog Post'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
          {error}
        </div>
      )}

      {output && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">Generated Blog Post</h3>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Copy
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
