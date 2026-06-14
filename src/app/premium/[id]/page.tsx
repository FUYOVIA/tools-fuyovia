import { notFound } from 'next/navigation'
import AiHumanizerClient from '@/components/tools/AiHumanizerClient'
import SocialMediaWriterClient from '@/components/tools/SocialMediaWriterClient'
import SeoBlogWriterClient from '@/components/tools/SeoBlogWriterClient'
import ProductDescriptionClient from '@/components/tools/ProductDescriptionClient'
import EmailCopyClient from '@/components/tools/EmailCopyClient'
import VideoScriptClient from '@/components/tools/VideoScriptClient'
import HashtagGeneratorClient from '@/components/tools/HashtagGeneratorClient'
import ResumeOptimizerClient from '@/components/tools/ResumeOptimizerClient'
import ReadabilityOptimizerClient from '@/components/tools/ReadabilityOptimizerClient'
import AiImageGeneratorClient from '@/components/tools/AiImageGeneratorClient'

const PREMIUM_TOOL_CONFIG: Record<string, { name: string; icon: string; description: string; credits: number }> = {
  'ai-humanizer': {
    name: 'AI Humanizer',
    icon: '✨',
    description: 'Make AI-generated text sound natural and human.',
    credits: 2,
  },
  'social-media-generator': {
    name: 'Social Media Writer',
    icon: '📲',
    description: 'Generate optimized captions for multiple platforms.',
    credits: 1,
  },
  'product-description': {
    name: 'Product Description Writer',
    icon: '🛍️',
    description: 'Generate compelling e-commerce product descriptions.',
    credits: 1,
  },
  'email-copy-generator': {
    name: 'Email Copy Writer',
    icon: '📧',
    description: 'Write high-converting email marketing copy.',
    credits: 1,
  },
  'seo-blog-generator': {
    name: 'SEO Blog Writer',
    icon: '📊',
    description: 'Generate long-form SEO-optimized blog posts.',
    credits: 3,
  },
  'video-script-generator': {
    name: 'Video Script Writer',
    icon: '🎬',
    description: 'Generate video scripts for TikTok, YouTube, and Shorts.',
    credits: 2,
  },
  'ai-image-generator': {
    name: 'AI Image Generator',
    icon: '🎨',
    description: 'Generate images from text descriptions.',
    credits: 5,
  },
  'hashtag-generator': {
    name: 'Hashtag Generator',
    icon: '🏷️',
    description: 'Generate optimal hashtags for Instagram and TikTok.',
    credits: 1,
  },
  'resume-optimizer': {
    name: 'Resume & Cover Letter',
    icon: '💼',
    description: 'Optimize your resume and generate tailored cover letters.',
    credits: 2,
  },
  'readability-optimizer': {
    name: 'Readability Optimizer',
    icon: '📖',
    description: 'Improve your writing clarity and flow.',
    credits: 1,
  },
}

interface PremiumToolPageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return Object.keys(PREMIUM_TOOL_CONFIG).map((id) => ({ id }))
}

export function generateMetadata({ params }: PremiumToolPageProps) {
  const tool = PREMIUM_TOOL_CONFIG[params.id]
  if (!tool) return {}
  return {
    title: `${tool.name} - Premium AI Tool | FUYOVIA AI Tools`,
    description: tool.description,
  }
}

function getToolComponent(id: string) {
  switch (id) {
    case 'ai-humanizer':
      return <AiHumanizerClient />
    case 'social-media-generator':
      return <SocialMediaWriterClient />
    case 'seo-blog-generator':
      return <SeoBlogWriterClient />
    case 'product-description':
      return <ProductDescriptionClient />
    case 'email-copy-generator':
      return <EmailCopyClient />
    case 'video-script-generator':
      return <VideoScriptClient />
    case 'ai-image-generator':
      return <AiImageGeneratorClient />
    case 'hashtag-generator':
      return <HashtagGeneratorClient />
    case 'resume-optimizer':
      return <ResumeOptimizerClient />
    case 'readability-optimizer':
      return <ReadabilityOptimizerClient />
    default:
      return null
  }
}

// Site URL for back links
const SITE_URL = 'https://www.fuyovia.com'

export default function PremiumToolPage({ params }: PremiumToolPageProps) {
  const tool = PREMIUM_TOOL_CONFIG[params.id]
  if (!tool) notFound()

  return (
    <div className="min-h-screen bg-[#fefdf8]">
      {/* Top bar */}
      <div className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <a href={SITE_URL} className="text-neutral-400 hover:text-neutral-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tool.icon}</span>
            <div>
              <h1 className="text-base font-bold text-neutral-800">{tool.name}</h1>
              <p className="text-xs text-amber-600 font-semibold">PREMIUM TOOL · {tool.credits} credit{tool.credits > 1 ? 's' : ''} / use</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Tool card */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-neutral-50">
            <h2 className="font-bold text-neutral-800 mb-1">Try {tool.name}</h2>
            <p className="text-sm text-neutral-500">{tool.description}</p>
          </div>

          <div className="p-6">
            {getToolComponent(params.id)}
          </div>
        </div>

        {/* Free trial notice */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200/50 rounded-2xl">
          <p className="text-sm text-amber-700">
            <strong>Free Trial:</strong> AI tools are currently in free trial mode. For production use with credits and会员 plans, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
