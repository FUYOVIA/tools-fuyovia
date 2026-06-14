"use client"

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await signIn(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
    } else {
      setSuccess(true)
      // Redirect to home after successful login
      setTimeout(() => {
        window.location.href = '/'
      }, 800)
    }
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

        {/* Login card */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-large p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">Welcome Back</h1>
            <p className="text-neutral-500">Sign in to access your AI tools</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50 text-center">
              <p className="text-sm text-emerald-700 font-medium">Successfully signed in! Redirecting...</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-2xl border border-red-200/50 text-center">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-3.5 rounded-2xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || success}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-center gap-4 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Secure login
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              SSL encrypted
            </span>
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
