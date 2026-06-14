/**
 * Client-side auth helper: returns a fetch wrapper that attaches the Bearer token.
 * Use as a hook inside your component:
 *
 *   const { authFetch } = useAuthFetch()
 *   // later:
 *   const res = await authFetch('/api/some-route', { method: 'POST', ... })
 */
import { useAuth } from '@/context/AuthContext'
import { useCallback } from 'react'

export function useAuthFetch() {
  const { getToken } = useAuth()

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken()

    return fetch(url, {
      ...options,
      headers: {
        ...((options.headers as Record<string, string>) || {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    })
  }, [getToken])

  return { authFetch }
}
