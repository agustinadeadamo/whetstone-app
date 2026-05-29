'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for Client Components (`"use client"`). Uses only the public
 * URL and anon key — never a server secret. The server counterpart, which
 * reads the session from cookies, lives in `lib/auth.ts`.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
