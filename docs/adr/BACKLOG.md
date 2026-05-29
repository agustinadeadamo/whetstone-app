# ADR Backlog

Decisions that will need ADRs as they arise. This is a forward-looking
list, not a binding commitment — items move to numbered ADRs when the
decision is actually made.

## Pending

- **Content strategy.** Curated packs, user-created decks, B2B
  org-scoped content, or a combination. Triggered when pricing/billing
  work begins (around build order step 6).

- **AI grading: structured outputs schema.** Exact schema for the
  grading response — score range, what "covered" and "missing" look
  like, how the grader handles ambiguous answers. Triggered at step 5
  (AI grading endpoint).

- **Evals: format and tooling.** How eval cases are defined, how
  regressions are detected, what counts as a passing run. Triggered
  alongside the grading endpoint.

- **Stripe entitlement reconciliation.** Webhook event handling,
  idempotency strategy, how subscription state is materialized into
  the DB. Triggered at step 6 (Stripe + rate limiting).

- **E2E testing strategy.** Playwright vs alternatives, scope of E2E
  coverage, how it runs in CI. Triggered at step 8 (hardening).

- **Observability stack.** Logging, tracing, error reporting for the
  AI path specifically. Triggered at step 8.

- **Restrict self-service updates to `users.plan` (and `email`).** The
  current RLS UPDATE policy on `public.users` lets a user update their own
  row, including `plan`. Harmless today, but a tenant must never be able to
  self-grant `plan = 'pro'` (Golden Rule 4). Needs a column-restricted policy
  or a guard trigger. Triggered at step 6 (Stripe + entitlement). Surfaced by
  the security-auditor in sub-paso 1.3.

- **Optional: RAG for company-specific grading (supersedes 0007).**
  Only if and when the "company-specific feedback" feature is added.

- **Optional: study-coach agent.** Tool-using agent for adaptive
  session selection. Triggered at step 7, optional.

## Committed (already documented)

See numbered ADRs 0001–0011 in this folder. (FK cascade behavior on user
deletion, previously listed here, was decided in ADR 0010.)
