"use client"

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function SignupPage() {
  const { signUp } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    const { error: authError } = await signUp(email, password, displayName)

    if (authError) {
      setError(authError)
      setLoading(false)
    } else {
      setEmailSent(true)
    }
  }

  // Show email verification message
  if (emailSent) {
    return (
      <div className="min-h-screen bg-[#fefdf8] flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-large p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-3">Check Your Email</h1>
            <p className="text-neutral-500 mb-6 leading-relaxed">
              We&apos;ve sent a verification link to <span className="font-semibold text-neutral-700">{email}</span>. 
              Click the link to activate your account.
            </p>
            <a href="/login" className="btn-primary inline-block px-8 py-3 rounded-2xl font-semibold text-sm">
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fefdf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white" stroke="white" strokeWidth="0"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-neutral-800 tracking-tight">
              <span className="text-primary-600">FUYO</span>VIA
            </span>
          </a>
        </div>

        {/* Signup card */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-large p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Create Account</h1>
            <p className="text-neutral-500">Start using free tools instantly</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200/50 text-center">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Display Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="input-field"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2">Password</label>
              <input
                type="password"
                placeholder="Min 8 characters"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={8}
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3.5 rounded-2xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign In
              </Link>
            </p>
          </div>

          {/* Free start badge */}
          <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50">
            <p className="text-sm text-emerald-700 text-center">
              <span className="font-bold">🎉 Free forever:</span> 10 free tools + 5 daily AI credits
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-8">
          <a href="/" className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors inline-flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
