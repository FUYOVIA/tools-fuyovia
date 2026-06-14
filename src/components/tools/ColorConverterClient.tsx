'use client'

import { useState } from 'react'

interface ColorConverterClientProps {}

export default function ColorConverterClient(_props: ColorConverterClientProps) {
  const [input, setInput] = useState('')
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex')
  const [result, setResult] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  const parseHex = (hex: string): [number, number, number] | null => {
    const cleaned = hex.replace('#', '')
    if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null
    return [
      parseInt(cleaned.substring(0, 2), 16),
      parseInt(cleaned.substring(2, 4), 16),
      parseInt(cleaned.substring(4, 6), 16),
    ]
  }

  const toHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  const toRgb = (r: number, g: number, b: number) => {
    return `${r}, ${g}, ${b}`
  }

  const toHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return `${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%`
  }

  const convert = () => {
    setError('')
    setResult({})

    const trimmed = input.trim()
    if (!trimmed) {
      setError('Please enter a color value')
      return
    }

    let r: number, g: number, b: number

    // Try HEX
    if (/^#?[0-9A-Fa-f]{6}$/.test(trimmed) || /^#?[0-9A-Fa-f]{3}$/.test(trimmed)) {
      let hex = trimmed.replace('#', '')
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
      const parsed = parseHex(hex)
      if (parsed) [r, g, b] = parsed
      else { setError('Invalid HEX color'); return }
    }
    // Try RGB
    else if (/^\d{1,3},\s*\d{1,3},\s*\d{1,3}$/.test(trimmed)) {
      const parts = trimmed.split(',').map(s => parseInt(s.trim()))
      if (parts.some(p => p < 0 || p > 255)) { setError('RGB values must be 0-255'); return }
      [r, g, b] = parts
    }
    // Try HSL
    else if (/^\d{1,3},\s*\d{1,3}%?,\s*\d{1,3}%?$/.test(trimmed)) {
      setError('HSL input coming soon. Please use HEX or RGB for now.')
      return
    }
    else {
      setError('Invalid color format. Use HEX (#FF5733) or RGB (255, 87, 51)')
      return
    }

    setResult({
      hex: toHex(r, g, b),
      rgb: toRgb(r, g, b),
      hsl: toHsl(r, g, b),
      cssName: getCssColorName(r, g, b),
    })
  }

  const getCssColorName = (r: number, g: number, b: number) => {
    // Simple CSS named color matching
    const colors: Record<string, string> = {
      '#ff0000': 'red', '#00ff00': 'lime', '#0000ff': 'blue',
      '#ffff00': 'yellow', '#ff00ff': 'magenta', '#00ffff': 'cyan',
      '#000000': 'black', '#ffffff': 'white', '#808080': 'gray',
      '#c0c0c0': 'silver', '#800000': 'maroon', '#808000': 'olive',
      '#008000': 'green', '#008080': 'teal', '#000080': 'navy',
    }
    return colors[toHex(r, g, b).toLowerCase()] || '—'
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    alert('Copied: ' + text)
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft overflow-hidden">
        {/* 输入区 */}
        <div className="p-6 border-b border-neutral-50">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="#FF5733 or 255, 87, 51"
              className="input-field flex-1"
            />
            <button onClick={convert} className="btn-primary px-6 py-3 text-sm">
              Convert
            </button>
          </div>
          <p className="text-xs text-neutral-400">
            Supports HEX (#FF5733) and RGB (255, 87, 51) formats
          </p>
        </div>

        {/* 结果区 */}
        <div className="p-6">
          {result.hex && (
            <div className="animate-fade-in">
              {/* 颜色预览 */}
              <div
                className="h-24 rounded-2xl mb-6 border border-neutral-100"
                style={{ backgroundColor: result.hex }}
              >
                <div className="h-full rounded-2xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                    {result.hex.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 转换结果 */}
              <div className="space-y-3">
                {[
                  { label: 'HEX', value: result.hex, color: 'from-orange-400 to-amber-500' },
                  { label: 'RGB', value: result.rgb, color: 'from-blue-400 to-indigo-500' },
                  { label: 'HSL', value: result.hsl, color: 'from-emerald-400 to-teal-500' },
                  { label: 'CSS Name', value: result.cssName, color: 'from-violet-400 to-purple-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-50 hover:bg-neutral-100 transition-colors duration-200">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {item.label}
                    </div>
                    <code className="flex-1 font-mono text-sm text-neutral-800">{item.value}</code>
                    <button
                      onClick={() => copyToClipboard(item.value)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm">
              ❌ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
