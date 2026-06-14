'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface AiImageGeneratorClientProps {
  previewMode?: boolean
}

export default function AiImageGeneratorClient({ previewMode = false }: AiImageGeneratorClientProps) {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [size, setSize] = useState('1024x1024')
  const [imageUrl, setImageUrl] = useState('')
  const [revisedPrompt, setRevisedPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { authFetch } = useAuthFetch()

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setImageUrl('')
    setRevisedPrompt('')

    try {
      const res = await authFetch('/api/ai-image-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, size }),
      })
      if (res.status === 401) {
        setError('Please sign in to use this tool.')
        return
      }
      if (res.status === 402) {
        setError('Insufficient credits. You need 5 credits to use this tool.')
        return
      }
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setImageUrl(data.imageUrl || '')
        setRevisedPrompt(data.revisedPrompt || '')
      }
    } catch {
      setError('Failed to generate image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <textarea placeholder="Describe the image you want to create" className="input-field min-h-[80px]" disabled />
        <button className="btn-primary w-full" disabled>Generate Image (5 credits)</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Image Description *</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cozy coffee shop interior with warm lighting, vintage furniture, and rain outside the window. Soft bokeh effect."
          className="input-field min-h-[120px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="input-field">
            <option value="realistic">Realistic / Photo</option>
            <option value="illustration">Digital Illustration</option>
            <option value="3d">3D Render</option>
            <option value="pixel">Pixel Art</option>
            <option value="watercolor">Watercolor</option>
            <option value="minimalist">Minimalist</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="input-field">
            <option value="1024x1024">Square (1024x1024)</option>
            <option value="1024x1792">Portrait (1024x1792)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating Image...
          </>
        ) : (
          'Generate Image (5 credits)'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-soft">
            <img
              src={imageUrl}
              alt={prompt}
              className="w-full h-auto"
            />
          </div>
          <div className="flex items-center gap-3">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm flex-1 text-center"
            >
              Open Full Size
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(imageUrl)}
              className="btn-outline text-sm flex-1"
            >
              Copy Image URL
            </button>
          </div>
          {revisedPrompt && (
            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4">
              <span className="text-xs font-semibold text-neutral-500 block mb-1">AI Revised Prompt</span>
              <p className="text-sm text-neutral-600 leading-relaxed">{revisedPrompt}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
