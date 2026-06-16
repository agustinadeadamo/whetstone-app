import { redirect } from 'next/navigation';

import { getUser } from '@/lib/auth';
import { signOut } from '@/lib/auth-actions';

export const metadata = { title: 'My account · Whetstone' };

export default async function AccountPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="card">
      <h1
        style={{
          fontFamily: 'var(--f-display)',
          fontWeight: 'var(--w-xbold)',
          fontSize: 'var(--t-xl)',
          letterSpacing: 'var(--tr-tight)',
          margin: '0 0 var(--s-4)',
        }}
      >
        My account
      </h1>

      <p style={{ fontSize: 'var(--t-sm)', color: 'var(--c-ink-2)', margin: 0 }}>
        Signed in as{' '}
        <strong style={{ color: 'var(--c-ink)' }}>{user.email}</strong>.
      </p>

      <form action={signOut} style={{ marginTop: 'var(--s-6)' }}>
        <button
          className="btn btn--outline"
          type="submit"
          style={{ justifyContent: 'center', width: '100%' }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
