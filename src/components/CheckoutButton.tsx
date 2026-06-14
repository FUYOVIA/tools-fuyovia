"use client"

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAuthFetch } from '@/lib/client-helpers'

interface CheckoutButtonProps {
  planId: string
  planName: string
  isCurrentPlan: boolean
  btnStyle: 'primary' | 'warm' | 'outline'
  children: React.ReactNode
}

export default function CheckoutButton({
  planId,
  planName,
  isCurrentPlan,
  btnStyle,
  children,
}: CheckoutButtonProps) {
  const { user } = useAuth()
  const { authFetch } = useAuthFetch()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!user) {
      window.location.href = '/signup'
      return
    }

    setLoading(true)

    try {
      const res = await authFetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, type: 'subscription' }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert(data.error || 'Failed to start checkout')
        setLoading(false)
        return
      }

      window.location.href = data.url
    } catch {
      alert('Network error. Please try again.')
      setLoading(false)
    }
  }

  const styleClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-soft hover:shadow-medium',
    warm: 'bg-warm-500 text-white hover:bg-warm-600 shadow-soft hover:shadow-medium',
    outline: isCurrentPlan
      ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
      : 'border-2 border-primary-200 text-primary-700 hover:bg-primary-50',
  }

  return (
    <button
      onClick={handleClick}
      disabled={isCurrentPlan || loading}
      className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] ${
        styleClasses[btnStyle]
      } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {loading ? 'Redirecting...' : isCurrentPlan ? 'Current Plan' : children}
    </button>
  )
}
