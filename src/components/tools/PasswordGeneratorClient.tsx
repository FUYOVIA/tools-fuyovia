'use client'

import { useState } from 'react'

export default function PasswordGeneratorClient() {
  const [password, setPassword] = useState('')
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [copied, setCopied] = useState(false)

  const generate = () => {
    let chars = ''
    if (options.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (options.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (options.numbers) chars += '0123456789'
    if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (chars === '') {
      alert('Please select at least one character type')
      return
    }

    let result = ''
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
    setPassword(result)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    if (!password) return
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const checkStrength = () => {
    if (password.length === 0) return { label: '', color: '', width: 0 }
    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (password.length >= 16) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', width: '50%' }
    if (score <= 4) return { label: 'Good', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' }
  }

  const strength = checkStrength()

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-soft overflow-hidden">
        {/* 密码展示区 */}
        <div className="p-6 border-b border-neutral-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={password}
                readOnly
                placeholder="Click Generate to create a password"
                className="w-full p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50/50 text-neutral-800 placeholder:text-neutral-400 text-lg font-mono tracking-wider"
              />
            </div>
            <button
              onClick={copyToClipboard}
              disabled={!password}
              className="px-5 py-4 rounded-2xl bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy to clipboard"
            >
              {copied ? '✅' : '📋'}
            </button>
            <button
              onClick={() => { generate(); setCopied(false) }}
              className="btn-primary px-6 py-4 text-base"
            >
              🔐 Generate
            </button>
          </div>

          {/* 强度条 */}
          {password && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">Password Strength</span>
                <span className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} rounded-full transition-all duration-500`} style={{ width: strength.width }}></div>
              </div>
            </div>
          )}
        </div>

        {/* 设置区 */}
        <div className="p-6">
          <div className="space-y-5">
            {/* 长度 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-700">Password Length</label>
                <span className="text-lg font-extrabold text-primary-600">{length}</span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-primary-500 h-2"
              />
              <div className="flex justify-between text-xs text-neutral-400 mt-1">
                <span>4</span>
                <span>64</span>
              </div>
            </div>

            {/* 字符选项 */}
            <div>
              <label className="text-sm font-semibold text-neutral-700 mb-3 block">Character Types</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'uppercase', label: 'A-Z (Uppercase)' },
                  { key: 'lowercase', label: 'a-z (Lowercase)' },
                  { key: 'numbers', label: '0-9 (Numbers)' },
                  { key: 'symbols', label: '!@#$ (Symbols)' },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setOptions({ ...options, [opt.key]: !options[opt.key as keyof typeof options] })}
                    className={`p-3 rounded-2xl border-2 text-sm font-medium transition-all duration-200 ${
                      options[opt.key as keyof typeof options]
                        ? 'border-primary-300 bg-primary-50 text-primary-700'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => { setLength(8); setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: false }) }}
                className="flex-1 py-2.5 rounded-2xl text-sm border border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
              >
                PIN (8 digits)
              </button>
              <button
                onClick={() => { setLength(16); setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: true }) }}
                className="flex-1 py-2.5 rounded-2xl text-sm border border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
              >
                Strong (16 mix)
              </button>
              <button
                onClick={() => { setLength(32); setOptions({ uppercase: true, lowercase: true, numbers: true, symbols: true }) }}
                className="flex-1 py-2.5 rounded-2xl text-sm border border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
              >
                Ultra (32 mix)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
