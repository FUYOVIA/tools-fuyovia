'use client'

import { useState } from 'react'

export default function JsonFormatterClient() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)

  const formatJson = () => {
    if (!input.trim()) {
      setError('Please paste some JSON to format')
      return
    }

    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError('')
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`)
      setOutput('')
    }
  }

  const minifyJson = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError('')
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`)
    }
  }

  const loadSample = () => {
    setInput(JSON.stringify({
      "name": "FUYOVIA AI Tools",
      "version": "1.0",
      "tools": [
        { "id": 1, "name": "Image Compressor", "free": true },
        { "id": 2, "name": "AI Humanizer", "free": false, "credits": 2 }
      ],
      "pricing": { "starter": 9.9, "pro": 19.9 }
    }, null, 2))
    setError('')
    setOutput('')
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft overflow-hidden">
        <div className="p-6 border-b border-neutral-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800">JSON Formatter</h3>
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-500">Indent:</label>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="text-xs border border-neutral-200 rounded-lg px-2 py-1 bg-white"
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Tab</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={formatJson} className="btn-primary text-sm py-2.5 rounded-xl font-semibold">
              ✨ Format
            </button>
            <button onClick={minifyJson} className="btn-outline text-sm py-2.5 rounded-xl font-semibold">
              📦 Minify
            </button>
            <button onClick={loadSample} className="text-sm py-2.5 rounded-xl font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200">
              📄 Sample
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Input JSON</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Paste your JSON here...'
                className="w-full h-64 p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-sm font-mono leading-relaxed resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Formatted Output</label>
              <pre className="w-full h-64 p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50 text-neutral-800 text-sm font-mono leading-relaxed overflow-auto">
                {output ? (
                  <code className="text-emerald-700">{output}</code>
                ) : (
                  <span className="text-neutral-400 italic">Formatted JSON will appear here...</span>
                )}
              </pre>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              ❌ {error}
            </div>
          )}

          {output && !error && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm flex items-center justify-between">
              <span>✅ JSON formatted successfully!</span>
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-emerald-600 hover:text-emerald-800 font-semibold"
              >
                📋 Copy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
