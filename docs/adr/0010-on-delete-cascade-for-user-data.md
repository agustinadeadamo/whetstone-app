# 0010 — ON DELETE CASCADE for user data

Date: 2026-05-29
Status: Accepted

## Context

When a user is deleted, every row that belongs to them — decks, modules,
questions, progress, evaluations, usage counters — has to go somewhere. The
foreign keys need an explicit `ON DELETE` behavior; the default (`NO ACTION`)
would block the delete or leave orphaned rows.

## Options considered

- **(A) CASCADE everywhere.** Deleting a user removes all their data; deleting
  a deck removes its modules → questions and the dependent progress/evaluation
  rows.
- **(B) RESTRICT everywhere.** Deletes are blocked while dependent rows exist;
  the application must tear everything down manually in order.
- **(C) Hybrid.** Cascade some relationships, restrict others.

## Decision

CASCADE on all foreign keys: those pointing at `users.id`, and the nested
chain (decks → modules → questions, and questions → progress/evaluations).
Cascade behavior is declared in the Drizzle schema (`lib/db/schema.ts`), which
remains the source of truth (ADR 0002).

## Consequences

- The app has no data shared between users, so cascading deletes can never
  remove something another user still needs. CASCADE is safe here in a way it
  would not be in a system with shared records.
- GDPR right-to-deletion is satisfied automatically: deleting the user row
  removes every trace of their data in one operation.
- The model is simple and consistent — one rule for every FK, no special cases.
- Deleting a user is destructive and total. Mitigation: the account-deletion
  flow in the UI must ask for explicit confirmation and show what will be
  removed. Supabase backups are the final safety net.
- Because a user delete is a deliberate action (via UI or admin), not an
  accidental one, the blast radius is acceptable.
