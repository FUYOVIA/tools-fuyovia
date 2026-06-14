'use client'

import { useState } from 'react'

export default function WordCounterClient() {
  const [text, setText] = useState('')
  
  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    sentences: text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length,
    paragraphs: text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(Boolean).length,
    readingTime: Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200)),
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setText(text)
    } catch {
      alert('Clipboard access denied. Please paste manually.')
    }
  }

  const handleClear = () => setText('')

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft overflow-hidden">
        {/* 输入区 */}
        <div className="p-6 border-b border-neutral-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-neutral-800">Word Counter</h3>
            <div className="flex items-center gap-2">
              <button onClick={handlePaste} className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                📋 Paste
              </button>
              <button onClick={handleClear} className="text-xs text-neutral-500 hover:text-neutral-700">
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="w-full h-48 p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-neutral-800 placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all duration-200 text-sm leading-relaxed resize-none"
          />
        </div>

        {/* 统计区 */}
        <div className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Words', value: stats.words, color: 'from-blue-400 to-indigo-500' },
              { label: 'Characters', value: stats.characters, color: 'from-emerald-400 to-teal-500' },
              { label: 'Chars (no space)', value: stats.charactersNoSpaces, color: 'from-cyan-400 to-sky-500' },
              { label: 'Sentences', value: stats.sentences, color: 'from-amber-400 to-orange-500' },
              { label: 'Paragraphs', value: stats.paragraphs, color: 'from-violet-400 to-purple-500' },
              { label: 'Reading Time', value: `${stats.readingTime} min`, color: 'from-rose-400 to-pink-500' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-2xl bg-neutral-50 border border-neutral-100 hover:border-primary-200 transition-all duration-200">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.color} mx-auto mb-2 flex items-center justify-center`}>
                  <span className="text-white text-xs font-bold">{stat.value.toString().length > 4 ? '∞' : stat.value}</span>
                </div>
                <p className="text-xs text-neutral-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* 详细统计 */}
          {text.trim() !== '' && (
            <div className="mt-6 p-5 bg-primary-50/30 rounded-2xl animate-fade-in">
              <h4 className="text-sm font-bold text-neutral-800 mb-3">Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Average word length</span>
                  <span className="font-semibold text-neutral-800">
                    {stats.words > 0 ? (stats.charactersNoSpaces / stats.words).toFixed(1) : 0} chars
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Words per sentence</span>
                  <span className="font-semibold text-neutral-800">
                    {stats.sentences > 0 ? (stats.words / stats.sentences).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
