"use client"

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { user, profile, loading, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform duration-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="white" stroke="white" strokeWidth="0"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-neutral-800 tracking-tight">
              <span className="text-primary-600">FUYO</span>VIA <span className="text-neutral-400 font-normal text-sm">Tools</span>
            </span>
          </a>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a href="/pricing" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors duration-200 font-medium hidden sm:inline">
              Pricing
            </a>

            {loading ? (
              <div className="w-8 h-8 rounded-2xl bg-neutral-100 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 hover:bg-neutral-50 rounded-2xl px-3 py-1.5 transition-colors duration-200"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                    {profile?.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-neutral-800 leading-tight">
                      {profile?.display_name || user.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-neutral-400 leading-tight">
                      {profile?.credits ?? 0} credits &middot; {profile?.plan || 'free'}
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-neutral-100 shadow-large py-2 animate-fade-in z-50">
                    <div className="px-4 py-3 border-b border-neutral-50">
                      <p className="text-sm font-semibold text-neutral-800">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{user.email}</p>
                    </div>
                    <a href="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Account
                    </a>
                    <a href="/pricing" className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                      Upgrade Plan
                    </a>
                    <div className="border-t border-neutral-50 mt-1 pt-1">
                      <button
                        onClick={async () => { setDropdownOpen(false); await signOut(); }}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/login" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors duration-200 font-medium hidden sm:inline">
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 px-5 py-2 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
