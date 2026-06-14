"use client"

import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Link from 'next/link'

export default function AccountPage() {
  const { user, profile, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fefdf8] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fefdf8] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-800 mb-3">Sign In Required</h1>
          <p className="text-neutral-500 mb-6">Please sign in to view your account.</p>
          <a href="/login" className="btn-primary inline-block px-8 py-3 rounded-2xl font-semibold text-sm">
            Sign In
          </a>
        </div>
      </div>
    )
  }

  const planDetails: Record<string, { name: string; color: string; credits: number }> = {
    free: { name: 'Free', color: 'bg-neutral-100 text-neutral-600', credits: 5 },
    starter: { name: 'Starter', color: 'bg-primary-50 text-primary-700', credits: 500 },
    pro: { name: 'Pro', color: 'bg-warm-50 text-warm-700', credits: 1200 },
    studio: { name: 'Studio', color: 'bg-purple-50 text-purple-700', credits: 5000 },
  }

  const currentPlan = planDetails[profile?.plan || 'free']

  return (
    <div className="min-h-screen bg-[#fefdf8]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight mb-2">My Account</h1>
          <p className="text-neutral-500">Manage your profile, plan, and credits.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-8 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-neutral-800">{profile?.display_name || 'User'}</h2>
              <p className="text-sm text-neutral-400 truncate">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentPlan.color}`}>
                  {currentPlan.name} Plan
                </span>
                <span className="text-xs text-neutral-400">
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Credits Card */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-800">AI Credits</h3>
            <Link href="/pricing" className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
              Get More Credits →
            </Link>
          </div>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-5xl font-extrabold text-neutral-900">{profile?.credits ?? 0}</span>
            <span className="text-neutral-400 mb-2">/ {currentPlan.credits} {profile?.plan === 'free' ? 'daily' : 'monthly'}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, ((profile?.credits ?? 0) / currentPlan.credits) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-400 mt-2">
            {profile?.plan === 'free'
              ? 'Daily credits refresh every 24 hours'
              : 'Monthly credits reset on your billing date'}
          </p>
        </div>

        {/* Plan Card */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-800">Current Plan</h3>
            {profile?.plan === 'free' && (
              <Link href="/pricing" className="text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 px-5 py-2 rounded-2xl transition-colors">
                Upgrade Plan
              </Link>
            )}
          </div>

          {profile?.plan === 'free' ? (
            <div className="p-5 bg-neutral-50 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-neutral-800">Free Plan</span>
                <span className="text-2xl font-extrabold text-neutral-900">$0</span>
              </div>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  10 free tools (unlimited use)
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  5 AI credits per day
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Basic support
                </li>
              </ul>
            </div>
          ) : (
            <div className="p-5 bg-primary-50 rounded-2xl border border-primary-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-primary-800">{currentPlan.name} Plan</span>
                <span className="text-2xl font-extrabold text-primary-900">
                  ${profile?.plan === 'starter' ? '9.9' : profile?.plan === 'pro' ? '19.9' : '49.9'}
                  <span className="text-sm font-normal text-primary-500">/mo</span>
                </span>
              </div>
              <p className="text-sm text-primary-600 mb-2">
                Next billing date: {profile?.plan_expires_at
                  ? new Date(profile.plan_expires_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'N/A'}
              </p>
              <Link href="/pricing" className="text-sm font-semibold text-primary-700 hover:text-primary-800">
                Manage Subscription →
              </Link>
            </div>
          )}
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft p-8">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Account</h3>
          <button
            onClick={async () => {
              setSigningOut(true)
              await signOut()
              window.location.href = '/'
            }}
            disabled={signingOut}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-2xl transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            {signingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
