"use client"

import { useState, useCallback } from 'react'
import { marked } from 'marked'

const SAMPLE_MD = `# Hello, Markdown! 👋

Write your **Markdown** on the left and see the live preview on the right.

## Features
- Real-time preview
- Syntax highlighting
- Export as HTML

## Code Example

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`
}
\`\`\`

> **Tip:** Markdown is great for README files, blog posts, and documentation.

---

| Column A | Column B | Column C |
|----------|----------|----------|
| Row 1    | Data     | More     |
| Row 2    | Data     | More     |
`

export default function MarkdownPreviewClient() {
  const [markdown, setMarkdown] = useState(SAMPLE_MD)
  const [copied, setCopied] = useState(false)

  const html = marked(markdown, { async: false }) as string

  const handleExportHTML = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Exported Markdown</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #292524; line-height: 1.7; }
    h1,h2,h3 { margin: 1.5em 0 0.5em; }
    code { background: #f5f5f4; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #f5f5f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 4px solid #d6d3d1; margin: 0; padding-left: 16px; color: #78716c; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #d6d3d1; padding: 8px 12px; }
    th { background: #f5f5f4; }
    img { max-width: 100%; }
    hr { border: none; border-top: 2px solid #f5f5f4; }
  </style>
</head>
<body>
${html}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopyHTML = async () => {
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => setMarkdown('')
  const handleReset = () => setMarkdown(SAMPLE_MD)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="text-xs text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors">
            Clear
          </button>
          <button onClick={handleReset} className="text-xs text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg transition-colors">
            Reset Sample
          </button>
          <span className="text-xs text-neutral-400">{markdown.length} chars · ~{Math.ceil(markdown.split(/\s+/).filter(Boolean).length / 200)} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyHTML}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200 ${
              copied
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-neutral-100 text-neutral-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
          >
            {copied ? '✓ Copied HTML' : 'Copy HTML'}
          </button>
          <button
            onClick={handleExportHTML}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export HTML
          </button>
        </div>
      </div>

      {/* Split Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: '520px' }}>
        {/* Editor */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-100 rounded-t-2xl border border-b-0 border-neutral-200">
            <div className="w-3 h-3 rounded-full bg-neutral-300"/>
            <div className="w-3 h-3 rounded-full bg-neutral-300"/>
            <div className="w-3 h-3 rounded-full bg-neutral-300"/>
            <span className="ml-2 text-xs text-neutral-500 font-medium">Markdown Editor</span>
          </div>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full px-4 py-4 font-mono text-sm text-neutral-800 bg-white border-2 border-neutral-200 rounded-b-2xl focus:border-primary-400 focus:outline-none resize-none leading-relaxed"
            placeholder="Type your Markdown here..."
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-t-2xl border border-b-0 border-emerald-200">
            <span className="text-xs font-medium text-emerald-600">● Live Preview</span>
          </div>
          <div
            className="flex-1 px-6 py-4 bg-white border-2 border-emerald-200 rounded-b-2xl overflow-y-auto prose prose-sm max-w-none leading-relaxed"
            style={{
              // manual prose styles since Tailwind Typography may not be installed
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {/* Cheatsheet */}
      <details className="bg-neutral-50 rounded-2xl border border-neutral-100">
        <summary className="cursor-pointer list-none px-5 py-3.5 flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-600">Markdown Cheatsheet</span>
          <svg className="w-4 h-4 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </summary>
        <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-neutral-600">
          {[
            ['# Heading 1', 'H1'],
            ['## Heading 2', 'H2'],
            ['**bold**', 'Bold'],
            ['*italic*', 'Italic'],
            ['`code`', 'Inline code'],
            ['```lang\ncode block\n```', 'Code block'],
            ['> blockquote', 'Blockquote'],
            ['- item', 'Bullet list'],
            ['1. item', 'Numbered list'],
            ['[text](url)', 'Link'],
            ['![alt](url)', 'Image'],
            ['---', 'Horizontal rule'],
          ].map(([syntax, label]) => (
            <div key={label} className="flex flex-col gap-1">
              <code className="bg-white border border-neutral-200 px-2 py-1 rounded text-xs font-mono text-neutral-700 whitespace-pre-wrap">{syntax}</code>
              <span className="text-neutral-400">{label}</span>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
