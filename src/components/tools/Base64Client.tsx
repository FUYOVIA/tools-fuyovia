"use client"

import { useState, useCallback } from 'react'
import { fromBase64, toBase64 } from 'js-base64'

type Mode = 'encode' | 'decode'

export default function Base64Client() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const process = useCallback((value: string, currentMode: Mode) => {
    setError('')
    if (!value.trim()) {
      setOutput('')
      return
    }
    try {
      if (currentMode === 'encode') {
        setOutput(toBase64(value))
      } else {
        setOutput(fromBase64(value))
      }
    } catch {
      setError('Invalid Base64 string. Make sure input is valid Base64 for decoding.')
      setOutput('')
    }
  }, [])

  const handleInput = (val: string) => {
    setInput(val)
    process(val, mode)
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    setInput(output) // swap: output becomes new input
    process(output, newMode)
  }

  const handleSwap = () => {
    const newMode: Mode = mode === 'encode' ? 'decode' : 'encode'
    handleModeChange(newMode)
  }

  const handleCopy = async () => {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-neutral-100 rounded-2xl w-fit">
        {(['encode', 'decode'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 capitalize ${
              mode === m
                ? 'bg-white shadow-soft text-neutral-800'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {m === 'encode' ? '🔒 Encode' : '🔓 Decode'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-600">
              {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
            </label>
            <button
              onClick={handleClear}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Clear
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'Enter text to encode to Base64...'
                : 'Enter Base64 string to decode...'
            }
            rows={10}
            className="input-field resize-none font-mono text-sm"
          />
          <p className="text-xs text-neutral-400">{input.length} characters</p>
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-600">
              {mode === 'encode' ? 'Base64 Output' : 'Decoded Text'}
            </label>
            <button
              onClick={handleCopy}
              disabled={!output}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
                copied
                  ? 'bg-emerald-50 text-emerald-600'
                  : output
                  ? 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-700'
                  : 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-500'
              }`}
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <textarea
            value={error || output}
            readOnly
            rows={10}
            className={`w-full px-4 py-3 rounded-xl border-2 font-mono text-sm resize-none bg-neutral-50 focus:outline-none transition-all duration-200 ${
              error
                ? 'border-red-200 text-red-500'
                : output
                ? 'border-emerald-200 text-neutral-800'
                : 'border-neutral-100 text-neutral-400'
            }`}
            placeholder={mode === 'encode' ? 'Base64 output will appear here...' : 'Decoded text will appear here...'}
          />
          <p className="text-xs text-neutral-400">{output.length} characters</p>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSwap}
          className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 px-5 py-2.5 rounded-2xl transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 16V4m0 0L3 8m4-4 4 4"/>
            <path d="M17 8v12m0 0 4-4m-4 4-4-4"/>
          </svg>
          Swap & Reverse
        </button>
      </div>

      {/* Tips */}
      <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-100">
        <p className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">How it works</p>
        <ul className="space-y-2 text-sm text-neutral-500">
          <li className="flex gap-2"><span className="text-primary-500 font-bold">Encode:</span> Convert any text/string to Base64 format (safe for URLs, HTML attributes, APIs)</li>
          <li className="flex gap-2"><span className="text-emerald-500 font-bold">Decode:</span> Convert Base64 back to its original text format</li>
          <li className="flex gap-2"><span className="text-amber-500 font-bold">Tip:</span> Base64 adds ~33% to the original string size — it's not compression, it's encoding.</li>
        </ul>
      </div>
    </div>
  )
}
