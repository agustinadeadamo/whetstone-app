import Link from 'next/link';

import { SignupForm } from '../_components/signup-form';

export const metadata = { title: 'Create account · Whetstone' };

export default function SignupPage() {
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
        Create account
      </h1>
      <p
        style={{
          color: 'var(--c-ink-3)',
          fontSize: 'var(--t-sm)',
          margin: '0 0 var(--s-6)',
        }}
      >
        Sign up to start training.
      </p>

      <SignupForm />

      <p
        style={{
          marginTop: 'var(--s-6)',
          fontSize: 'var(--t-sm)',
          color: 'var(--c-ink-2)',
        }}
      >
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--c-lav-deep)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
