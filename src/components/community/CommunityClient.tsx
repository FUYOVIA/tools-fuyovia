'use client'

/* ============================================================
  【社区页面】CommunityClient.tsx — FUYOVIA 社区论坛主组件
  ------------------------------------------------------------
  文件用途：社区讨论页的完整前端逻辑和 UI 渲染
  - 讨论列表展示（分类筛选、排序、搜索）
  - 发布/编辑/删除讨论
  - 评论系统
  - 投票/点赞系统
  - 登录弹窗（邮箱 + Google/Facebook）
  - 65 条内置种子数据（合并显示，永不消失）
  - 大气 UI：全宽渐变 Hero、统计栏、Hot/New 徽章
  - 2026-06-15 更新：真实数据 + 种子数据合并排序

  对应的页面路由：/community
  对应的 API 路由：/api/discussions /api/comments /api/vote
  最后更新：2026-06-15
  ============================================================ */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

// ===== Types =====
interface Discussion {
  id: string
  title: string
  content: string
  category: string
  author_id: string
  author_name: string
  author_avatar: string | null
  status: 'open' | 'under_review' | 'planned' | 'implemented' | 'closed'
  votes_count: number
  comments_count: number
  views_count: number
  created_at: string
  updated_at: string
}

interface Comment {
  id: string
  discussion_id: string
  content: string
  author_id: string
  author_name: string
  author_avatar: string | null
  created_at: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Topics', icon: '🌐', color: '#64748b' },
  { id: 'feedback', label: 'Feedback & Ideas', icon: '💡', color: '#0ea5e9' },
  { id: 'bug_report', label: 'Bug Reports', icon: '🐛', color: '#ef4444' },
  { id: 'feature_request', label: 'Feature Requests', icon: '✨', color: '#8b5cf6' },
  { id: 'general', label: 'General Chat', icon: '💬', color: '#f97316' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#0ea5e9', bg: '#e0f2fe' },
  under_review: { label: 'Under Review', color: '#f59e0b', bg: '#fff7ed' },
  planned: { label: 'Planned', color: '#8b5cf6', bg: '#f3e8ff' },
  implemented: { label: 'Implemented', color: '#10b981', bg: '#ecfdf5' },
  closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' },
}

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Most Popular' },
]

// ============================================================
//  SEED DATA — 65 realistic community discussions
//  Covers: AI tool pain points, feature requests, bug reports,
//  positive feedback, general chat from overseas creators
// ============================================================
function generateSeedData(): Discussion[] {
  const now = Date.now()
  const day = 86400000
  const hour = 3600000
  const minute = 60000
  const u = (i: string) => `seed-${i}`

  return [
    // === WELCOME POST ===
    {
      id: u('welcome'), title: 'Welcome to the FUYOVIA Community! Your voice shapes our AI tools',
      content: 'We are thrilled to have you here!\n\nThis is where you can:\n\n- Suggest new features and improvements\n- Report bugs and issues you encounter\n- Share feedback on existing tools\n- Chat with fellow creators and marketers\n\n## How it works\n1. Sign in with email, Google, or Facebook to participate\n2. Upvote ideas you care about — popular ones get prioritized\n3. Leave comments with detailed thoughts and use cases\n4. Track progress — We update statuses as we work on requests\n\nWe read every single discussion. Your voice directly shapes what we build next.\n\n— The FUYOVIA Team ✨',
      category: 'feedback', author_id: u('team'), author_name: 'FUYOVIA Team', author_avatar: null,
      status: 'implemented', votes_count: 127, comments_count: 23, views_count: 3420,
      created_at: new Date(now - 30 * day).toISOString(), updated_at: new Date(now - 2 * day).toISOString()
    },

    // === FEATURE REQUESTS (Hot topics from social media) ===
    {
      id: u('fr1'), title: 'Please add batch processing for images! I need to compress 500+ photos at once',
      content: 'I run an e-commerce store with thousands of product photos. Compressing one by one is killing me. Can we get a bulk upload feature where I can drag-and-drop 100 images at once and they all get compressed/optimized?\n\nTools like TinyPNG do this but they charge $25/month. Would be amazing if FUYOVIA offered it free or as part of credits.',
      category: 'feature_request', author_id: u('sarah_m'), author_name: 'Sarah M.', author_avatar: null,
      status: 'under_review', votes_count: 89, comments_count: 17, views_count: 1256,
      created_at: new Date(now - 3 * day).toISOString(), updated_at: new Date(now - 1 * day).toISOString()
    },
    {
      id: u('fr2'), title: 'API access / developer integration? I want to connect FUYOVIA tools to my workflow automation (Zapier, Make.com)',
      content: 'Hey team! Love the tools here. As a developer who builds workflows for clients, I\'d love API endpoints for the AI tools (especially Social Media Writer, SEO Blog Writer).\n\nImagine triggering blog post generation automatically when a new product is added to Shopify... that would be HUGE.\n\nAny plans for REST API or webhook support?',
      category: 'feature_request', author_id: u('alex_dev'), author_name: 'Alex K.', author_avatar: null,
      status: 'open', votes_count: 72, comments_count: 12, views_count: 987,
      created_at: new Date(now - 5 * day).toISOString(), updated_at: new Date(now - 1 * day).toISOString()
    },
    {
      id: u('fr3'), title: 'Multi-language support for SEO Blog Writer? My audience reads in Spanish & Portuguese',
      content: 'The blog writer produces great English content but I\'m targeting LATAM markets. It would be game-changing if I could select output language (Spanish, Portuguese, French, German, Japanese).\n\nCurrently I\'m using DeepL after generation which works but adds extra step. Native multi-language would save so much time.',
      category: 'feature_request', author_id: u('carlos_r'), author_name: 'Carlos R.', author_avatar: null,
      status: 'planned', votes_count: 64, comments_count: 9, views_count: 843,
      created_at: new Date(now - 7 * day).toISOString(), updated_at: new Date(now - 2 * day).toISOString()
    },
    {
      id: u('fr4'), title: 'Dark mode please! My eyes hurt using this late at night 😅',
      content: 'Simple request — dark mode toggle. I work late nights and the white background is blinding. A lot of dev/designer tools offer this now (Linear, Notion, VS Code). Would match the modern aesthetic too.',
      category: 'feature_request', author_id: u('jenny_l'), author_name: 'Jenny L.', author_avatar: null,
      status: 'planned', votes_count: 58, comments_count: 14, views_count: 1123,
      created_at: new Date(now - 4 * day).toISOString(), updated_at: new Date(now - 12 * hour).toISOString()
    },
    {
      id: u('fr5'), title: 'Team workspace / collaboration features? Our marketing team of 8 needs shared projects',
      content: 'We\'re a small agency and everyone uses different AI tools right now. If FUYOVIA had team features like:\n- Shared folders/projects\n- Comment/collaborate on generated content\n- Usage analytics per team member\n- Team billing\n\nWe\'d switch our whole team over immediately.',
      category: 'feature_request', author_id: u('marcus_w'), author_name: 'Marcus W.', author_avatar: null,
      status: 'open', votes_count: 51, comments_count: 7, views_count: 678,
      created_at: new Date(now - 6 * day).toISOString(), updated_at: new Date(now - 3 * day).toISOString()
    },
    {
      id: u('fr6'), title: 'Export to more formats: DOCX, PPTX, PDF with proper formatting?',
      content: 'Right now exports feel basic. For professional use I need:\n- Properly formatted Word docs (not just plain text)\n- PowerPoint slides from the presentation tool\n- Branded PDFs with my logo\n- Direct export to Google Docs / Drive integration',
      category: 'feature_request', author_id: u('david_h'), author_name: 'David H.', author_avatar: null,
      status: 'open', votes_count: 47, comments_count: 5, views_count: 534,
      created_at: new Date(now - 8 * day).toISOString(), updated_at: new Date(now - 4 * day).toISOString()
    },
    {
      id: u('fr7'), title: 'History / saved outputs dashboard? I keep losing track of what I generated last week',
      content: 'Is there any way to see past generations? Sometimes I write something great and forget to copy it, then can\'t find it anymore. A simple history page with:\n- Searchable list of past outputs\n- Favorite/star feature\n- Organize by project\n- Re-edit previous results\n\nWould make this 10x more usable for daily work.',
      category: 'feature_request', author_id: u('nina_p'), author_name: 'Nina P.', author_avatar: null,
      status: 'under_review', votes_count: 44, comments_count: 11, views_count: 756,
      created_at: new Date(now - 2 * day).toISOString(), updated_at: new Date(now - 6 * hour).toISOString()
    },

    // === FEEDBACK / COMPLAINTS (Real user pain points) ===
    {
      id: u('fb1'), title: 'Honest review: This is BETTER than ChatGPT for specific tasks, and I\'ve tried everything',
      content: 'Been using FUYOVIA for about 3 weeks now and I want to give some honest feedback:\n\n**What blows me away:**\n- The Social Media Writer actually sounds like a human wrote it (not generic AI fluff)\n- Image compression quality vs size ratio is insane — better than TinyPNG honestly\n- The fact that it\'s all free (with credits) is wild\n\n**Could improve:**\n- Speed when generating long blog posts (takes ~15 seconds)\n- Mobile experience could be smoother\n- Wish there were templates for common formats\n\nOverall? 9/10. Told my entire Slack group about this already.',
      category: 'general', author_id: u('tom_biz'), author_name: 'Tom B.', author_avatar: null,
      status: 'open', votes_count: 96, comments_count: 22, views_count: 2134,
      created_at: new Date(now - 14 * hour).toISOString(), updated_at: new Date(now - 2 * hour).toISOString()
    },
    {
      id: u('fb2'), title: 'Finally an AI tool that doesn\'t charge $20/month just to exist 💀',
      content: 'I was paying $49/mo for Jasper, then switched to Copy.ai ($36/mo), then tried Writesonic ($19/mo)... and honestly the credit-based model here makes SO MUCH more sense.\n\nI don\'t write every single day. Some weeks I generate 10 things, other weeks none. Why should I pay monthly subscription for idle time?\n\nFUYOVIA\'s pay-per-use approach is exactly what creators need. Keep it up!',
      category: 'feedback', author_id: u('rachel_s'), author_name: 'Rachel S.', author_avatar: null,
      status: 'open', votes_count: 83, comments_count: 18, views_count: 1567,
      created_at: new Date(now - 2 * day).toISOString(), updated_at: new Date(now - 4 * hour).toISOString()
    },
    {
      id: u('fb3'), title: 'The SEO Blog Writer saved my client deadline — generated 2000-word article in under a minute',
      content: 'Client called at 6PM needing a blog post for their website launch next morning. Normally this takes me 3-4 hours minimum.\n\nUsed FUYOVIA\'s SEO Blog Writer with target keyword "best CRM for small business 2026". Output was genuinely good — needed maybe 15% editing for tone/personality but the structure, headings, keyword placement were all spot-on.\n\nClient loved it. I looked like a hero. You guys rock.',
      category: 'feedback', author_id: u('mike_freelance'), author_name: 'Mike T.', author_avatar: null,
      status: 'open', votes_count: 76, comments_count: 13, views_count: 1345,
      created_at: new Date(now - 10 * hour).toISOString(), updated_at: new Date(now - 30 * minute).toISOString()
    },
    {
      id: u('fb4'), title: 'AI Humanizer actually works?? I ran it through GPTZero and got 98% human score',
      content: 'Okay I was skeptical. Every "humanizer" tool I tried before either:\n1. Just adds typos and weird punctuation (obviously fake)\n2. Doesn\'t change anything meaningful\n3. Makes text worse instead of better\n\nBut FUYOVIA\'s AI Humanizer rewrote my ChatGPT article and GPTZero gave it 98% human, Originality.ai gave 96%. That\'s genuinely impressive.\n\nMy only suggestion: add options for writing style (academic, casual, professional). Currently defaults to neutral.',
      category: 'feedback', author_id: u('emma_writer'), author_name: 'Emma W.', author_avatar: null,
      status: 'open', votes_count: 71, comments_count: 16, views_count: 1678,
      created_at: new Date(now - 1 * day).toISOString(), updated_at: new Date(now - 3 * hour).toISOString()
    },
    {
      id: u('fb5'), title: 'From Thailand — thank you for making this accessible globally!',
      content: 'Most AI tools are US-centric or require US payment methods. FUYOVIA accepts international payments and the tools work perfectly for Southeast Asian markets.\n\nI use the Hashtag Generator daily for my Instagram shop (selling Thai silk products). The English hashtags it generates actually help me reach international customers.\n\n🙏 ขอบคุณมากครับ (Thank you very much!)',
      category: 'general', author_id: u('somchai_t'), author_name: 'Somchai T.', author_avatar: null,
      status: 'open', votes_count: 55, comments_count: 8, views_count: 892,
      created_at: new Date(now - 9 * day).toISOString(), updated_at: new Date(now - 5 * day).toISOString()
    },

    // === BUG REPORTS ===
    {
      id: u('bug1'), title: '[Bug] PDF Toolkit merge function crashes with files > 10MB',
      content: 'When trying to merge 5 PDF files where each is around 12-15MB (total ~60MB), the browser tab becomes unresponsive and eventually crashes with "out of memory" error.\n\nChrome Version: 120.0.6099.129\nFiles: 5x scanned documents (~12MB each)\nAction: Merge PDF\nResult: Tab crash\n\nSmaller files (under 5MB each) work fine. Seems like a memory issue with large file handling.',
      category: 'bug_report', author_id: u('kevin_it'), author_name: 'Kevin L.', author_avatar: null,
      status: 'under_review', votes_count: 38, comments_count: 6, views_count: 567,
      created_at: new Date(now - 4 * day).toISOString(), updated_at: new Date(now - 1 * day).toISOString()
    },
    {
      id: u('bug2'), title: '[Bug] Color Converter hex-to-RGB shows wrong values sometimes',
      content: 'Inputting #FF5733 gives RGB(255, 87, 51) ✅ correct\nBut #FF69B4 gives RGB(255, 105, 180) ❌ wait that IS correct\n\nOK let me be more specific: converting from HSL values sometimes rounds wrong. HSL(240, 100%, 50%) should be pure blue #0000FF = rgb(0,0,255), but it shows rgb(0,0,254). Minor rounding error but matters for exact color matching in design work.',
      category: 'bug_report', author_id: u('lisa_design'), author_name: 'Lisa D.', author_avatar: null,
      status: 'open', votes_count: 23, comments_count: 4, views_count: 389,
      created_at: new Date(now - 6 * day).toISOString(), updated_at: new Date(now - 3 * day).toISOString()
    },
    {
      id: u('bug3'), title: '[Bug] JSON Formatter doesn\'t handle really deep nested objects well (10+ levels)',
      content: 'Working with some complex API responses that have deeply nested JSON structures. The formatter starts lagging badly at around 8 levels of nesting and at 10+ levels the collapse/expand buttons stop working correctly.\n\nTest case: Copied a 15-level nested JSON from an AWS CloudFormation template response. The tree view became unusable.',
      category: 'bug_report', author_id: u('raj_cloud'), author_name: 'Raj P.', author_avatar: null,
      status: 'open', votes_count: 19, comments_count: 3, views_count: 298,
      created_at: new Date(now - 11 * day).toISOString(), updated_at: new Date(now - 7 * day).toISOString()
    },
    {
      id: u('bug4'), title: '[Bug] QR Code download on Safari iOS saves as .txt instead of image',
      content: 'Generated a QR code for my restaurant menu on iPhone (Safari browser). When I tap download, it saves as "qrcode.txt" not "qrcode.png". Opening it shows raw text/data.\n\nWorks fine on Chrome desktop and Android Chrome. Only Safari iOS has this issue.\niPhone 15 Pro, iOS 17.2, Safari latest.',
      category: 'bug_report', author_id: u('chef_anna'), author_name: 'Anna C.', author_avatar: null,
      status: 'open', votes_count: 31, comments_count: 7, views_count: 445,
      created_at: new Date(now - 3 * day).toISOString(), updated_at: new Date(now - 12 * hour).toISOString()
    },
    {
      id: u('bug5'), title: '[Bug] Word Counter gets stuck when pasting 50k+ characters',
      content: 'Pasted a full book chapter (~55,000 chars) into Word Counter to check reading time. The count stayed at "Counting..." forever. Had to refresh the page.\n\nSuggestion: Add progress indicator or chunk processing so it doesn\'t freeze the UI.',
      category: 'bug_report', author_id: u('author_james'), author_name: 'James R.', author_avatar: null,
      status: 'open', votes_count: 15, comments_count: 2, views_count: 234,
      created_at: new Date(now - 13 * day).toISOString(), updated_at: new Date(now - 10 * day).toISOString()
    },

    // === GENERAL CHAT / COMMUNITY BUZZ ===
    {
      id: u('chat1'), title: 'Just discovered this site today — WHERE HAS THIS BEEN ALL MY LIFE?! 🤯',
      content: 'Seriously, how did I not know about FUYOVIA before? I\'ve been paying for 4 separate tools (image compressor, QR generator, JSON formatter, password gen) when this entire suite is free??\n\nThe AI tools are cherry on top. Already used the Product Description writer for 15 of my Etsy listings and they sound way better than what I wrote myself lol.\n\nBookmarking this IMMEDIATELY. You earned a fan today.',
      category: 'general', author_id: u('new_fan'), author_name: 'Jessica M.', author_avatar: null,
      status: 'open', votes_count: 67, comments_count: 19, views_count: 1890,
      created_at: new Date(now - 18 * hour).toISOString(), updated_at: new Date(now - 1 * hour).toISOString()
    },
    {
      id: u('chat2'), title: 'Anyone else using this for dropshipping? The Product Description tool is a cheat code 🔥',
      content: 'I dropship on TikTok Shop and writing descriptions for 50+ products per week was taking hours. Now I paste the supplier\'s basic info into FUYOVIA\'s Product Description tool and get back something I\'d actually want to read as a customer.\n\nPro tip: Add your brand voice instructions in the prompt field. I type "Write in an energetic, Gen Z-friendly tone with emojis" and the results go crazy viral.',
      category: 'general', author_id: u('dropship_king'), author_name: 'Marcus J.', author_avatar: null,
      status: 'open', votes_count: 54, comments_count: 21, views_count: 1456,
      created_at: new Date(now - 5 * day).toISOString(), updated_at: new Date(now - 8 * hour).toISOString()
    },
    {
      id: u('chat3'), title: 'Quick poll: Which FUYOVIA tool do you use the MOST? I\'ll go first 👇',
      content: 'Mine is definitely **Social Media Writer** — I manage 3 brand accounts and this cuts my caption writing time by 80%.\n\nHonorable mention: **Image Compressor** because I upload 50+ images/day to Instagram and file size limits are annoying.\n\nWhat\'s YOUR most-used tool? Drop it below! 👇',
      category: 'general', author_id: u('social_sam'), author_name: 'Sam K.', author_avatar: null,
      status: 'open', votes_count: 48, comments_count: 35, views_count: 2012,
      created_at: new Date(now - 7 * day).toISOString(), updated_at: new Date(now - 2 * hour).toISOString()
    },
    {
      id: u('chat4'), title: 'Shoutout to whoever built the Email Copy tool — my open rate went from 18% to 34%',
      content: 'Been A/B testing email subject lines and body copy for my newsletter (12k subscribers, SaaS niche). Used to write everything manually.\n\nSwitched to generating variants with FUYOVIA Email Copy tool, pick the best ones, tweak slightly. Results after 4 weeks:\n\n| Metric | Before | After |\n|--------|--------|-------|\n| Open Rate | 18.2% | 34.1% |\n| Click Rate | 2.8% | 6.4% |\n| Unsub Rate | 0.6% | 0.4% |\n\nThis is not a drill. AI-assisted copywriting actually converts better than my "human-written" stuff. Maybe I just suck at emails lol but whatever, numbers don\'t lie.',
      category: 'feedback', author_id: u('email_ninja'), author_name: 'Diana C.', author_avatar: null,
      status: 'open', votes_count: 62, comments_count: 15, views_count: 1234,
      created_at: new Date(now - 3 * day).toISOString(), updated_at: new Date(now - 5 * hour).toISOString()
    },
    {
      id: u('chat5'), title: 'Can we get a Discord server or Telegram group? Would love to chat with other users live',
      content: 'This community is great but real-time chat would be awesome for:\n- Quick questions ("how do I format X")\n- Sharing tips and tricks\n- Networking with other creators\n- Getting faster responses from the team\n\nI\'d happily moderate a channel if needed! Anyone else interested?',
      category: 'general', author_id: u('community_guy'), author_name: 'Ryan B.', author_avatar: null,
      status: 'open', votes_count: 41, comments_count: 24, views_count: 978,
      created_at: new Date(now - 9 * day).toISOString(), updated_at: new Date(now - 4 * day).toISOString()
    },
    {
      id: u('chat6'), title: 'Hot take: The Readability Optimizer is underrated and nobody talks about it enough',
      content: 'Everyone focuses on the AI generators but the Readability Optimizer is secretly the best tool here.\n\nI paste every blog post, email, landing page copy through it before publishing. It catches:\n- Sentences that are way too long (I\'m guilty of this)\n- Passive voice overuse\n- Complex words that confuse readers\n- Flesch-Kincaid grade level (aiming for 8th grade max)\n\nMy bounce rate dropped 23% since I started optimizing readability consistently. Don\'t sleep on this tool!',
      category: 'general', author_id: u('content_pro'), author_name: 'Patricia V.', author_avatar: null,
      status: 'open', votes_count: 39, comments_count: 8, views_count: 687,
      created_at: new Date(now - 10 * day).toISOString(), updated_at: new Date(now - 6 * day).toISOString()
    },

    // === MORE FEATURE REQUESTS ===
    {
      id: u('fr8'), title: 'Video Script generator: Can it support YouTube Shorts / TikTok scripts format? (60s max)',
      content: 'The video script tool is great for longer YouTube videos (10min+) but for short-form content (Shorts, Reels, TikTok), I need:\n- Hook in first 2 seconds\n- Max 150 words script\n- Built-in trending sound suggestions\n- Caption overlay recommendations\n\nShort-form is where the growth is right now. Would be huge for creator economy folks.',
      category: 'feature_request', author_id: u('shorts_queen'), author_name: 'Amanda L.', author_avatar: null,
      status: 'open', votes_count: 42, comments_count: 9, views_count: 645,
      created_at: new Date(now - 8 * day).toISOString(), updated_at: new Date(now - 3 * day).toISOString()
    },
    {
      id: u('fr9'), title: 'Browser extension? One-click access without opening a new tab would be amazing',
      content: 'Workflow idea: highlight text on any webpage → right-click → "Humanize with FUYOVIA" or "Summarize with FUYOVIA"\n\nWould save so many context switches. Similar to Grammarly\'s browser extension model.',
      category: 'feature_request', author_id: u('ext_fan'), author_name: 'Chris N.', author_avatar: null,
      status: 'open', votes_count: 35, comments_count: 6, views_count: 512,
      created_at: new Date(now - 12 * day).toISOString(), updated_at: new Date(now - 8 * day).toISOString()
    },
    {
      id: u('fr10'), title: 'Resume builder: Can we add ATS-friendly formatting and industry-specific templates?',
      content: 'Love the Resume & Cover Letter tool! Got interviews at 3 companies using it.\n\nWishlist for improvement:\n- ATS-compatible formatting (many companies filter non-standard resumes)\n- Templates for tech, healthcare, finance, creative industries\n- LinkedIn profile optimization suggestions based on resume input\n- Cover letter that auto-matches resume bullet points',
      category: 'feature_request', author_id: u('job_seeker'), author_name: 'Tyler R.', author_avatar: null,
      status: 'under_review', votes_count: 37, comments_count: 8, views_count: 567,
      created_at: new Date(now - 6 * day).toISOString(), updated_at: new Date(now - 2 * day).toISOString()
    } as any,
    {
      id: u('fr11'), title: 'Custom brand voice training? I want AI to learn MY writing style permanently',
      content: 'Every time I use the Social Media Writer, I have to paste my style guide again. It would be incredible if I could:\n\n1. Upload 10-20 examples of my best-performing posts\n2. System learns my voice/tone/style\n3. Future generations match my brand voice automatically\n4. Save multiple voices (personal brand, client A, client B)\n\nThis is the ONE thing that would make me cancel all other AI subscriptions.',
      category: 'feature_request', author_id: u('brand_voice'), author_name: 'Sophie M.', author_avatar: null,
      status: 'planned', votes_count: 56, comments_count: 11, views_count: 823,
      created_at: new Date(now - 5 * day).toISOString(), updated_at: new Date(now - 1 * day).toISOString()
    },
    {
      id: u('fr12'), title: 'Image Generator: Support for specific aspect ratios (Instagram portrait, YouTube thumbnail, etc.)',
      content: 'The AI image generator creates beautiful images but they\'re always square. For social media I need:\n- 1080x1920 (Instagram Story/Reel)\n- 1280x720 (YouTube thumbnail)\n- 1080x1350 (Instagram Portrait)\n- 1200x628 (Facebook link preview)\n\nHaving pre-set aspect ratio options would save cropping time later.',
      category: 'feature_request', author_id: u('ratio_req'), author_name: 'Omar F.', author_avatar: null,
      status: 'open', votes_count: 33, comments_count: 4, views_count: 445,
      created_at: new Date(now - 14 * day).toISOString(), updated_at: new Date(now - 10 * day).toISOString()
    },

    // === MORE REAL USER FEEDBACK ===
    {
      id: u('fb6'), title: 'Comparison: FUYOVIA vs Jasper vs Copy.ai — my honest 30-day test results',
      content: 'I spent the last month testing all three for my content agency (we publish ~40 articles/month):\n\n## Quality (out of 10)\n- FUYOVIA Blog Writer: 8.5/10\n- Jasper: 8/10\n- Copy.ai: 7/10\n\n## Speed\n- FUYOVIA: Fastest (avg 8s for blog post)\n- Copy.ai: Medium (~15s)\n- Jasper: Slowest (~25s)\n\n## Cost (for our volume)\n- FUYOVIA: ~$15/month (credits)\n- Jasper: $49/month (team plan)\n- Copy.ai: $36/month\n\n**Winner: FUYOVIA** by a mile on value. Quality is comparable or better, cost is 3x less.\n\nOnly area where Jasper still wins: Brand voice customization (they call it \"Brand Voice\"). Hoping FUYOVIA adds this soon (see my feature request above!).',
      category: 'feedback', author_id: u('agency_owner'), author_name: 'Daniel M.', author_avatar: null,
      status: 'open', votes_count: 79, comments_count: 20, views_count: 1876,
      created_at: new Date(now - 2 * day).toISOString(), updated_at: new Date(now - 30 * minute).toISOString()
    },
    {
      id: u('fb7'), title: 'Student here — this toolkit is a lifesaver for assignments AND side hustles',
      content: 'I\'m a university student in Malaysia studying digital marketing. FUYOVIA helps with:\n\n1. **Assignments**: SEO Blog Writer helps structure research papers\n2. **Side hustle**: I freelance doing social media management for local businesses — Social Media Writer + Hashtag Generator = instant deliverables\n3. **Portfolio**: AI Image Generator creates mockups for my design portfolio\n\nThe free tier credits reset is generous. Never felt limited even as a broke student 😂',
      category: 'general', author_id: u('student_life'), author_name: 'Aisha H.', author_avatar: null,
      status: 'open', votes_count: 46, comments_count: 12, views_count: 890,
      created_at: new Date(now - 4 * day).toISOString(), updated_at: new Date(now - 1 * day).toISOString()
    },
    {
      id: u('fb8'), title: 'Small win: Password Generator helped me secure all my accounts after getting hacked 😬',
      content: 'Got my Instagram account hacked last month (don\'t click suspicious links, kids!). Used FUYOVIA Password Generator to create unique 20-char passwords for all 47 of my online accounts. Saved them in a password manager.\n\nFeature request: Add "pronounceable password" option alongside random characters. Some sites don\'t accept special characters and pronounceable ones are easier to type on phone.',
      category: 'general', author_id: u('hacked_sad'), author_name: 'Brian T.', author_avatar: null,
      status: 'open', votes_count: 29, comments_count: 10, views_count: 567,
      created_at: new Date(now - 15 * day).toISOString(), updated_at: new Date(now - 12 * day).toISOString()
    },

    // === MORE BUG REPORTS ===
    {
      id: u('bug6'), title: '[Bug] Meta Tag Generator output missing OG:image tag by default',
      content: 'When generating meta tags for a blog post, the Open Graph image tag isn\'t included unless I specifically check a box. But most social platforms won\'t show a nice preview card without og:image.\n\nShould include og:image as default, not optional. Cost me some time figuring out why Facebook wasn\'t showing thumbnails.',
      category: 'bug_report', author_id: u('seo_dave'), author_name: 'Dave W.', author_avatar: null,
      status: 'open', votes_count: 21, comments_count: 3, views_count: 334,
      created_at: new Date(now - 10 * day).toISOString(), updated_at: new Date(now - 7 * day).toISOString()
    },
    {
      id: u('bug7'), title: '[Bug] Base64 encoder shows garbled text for large images (>2MB)',
      content: 'Tried encoding a 2.3MB PNG photo to Base64. Result is a massive string that seems correct but when I decode it, the image is corrupted (half black, half visible).\n\nWorks fine with images under 1MB. Might be a memory limit issue similar to the PDF merger bug reported above.',
      category: 'bug_report', author_id: u('base64_user'), author_name: 'Natalie K.', author_avatar: null,
      status: 'open', votes_count: 14, comments_count: 2, views_count: 212,
      created_at: new Date(now - 16 * day).toISOString(), updated_at: new Date(now - 14 * day).toISOString()
    },

    // === MORE FEATURE REQUESTS (High demand) ===
    {
      id: u('fr13'), title: 'Template library? Save prompts as reusable templates for recurring content needs',
      content: 'I write weekly newsletters for 3 different clients. Each has specific requirements:\n- Client A: Tech startup, witty tone, CTA-driven\n- Client B: Wellness brand, calming tone, educational\n- Client C: E-commerce deals, urgent/fomo tone, emoji-heavy\n\nIf I could save each setup as a "template" and just click to regenerate with new topic, it would save SO much time. Currently re-entering settings every week.',
      category: 'feature_request', author_id: u('template_wish'), author_name: 'Michelle G.', author_avatar: null,
      status: 'open', votes_count: 49, comments_count: 7, views_count: 678,
      created_at: new Date(now - 7 * day).toISOString(), updated_at: new Date(now - 4 * day).toISOString()
    },
    {
      id: u('fr14'), title: 'Analytics dashboard: Show usage stats, popular tools, credits consumed over time',
      content: 'As a power user, I\'d love to see:\n- Total generations this month\n- Most-used tool ranking\n- Credits consumption graph\n- Average words/images processed\n- Compare month-over-month trends\n\nWould help me justify the ROI to my boss/team when recommending FUYOVIA internally.',
      category: 'feature_request', author_id: u('analytics_want'), author_name: 'Eric S.', author_avatar: null,
      status: 'open', votes_count: 27, comments_count: 3, views_count: 398,
      created_at: new Date(now - 17 * day).toISOString(), updated_at: new Date(now - 13 * day).toISOString()
    },
    {
      id: u('fr15'), title: 'Keyboard shortcuts for power users? Ctrl+Enter to generate, Ctrl+S to save, etc.',
      content: 'Small QoL feature that makes a big difference for daily users. Suggested shortcuts:\n- Ctrl/Cmd + Enter: Generate/Submit\n- Ctrl/Cmd + S: Save output\n- Ctrl/Cmd + Shift + C: Clear all fields\n- Escape: Close modals\n- Tab: Move between input fields\n\nWould make the tools feel much more professional and keyboard-navigable.',
      category: 'feature_request', author_id: u('shortcut_lover'), author_name: 'Alex R.', author_avatar: null,
      status: 'open', votes_count: 31, comments_count: 9, views_count: 489,
      created_at: new Date(now - 11 * day).toISOString(), updated_at: new Date(now - 6 * day).toISOString()
    },

    // === MORE GENERAL DISCUSSIONS ===
    {
      id: u('chat7'), title: 'What\'s the team\'s roadmap for 2026? Curious what\'s coming next! 🚀',
      content: 'Been loving the tools and curious about what\'s on the horizon. Any hints about:\n- New AI tools being developed?\n- Major platform updates?\n- Pricing changes (hope it stays affordable!)?\n- Any partnerships or integrations coming?\n\nExcited to see how FUYOVIA grows! 🎉',
      category: 'general', author_id: u('roadmap_curious'), author_name: 'Kevin Z.', author_avatar: null,
      status: 'open', votes_count: 44, comments_count: 13, views_count: 756,
      created_at: new Date(now - 1 * day).toISOString(), updated_at: new Date(now - 6 * hour).toISOString()
    },
    {
      id: u('chat8'), title: 'Pro tip thread: Share your best prompts/workflows below! 🧵',
      content: 'Let\'s crowdsource the best ways to use FUYOVIA tools! I\'ll start:\n\n### Social Media Writer — Viral Tweet Formula\nPrompt: "Write a tweet thread (7 tweets) about [topic]. Format: Hook tweet with shocking stat → Problem breakdown → 3 actionable solutions → Case study → Call to action. Use short punchy sentences. Include relevant hashtags."\n\n### SEO Blog Writer — skyscraper article\nPrompt: "Write a comprehensive 2500-word guide on [keyword]. Structure: Intro with compelling hook → What/Why/How sections → Step-by-step tutorial → Common mistakes to avoid → FAQ section → Conclusion with CTA. Use H2/H3 headers naturally." \n\nYour turn! Drop your best prompt recipes below 👇',
      category: 'general', author_id: u('prompt_master'), author_name: 'Luna V.', author_avatar: null,
      status: 'open', votes_count: 66, comments_count: 28, views_count: 1654,
      created_at: new Date(now - 3 * day).toISOString(), updated_at: new Date(now - 2 * hour).toISOString()
    },
    {
      id: u('chat9'), title: 'First time using AI Image Generator — the results blew my mind 🎨',
      content: 'I\'m a graphic designer and always been skeptical of AI art. Tried FUYOVIA\'s Image Generator yesterday for a client\'s social media campaign.\n\nPrompt: "A cozy coffee shop interior with warm lighting, plants hanging from ceiling, people working on laptops, bohemian style, photorealistic, golden hour light streaming through windows"\n\nThe result was GOOD. Like, actually usable-good. Not "AI-looking" at all. I showed it to my creative director and he couldn\'t tell it was AI-generated.\n\nThis changes things for mockups and concept art. Mind = blown.',
      category: 'general', author_id: u('designer_shocked'), author_name: 'Maya T.', author_avatar: null,
      status: 'open', votes_count: 53, comments_count: 16, views_count: 1123,
      created_at: new Date(now - 20 * hour).toISOString(), updated_at: new Date(now - 4 * hour).toISOString()
    } as any,

    // === MORE FEATURE REQUESTS (Continued) ===
    {
      id: u('fr16'), title: 'Undo/Redo button in AI text editors? Accidentally lost good output',
      content: 'Was generating a blog post and accidentally clicked somewhere that cleared the output. Lost a really good paragraph I wanted to keep.\n\nAn undo history (Ctrl+Z compatible) would prevent this frustration. Even just a "Previous Outputs" sidebar showing last 5 generations would help immensely.',
      category: 'feature_request', author_id: u('undo_needer'), author_name: 'Jake P.', author_avatar: null,
      status: 'open', votes_count: 26, comments_count: 5, views_count: 378,
      created_at: new Date(now - 13 * day).toISOString(), updated_at: new Date(now - 9 * day).toISOString()
    },
    {
      id: u('fr17'), title: 'Mobile app? Or at least mobile-optimized responsive design?',
      content: 'I use FUYOVIA primarily on my phone while commuting. The current mobile view works but feels cramped:\n- Buttons are small and hard to tap\n- Text input areas are tiny\n- Some tools scroll horizontally (not ideal)\n\nA PWA (Progressive Web App) that can be added to home screen would be amazing. Even better: actual iOS/Android app!',
      category: 'feature_request', author_id: u('mobile_user'), author_name: 'Priya S.', author_avatar: null,
      status: 'planned', votes_count: 43, comments_count: 14, views_count: 723,
      created_at: new Date(now - 8 * day).toISOString(), updated_at: new Date(now - 3 * day).toISOString()
    },

    // === MORE FEEDBACK ===
    {
      id: u('fb9'), title: 'The Hashtag Generator finds tags I NEVER would have thought of — reached 10k impressions!',
      content: 'Posted a Reel about morning routines. Used to just tag #morningroutine #wellness #healthylifestyle (basic stuff).\n\nRan my caption through FUYOVIA Hashtag Generator. It suggested:\n#MorningRoutineTok #5AMClub #ThatGirlEnergy #OptimizeYourLife #GrindsetMindset #MorningVibes #DailyDiscipline\n\nResult: Post reached **10,400 impressions** (my usual is 800-1500). These micro/niche hashtags have less competition but super engaged audiences.\n\nGame changer for organic growth. Thank you!!',
      category: 'feedback', author_id: u('hashtag_win'), author_name: 'Tiffany R.', author_avatar: null,
      status: 'open', votes_count: 58, comments_count: 11, views_count: 1034,
      created_at: new Date(now - 6 * day).toISOString(), updated_at: new Date(now - 2 * day).toISOString()
    },
    {
      id: u('fb10'), title: 'Used Video Script tool for my YouTube explainer channel — subscriber growth 3x in one month',
      content: 'Run a small YouTube channel (8k subs) about tech explainers. Writing scripts was always my bottleneck — would spend 3-4 hours per script.\n\nStarted using FUYOVIA Video Script tool 4 weeks ago. Workflow:\n1. Enter topic + target audience + desired length\n2. Get structured script with hooks, segments, CTAs\n3. Spend 30 mins personalizing (add my personality/jokes)\n4. Record and publish\n\nResults: Went from 2 videos/week to 5 videos/week. Subscribers grew from 8k to 24k. Watch time increased 280%.\n\nThe script structure it generates (hook → problem → solution → example → CTA) follows proven YouTube formulas. Highly recommend.',
      category: 'feedback', author_id: u('yt_creator'), author_name: 'Marcus Chen', author_avatar: null,
      status: 'open', votes_count: 61, comments_count: 9, views_count: 1122,
      created_at: new Date(now - 4 * day).toISOString(), updated_at: new Date(now - 1 * day).toISOString()
    },

    // === Fill remaining slots with diverse discussions ===
    {
      id: u('chat10'), title: 'Who else here is a solopreneur? Would love to network with other one-person businesses 🤝',
      content: 'Running a one-person digital marketing consultancy. Always looking to connect with others in the same boat — we can share resources, refer clients, vent about the hustle lol.\n\nDrop your niche/industry below if you\'re solo! Let\'s build a mini-network within this community.',
      category: 'general', author_id: u('solo_preneur'), author_name: 'Nate H.', author_avatar: null,
      status: 'open', votes_count: 37, comments_count: 19, views_count: 845,
      created_at: new Date(now - 5 * day).toISOString(), updated_at: new Date(now - 3 * day).toISOString()
    },
    {
      id: u('chat11'), title: 'Fun challenge: Describe FUYOVIA in 3 words only! I\'ll start:',
      content: '**Fast. Free. Fantastic.**\n\nYour turn! 3 words that describe your experience with FUYOVIA tools. Let\'s see how diverse the answers are 😄',
      category: 'general', author_id: u('word_game'), author_name: 'Olivia J.', author_avatar: null,
      status: 'open', votes_count: 32, comments_count: 41, views_count: 1456,
      created_at: new Date(now - 2 * day).toISOString(), updated_at: new Date(now - 30 * minute).toISOString()
    },
    {
      id: u('fb11'), title: 'Migrated my entire team from Notion AI to FUYOVIA this week — here\'s why',
      content: 'Team of 6 content writers. Were paying $15/head/month for Notion AI ($90 total). Switched to FUYOVIA:\n\n**Why we switched:**\n- Notion AI locked inside Notion (can\'t use elsewhere)\n- FUYOVIA tools are purpose-built (each tool does ONE thing excellently)\n- Cost: ~$30/month total for entire team (vs $90)\n- No vendor lock-in\n\n**Team feedback after 1 week:**\n- "Blog Writer is faster than Notion AI" — Sarah\n- "Love having dedicated tools for each task" — Mike\n- "The Humanizer saved my butt on a client deliverable" — Jen\n\nNotion is still our wiki/doc tool, but FUYOVIA replaced Notion AI entirely for us.',
      category: 'feedback', author_id: u('team_lead'), author_name: 'Rebecca K.', author_avatar: null,
      status: 'open', votes_count: 52, comments_count: 14, views_count: 967,
      created_at: new Date(now - 9 * day).toISOString(), updated_at: new Date(now - 5 * day).toISOString()
    },
    {
      id: u('fr18'), title: 'Integration with WordPress? One-click publish from Blog Writer would be incredible',
      content: 'I manage 5 WordPress sites for clients. Current flow:\n1. Write in FUYOVIA Blog Writer\n2. Copy output\n3. Go to WordPress admin\n4. Create new post\n5. Paste\n6. Format (always loses some formatting)\n7. Add featured image\n8. Set categories/tags\n9. Publish\n\nDream flow: Click "Publish to WordPress" → select site → done. Is this technically possible via WP REST API?',
      category: 'feature_request', author_id: u('wp_admin'), author_name: 'George M.', author_avatar: null,
      status: 'open', votes_count: 38, comments_count: 7, views_count: 589,
      created_at: new Date(now - 12 * day).toISOString(), updated_at: new Date(now - 8 * day).toISOString()
    },
    {
      id: u('bug8'), title: '[Bug] Markdown Preview doesn\'t render Mermaid diagrams or math formulas',
      content: 'Pasting markdown that contains ```mermaid blocks or $$LaTeX$$ math formulas. They show as raw code instead of rendered diagrams/equations.\n\nExample that doesn\'t render:\n```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n```\n\nAnd: $$E = mc^2$$ shows as literal text.\n\nWould be amazing if the preview supported these!',
      category: 'bug_report', author_id: u('md_nerd'), author_name: 'Ian B.', author_avatar: null,
      status: 'open', votes_count: 18, comments_count: 4, views_count: 301,
      created_at: new Date(now - 18 * day).toISOString(), updated_at: new Date(now - 15 * day).toISOString()
    },
    {
      id: u('chat12'), title: 'Just hit 100 followers on my shop thanks to FUYOVIA product descriptions — celebration post! 🎉',
      content: 'Opened my Etsy shop 3 months ago selling handmade candles. Was getting zero sales despite great products.\n\nRealized my product descriptions were boring: "Handmade soy wax candle, vanilla scent, 8oz jar" 🥱\n\nRewrote all 40 listings using FUYOVIA Product Description generator with prompt: "Cozy, warm, inviting tone. Focus on sensory details (smell, ambiance, gift-worthiness). Include emotional benefits."\n\nResults:\n- Views/listing: +340%\n- Conversion rate: 2.8% (was 0.4%)\n- First sale: Day 3 after updating\n- Today: Hit 100 followers milestone! 🎊\n\nNever underestimate the power of good copy. And never underestimate FUYOVIA.',
      category: 'general', author_id: u('candle_maker'), author_name: 'Grace L.', author_avatar: null,
      status: 'open', votes_count: 49, comments_count: 17, views_count: 1234,
      created_at: new Date(now - 22 * hour).toISOString(), updated_at: new Date(now - 1 * hour).toISOString()
    },
    {
      id: u('fr19'), title: 'Voice input? Dictate instead of type for hands-free content creation',
      content: 'I think out loud better than I type. Would love a microphone button in all AI text tools where I can speak my thoughts and they get transcribed and sent to the AI for processing.\n\nUse cases:\n- Walking outside, dictating blog ideas\n- Cooking, thinking through recipe content\n- Driving, outlining video scripts verbally\n- Accessibility for users who can\'t type easily\n\nWeb Speech API can do this natively in browsers now, so implementation shouldn\'t be too hard?',
      category: 'feature_request', author_id: u('voice_wanter'), author_name: 'Jordan A.', author_avatar: null,
      status: 'open', votes_count: 25, comments_count: 6, views_count: 412,
      created_at: new Date(now - 19 * day).toISOString(), updated_at: new Date(now - 15 * day).toISOString()
    },
    {
      id: u('chat13'), title: 'Unpopular opinion: AI tools won\'t replace writers, they\'ll make average writers into great ones',
      content: 'Hear me out. Everyone fears "AI will take my job" as a writer. But after using FUYOVIA extensively:\n\n**Before AI:**\n- Stared at blank page for hours\n- Produced mediocre content slowly\n- Inconsistent quality\n- Burned out constantly\n\n**With AI assistance:**\n- Start with solid draft instantly\n- Spend time EDITING and POLISHING (the fun parts)\n- Consistent high-quality output\n- More creative energy for original ideas\n\nAI handles the grunt work. Humans handle the soul. That\'s the future I see.\n\nAgree or disagree? Let\'s discuss! 👇',
      category: 'general', author_id: u('philosopher_ai'), author_name: 'David L.', author_avatar: null,
      status: 'open', votes_count: 45, comments_count: 27, views_count: 1543,
      created_at: new Date(now - 1 * day).toISOString(), updated_at: new Date(now - 30 * minute).toISOString()
    },
    {
      id: u('fb12'), title: 'Non-technical user review: I\'m 52 years old and this is the FIRST AI tool I actually enjoy using',
      content: 'My son kept telling me to "use AI for your bakery\'s Facebook posts" and I kept resisting because every AI tool I tried was confusing.\n\nFUYOVIA is DIFFERENT:\n- Clean interface, no clutter\n- Big buttons, clear labels\n- Tools are named in normal English (not tech jargon)\n- Results appear right there, no navigating between pages\n\nI now write all my own social media posts for Sweet Dreams Bakery. Daughter says they\'re actually engaging now (she used to cringe at my posts haha).\n\nIf a 52-year-old baker can use it, anyone can. Well done team! 🍰',
      category: 'feedback', author_id: u('baker_mom'), author_name: 'Linda G.', author_avatar: null,
      status: 'open', votes_count: 73, comments_count: 21, views_count: 1765,
      created_at: new Date(now - 10 * hour).toISOString(), updated_at: new Date(now - 2 * hour).toISOString()
    },
    {
      id: u('fr20'), title: 'Content calendar integration? Plan and schedule posts across tools',
      content: 'Dream feature: a simple calendar view where I can:\n- See all scheduled/generated content at a glance\n- Drag-drop to reorder posting schedule\n- Connect to Buffer/Hootsuite for auto-publishing\n- Set reminders: "Regenerate this post variant on Friday"\n- Track which content performed best each week\n\nBasically a lightweight Content Studio inside FUYOVIA. Would complete the loop from creation → scheduling → publishing → analysis.',
      category: 'feature_request', author_id: u('calendar_dream'), author_name: 'Rachel T.', author_avatar: null,
      status: 'open', votes_count: 34, comments_count: 5, views_count: 512,
      created_at: new Date(now - 20 * day).toISOString(), updated_at: new Date(now - 16 * day).toISOString()
    },
    {
      id: u('chat14'), title: 'Day 30 of using FUYOVIA exclusively — my full report 📊',
      content: 'Challenge accepted: Use ONLY FUYOVIA for all my content needs for 30 days. Here are my stats:\n\n**Usage Summary:**\n- Social Media Writer: 142 generations (most used!)\n- SEO Blog Writer: 23 blog posts\n- Product Descriptions: 67 items\n- AI Humanizer: 45 texts processed\n- Image Compressor: 230+ images\n- Hashtag Generator: 89 posts tagged\n- Other tools: various\n\n**Time saved:** Estimated 40+ hours vs manual work\n**Money saved:** Cancelled 3 subscriptions (~$100/mo total)\n**Quality rating:** 8.5/10 overall\n\nVerdict: FUYOVIA is now essential to my workflow. Not going back.',
      category: 'general', author_id: u('power_user_30'), author_name: 'Tom H.', author_avatar: null,
      status: 'open', votes_count: 57, comments_count: 15, views_count: 1334,
      created_at: new Date(now - 26 * hour).toISOString(), updated_at: new Date(now - 3 * hour).toISOString()
    },
    {
      id: u('fr21'), title: 'Collaborative editing: Real-time co-writing on the same document?',
      content: 'Sometimes I work with a client on refining AI-generated content. Would be cool if we could both edit the same document simultaneously (like Google Docs).\n\nUse case:\n1. Generate initial draft with FUYOVIA\n2. Share link with client\n3. Both can comment/edit in real-time\n4. Finalize together\n5. Export/download final version\n\nProbably ambitious but wanted to put it out there!',
      category: 'feature_request', author_id: u('collab_wanter'), author_name: 'Sam W.', author_avatar: null,
      status: 'open', votes_count: 22, comments_count: 3, views_count: 345,
      created_at: new Date(now - 21 * day).toISOString(), updated_at: new Date(now - 18 * day).toISOString()
    },
    {
      id: u('chat15'), title: 'FUYOVIA + Canva workflow: How I create stunning graphics in half the time',
      content: 'My content creation stack:\n\n1. **FUYOVIA AI Image Gen** → Generate base concept image\n2. **FUYOVIA Social Media Writer** → Write caption + hashtag strategy\n3. **Canva** → Overlay text, branding, resize for each platform\n4. **Buffer** → Schedule across all accounts\n\nTotal time per post: ~8 minutes (used to take 45+)\n\nThe combo of FUYOVIA + Canva is unbeatable for visual content. Anyone else using a similar stack?',
      category: 'general', author_id: u('workflow_share'), author_name: 'Nina C.', author_avatar: null,
      status: 'open', votes_count: 41, comments_count: 12, views_count: 789,
      created_at: new Date(now - 7 * day).toISOString(), updated_at: new Date(now - 4 * day).toISOString()
    } as any,
    {
      id: u('fb13'), title: 'The JSON Formatter saved my backend debugging session today',
      content: 'Was debugging a messy API response that had no line breaks, no indentation, just a wall of text. Pasted it into FUYOVIA JSON Formatter and instantly got a beautifully formatted, color-coded, collapsible tree view.\n\nFound the issue in 2 minutes (a trailing comma in a nested array that was breaking parsing).\n\nPreviously would have taken me 15+ minutes squinting at raw text. Small tool, huge impact. Thank you for including developer utilities alongside the AI creative tools!',
      category: 'feedback', author_id: u('dev_helper'), author_name: 'Ryan M.', author_avatar: null,
      status: 'open', votes_count: 28, comments_count: 5, views_count: 423,
      created_at: new Date(now - 14 * day).toISOString(), updated_at: new Date(now - 11 * day).toISOString()
    },
    {
      id: u('fr22'), title: 'White-label option for agencies? Put our branding on generated outputs',
      content: 'My agency delivers AI-generated content to clients but they don\'t know we use AI tools (and prefer not to know). It would be great if:\n\n- We could set custom branding/logo on the interface\n- Generated outputs include our agency watermark\n- Custom domain: tools.ouragency.com instead of tools.fuyovia.com\n- Client-facing dashboards showing their content library\n\nWe\'d happily pay premium pricing for white-label capabilities.',
      category: 'feature_request', author_id: u('white_label'), author_name: 'AgencyBoss', author_avatar: null,
      status: 'open', votes_count: 40, comments_count: 8, views_count: 634,
      created_at: new Date(now - 15 * day).toISOString(), updated_at: new Date(now - 10 * day).toISOString()
    },
    {
      id: u('chat16'), title: 'Confession time: I used AI Humanizer on my college essay and professor said it was my best work yet 😅',
      content: 'OK before anyone judges me — I DID write the core ideas and research myself. I just used FUYOVIA AI Humanizer to polish the language because English isn\'t my first language and I always lose points for "awkward phrasing."\n\nProfessor\'s comment: "Excellent flow and clarity this time! Your writing has really improved."\n\nYeah... it has. Thanks FUYOVIA 😂\n\n(For the record, I still put in the actual effort. AI is a polishing tool, not a cheating tool. There\'s a difference!) ',
      created_at: new Date(now - 3 * day).toISOString(), updated_at: new Date(now - 1 * hour).toISOString()
    } as any,
    {
      id: u('fr23'), title: 'Grammar/spell-check integration? Catch errors before publishing',
      content: 'After AI generates content, I still need to run it through Grammarly to catch typos and grammar issues. Would be seamless if FUYOVIA had built-in proofreading:\n\n- Underline potential errors in real-time\n- Offer corrections on click\n- Check for commonly confused words (their/there/they\'re)\n- Style consistency checker\n\nOne less tab to switch between means faster workflow.',
      category: 'feature_request', author_id: u('grammar_geek'), author_name: 'Lisa Marie', author_avatar: null,
      status: 'open', votes_count: 24, comments_count: 4, views_count: 367,
      created_at: new Date(now - 23 * day).toISOString(), updated_at: new Date(now - 19 * day).toISOString()
    } as any,
    {
      id: u('chat17'), title: 'Community milestone: We just hit [number] members! Let\'s celebrate! 🎉',
      content: 'This community is growing fast! So many valuable conversations happening here.\n\nTo the FUYOVIA team: thank you for building not just tools, but a space where users can connect and share.\n\nTo fellow users: keep the feedback coming! Every post here makes the product better for everyone.\n\nHere\'s to building something amazing together! 🥂',
      category: 'general', author_id: u('celebrator'), author_name: 'FUYOVIA Team', author_avatar: null,
      status: 'open', votes_count: 42, comments_count: 11, views_count: 678,
      created_at: new Date(now - 28 * hour).toISOString(), updated_at: new Date(now - 5 * hour).toISOString()
    } as any,
  ].map(d => ({
    ...d,
    views_count: d.views_count || Math.floor(Math.random() * 500) + 100,
    comments_count: d.comments_count || Math.floor(Math.random() * 10),
  }))
}

const SEED_DATA = (() => {
  let cached: Discussion[] | null = null
  return () => {
    if (!cached) cached = generateSeedData()
    return cached
  }
})()

// ============================================================
//  MAIN COMPONENT
// ============================================================

export default function CommunityClient() {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signInWithFacebook, signOut, getToken } = useAuth()

  const [view, setView] = useState<'list' | 'detail'>('list')
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)

  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('latest')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(0)

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('general')
  const [submitting, setSubmitting] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)

  // UI states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set())
  const [showLoginModal, setShowLoginModal] = useState(false)
  // Detect iframe embedding (Shoplazza) — remove max-width when embedded
  const [isEmbedded, setIsEmbedded] = useState(false)
  useEffect(() => { try { setIsEmbedded(window.self !== window.top) } catch { setIsEmbedded(true) } }, [])

  // Email auth form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [authLoading2, setAuthLoading2] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const PAGE_SIZE = 15

  // Fetch discussions — ALWAYS merge real + seed data
  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Always fetch ALL real discussions (client-side pagination after merge)
      const params = new URLSearchParams({
        category,
        sort,
        limit: '1000',
        offset: '0',
      })
      const res = await fetch(`/api/discussions?${params}`)
      const json = await res.json()

      const seed = SEED_DATA()

      // ALWAYS merge real + seed (never replace)
      let merged: Discussion[] = []
      if (json.success && json.data && Array.isArray(json.data)) {
        merged = [...json.data, ...seed]
      } else {
        merged = [...seed]
      }

      // Deduplicate by ID (safety)
      const seen = new Set<string>()
      merged = merged.filter(d => {
        if (seen.has(d.id)) return false
        seen.add(d.id)
        return true
      })

      // Filter by category
      let filtered = category !== 'all'
        ? merged.filter(d => d.category === category)
        : merged

      // Filter by search (client-side on merged data)
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
        )
      }

      // Sort: popular = by votes, latest = by date
      if (sort === 'popular') {
        filtered.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
      } else {
        filtered.sort((a, b) => {
          const aTime = new Date(b.created_at).getTime()
          const bTime = new Date(a.created_at).getTime()
          return bTime - aTime
        })
      }

      // Client-side pagination on merged array
      const total = filtered.length
      const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

      setDiscussions(paged)
      setTotal(total)
    } catch {
      // Network error — fallback to seed only
      const seed = SEED_DATA()
      let filtered = category !== 'all'
        ? seed.filter(d => d.category === category)
        : seed
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(q) ||
          d.content.toLowerCase().includes(q)
        )
      }
      if (sort === 'popular') {
        filtered.sort((a, b) => (b.votes_count || 0) - (a.votes_count || 0))
      } else {
        filtered.sort((a, b) => {
          const aTime = new Date(b.created_at).getTime()
          const bTime = new Date(a.created_at).getTime()
          return bTime - aTime
        })
      }
      const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
      setDiscussions(paged)
      setTotal(filtered.length)
    } finally {
      setLoading(false)
    }
  }, [category, sort, searchQuery, page])

  useEffect(() => {
    fetchDiscussions()
  }, [fetchDiscussions])

  // Fetch user votes when logged in
  useEffect(() => {
    if (!user) return
    fetch(`/api/vote?user_id=${user.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setUserVotes(new Set(json.data.map((v: any) => v.discussion_id)))
        }
      })
      .catch(() => {})
  }, [user])

  // Open discussion detail
  const openDiscussion = async (discussion: Discussion) => {
    setSelectedDiscussion(discussion)
    setView('detail')
    setCommentText('')
    try {
      const res = await fetch(`/api/discussions/${discussion.id}`)
      const json = await res.json()
      if (json.success) {
        setComments(json.comments || [])
      }
    } catch {
      setComments([])
    }
  }

  const backToList = () => {
    setView('list')
    setSelectedDiscussion(null)
    setComments([])
  }

  // Vote
  const handleVote = async (discussionId: string) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }
    const token = await getToken()
    if (!token) return

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ discussion_id: discussionId, user_id: user.id }),
      })
      const json = await res.json()
      if (json.success) {
        if (json.voted) {
          setUserVotes(prev => new Set([...prev, discussionId]))
          setDiscussions(prev => prev.map(d =>
            d.id === discussionId ? { ...d, votes_count: d.votes_count + 1 } : d
          ))
          if (selectedDiscussion?.id === discussionId) {
            setSelectedDiscussion(p => p ? { ...p, votes_count: p.votes_count + 1 } : null)
          }
        } else {
          setUserVotes(prev => { const s = new Set(prev); s.delete(discussionId); return s })
          setDiscussions(prev => prev.map(d =>
            d.id === discussionId ? { ...d, votes_count: Math.max(0, d.votes_count - 1) } : d
          ))
          if (selectedDiscussion?.id === discussionId) {
            setSelectedDiscussion(p => p ? { ...p, votes_count: Math.max(0, p.votes_count - 1) } : null)
          }
        }
      }
    } catch { /* offline vote handled locally */ }
  }

  // Create discussion
  const handleCreateDiscussion = async () => {
    if (!newTitle.trim() || !newContent.trim()) return
    setSubmitting(true)
    const token = await getToken()
    if (!token) { setSubmitting(false); setShowLoginModal(true); return }

    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          category: newCategory,
          author_id: user!.id,
          author_name: user!.user_metadata?.full_name || user?.email?.split('@')[0],
          author_avatar: user!.user_metadata?.avatar_url || user!.user_metadata?.picture || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setShowCreateModal(false)
        setNewTitle('')
        setNewContent('')
        setNewCategory('general')
        fetchDiscussions()
      } else {
        alert(json.error || 'Failed to create discussion')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Add comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedDiscussion) return
    setCommenting(true)
    const token = await getToken()
    if (!token) { setCommenting(false); setShowLoginModal(true); return }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          discussion_id: selectedDiscussion.id,
          content: commentText.trim(),
          author_id: user!.id,
          author_name: user!.user_metadata?.full_name || user?.email?.split('@')[0],
          author_avatar: user!.user_metadata?.avatar_url || user!.user_metadata?.picture || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setComments(prev => [...prev, json.data])
        setCommentText('')
        setSelectedDiscussion(prev => prev ? { ...prev, comments_count: prev.comments_count + 1 } : null)
      } else {
        alert(json.error || 'Failed to add comment')
      }
    } catch {
      alert('Network error. Please try again.')
    } finally {
      setCommenting(false)
    }
  }

  // Email / Password Auth
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) return
    setAuthLoading2(true)
    setAuthError(null)
    try {
      if (authMode === 'signup') {
        const result = await signUp(email, password, displayName.trim())
        if (result.error) setAuthError(result.error)
        else { setShowLoginModal(false); setEmail(''); setPassword(''); setDisplayName('') }
      } else {
        const result = await signIn(email, password)
        if (result.error) setAuthError(result.error)
        else { setShowLoginModal(false); setEmail(''); setPassword('') }
      }
    } catch {
      setAuthError('Network error. Please try again.')
    } finally {
      setAuthLoading2(false)
    }
  }

  const closeLoginModal = () => {
    setShowLoginModal(false)
    setEmail(''); setPassword(''); setDisplayName('')
    setAuthError(null)
    setAuthMode('signin')
  }

  // Time formatting
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Stats calculation — always merge seed + real counts
  const allDiscussions = SEED_DATA()
  const [realTotal, setRealTotal] = useState(0)

  useEffect(() => {
    // Fetch real discussion count from API (limit=1 to get total count efficiently)
    fetch('/api/discussions?limit=1')
      .then(r => r.json())
      .then(json => {
        if (json.success && typeof json.total === 'number') {
          setRealTotal(json.total)
        }
      })
      .catch(() => {})
  }, [])

  const totalMembers = 1247
  // Always show seed + real (merged model: never replace)
  const totalDiscussionsCount = allDiscussions.length + realTotal
  const totalComments = allDiscussions.reduce((sum, d) => sum + d.comments_count, 0) + 156
  const activeToday = 38

  // ===== Render: List View =====
  if (view === 'list') {
    return (
      <div className={`w-full ${isEmbedded ? '' : 'min-h-screen bg-[#fefdf8]'}`} style={isEmbedded ? { background: '#fefdf8' } : undefined}>
        {/* ========== HERO SECTION — Bold & Atmospheric ========== */}
        <div className={`relative overflow-hidden ${isEmbedded ? '' : 'rounded-b-3xl'}`}
             style={{
               background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 25%, #0284c7 50%, #0ea5e9 75%, #38bdf8 100%)',
               padding: isEmbedded ? '40px 0 35px' : '60px 24px 50px',
             }}>
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
            <div className="absolute top-40 -left-10 w-60 h-60 rounded-full opacity-8" style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-40 rounded-full opacity-6" style={{ background: 'radial-gradient(circle, #bae6fd 0%, transparent 70%)' }} />
          </div>

          <div className={`relative ${isEmbedded ? 'px-6 sm:px-8' : 'max-w-5xl mx-auto'} text-center`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                 style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-white/90">{activeToday} people active right now</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
              Community Hub
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-3 font-medium">
              Your voice shapes FUYOVIA AI Tools.
            </p>
            <p className="text-base text-white/60 max-w-xl mx-auto mb-10">
              Share ideas, report bugs, suggest features — we listen to every single conversation.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => user ? setShowCreateModal(true) : setShowLoginModal(true)}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-base text-sky-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              style={{ background: 'white' }}
            >
              <span className="text-xl">✏️</span> Start a Discussion
            </button>
          </div>
        </div>

        {/* ========== STATS BAR ========== */}
        <div className={`${isEmbedded ? 'px-6 sm:px-8' : 'max-w-5xl mx-auto px-4'} -mt-6 relative z-10`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { label: 'Members', value: totalMembers.toLocaleString(), icon: '👥', color: '#0ea5e9' },
              { label: 'Discussions', value: totalDiscussionsCount.toLocaleString(), icon: '💬', color: '#8b5cf6' },
              { label: 'Comments', value: totalComments.toLocaleString(), icon: '💭', color: '#f97316' },
              { label: 'Implemented', value: '12+', icon: '✅', color: '#10b981' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 text-center">
                <span className="text-2xl block mb-1">{stat.icon}</span>
                <div className="text-2xl font-black text-neutral-800" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== MAIN CONTENT AREA ========== */}
        <div className={`${isEmbedded ? 'px-6 sm:px-8' : 'max-w-5xl mx-auto px-4'} py-8`}>

          {/* Search & Sort Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text" placeholder="Search discussions..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-neutral-200 bg-white text-sm font-medium placeholder:text-neutral-400 focus:border-sky-300 focus:outline-none transition-colors"
                />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(0) }}
                className="px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm font-bold text-neutral-600 bg-white focus:border-sky-300 focus:outline-none cursor-pointer whitespace-nowrap">
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <button onClick={() => user ? setShowCreateModal(true) : setShowLoginModal(true)}
              className="whitespace-nowrap px-6 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2 transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
              <span className="text-base">+</span> New Discussion
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setPage(0) }}
                style={{
                  background: category === cat.id ? `${cat.color}` : 'white',
                  borderColor: category === cat.id ? cat.color : '#e5e7eb',
                  color: category === cat.id ? 'white' : '#6b7280',
                  boxShadow: category === cat.id ? `0 2px 8px ${cat.color}40` : 'none'
                }}
                className="px-5 py-2.5 rounded-full text-sm font-bold border-2 transition-all hover:shadow-md">
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-neutral-100 p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-neutral-100 flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-3/4 bg-neutral-100 rounded-lg" />
                      <div className="h-4 w-full bg-neutral-50 rounded-lg" />
                      <div className="h-4 w-2/3 bg-neutral-50 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discussion List */}
          {!loading && (
            <>
              <div className="space-y-3">
                {discussions.map((discussion) => {
                  const statusInfo = STATUS_CONFIG[discussion.status] || STATUS_CONFIG.open
                  const cat = CATEGORIES.find(c => c.id === discussion.category) || CATEGORIES[4]
                  const hasVoted = userVotes.has(discussion.id)
                  const isHot = discussion.votes_count >= 50
                  const isNew = (Date.now() - new Date(discussion.created_at).getTime()) < 172800000 // 48h

                  return (
                    <div key={discussion.id} onClick={() => openDiscussion(discussion)}
                      className="group bg-white rounded-2xl border border-neutral-100 p-5 cursor-pointer hover:shadow-lg hover:border-sky-200/60 transition-all duration-200 hover:-translate-y-0.5">
                      <div className="flex gap-4">
                        {/* Vote Button */}
                        <div className="flex-shrink-0 pt-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleVote(discussion.id) }}
                            disabled={!user}
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 font-bold text-sm transition-all ${
                              hasVoted
                                ? 'border-sky-400 bg-sky-50 text-sky-600'
                                : 'border-neutral-200 text-neutral-400 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                            <span className="text-xs mt-0.5 font-black">{discussion.votes_count}</span>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                            <h3 className="font-bold text-neutral-800 group-hover:text-sky-600 transition-colors text-[16px] leading-snug">
                              {discussion.title}
                              {isHot && <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide" style={{ background: '#fef3c7', color: '#d97706' }}>🔥 Hot</span>}
                              {isNew && <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide" style={{ background: '#dcfce7', color: '#16a34a' }}>✨ New</span>}
                            </h3>
                          </div>
                          <p className="text-sm text-neutral-500 line-clamp-2 mb-3 leading-relaxed">{discussion.content}</p>

                          {/* Footer meta */}
                          <div className="flex items-center gap-4 text-xs font-medium">
                            <span className="flex items-center gap-1.5">
                              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-black"
                                   style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}>
                                {discussion.author_name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="text-neutral-700 font-semibold">{discussion.author_name}</span>
                            </span>
                            <span className="text-neutral-400">{timeAgo(discussion.created_at)}</span>
                            <span className="flex items-center gap-1 text-neutral-400">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                              {discussion.comments_count}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold`} style={{ background: statusInfo.bg, color: statusInfo.color }}>
                              {statusInfo.label}
                            </span>
                            <span className="ml-auto flex items-center gap-1 text-neutral-300" style={{ color: '#94a3b8' }}>
                              {cat.icon} <span className="text-[10px]">{cat.label.split(' ')[0]}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {total > PAGE_SIZE && (
                <div className="flex justify-center gap-2 mt-8">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                    className="py-2.5 px-5 rounded-xl text-sm font-bold border-2 border-neutral-200 text-neutral-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    ← Previous
                  </button>
                  <span className="py-2.5 px-5 text-sm text-neutral-500 font-bold self-center bg-neutral-50 rounded-xl">
                    Page {page + 1} of {Math.ceil(total / PAGE_SIZE)}
                  </span>
                  <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= total}
                    className="py-2.5 px-5 rounded-xl text-sm font-bold border-2 border-neutral-200 text-neutral-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===== Create Modal ===== */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-100 sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-neutral-800">Start a New Discussion</h2>
                  <button onClick={() => setShowCreateModal(false)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-neutral-100 transition-colors text-neutral-400 text-lg">✕</button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-black text-neutral-500 mb-2 uppercase tracking-wider">Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What's on your mind?" maxLength={200}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm focus:border-sky-300 focus:outline-none transition-colors" />
                  <div className="text-right text-xs text-neutral-400 mt-1 font-medium">{newTitle.length}/200</div>
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-500 mb-2 uppercase tracking-wider">Details</label>
                  <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Describe your idea, feedback, or issue in detail..."
                    rows={5} maxLength={2000}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm resize-none focus:border-sky-300 focus:outline-none transition-colors" />
                  <div className="text-right text-xs text-neutral-400 mt-1 font-medium">{newContent.length}/2000</div>
                </div>
                <div>
                  <label className="block text-xs font-black text-neutral-500 mb-2 uppercase tracking-wider">Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                      <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-bold border-2 transition-all ${
                          newCategory === cat.id ? 'border-current shadow-sm' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                        }`}
                        style={newCategory === cat.id ? { borderColor: cat.color, color: cat.color, background: `${cat.color}10` } : {}}>
                        {cat.icon} {cat.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-neutral-100 flex justify-end gap-3">
                <button onClick={() => setShowCreateModal(false)}
                  className="py-2.5 px-6 rounded-2xl font-bold border-2 border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all">Cancel</button>
                <button onClick={handleCreateDiscussion} disabled={!newTitle.trim() || !newContent.trim() || submitting}
                  className="py-2.5 px-8 rounded-2xl font-bold text-white disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                  {submitting ? 'Posting...' : '🚀 Post Discussion'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Login Modal ===== */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeLoginModal()}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-neutral-800 mb-1">
                    {authMode === 'signin' ? 'Welcome Back' : 'Join Community'}
                  </h2>
                  <p className="text-neutral-500 text-sm font-medium">
                    {authMode === 'signin' ? 'Sign in to post, vote, and discuss' : 'Create an account to join the conversation'}
                  </p>
                </div>
                {authError && (
                  <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200/50 text-red-600 text-sm font-bold text-center">{authError}</div>
                )}
                <div className="space-y-3">
                  {authMode === 'signup' && (
                    <div><label className="block text-xs font-black text-neutral-500 mb-1.5 uppercase tracking-wider">Display Name</label>
                      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" maxLength={50}
                        className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm focus:border-sky-300 focus:outline-none" /></div>
                  )}
                  <div><label className="block text-xs font-black text-neutral-500 mb-1.5 uppercase tracking-wider">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm focus:border-sky-300 focus:outline-none" /></div>
                  <div><label className="block text-xs font-black text-neutral-500 mb-1.5 uppercase tracking-wider">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder={authMode === 'signup' ? 'Min 6 characters' : 'Enter password'}
                      autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={6}
                      className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm focus:border-sky-300 focus:outline-none" /></div>
                  <button onClick={handleEmailAuth}
                    disabled={!email.trim() || !password.trim() || (authMode === 'signup' && !displayName.trim()) || authLoading2}
                    className="w-full py-3.5 px-6 rounded-2xl font-bold text-white disabled:opacity-50 mt-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                    {authLoading2 ? (authMode === 'signup' ? 'Creating...' : 'Signing in...') : (authMode === 'signup' ? '🚀 Create Account' : '→ Sign In')}
                  </button>
                </div>
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-neutral-200" /><span className="text-xs text-neutral-400 font-bold uppercase">or</span><div className="flex-1 h-px bg-neutral-200" />
                </div>
                <div className="space-y-2.5">
                  <button onClick={() => { signInWithGoogle(); closeLoginModal() }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-neutral-200 bg-white font-bold text-neutral-600 hover:bg-neutral-50 transition-all text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Google
                  </button>
                  <button onClick={() => { signInWithFacebook(); closeLoginModal() }}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl border-2 border-neutral-200 bg-white font-bold text-neutral-600 hover:bg-neutral-50 transition-all text-sm">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </button>
                </div>
                <p className="mt-5 text-center text-sm text-neutral-500 font-medium">
                  {authMode === 'signin' ? <>Don&apos;t have an account? <button onClick={() => { setAuthMode('signup'); setAuthError(null) }} className="font-black" style={{ color: '#0ea5e9' }}>Sign up free</button></>
                    : <>Already have an account? <button onClick={() => { setAuthMode('signin'); setAuthError(null) }} className="font-black" style={{ color: '#0ea5e9' }}>Sign in</button></>}
                </p>
                <p className="mt-3 text-xs text-neutral-400 text-center font-medium">By signing in, you agree to our community guidelines.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== Render: Detail View =====
  if (view === 'detail' && selectedDiscussion) {
    const statusInfo = STATUS_CONFIG[selectedDiscussion.status] || STATUS_CONFIG.open
    const cat = CATEGORIES.find(c => c.id === selectedDiscussion.category) || CATEGORIES[4]
    const hasVoted = userVotes.has(selectedDiscussion.id)

    return (
      <div className={`${isEmbedded ? 'px-6 sm:px-8' : 'max-w-4xl mx-auto px-4'} py-8`}>
        <button onClick={backToList}
          className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-sky-600 transition-colors mb-6">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Community
        </button>

        <article className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: statusInfo.bg, color: statusInfo.color }}>{statusInfo.label}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${cat.color}15`, color: cat.color }}>{cat.icon} {cat.label}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-800 mb-4 leading-tight">{selectedDiscussion.title}</h1>
          <div className="flex items-center gap-4 mb-6 text-sm text-neutral-500 pb-6 border-b border-neutral-100 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black"
                   style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}>
                {selectedDiscussion.author_name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="font-bold text-neutral-700">{selectedDiscussion.author_name}</span>
            </div>
            <span>{timeAgo(selectedDiscussion.created_at)}</span>
            <span className="flex items-center gap-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{selectedDiscussion.comments_count}</span>
            <span>{selectedDiscussion.views_count || 0} views</span>
          </div>
          <div className="prose prose-slate max-w-none text-neutral-700 whitespace-pre-wrap leading-relaxed text-[15px]">{selectedDiscussion.content}</div>
          <div className="flex items-center gap-4 mt-8 pt-6 border-t border-neutral-100">
            <button onClick={() => handleVote(selectedDiscussion.id)} disabled={!user}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                hasVoted ? 'border-sky-400 bg-sky-50 text-sky-600' : 'border-neutral-200 text-neutral-500 hover:border-sky-300 hover:text-sky-500'
              } disabled:opacity-50`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6"/></svg>
              {hasVoted ? 'Upvoted' : 'Upvote'} <span className="font-black ml-0.5">{selectedDiscussion.votes_count}</span>
            </button>
          </div>
        </article>

        <section className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-black text-neutral-800 mb-6 flex items-center gap-2">💬 Comments ({comments.length})</h2>
          {user ? (
            <div className="mb-6">
              <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Share your thoughts..." rows={3}
                maxLength={1000} className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 text-sm resize-none focus:border-sky-300 focus:outline-none" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-neutral-400 font-medium">{commentText.length}/1000</span>
                <button onClick={handleAddComment} disabled={!commentText.trim() || commenting}
                  className="py-2 px-5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                  {commenting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-5 bg-neutral-50 rounded-2xl text-center">
              <p className="text-sm text-neutral-500 mb-3 font-medium">Sign in to join the conversation</p>
              <button onClick={() => setShowLoginModal(true)}
                className="py-2.5 px-5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                Sign In to Comment
              </button>
            </div>
          )}
          {comments.length > 0 ? (
            <div className="space-y-4 divide-y divide-neutral-50">
              {comments.map((comment) => (
                <div key={comment.id} className="pt-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-200 to-sky-400 flex-shrink-0 flex items-center justify-center text-white text-sm font-black">
                      {comment.author_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-neutral-700">{comment.author_name}</span>
                        <span className="text-xs text-neutral-400">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-sm text-neutral-600 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400">
              <span className="text-3xl block mb-2">💭</span>
              <p className="text-sm font-medium">No comments yet. Be the first!</p>
            </div>
          )}
        </section>
      </div>
    )
  }

  return null
}
