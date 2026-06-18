# 0014 — LLM output parse/repair pipeline for the grader

Date: 2026-06-18
Status: Proposed

## Context

The AI grading loop (step 5) asks Claude to score a user's answer and return a
structured verdict. Even when the prompt requests JSON and uses structured
outputs, the response is untrusted input: it can be truncated by `max_tokens`,
wrapped in prose or code fences, contain trailing commas, or be structurally
valid JSON that nonetheless violates the grading schema (out-of-range score,
missing field, wrong type). CLAUDE.md Golden Rule 3 forbids `JSON.parse`-ing a
model response directly; every grade must flow through a parse → validate →
repair pipeline before it is trusted.

A grade that cannot be trusted must never be written back as if it were a real
evaluation — a corrupted or invented score silently poisons the user's spaced-
repetition state, which is worse than showing no grade at all.

This ADR captures the design now, while it is fresh, but does not implement it.
Step 3 ports only pure logic; the pipeline and its schema belong to the grader
in step 5. Recording it as Proposed lets the decision be reviewed and refined
before code exists.

## Options considered

- **Trust structured outputs and `JSON.parse` directly.** Simplest, but
  violates Golden Rule 3 and breaks the moment the model truncates or wraps the
  payload. Rejected.

- **Validation only, no repair.** Parse, validate with Zod, fail otherwise. Safe
  but wastes recoverable responses — a single truncated brace would discard an
  otherwise-complete grade and force a full re-grade (cost + latency).

- **Where the single repair happens — local vs. second LLM call.** This is the
  key trade-off and is left to be resolved during step 5 implementation:
  - **Local repair (as the prototype does):** deterministically fix the payload
    without calling the model — strip code fences/prose, close JSON truncated by
    `max_tokens`, drop trailing commas. Cheap, fast, no extra token spend, no
    added latency. Strong fit for truncation, which is the most common failure
    mode. Cannot fix deeper semantic/structural errors (a hallucinated shape or
    an out-of-range score it cannot infer).
  - **Repair via a second LLM call:** hand the bad output back to the model and
    ask it to correct it against the schema. Can recover deeper structural
    errors local string-fixing cannot, but costs another call, adds latency, and
    is itself non-deterministic output that must be re-validated. Justified only
    for failures local repair cannot address.
  Decision deferred: lead with local repair for truncation (cheapest path that
  covers the dominant failure), and evaluate an LLM-based repair only as a
  fallback for genuine structural errors, measured against real eval cases in
  step 5 before committing.

- **Unbounded retries.** Loop parse/repair until success. Rejected: a model
  stuck producing garbage turns one grade into an unbounded cost/latency sink.

## Decision

Adopt a bounded, defensive parse/repair pipeline for all grader output, to be
implemented in step 5:

- **Do not trust LLM output even when JSON is requested.** Every response is
  validated against a versioned Zod grading schema before it is used.
- **Pipeline:** parse defensively → validate with Zod → if invalid, run **one**
  controlled repair → re-validate → if it still fails, return a **safe
  fallback** marked `failed`. The fallback is surfaced to the user as
  "could not grade", never persisted as a real evaluation and never fed into
  spaced-repetition state.
- **Bounded attempts:** at most **1 parse + 1 repair** per grade. No unbounded
  retry loop.
- **Reliability metadata** travels with every grade result: `repaired`,
  `parseAttempts`, `model`, `latency`, and `schemaVersion`, so a grade's
  trustworthiness is observable and auditable rather than implicit.
- **Separation of concerns into modules:** `schema` (the Zod grading schema +
  version), `parse` (defensive parsing/extraction), `repair` (the single
  controlled repair step), and `pipeline` (orchestration + fallback + metadata).
  The pure, framework-free parts stay unit-testable in isolation, consistent
  with CLAUDE.md's testing rules.
- The **local-vs-LLM repair** choice (see Options) is intentionally left open,
  to be settled against eval cases during step 5.

## Consequences

- A corrupt or unparseable model response degrades to an explicit `failed`
  grade, never a silently wrong score — the spaced-repetition state is protected
  from poisoned input.
- Recoverable responses (notably `max_tokens` truncation) are salvaged by the
  single repair instead of forcing a full re-grade, bounding cost and latency.
- Reliability metadata makes grade quality measurable and gives the step-5 evals
  a signal to assert on (e.g. repair rate, fallback rate).
- The schema is versioned, so prompt/schema changes are traceable and can be
  reconciled with stored grades and the eval set.
- This ADR is **Proposed**: it commits the project to the pipeline shape and the
  trust boundary, but the repair-implementation trade-off and the concrete
  schema are finalized when step 5 is built. A superseding ADR records the
  outcome if the design shifts.
