import Link from 'next/link';

import { LoginForm } from '../_components/login-form';

export const metadata = { title: 'Sign in · Whetstone' };

export default function LoginPage() {
  return (
    <div className="card">
      <h1
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 'var(--w-xbold)',
          fontSize: 'var(--t-xl)',
          letterSpacing: 'var(--tr-tight)',
          margin: '0 0 var(--s-2)',
        }}
      >
        Sign in
      </h1>
      <p
        style={{
          color: 'var(--c-ink-3)',
          fontSize: 'var(--t-sm)',
          margin: '0 0 var(--s-6)',
        }}
      >
        Access your Whetstone account.
      </p>

      <LoginForm />

      <p
        style={{
          marginTop: 'var(--s-6)',
          fontSize: 'var(--t-sm)',
          color: 'var(--c-ink-2)',
        }}
      >
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: 'var(--c-lav-deep)' }}>
          Create account
        </Link>
      </p>
    </div>
  );
}
