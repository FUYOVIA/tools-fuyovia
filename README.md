# FUYOVIA AI Tools

AI tools platform for creators - free tools + premium AI writing tools.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres + Auth)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o / GPT-4o-mini
- **Deployment**: Vercel

## Project Structure

```
tools-fuyovia/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── pricing/
│   │   │   └── page.tsx      # Pricing page
│   │   ├── free/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # Free tool pages
│   │   └── premium/
│   │       └── [id]/
│   │           └── page.tsx  # Premium tool pages
│   ├── components/
│   │   ├── HeroSection.tsx
│   │   ├── FreeToolsGrid.tsx
│   │   ├── PremiumToolsGrid.tsx
│   │   ├── PricingPreview.tsx
│   │   ├── FaqSection.tsx
│   │   └── tools/
│   │       ├── ImageCompressorClient.tsx
│   │       ├── QrGeneratorClient.tsx
│   │       ├── JsonFormatterClient.tsx
│   │       ├── WordCounterClient.tsx
│   │       ├── PasswordGeneratorClient.tsx
│   │       └── AiHumanizerClient.tsx
│   └── types/
│       └── index.ts
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── .env.local
```

## Getting Started

1. Install dependencies:
```bash
cd tools-fuyovia
npm install
```

2. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

3. Run the development server:
```bash
npm run dev
```

4. Open  http://localhost:3000  in your browser.

## Free Tools (10 total)

- ✅ Image Compressor - `/free/image-compressor`
- ✅ QR Code Generator - `/free/qr-generator`
- ✅ JSON Formatter - `/free/json-formatter`
- ✅ Password Generator - `/free/password-generator`
- ✅ Word Counter - `/free/word-counter`
- 🚧 PDF Toolkit - Coming soon
- 🚧 Color Converter - Coming soon
- 🚧 Base64 Tool - Coming soon
- 🚧 Markdown Preview - Coming soon
- 🚧 Meta Tag Generator - Coming soon

## Premium AI Tools (10 total)

- ✅ AI Humanizer (preview mode) - `/premium/ai-humanizer`
- 🚧 Social Media Writer - Coming soon
- 🚧 Product Description Writer - Coming soon
- 🚧 Email Copy Writer - Coming soon
- 🚧 SEO Blog Writer - Coming soon
- 🚧 Video Script Writer - Coming soon
- 🚧 AI Image Generator - Coming soon
- 🚧 Hashtag Generator - Coming soon
- 🚧 Resume & Cover Letter - Coming soon
- 🚧 Readability Optimizer - Coming soon

## Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## Next Steps

- [ ] Connect Supabase Auth
- [ ] Implement AI API routes
- [ ] Integrate Stripe payments
- [ ] Finish remaining free tools
- [ ] Finish remaining premium tools
- [ ] Add Shoplazza webhook for course unlock
- [ ] SEO optimization
- [ ] Analytics integration
