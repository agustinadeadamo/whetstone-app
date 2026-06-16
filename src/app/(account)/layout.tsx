/**
 * Centered, single-column shell for the account/auth screens. Uses design
 * tokens from globals.css — no hardcoded colors.
 */
export default function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--s-6)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>{children}</div>
    </main>
  );
}
