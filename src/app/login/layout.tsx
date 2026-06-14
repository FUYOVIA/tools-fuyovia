import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - FUYOVIA AI Tools',
  description: 'Sign in to access premium AI tools.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
