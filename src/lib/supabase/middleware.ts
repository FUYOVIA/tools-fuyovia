import { NextResponse, type NextRequest } from 'next/server'

// Check if Supabase is configured
const isSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

export async function updateSession(request: NextRequest) {
  // If Supabase is not configured, just pass through
  if (!isSupabaseConfigured) {
    return NextResponse.next({ request })
  }

  // When Supabase is configured, do the full session refresh
  try {
    const { createServerClient } = await import('@supabase/ssr')

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.getUser()

    return supabaseResponse
  } catch (error) {
    console.error('Middleware auth error:', error)
    return NextResponse.next({ request })
  }
}
