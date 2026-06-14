'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface ReadabilityOptimizerClientProps {
  previewMode?: boolean
}

export default function ReadabilityOptimizerClient({ previewMode = false }: ReadabilityOptimizerClientProps) {
  const [text, setText] = useState('')
  const [targetAudience, setTargetAudience] = useState('general readers')
  const [style, setStyle] = useState('clear and engaging')
  const [output, setOutput] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { authFetch } = useAuthFetch()

  const handleOptimize = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError('')
    setOutput(null)

    try {
      const res = await authFetch('/api/readability-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetAudience, style }),
      })
      if (res.status === 401) {
        setError('Please sign in to use this tool.')
        return
      }
      if (res.status === 402) {
        setError('Insufficient credits. You need 1 credit to use this tool.')
        return
      }
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setOutput(data)
      }
    } catch {
      setError('Failed to optimize text. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <textarea placeholder="Paste your text" className="input-field min-h-[100px]" disabled />
        <button className="btn-primary w-full" disabled>Optimize Readability</button>
      </div>
    )
  }

  const optimizedText = (output?.optimizedText as string) || ''
  const readabilityScore = (output?.readabilityScore as string) || ''
  const improvements = (output?.improvements as string[]) || []

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Your Text *</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to improve..."
          className="input-field min-h-[150px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Audience</label>
          <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className="input-field">
            <option value="general readers">General Readers</option>
            <option value="professionals">Professionals</option>
            <option value="students">Students</option>
            <option value="children">Children (Simple Language)</option>
            <option value="technical audience">Technical Audience</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Writing Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="input-field">
            <option value="clear and engaging">Clear & Engaging</option>
            <option value="concise and direct">Concise & Direct</option>
            <option value="formal and academic">Formal & Academic</option>
            <option value="conversational and warm">Conversational & Warm</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={loading || !text.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Optimizing...
          </>
        ) : (
          'Optimize Readability'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      {output && (
        <div className="space-y-4">
          {readabilityScore && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-semibold text-emerald-600 block mb-1">Estimated Readability Score</span>
              <span className="text-lg font-bold text-emerald-800">{readabilityScore}</span>
            </div>
          )}

          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-neutral-800">Optimized Text</h3>
              <button
                onClick={() => navigator.clipboard.writeText(optimizedText)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Copy
              </button>
            </div>
            <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
              {optimizedText}
            </div>
          </div>

          {improvements.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">Key Improvements</h4>
              <ul className="space-y-1.5">
                {improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">✓</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
