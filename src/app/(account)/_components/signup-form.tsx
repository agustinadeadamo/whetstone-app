'use client';

import { useActionState } from 'react';

import { signUp, type AuthState } from '@/lib/auth-actions';

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    signUp,
    null,
  );

  if (state && 'ok' in state) {
    return (
      <p
        role="status"
        style={{
          color: 'var(--c-success)',
          fontSize: 'var(--t-sm)',
          margin: 0,
        }}
      >
        {state.message}
      </p>
    );
  }

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
          autoComplete="new-password"
          required
        />
        <span className="hint">At least 8 characters.</span>
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
        {pending ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
}
