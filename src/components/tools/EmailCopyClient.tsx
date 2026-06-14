'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface EmailCopyClientProps {
  previewMode?: boolean
}

export default function EmailCopyClient({ previewMode = false }: EmailCopyClientProps) {
  const { authFetch } = useAuthFetch()
  const [product, setProduct] = useState('')
  const [goal, setGoal] = useState('')
  const [emailType, setEmailType] = useState('promotional')
  const [audience, setAudience] = useState('')
  const [output, setOutput] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!product.trim() || !goal.trim()) return
    setLoading(true)
    setError('')
    setOutput(null)

    try {
      const res = await authFetch('/api/email-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product, goal, emailType, audience }),
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
      setError('Failed to generate email copy. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <input type="text" placeholder="Product or service" className="input-field" disabled />
        <input type="text" placeholder="Goal of this email" className="input-field" disabled />
        <button className="btn-primary w-full" disabled>Generate Email Copy</button>
      </div>
    )
  }

  const subjectLines = (output?.subjectLines as string[]) || []
  const previewText = (output?.previewText as string) || ''
  const body = (output?.body as string) || ''
  const ctaText = (output?.ctaText as string) || ''
  const ps = (output?.ps as string) || ''

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product / Service *</label>
        <input
          type="text"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          placeholder="e.g., AI Writing Assistant Pro"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Goal *</label>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Get users to upgrade to paid plan"
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Type</label>
          <select value={emailType} onChange={(e) => setEmailType(e.target.value)} className="input-field">
            <option value="promotional">Promotional</option>
            <option value="welcome">Welcome Series</option>
            <option value="newsletter">Newsletter</option>
            <option value="reengagement">Re-engagement</option>
            <option value="abandoned-cart">Abandoned Cart</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Audience</label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="e.g., Free trial users"
            className="input-field"
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !product.trim() || !goal.trim()}
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
          'Generate Email Copy'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      {output && (
        <div className="space-y-4">
          {subjectLines.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5">
              <h3 className="font-semibold text-amber-800 mb-3">Subject Line Options</h3>
              <div className="space-y-2">
                {subjectLines.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 border border-amber-100">
                    <span className="text-xs font-bold text-amber-500">#{i + 1}</span>
                    <span className="text-sm text-neutral-800 flex-1">{s}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(s)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previewText && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <span className="text-xs font-semibold text-blue-600">Preview Text:</span>
              <p className="text-sm text-neutral-700 mt-1">{previewText}</p>
            </div>
          )}

          {body && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-neutral-800">Email Body</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(body)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">{body}</div>
            </div>
          )}

          {ctaText && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-semibold text-emerald-600 block mb-2">CTA Button</span>
              <span className="inline-block bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm">{ctaText}</span>
            </div>
          )}

          {ps && (
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
              <span className="text-xs font-semibold text-neutral-500">P.S.</span>
              <p className="text-sm text-neutral-700 mt-1">{ps}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
