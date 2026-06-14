"use client"

import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'

type Tab = 'merge' | 'split' | 'compress'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function bytesToBlob(bytes: Uint8Array): Blob {
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// ─────────────────────────────────────────────────────────────────────────────
// Merge Tab
// ─────────────────────────────────────────────────────────────────────────────
function MergeTab() {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const pdfs = Array.from(newFiles).filter((f) => f.type === 'application/pdf')
    setFiles((prev) => [...prev, ...pdfs])
    setDone(false)
  }

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx))

  const moveUp = (idx: number) => {
    if (idx === 0) return
    setFiles((prev) => {
      const arr = [...prev]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      return arr
    })
  }

  const moveDown = (idx: number) => {
    setFiles((prev) => {
      if (idx === prev.length - 1) return prev
      const arr = [...prev]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      return arr
    })
  }

  const merge = async () => {
    if (files.length < 2) return
    setLoading(true)
    try {
      const merged = await PDFDocument.create()
      for (const file of files) {
        const buf = await readFileAsArrayBuffer(file)
        const pdf = await PDFDocument.load(buf)
        const pages = await merged.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((p) => merged.addPage(p))
      }
      const bytes = await merged.save()
      downloadBlob(bytesToBlob(bytes), 'merged.pdf')
      setDone(true)
    } catch (e) {
      alert('Failed to merge PDFs. Make sure files are valid PDFs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-primary-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all duration-200"
      >
        <div className="text-4xl mb-3">📂</div>
        <p className="font-semibold text-neutral-700 mb-1">Drop PDF files here or click to select</p>
        <p className="text-sm text-neutral-400">Multiple PDFs · No size limit · Browser-only</p>
        <input ref={inputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-neutral-600">{files.length} file{files.length > 1 ? 's' : ''} selected</p>
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white border border-neutral-100 rounded-xl px-4 py-3">
              <span className="text-lg">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">{f.name}</p>
                <p className="text-xs text-neutral-400">{formatBytes(f.size)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">↑</button>
                <button onClick={() => moveDown(idx)} disabled={idx === files.length - 1} className="p-1 text-neutral-400 hover:text-neutral-700 disabled:opacity-30">↓</button>
                <button onClick={() => removeFile(idx)} className="p-1 text-red-400 hover:text-red-600">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length >= 2 && (
        <button
          onClick={merge}
          disabled={loading}
          className={`w-full btn-primary py-3.5 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {loading ? '⏳ Merging...' : done ? '✓ Done! Click to merge again' : `Merge ${files.length} PDFs`}
        </button>
      )}
      {files.length === 1 && <p className="text-sm text-amber-600 text-center">Add at least 2 PDF files to merge.</p>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Split Tab
// ─────────────────────────────────────────────────────────────────────────────
function SplitTab() {
  const [file, setFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState<number>(0)
  const [range, setRange] = useState({ from: '1', to: '' })
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (f: File | null) => {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    try {
      const buf = await readFileAsArrayBuffer(f)
      const pdf = await PDFDocument.load(buf)
      const n = pdf.getPageCount()
      setTotalPages(n)
      setRange({ from: '1', to: String(n) })
    } catch {
      alert('Could not read this PDF file.')
    }
  }

  const split = async () => {
    if (!file) return
    const from = Math.max(1, parseInt(range.from) || 1)
    const to = Math.min(totalPages, parseInt(range.to) || totalPages)
    if (from > to) return alert('Invalid page range.')
    setLoading(true)
    try {
      const buf = await readFileAsArrayBuffer(file)
      const src = await PDFDocument.load(buf)
      const out = await PDFDocument.create()
      const pages = await out.copyPages(src, Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i))
      pages.forEach((p) => out.addPage(p))
      const bytes = await out.save()
      downloadBlob(bytesToBlob(bytes), `pages-${from}-${to}.pdf`)
    } catch {
      alert('Failed to split PDF.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-primary-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all duration-200"
      >
        {file ? (
          <>
            <div className="text-4xl mb-2">📄</div>
            <p className="font-semibold text-neutral-700">{file.name}</p>
            <p className="text-sm text-neutral-400 mt-1">{totalPages} pages · {formatBytes(file.size)}</p>
            <p className="text-xs text-primary-500 mt-2">Click to change file</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">✂️</div>
            <p className="font-semibold text-neutral-700 mb-1">Drop a PDF file here or click to select</p>
            <p className="text-sm text-neutral-400">Extract specific page ranges from your PDF</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
      </div>

      {totalPages > 0 && (
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 space-y-4">
          <p className="text-sm font-semibold text-neutral-700">Select Page Range</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-neutral-500 mb-1 block">From page</label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={range.from}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                className="input-field text-center"
              />
            </div>
            <div className="text-neutral-400 pt-5">→</div>
            <div className="flex-1">
              <label className="text-xs text-neutral-500 mb-1 block">To page</label>
              <input
                type="number"
                min={1}
                max={totalPages}
                value={range.to}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                className="input-field text-center"
              />
            </div>
            <div className="pt-5 text-xs text-neutral-400">/ {totalPages} pages</div>
          </div>

          <button onClick={split} disabled={loading} className={`w-full btn-primary py-3.5 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
            {loading ? '⏳ Splitting...' : `Extract Pages ${range.from}–${range.to}`}
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Compress Tab
// ─────────────────────────────────────────────────────────────────────────────
function CompressTab() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ originalSize: number; newSize: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f || f.type !== 'application/pdf') return
    setFile(f)
    setResult(null)
  }

  const compress = async () => {
    if (!file) return
    setLoading(true)
    try {
      const buf = await readFileAsArrayBuffer(file)
      const pdf = await PDFDocument.load(buf)
      // pdf-lib saves with object streams which reduces size
      const bytes = await pdf.save({ useObjectStreams: true })
      const blob = bytesToBlob(bytes)
      setResult({ originalSize: file.size, newSize: bytes.byteLength })
      downloadBlob(blob, `compressed-${file.name}`)
    } catch {
      alert('Failed to compress PDF.')
    } finally {
      setLoading(false)
    }
  }

  const savings = result ? ((result.originalSize - result.newSize) / result.originalSize * 100) : 0

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> This performs lossless structural compression using PDF object streams. For image-heavy PDFs, the reduction may be limited. No images are resampled.
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-primary-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/40 transition-all duration-200"
      >
        {file ? (
          <>
            <div className="text-4xl mb-2">📄</div>
            <p className="font-semibold text-neutral-700">{file.name}</p>
            <p className="text-sm text-neutral-400 mt-1">{formatBytes(file.size)}</p>
            <p className="text-xs text-primary-500 mt-2">Click to change file</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">🗜️</div>
            <p className="font-semibold text-neutral-700 mb-1">Drop a PDF file here or click to select</p>
            <p className="text-sm text-neutral-400">Reduce file size using lossless compression</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
      </div>

      {file && (
        <button onClick={compress} disabled={loading} className={`w-full btn-primary py-3.5 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {loading ? '⏳ Compressing...' : 'Compress PDF'}
        </button>
      )}

      {result && (
        <div className={`rounded-2xl p-5 border ${savings > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{savings > 0 ? '🎉' : '📊'}</span>
            <div>
              <p className="font-bold text-neutral-800 mb-2">
                {savings > 0 ? `Saved ${savings.toFixed(1)}%!` : 'Already optimized'}
              </p>
              <div className="text-sm text-neutral-600 space-y-1">
                <p>Original: <strong>{formatBytes(result.originalSize)}</strong></p>
                <p>Compressed: <strong>{formatBytes(result.newSize)}</strong></p>
                {savings > 0 && <p className="text-emerald-700">Saved: <strong>{formatBytes(result.originalSize - result.newSize)}</strong></p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function PdfToolsClient() {
  const [tab, setTab] = useState<Tab>('merge')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'merge', label: 'Merge PDFs', icon: '🔗' },
    { id: 'split', label: 'Split / Extract', icon: '✂️' },
    { id: 'compress', label: 'Compress', icon: '🗜️' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Privacy badge */}
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <span className="text-sm text-emerald-700 font-medium">100% browser-based · Your files never leave your device</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-neutral-100 rounded-2xl">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === id
                ? 'bg-white shadow-soft text-neutral-800'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-64">
        {tab === 'merge' && <MergeTab />}
        {tab === 'split' && <SplitTab />}
        {tab === 'compress' && <CompressTab />}
      </div>
    </div>
  )
}
