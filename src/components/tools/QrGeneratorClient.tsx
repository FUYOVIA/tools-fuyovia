'use client'

import { useState, useRef, useCallback } from 'react'
import QRCode from 'qrcode'

export default function QrGeneratorClient() {
  const [text, setText] = useState('https://fuyovia.com')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#0ea5e9')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [svgString, setSvgString] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQr = useCallback(async () => {
    if (!text.trim()) return

    setIsGenerating(true)
    try {
      // 生成 Canvas QR 码（用于 PNG 下载和预览）
      const canvas = canvasRef.current
      if (!canvas) return

      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      })

      // 生成 data URL 用于预览
      const dataUrl = canvas.toDataURL('image/png')
      setQrDataUrl(dataUrl)

      // 生成 SVG 字符串（用于 SVG 下载）
      const svg = await QRCode.toString(text, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: bgColor,
        },
        errorCorrectionLevel: 'M',
      })
      setSvgString(svg)
    } catch (err) {
      console.error('QR Code generation failed:', err)
      alert('Failed to generate QR code. Please check your input.')
    } finally {
      setIsGenerating(false)
    }
  }, [text, size, color, bgColor])

  const downloadQr = useCallback((format: 'png' | 'svg') => {
    if (!qrDataUrl && !svgString) return

    const link = document.createElement('a')
    
    if (format === 'png') {
      link.href = qrDataUrl
      link.download = `qrcode_${Date.now()}.png`
    } else {
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      link.href = URL.createObjectURL(blob)
      link.download = `qrcode_${Date.now()}.svg`
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 清理 URL object
    if (format === 'svg') {
      setTimeout(() => URL.revokeObjectURL(link.href), 100)
    }
  }, [qrDataUrl, svgString])

  const copyToClipboard = useCallback(async () => {
    if (!qrDataUrl) return

    try {
      // 将 Canvas 转换为 Blob
      const canvas = canvasRef.current
      if (!canvas) return

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ])
        alert('QR code image copied to clipboard!')
      }
    } catch (err) {
      console.error('Failed to copy image:', err)
      alert('Failed to copy image. Try downloading instead.')
    }
  }, [qrDataUrl])

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft overflow-hidden">
        {/* 设置区 */}
        <div className="p-6 border-b border-neutral-50">
          <div className="space-y-5">
            {/* 输入文本 */}
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Content / URL</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text..."
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 尺寸 */}
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">Size</label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  step="16"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-primary-500"
                />
                <div className="flex justify-between text-xs text-neutral-400 mt-1">
                  <span>128px</span>
                  <span className="font-semibold text-neutral-700">{size}px</span>
                  <span>512px</span>
                </div>
              </div>

              {/* 颜色 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">QR Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-2 border-neutral-200 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-500 font-mono">{color}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-wider">BG Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-2 border-neutral-200 cursor-pointer"
                    />
                    <span className="text-xs text-neutral-500 font-mono">{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={generateQr}
              disabled={isGenerating || !text.trim()}
              className="w-full btn-primary py-3 rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? '⏳ Generating...' : '📱 Generate QR Code'}
            </button>
          </div>
        </div>

        {/* 预览区 */}
        <div className="p-6">
          <p className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-wider">Preview</p>
          <div className="flex items-center justify-center min-h-48 bg-neutral-50 rounded-2xl border border-neutral-100 p-6">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="animate-fade-in max-w-full h-auto" style={{ maxWidth: Math.min(size, 400) }} />
            ) : (
              <div className="text-center text-neutral-400">
                <span className="text-4xl mb-3 block">📱</span>
                <p className="text-sm">Enter content and click "Generate" to create your QR code</p>
              </div>
            )}
          </div>

          {qrDataUrl && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
              <button
                onClick={() => downloadQr('png')}
                className="btn-primary py-2.5 rounded-2xl font-semibold text-sm"
              >
                ⬇️ Download PNG
              </button>
              <button
                onClick={() => downloadQr('svg')}
                className="btn-primary py-2.5 rounded-2xl font-semibold text-sm bg-neutral-800 hover:bg-neutral-900"
              >
                ⬇️ Download SVG
              </button>
              <button
                onClick={copyToClipboard}
                className="btn-outline py-2.5 rounded-2xl font-semibold text-sm"
              >
                📋 Copy Image
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 隐藏 Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
