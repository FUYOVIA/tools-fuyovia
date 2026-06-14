export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  color: string
  tag?: string | null
  popular?: boolean
  credits?: number
}

export interface User {
  id: string
  email: string
  credits: number
  plan: 'free' | 'starter' | 'pro' | 'studio'
  planExpiresAt?: string
}

export interface ToolResult {
  success: boolean
  data?: string
  error?: string
}
