import 'server-only';

import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
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

/**
 * Resolve the currently authenticated user, server-side. Returns `null` when
 * there is no valid session.
 *
 * Uses `auth.getUser()` (not `getSession()`): `getUser()` revalidates the token
 * against the Supabase auth server, so the result is trustworthy on the server.
 * `getSession()` only decodes the cookie and must not be trusted for
 * authorization decisions.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
