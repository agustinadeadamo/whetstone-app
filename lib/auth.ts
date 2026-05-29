import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads the auth session from the request cookies via `@supabase/ssr`.
 *
 * Never import this from client code: the `server-only` guard above fails the
 * build if this module is pulled into a client bundle. The browser counterpart
 * lives in `lib/auth-client.ts`.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where mutating cookies is not
            // allowed. Safe to ignore when middleware refreshes the session.
          }
        },
      },
    },
  );
}
