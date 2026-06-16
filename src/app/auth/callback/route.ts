import { NextResponse, type NextRequest } from 'next/server';

import { createServerSupabaseClient } from '@/lib/auth';

/**
 * Email-confirmation (and any code-based) callback. Supabase redirects the user
 * here with a `?code=...` after they click the confirmation link; we exchange
 * it for a session (cookies are writable in a Route Handler) and then send them
 * to their destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Only allow same-app relative redirects to avoid an open-redirect.
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/account';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code, or exchange failed: send to login with an error flag.
  return NextResponse.redirect(`${origin}/login?error=auth_callback`);
}
