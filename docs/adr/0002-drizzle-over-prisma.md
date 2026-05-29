# 0002 — Drizzle ORM over Prisma

Date: 2026-05-29
Status: Accepted

## Context

The project needs type-safe access to Postgres from TypeScript, with
support for Row-Level Security policies and visibility into the actual
SQL being executed. The app is multi-tenant and uses Supabase as the
Postgres host.

## Options considered

- **Raw SQL with `pg`.** Full control, zero type safety, every typo
  becomes a runtime error.
- **Prisma.** Mature ecosystem, generated client, abstracted API,
  external Rust engine that handles query execution.
- **Drizzle.** Schema defined in TypeScript directly, type-safe query
  builder that mirrors SQL closely, no external engine.

## Decision

Drizzle ORM.

## Consequences

- The TypeScript schema is the source of truth. Tables, types, and
  migrations all derive from it.
- The SQL emitted by Drizzle is predictable and readable, which matters
  when working with RLS — I need to know exactly what query is being
  evaluated against the policies.
- No engine overhead, no separate process to deploy.
- Less ecosystem maturity than Prisma; some patterns require recourse
  to Drizzle's `sql\`\`` escape hatch for complex queries.
- Migrations are generated with `drizzle-kit generate`, reviewed as
  plain SQL, and committed to the repo. In development, `db:push`
  applies changes directly; in production, migrations are explicit.
