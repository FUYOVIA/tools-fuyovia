import { notFound } from 'next/navigation'
import ImageCompressorClient from '@/components/tools/ImageCompressorClient'
import QrGeneratorClient from '@/components/tools/QrGeneratorClient'
import JsonFormatterClient from '@/components/tools/JsonFormatterClient'
import WordCounterClient from '@/components/tools/WordCounterClient'
import PasswordGeneratorClient from '@/components/tools/PasswordGeneratorClient'
import ColorConverterClient from '@/components/tools/ColorConverterClient'
import Base64Client from '@/components/tools/Base64Client'
import MarkdownPreviewClient from '@/components/tools/MarkdownPreviewClient'
import MetaTagGeneratorClient from '@/components/tools/MetaTagGeneratorClient'
import PdfToolsClient from '@/components/tools/PdfToolsClient'

const FREE_TOOL_CONFIG: Record<string, { name: string; icon: string; description: string }> = {
  'image-compressor': {
    name: 'Image Compressor',
    icon: '🖼️',
    description: 'Compress images in your browser. No upload needed. 100% private.',
  },
  'pdf-tools': {
    name: 'PDF Toolkit',
    icon: '📄',
    description: 'Merge, split, and compress PDF files. Fully in-browser — your files never leave your device.',
  },
  'qr-generator': {
    name: 'QR Code Generator',
    icon: '📱',
    description: 'Generate customizable QR codes. Download as PNG or SVG.',
  },
  'json-formatter': {
    name: 'JSON Formatter',
    icon: '🧰',
    description: 'Format, validate and beautify JSON instantly.',
  },
  'password-generator': {
    name: 'Password Generator',
    icon: '🔐',
    description: 'Generate secure passwords with custom criteria.',
  },
  'word-counter': {
    name: 'Word Counter',
    icon: '📝',
    description: 'Count words, characters, and estimate reading time.',
  },
  'color-converter': {
    name: 'Color Converter',
    icon: '🎨',
    description: 'Convert between HEX, RGB, HSL color formats.',
  },
  'base64-tool': {
    name: 'Base64 Encode/Decode',
    icon: '🔤',
    description: 'Encode or decode Base64 strings instantly. Supports text input.',
  },
  'markdown-preview': {
    name: 'Markdown Preview',
    icon: '📄',
    description: 'Write Markdown and preview in real-time. Export as HTML.',
  },
  'meta-tag-generator': {
    name: 'Meta Tag Generator',
    icon: '🔍',
    description: 'Generate SEO-friendly meta tags for your website.',
  },
}

// Site URL for back links
const SITE_URL = 'https://www.fuyovia.com'

interface FreeToolPageProps {
  params: { id: string }
}

export function generateStaticParams() {
  return Object.keys(FREE_TOOL_CONFIG).map((id) => ({ id }))
}

export function generateMetadata({ params }: FreeToolPageProps) {
  const tool = FREE_TOOL_CONFIG[params.id]
  if (!tool) return {}
  return {
    title: `${tool.name} - Free Tool`,
    description: tool.description,
  }
}

export default function FreeToolPage({ params }: FreeToolPageProps) {
  const tool = FREE_TOOL_CONFIG[params.id]
  if (!tool) notFound()

  return (
    <div className="min-h-screen bg-[#fefdf8]">
      {/* Page header breadcrumb */}
      <div className="border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <a href={SITE_URL} className="text-neutral-400 hover:text-neutral-700 transition-colors flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">{tool.icon}</span>
            <div>
              <h1 className="text-base font-bold text-neutral-800 leading-tight">{tool.name}</h1>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide">Free Tool</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {params.id === 'image-compressor' && <ImageCompressorClient />}
        {params.id === 'pdf-tools' && <PdfToolsClient />}
        {params.id === 'qr-generator' && <QrGeneratorClient />}
        {params.id === 'json-formatter' && <JsonFormatterClient />}
        {params.id === 'password-generator' && <PasswordGeneratorClient />}
        {params.id === 'word-counter' && <WordCounterClient />}
        {params.id === 'color-converter' && <ColorConverterClient />}
        {params.id === 'base64-tool' && <Base64Client />}
        {params.id === 'markdown-preview' && <MarkdownPreviewClient />}
        {params.id === 'meta-tag-generator' && <MetaTagGeneratorClient />}
      </div>
    </div>
  )
}
