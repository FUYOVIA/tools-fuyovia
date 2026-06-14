'use client'

import { useState, useRef } from 'react'

export default function ImageCompressorClient() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [compressed, setCompressed] = useState<string>('')
  const [originalSize, setOriginalSize] = useState<number>(0)
  const [compressedSize, setCompressedSize] = useState<number>(0)
  const [quality, setQuality] = useState<number>(80)
  const [format, setFormat] = useState<string>('image/jpeg')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setFile(selected)
    setOriginalSize(selected.size)
    setError('')
    setCompressed('')

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(selected)
  }

  const compressImage = () => {
    if (!file) return
    setLoading(true)
    setError('')

    const img = new window.Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('Failed to process image')
        setLoading(false)
        return
      }

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Compression failed. Try a different image.')
            setLoading(false)
            return
          }

          setCompressedSize(blob.size)
          const reader = new FileReader()
          reader.onload = (ev) => {
            setCompressed(ev.target?.result as string)
            setLoading(false)
          }
          reader.readAsDataURL(blob)
        },
        format,
        quality / 100
      )
    }

    img.onerror = () => {
      setError('Failed to load image')
      setLoading(false)
    }

    const reader = new FileReader()
    reader.onload = (ev) => { img.src = ev.target?.result as string }
    reader.readAsDataURL(file)
  }

  const downloadCompressed = () => {
    if (!compressed) return
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg'
    const link = document.createElement('a')
    link.href = compressed
    link.download = `compressed_${file?.name?.split('.')[0] || 'image'}.${ext}`
    link.click()
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const reduction = originalSize > 0 && compressedSize > 0
    ? ((1 - compressedSize / originalSize) * 100).toFixed(1)
    : null

  return (
    <div className="max-w-2xl mx-auto">
      {/* 上传区 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-neutral-200 rounded-3xl p-10 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-300 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors duration-200">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
        </div>
        <p className="font-semibold text-neutral-700 mb-1">
          {file ? file.name : 'Click to upload an image'}
        </p>
        <p className="text-sm text-neutral-400">
          Supports JPG, PNG, WebP. Max 10MB.
        </p>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* 预览区 */}
      {preview && (
        <div className="mt-8 animate-fade-in">
          <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-soft">
            {/* 设置区 */}
            <div className="p-6 border-b border-neutral-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-2">Quality</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-primary-500"
                  />
                  <div className="flex justify-between text-xs text-neutral-400 mt-1">
                    <span>Smaller file</span>
                    <span className="font-semibold text-neutral-700">{quality}%</span>
                    <span>Better quality</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-2">Output Format</label>
                  <div className="flex gap-2">
                    {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          format === fmt
                            ? 'bg-primary-500 text-white shadow-soft'
                            : 'bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {fmt.split('/')[1].toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={compressImage}
                disabled={loading}
                className="w-full btn-primary py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/>
                    </svg>
                    Compressing...
                  </span>
                ) : (
                  '🚀 Compress Image'
                )}
              </button>
            </div>

            {/* 预览对比 */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">Original</p>
                  <div className="rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
                    <img src={preview} alt="Original" className="w-full h-auto object-contain max-h-64 mx-auto" />
                  </div>
                  <p className="text-sm text-neutral-500 mt-2 text-center">{formatSize(originalSize)}</p>
                </div>

                {compressed && (
                  <div className="animate-fade-in">
                    <p className="text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">Compressed</p>
                    <div className="rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100">
                      <img src={compressed} alt="Compressed" className="w-full h-auto object-contain max-h-64 mx-auto" />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-neutral-500">{formatSize(compressedSize)}</p>
                      {reduction && (
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                          -{reduction}%
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {compressed && (
                <button
                  onClick={downloadCompressed}
                  className="w-full mt-6 btn-primary py-3 rounded-2xl font-semibold"
                >
                  ⬇️ Download Compressed Image
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
