import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase auth session on every request so Server Components
 * always read a current session. `lib/auth.ts` relies on this: it cannot write
 * refreshed cookies from a Server Component, so the middleware does it here.
 *
 * This builds its own Supabase client because middleware needs a cookie adapter
 * backed by the request/response objects — a different adapter than the
 * `next/headers` one in `lib/auth.ts`. It uses the anon key only; no secret.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touching getUser() triggers a token refresh and writes the updated cookies
  // into `response` via setAll above. Do not gate on the result here — route
  // protection is enforced per-page with getUser() from lib/auth.ts.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on all routes except static assets and image files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
