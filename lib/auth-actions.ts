'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createServerSupabaseClient } from './auth';

/** Shape returned to the forms via `useActionState`. */
export type AuthState = { error: string } | { ok: true; message: string } | null;

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  // Supabase enforces its own minimum; we require a sane floor for signup.
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

// Sign-in must not leak the password policy, so only require a non-empty value.
const signInSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(1, 'Enter your password.'),
});

/** Absolute origin of the current request, for building redirect URLs. */
async function requestOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get('origin');
  if (origin) return origin;
  // Fallback for environments that omit the Origin header.
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? 'http';
  return `${proto}://${host}`;
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = await createServerSupabaseClient();
  const origin = await requestOrigin();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    ok: true,
    message:
      'We sent you a confirmation email. Confirm your account to sign in.',
  };
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: 'Incorrect email or password.' };
  }

  redirect('/account');
}

export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}
