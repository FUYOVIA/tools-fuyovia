'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface VideoScriptClientProps {
  previewMode?: boolean
}

export default function VideoScriptClient({ previewMode = false }: VideoScriptClientProps) {
  const { authFetch } = useAuthFetch()
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('tiktok')
  const [duration, setDuration] = useState('30-60 seconds')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    setError('')
    setOutput('')

    try {
      const res = await authFetch('/api/video-script-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, platform, duration }),
      })
      if (res.status === 401) {
        setError('Please sign in to use this tool.')
        return
      }
      if (res.status === 402) {
        setError('Insufficient credits. You need 2 credits to use this tool.')
        return
      }
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setOutput(data.data || data.script || 'No script generated.')
      }
    } catch {
      setError('Failed to generate script. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <input type="text" placeholder="Video topic" className="input-field" disabled />
        <button className="btn-primary w-full" disabled>Generate Video Script</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Video Topic *</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., 5 AI tools that will replace your job"
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input-field">
            <option value="tiktok">TikTok</option>
            <option value="youtube">YouTube</option>
            <option value="shorts">YouTube Shorts</option>
            <option value="reels">Instagram Reels</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Duration</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input-field">
            <option value="15-30 seconds">15-30 seconds</option>
            <option value="30-60 seconds">30-60 seconds</option>
            <option value="1-3 minutes">1-3 minutes</option>
            <option value="5-10 minutes">5-10 minutes</option>
          </select>
        </div>
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
          'Generate Video Script'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      {output && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">Generated Script</h3>
            <button
              onClick={() => navigator.clipboard.writeText(output)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Copy
            </button>
          </div>
          <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed font-mono text-xs bg-white rounded-2xl p-4 border border-neutral-100">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
