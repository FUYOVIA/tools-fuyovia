import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { authenticateAndCheckCredits, deductCredits, callOpenAI } from '@/lib/api-helpers'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateAndCheckCredits(request, 'resume-optimizer')
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 401 })
    }

    const body = await request.json()
    const { resumeContent, targetRole, type } = body

    if (!resumeContent || resumeContent.trim().length < 50) {
      return NextResponse.json({ error: 'Please paste your resume content (at least 50 characters)' }, { status: 400 })
    }

    const outputType = type || 'both'

    const systemPrompt = `You are an expert career coach and ATS (Applicant Tracking System) specialist. You help job seekers optimize their resumes and cover letters to actually get interviews.

For RESUME optimization:
- Replace passive language ("responsible for", "helped with") with strong action verbs (Spearheaded, Architected, Drove, Optimized)
- Quantify EVERYTHING: "Managed team" → "Managed 12-person cross-functional team, delivering 3 major features 2 weeks ahead of deadline"
- ATS optimization: Use standard section headings (Work Experience, Education, Skills), avoid tables/graphics/tables (ATS cant parse them)
- Keyword matching: Extract 5-8 keywords from the target job description and naturally weave them into the resume
- Remove: GPA (unless recent grad), outdated jobs (10+ years), irrelevant hobbies
- Add: "Core Competencies" section with 6-8 relevant skill keywords
- Format: Reverse-chronological, clean, no fancy graphics

For COVER LETTER:
- Structure: Opening (why this company/role specifically) → 2-3 achievement paragraphs (not restating the resume) → Closing (clear next step)
- Customize for the target company: Mention 1 specific thing about them
- Tone: Confident but not arrogant, professional but not robotic
- Length: 250-350 words max
- AVOID: "I am writing to apply", "Please find my resume attached", generic templates

Output format:
## Optimized Resume
[Full optimized resume in clean text format]

## What Changed (ATS Improvements)
- [specific improvement 1]
- [specific improvement 2]
...

## Core Competencies (for ATS)
[keyword 1], [keyword 2], ...

## Cover Letter (if requested)
[Full cover letter]

## Interview Tips for This Role
- [specific tip 1]
- [specific tip 2]
...`

    const userPrompt = `Optimize this resume for the role of: "${targetRole || 'the most relevant role based on the resume content'}"

Resume content:
${resumeContent}

Output type: ${outputType} (options: "resume", "cover-letter", "both")

Focus on ATS compatibility and keyword optimization for this specific role. Make the person sound like a top 1% candidate.`

    const result = await callOpenAI(systemPrompt, userPrompt, 'gpt-4o-mini', 0.6, 3000)
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    await deductCredits(auth.userId, 'resume-optimizer')

    return NextResponse.json({
      success: true,
      data: result.content,
      targetRole: targetRole || 'inferred from resume',
    })

  } catch (error) {
    console.error('Resume Optimizer error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Resume Optimizer API is running' })
}
