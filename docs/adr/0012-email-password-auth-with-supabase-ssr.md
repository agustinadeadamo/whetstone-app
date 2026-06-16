# 0012 — Email + password auth via Supabase SSR, server actions

Date: 2026-06-02
Status: Accepted

## Context

Step 2 of the build order requires working auth: a user can sign up and log in,
and a logged-in user can be resolved server-side. The Anthropic key and all
privileged operations are server-side (ADR 0004, Golden Rule 1), so the auth
session must be readable on the server. Several choices had to be made: the auth
method, where auth logic runs, and how the session is kept fresh across requests.

## Options considered

- **Auth method.** Email + password; magic links; OAuth providers. Magic links
  and OAuth add provider/redirect complexity not needed for an MVP.
- **Where auth logic runs.** Client-side calls with the browser Supabase client
  vs. server actions that proxy the calls. Client-side calls skip server-side
  input validation and scatter auth logic across components.
- **Session freshness.** Rely on client refresh only vs. refresh in Next
  middleware so Server Components always read a current session.

## Decision

- **Email + password**, with **email confirmation ON**. Signup sends a
  confirmation email; the link hits `/auth/callback`, which exchanges the code
  for a session.
- **Server Actions** (`lib/auth-actions.ts`, `signUp`/`signIn`/`signOut`)
  validate input with Zod, then call Supabase via the existing server client
  (`lib/auth.ts`). The browser client (`lib/auth-client.ts`) stays available for
  future client-side needs but is not on the auth path.
- **`src/middleware.ts`** refreshes the session on every request. Route
  protection is enforced per-page with `getUser()` (which revalidates the token
  against the auth server, unlike `getSession()`).
- Auth uses the **anon key + session cookie** (the Supabase SSR pattern); the
  `service_role` key never reaches the client.

Password reset, OAuth, and magic links are deferred (post-MVP). Restricting
self-service updates to `users.plan` is tracked separately for step 6
(entitlement) — see the backlog.

## Consequences

- Smallest correct surface for an MVP: no provider config, no redirect matrix.
- All auth mutations are server-side and Zod-validated, consistent with the
  rest of the app; the client never holds a secret.
- Queries run as the `authenticated` role and are gated by the RLS policies
  (ADR 0003 / 0009). The `handle_new_user` trigger mirrors the new auth user
  into `public.users` on signup.
- Email confirmation depends on Supabase dashboard config (confirmation enabled,
  the callback URL allow-listed) — an operational prerequisite, not code.
- Routes live under `src/app/`; `lib/` stays at the repo root and is imported
  via the `@/lib/*` alias rather than being moved under `src/` (a refactor
  deliberately kept out of this change).
