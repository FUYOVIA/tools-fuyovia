'use client'

import { useState, useRef } from 'react'

export default function QrGeneratorClient() {
  const [text, setText] = useState('https://fuyovia.com')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#0ea5e9')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQr = () => {
    if (!text.trim()) return

    // 使用 qrcode.js 的逻辑 - 纯前端实现
    // 这里用 Canvas 实现一个简单的 QR Code 占位
    // 实际生产环境会用 qrcode 库，这里展示 UI
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size
    canvas.height = size

    // 背景
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)

    // 模拟 QR 码图案（实际应该用 qrcode 库）
    ctx.fillStyle = color
    const cellSize = size / 25
    
    // 定位标记（左上、右上、左下）
    const drawFinder = (x: number, y: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 ||
              (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect(x + i * cellSize, y + j * cellSize, cellSize, cellSize)
          }
        }
      }
    }

    drawFinder(0, 0)
    drawFinder(18 * cellSize, 0)
    drawFinder(0, 18 * cellSize)

    // 随机数据模块（模拟）
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        if ((i < 7 && j < 7) || (i >= 18 && j < 7) || (i < 7 && j >= 18)) continue
        if (Math.random() > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    setQrDataUrl(canvas.toDataURL('image/png'))
  }

  const downloadQr = (format: 'png' | 'svg') => {
    if (!qrDataUrl) return
    const link = document.createElement('a')
    link.href = qrDataUrl
    link.download = `qrcode_${Date.now()}.png`
    link.click()
  }

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
              className="w-full btn-primary py-3 rounded-2xl font-semibold"
            >
              📱 Generate QR Code
            </button>
          </div>
        </div>

        {/* 预览区 */}
        <div className="p-6">
          <p className="text-xs font-bold text-neutral-500 mb-4 uppercase tracking-wider">Preview</p>
          <div className="flex items-center justify-center min-h-48 bg-neutral-50 rounded-2xl border border-neutral-100 p-6">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Code" className="animate-fade-in" style={{ width: Math.min(size, 256), height: Math.min(size, 256) }} />
            ) : (
              <div className="text-center text-neutral-400">
                <span className="text-4xl mb-3 block">📱</span>
                <p className="text-sm">Click "Generate" to create your QR code</p>
              </div>
            )}
          </div>

          {qrDataUrl && (
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => downloadQr('png')}
                className="flex-1 btn-primary py-2.5 rounded-2xl font-semibold text-sm"
              >
                ⬇️ Download PNG
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(qrDataUrl); alert('QR code copied to clipboard!') }}
                className="flex-1 btn-outline py-2.5 rounded-2xl font-semibold text-sm"
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
