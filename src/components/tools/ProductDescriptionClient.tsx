'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface ProductDescriptionClientProps {
  previewMode?: boolean
}

export default function ProductDescriptionClient({ previewMode = false }: ProductDescriptionClientProps) {
  const { authFetch } = useAuthFetch()
  const [productName, setProductName] = useState('')
  const [features, setFeatures] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [tone, setTone] = useState('professional')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!productName.trim() || !features.trim()) return
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await authFetch('/api/product-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, features, targetAudience, tone }),
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
        setOutput(data.data || data.description || 'No description generated.')
      }
    } catch {
      setError('Failed to generate description. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <input type="text" placeholder="Product name" className="input-field" disabled />
        <textarea placeholder="Key features (one per line)" className="input-field min-h-[80px]" disabled />
        <button className="btn-primary w-full" disabled>Generate Description</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Product Name *</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="e.g., Wireless Noise-Canceling Headphones"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Key Features *</label>
        <textarea
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="One feature per line:&#10;Active noise cancellation&#10;40-hour battery life&#10;Premium sound quality"
          className="input-field min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Audience</label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g., Music lovers, commuters"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tone</label>
          <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-field">
            <option value="professional">Professional & Persuasive</option>
            <option value="casual">Casual & Friendly</option>
            <option value="luxury">Luxury & Premium</option>
            <option value="playful">Playful & Fun</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !productName.trim() || !features.trim()}
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
          'Generate Product Description'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      {output && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">Generated Description</h3>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Copy HTML
            </button>
          </div>
          <div
            className="prose prose-sm max-w-none text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: output }}
          />
        </div>
      )}
    </div>
  )
}
