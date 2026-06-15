import { Metadata } from 'next'
import CommunityClient from '@/components/community/CommunityClient'

export const metadata: Metadata = {
  title: 'Community Hub',
  description: 'Join the FUYOVIA community. Share feedback, suggest features, report bugs, and help shape our AI tools. Your voice matters.',
}

export default function CommunityPage() {
  return <CommunityClient />
}
