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

- **FK cascade behavior on user deletion.** All FKs to `users.id`
  currently default to NO ACTION. Needs explicit ON DELETE strategy
  (cascade vs restrict) when the `auth.users` → `public.users` trigger
  is created. Triggered at sub-paso 1.3 (RLS + auth trigger).

- **Optional: RAG for company-specific grading (supersedes 0007).**
  Only if and when the "company-specific feedback" feature is added.

- **Optional: study-coach agent.** Tool-using agent for adaptive
  session selection. Triggered at step 7, optional.

## Committed (already documented)

See numbered ADRs 0001–0007 in this folder.
