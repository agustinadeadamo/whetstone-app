# 0003 — Row-Level Security as the tenant isolation mechanism

Date: 2026-05-29
Status: Accepted

## Context

The application is multi-tenant: every user owns their own decks,
modules, questions, and progress. The most common failure mode in
multi-tenant systems is a query that forgets to filter by user, leaking
data across tenants. The question is where to enforce isolation.

## Options considered

- **Application-level filtering.** Every query manually adds
  `WHERE user_id = ?`. Correctness depends on every developer
  remembering, every time, forever.
- **Postgres Row-Level Security (RLS).** Policies live in the database
  and filter rows based on `auth.uid()`. Queries that omit the filter
  simply return no rows; isolation does not depend on application code.

## Decision

RLS policies in Postgres, applied to every user-owned table. Policies
live in `lib/db/rls.sql`, version-controlled with the schema.

## Consequences

- Tenant isolation is enforced at a layer below the application code.
  A bug in a query cannot leak data across tenants.
- Drizzle queries automatically benefit from RLS without needing to
  remember to filter — Postgres applies the policy regardless.
- During development, an unconfigured policy can make queries return
  nothing, which can confuse the debugging path. The policy file is
  reviewed as carefully as the schema.
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS; it is used only
  server-side and only where explicitly needed, never in any code path
  reachable from the client.
