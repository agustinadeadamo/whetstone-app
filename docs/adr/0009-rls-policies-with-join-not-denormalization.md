# 0009 — RLS policies resolve ownership via join, not denormalization

Date: 2026-05-29
Status: Accepted

## Context

The nested content tables (`modules`, `questions`) do not have a direct
`user_id` column — ownership lives on `decks` (`decks.user_id`). The RLS
policies still have to filter these tables by owner. There are two ways to
make that work.

## Options considered

- **Join in the policy (EXISTS subquery).** The policy resolves ownership by
  walking the hierarchy at evaluation time: `modules` checks `EXISTS` against
  `decks`; `questions` checks `EXISTS` against `modules → decks`. Ownership has
  a single home.
- **Denormalize `user_id` onto every nested table.** Copy `user_id` down to
  `modules` and `questions` so every policy is a flat `user_id = auth.uid()`.
  Faster to evaluate, but the column must be kept in sync on every write.

## Decision

Join in the policy via `EXISTS`. Ownership is resolved through the hierarchy;
nested tables carry no denormalized `user_id`.

## Consequences

- One source of truth for ownership: it lives on `decks`. There is no risk of a
  denormalized `user_id` drifting out of sync with the deck it belongs to.
- Smaller bug surface: no triggers or application code to maintain a copied
  column, and no window where the copy is wrong.
- Queries against nested tables run an extra correlated subquery. Acceptable at
  the expected scale, especially with the FK columns (`deck_id`, `module_id`)
  indexed.
- If join cost ever becomes a real performance problem, denormalization is a
  later optimization — not a security refactor. The isolation guarantee does
  not depend on the join being fast.
