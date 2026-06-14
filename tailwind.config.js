/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 温和浅色系主色调
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        warm: {
          50: '#fefdf8',
          100: '#fdf6ec',
          200: '#faeed8',
          300: '#f5dbb0',
          400: '#efc47a',
          500: '#e8a84b',
          600: '#d4882a',
          700: '#b06d1c',
          800: '#8c5415',
          900: '#6b3f10',
        },
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 2px 16px rgba(0, 0, 0, 0.04)',
        medium: '0 4px 24px rgba(0, 0, 0, 0.06)',
        large: '0 8px 40px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
