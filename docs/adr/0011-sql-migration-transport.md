# 0011 — Apply migrations via a SQL runner, not `drizzle-kit push`

Date: 2026-05-29
Status: Accepted

## Context

The project initially used `npm run db:push` (drizzle-kit) to apply schema
changes. After the first migration added CHECK constraints
(`questions_kind_check`, `progress_status_check`), `db:push` began crashing
during its introspection phase:

```
TypeError: Cannot read properties of undefined (reading 'replace')
  at .../drizzle-kit/bin.cjs ... checkValue.replace(...)
```

drizzle-kit 0.31.10 fails to parse existing CHECK constraints when pulling the
live schema. `db:push` worked on the empty database (nothing to introspect) but
is unusable once CHECK constraints exist — which is permanent for this schema.

## Options considered

- **Stay on `db:push`.** Blocked: the bug fires on every push now.
- **Switch to `drizzle-kit migrate`.** The journal was never initialized
  (we used `push`), so `migrate` would try to re-run `0000` (CREATE TABLE)
  against existing tables and fail. Adopting it would need manual journal
  reconciliation.
- **Apply generated migration SQL with a small transactional runner.**
  `drizzle-kit generate` still works (it diffs the TS schema against its
  snapshot, no live introspection). Apply the resulting `NNNN_*.sql` with
  `scripts/db-exec-sql.mjs`, which runs the file in a single transaction over
  `DATABASE_URL`.

## Decision

Migrations are generated with `npm run db:generate` and applied with
`scripts/db-exec-sql.mjs` (the same runner used for `lib/db/rls.sql`). The
TypeScript schema stays the source of truth (ADR 0002); only the apply
transport changed. `db:push` is no longer part of the workflow.

## Consequences

- The schema authoring loop is unchanged: edit `lib/db/schema.ts`, run
  `db:generate`, review the SQL, apply it.
- Applies are transactional and never print credentials (the runner only
  surfaces `err.code`/`err.message`).
- We do not depend on drizzle-kit's live-introspection path, which is the
  buggy one.
- Trade-off: no automatic "diff the live DB and apply" convenience. The
  generated migration files are the record of what was applied, and
  `scripts/db-audit-rls.mjs` verifies live state.
- Revisit if drizzle-kit fixes the CHECK-constraint parsing or if we adopt the
  `migrate` journal workflow on a clean environment.
