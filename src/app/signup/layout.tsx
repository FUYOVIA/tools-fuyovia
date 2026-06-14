import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - FUYOVIA AI Tools',
  description: 'Create your account to access AI tools.',
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
