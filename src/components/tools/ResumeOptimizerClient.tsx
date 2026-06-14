'use client'

import { useState } from 'react'
import { useAuthFetch } from '@/lib/client-helpers'

interface ResumeOptimizerClientProps {
  previewMode?: boolean
}

export default function ResumeOptimizerClient({ previewMode = false }: ResumeOptimizerClientProps) {
  const [resumeContent, setResumeContent] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [industry, setIndustry] = useState('')
  const [focusArea, setFocusArea] = useState('overall optimization')
  const [output, setOutput] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume')
  const { authFetch } = useAuthFetch()

  const handleGenerate = async () => {
    if (!resumeContent.trim() || !targetRole.trim()) return
    setLoading(true)
    setError('')
    setOutput(null)

    try {
      const res = await authFetch('/api/resume-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, targetRole, industry, focusArea }),
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
        setOutput(data)
      }
    } catch {
      setError('Failed to optimize resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (previewMode) {
    return (
      <div className="space-y-4 opacity-60 pointer-events-none">
        <input type="text" placeholder="Target role" className="input-field" disabled />
        <textarea placeholder="Paste your current resume" className="input-field min-h-[80px]" disabled />
        <button className="btn-primary w-full" disabled>Optimize Resume & Generate Cover Letter</button>
      </div>
    )
  }

  const optimizedResume = (output?.optimizedResume as string) || ''
  const coverLetter = (output?.coverLetter as string) || ''
  const keywords = (output?.keywords as string[]) || []
  const suggestions = (output?.suggestions as string[]) || []

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Target Role *</label>
        <input
          type="text"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g., Senior Product Manager at a tech company"
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Current Resume Content *</label>
        <textarea
          value={resumeContent}
          onChange={(e) => setResumeContent(e.target.value)}
          placeholder="Paste your current resume text here..."
          className="input-field min-h-[150px]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Industry</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g., Technology, Healthcare"
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Focus Area</label>
          <select value={focusArea} onChange={(e) => setFocusArea(e.target.value)} className="input-field">
            <option value="overall optimization">Overall Optimization</option>
            <option value="ats keywords">ATS Keywords</option>
            <option value="achievements focus">Achievement-Focused</option>
            <option value="career change">Career Change</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !resumeContent.trim() || !targetRole.trim()}
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
          'Optimize Resume & Generate Cover Letter'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">{error}</div>
      )}

      {output && (
        <div className="space-y-4">
          {keywords.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
              <h4 className="text-sm font-semibold text-purple-700 mb-2">Recommended ATS Keywords</h4>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, i) => (
                  <span key={i} className="bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">{kw}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-neutral-50 border border-neutral-200 rounded-3xl overflow-hidden">
            <div className="flex border-b border-neutral-200">
              <button
                onClick={() => setActiveTab('resume')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  activeTab === 'resume' ? 'text-primary-700 bg-white border-b-2 border-primary-500' : 'text-neutral-500'
                }`}
              >
                Optimized Resume
              </button>
              <button
                onClick={() => setActiveTab('coverLetter')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  activeTab === 'coverLetter' ? 'text-primary-700 bg-white border-b-2 border-primary-500' : 'text-neutral-500'
                }`}
              >
                Cover Letter
              </button>
            </div>
            <div className="p-5">
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => navigator.clipboard.writeText(activeTab === 'resume' ? optimizedResume : coverLetter)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Copy
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed">
                {activeTab === 'resume' ? optimizedResume : coverLetter}
              </div>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-2">Improvement Suggestions</h4>
              <ul className="space-y-1.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {s}
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
