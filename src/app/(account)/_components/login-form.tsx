'use client';

import { useActionState } from 'react';

import { signIn, type AuthState } from '@/lib/auth-actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signIn,
    null,
  );

  return (
    <form action={action} style={{ display: 'grid', gap: 'var(--s-4)' }}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {state && 'error' in state && (
        <p
          role="alert"
          style={{ color: 'var(--c-error)', fontSize: 'var(--t-sm)', margin: 0 }}
        >
          {state.error}
        </p>
      )}

      <button
        className="btn btn--primary"
        type="submit"
        disabled={pending}
        style={{ justifyContent: 'center' }}
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
