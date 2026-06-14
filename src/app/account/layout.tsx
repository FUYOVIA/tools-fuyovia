import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your FUYOVIA AI Tools account, view credits, and upgrade your plan.',
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children
}
