'use client'

import { useState } from 'react'

interface AiHumanizerClientProps {
  previewMode?: boolean
}

export default function AiHumanizerClient({ previewMode = false }: AiHumanizerClientProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sampleText = `AI technology has revolutionized various industries. It has the capability to process vast amounts of data and generate insights. Many businesses are adopting AI solutions to improve their operational efficiency. This transformative technology continues to evolve at an unprecedented pace.`

  const handleHumanize = async () => {
    if (!input.trim()) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/ai-humanizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to humanize text')
        setLoading(false)
        return
      }

      setOutput(data.data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            disabled={previewMode}
            className="w-full h-64 p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-sm leading-relaxed resize-none disabled:opacity-60"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-neutral-400">{input.length} characters</span>
            <button onClick={() => setInput(sampleText)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
              Load Sample Text
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Humanized Text</label>
          <div className="w-full h-64 p-4 rounded-2xl border-2 border-neutral-200 bg-white text-neutral-800 text-sm leading-relaxed overflow-y-auto">
            {output ? (
              <p className="whitespace-pre-wrap">{output}</p>
            ) : (
              <p className="text-neutral-400 italic">Humanized text will appear here...</p>
            )}
          </div>
          {output && (
            <button onClick={() => navigator.clipboard.writeText(output)} className="mt-3 text-xs text-primary-600 hover:text-primary-700 font-semibold">
              📋 Copy to Clipboard
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleHumanize}
          disabled={loading || !input.trim() || previewMode}
          className="btn-primary px-8 py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/>
              </svg>
              Humanizing...
            </>
          ) : '✨ Humanize Text'}
        </button>
        <button onClick={() => { setInput(''); setOutput(''); setError('') }} className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors">
          Clear
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          ❌ {error}
        </div>
      )}

      <div className="mt-8 p-5 bg-primary-50/50 rounded-2xl border border-primary-100/50">
        <h4 className="text-sm font-bold text-primary-800 mb-2">How it works</h4>
        <ul className="space-y-1.5 text-sm text-primary-700">
          <li className="flex items-start gap-2"><span>1.</span><span>Paste your AI-generated text (written by ChatGPT, Claude, etc.)</span></li>
          <li className="flex items-start gap-2"><span>2.</span><span>Our AI rewrites it to sound natural and human-like</span></li>
          <li className="flex items-start gap-2"><span>3.</span><span>Bypass AI detection tools and improve readability</span></li>
        </ul>
      </div>
    </div>
  )
}
