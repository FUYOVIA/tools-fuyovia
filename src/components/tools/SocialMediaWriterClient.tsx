'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface SocialMediaWriterClientProps {
  previewMode?: boolean
}

export default function SocialMediaWriterClient({ previewMode = false }: SocialMediaWriterClientProps) {
  const { authFetch } = useAuthFetch()
  const [content, setContent] = useState('')
  const [platform, setPlatform] = useState('instagram')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const platforms = [
    { id: 'instagram', label: 'Instagram', emoji: '📸' },
    { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
    { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
    { id: 'twitter', label: 'Twitter/X', emoji: '🐦' },
  ]

  const handleGenerate = async () => {
    if (previewMode || !content.trim()) return
    setLoading(true)
    setError('')

    try {
      const response = await authFetch('/api/social-media-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, platform }),
      })

      if (response.status === 401) {
        setError('Please sign in to use this tool.')
        setLoading(false)
        return
      }
      if (response.status === 402) {
        setError('Insufficient credits. You need 1 credit to use this tool.')
        setLoading(false)
        return
      }

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Failed to generate caption')
        setLoading(false)
        return
      }

      setResult(data.data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Content / Topic</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's your post about? E.g. 'Launching our new jewelry collection'"
            disabled={previewMode}
            className="w-full h-64 p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-sm leading-relaxed resize-none disabled:opacity-60"
          />
        </div>

        {/* Output */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Generated Caption</label>
          <div className="w-full h-64 p-4 rounded-2xl border-2 border-neutral-200 bg-white text-neutral-800 text-sm leading-relaxed overflow-y-auto">
            {result ? (
              <p className="whitespace-pre-wrap">{result}</p>
            ) : (
              <p className="text-neutral-400 italic">Your generated caption will appear here...</p>
            )}
          </div>
          {result && (
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              📋 Copy to Clipboard
            </button>
          )}
        </div>
      </div>

      {/* Platform selector */}
      <div className="mt-6">
        <label className="block text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">Platform</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {platforms.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlatform(p.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                platform === p.id
                  ? 'border-primary-300 bg-primary-50/50 shadow-soft'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <span className="text-2xl block mb-1">{p.emoji}</span>
              <span className="text-sm font-semibold text-neutral-800">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={loading || !content.trim() || previewMode}
          className="btn-primary px-8 py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/>
              </svg>
              Generating...
            </>
          ) : (
            <>📲 Generate Caption</>
          )}
        </button>
        <button
          onClick={() => { setContent(''); setResult(''); setError('') }}
          className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          ❌ {error}
        </div>
      )}
    </div>
  )
}
