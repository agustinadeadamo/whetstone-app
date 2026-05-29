# 0005 — Weighted random ordering over deterministic spaced repetition

Date: 2026-05-29
Status: Accepted

## Context

Flashcard ordering needs to bias toward cards the user struggles with,
while remaining unpredictable enough that the user learns the answers
rather than memorizing the sequence. Most spaced repetition systems
rely on deterministic intervals (SM-2, Anki-style).

## Options considered

- **Deterministic "weak first" ordering.** Sort cards by status:
  weak, then new, then learning, then mastered. Predictable, but the
  user can memorize the sequence — defeating the purpose.
- **Pure random.** No bias toward weak cards; the user wastes time
  on cards they already know.
- **Weighted random sampling (Efraimidis–Spirakis).** Each card's
  sort key is `random ** (1 / weight)`, with weights 4/3/2/1 for
  weak/new/learning/mastered. Weak cards probabilistically surface
  earlier without becoming deterministic.

## Decision

Weighted random sampling via Efraimidis–Spirakis, implemented as a
pure function in `lib/srs/sampler.ts`.

## Consequences

- Each session reorders the queue; the user cannot memorize position.
- Weak cards still appear more often, on average ~4x more than
  mastered cards.
- The sampler is a pure function with no I/O, which makes it trivially
  unit-testable with seeded randomness.
- Future iterations may layer an SM-2-style scheduler on top (e.g.,
  "due for review" logic), but the random weighting remains the base.
