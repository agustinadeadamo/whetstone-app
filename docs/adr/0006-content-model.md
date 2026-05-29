# 0006 — Content model: decks → modules → questions, with separate progress

Date: 2026-05-29
Status: Accepted

## Context

The application stores study content (questions and glossary terms)
and tracks per-user learning progress. The schema must support
multiple study contexts per user, group questions thematically, and
isolate per-user state from global content.

## Options considered

- **Flat: user → questions.** Simple, but no grouping. The user
  sees one big list.
- **Two-level: user → questions, with `module` as a string column.**
  Simpler schema but harder to manage module metadata (colors, labels,
  ordering).
- **Three-level: user → decks → modules → questions.** First-class
  entities at each level. Supports multiple decks per user (different
  study contexts) and rich module metadata.

For progress tracking:

- **Status columns on `questions`.** Wrong — would require duplicating
  the question per user, since "mastered" varies by viewer.
- **Separate `progress` table keyed by (user_id, question_id).** Correct
  relational modeling: content is global, state is per-user.

For glossary terms vs. questions:

- **Separate `glossary` table.** Duplicates structure and code paths,
  since the flashcard flow is identical.
- **Same `questions` table with a `kind` discriminator** (`'question'`
  or `'term'`). Reuses infrastructure for progress, RLS, and rendering.

## Decision

Three-level hierarchy: `users` → `decks` → `modules` → `questions`.
Per-user state in a separate `progress` table with a unique constraint
on `(user_id, question_id)`. Glossary terms share the `questions` table
via a `kind` column.

## Consequences

- Users can have multiple decks (e.g., "Senior Frontend Interview",
  "System Design Prep") in parallel.
- The same model supports content beyond interview prep without schema
  changes — any domain that fits the "themed sets of question/answer
  pairs with user progress" pattern works.
- The discriminator pattern (`questions.kind`) saves a parallel table
  while keeping behaviors easy to branch where they differ.
- When a third entity diverges meaningfully from questions/terms in the
  future (e.g., code challenges with executable tests), it may warrant
  its own table rather than another discriminator value.
