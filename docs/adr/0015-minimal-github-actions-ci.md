# 0015 — Minimal GitHub Actions CI (typecheck + unit tests)

Date: 2026-06-18
Status: Accepted

## Context

The repository has no CI. The two verification gates the project relies on —
`npm run typecheck` and `npm run test` (unit tests + evals, per ADR 0013) — only
run when someone remembers to run them locally before committing. CLAUDE.md
makes both mandatory before any task is "done", but nothing enforces that on
push or in a pull request. The two highest-risk modules (the SRS sampler and the
parse/repair pipeline) now have unit tests; a regression in either would
currently pass unnoticed until a human ran the suite by hand.

## Options considered

- **No CI (status quo).** Zero setup, but the mandatory gates stay manual and
  unenforced — a single forgotten run lets a broken typecheck or test reach
  `main`.
- **Full CI now.** Lint + typecheck + unit/eval + Playwright E2E + Lighthouse
  budgets in one pipeline. This is the eventual target, but most of it depends on
  surfaces that do not exist yet (no UI to E2E, no pages to score) and belongs to
  step 8 (Hardening). Building it now would be speculative and mostly skipped.
- **Minimal CI.** A single workflow that installs from the lockfile and runs the
  two gates that exist today (`typecheck`, `test`) on every push and PR to
  `main`. Small, fast, and enforces exactly the rules already written down.

## Decision

Add a single GitHub Actions workflow (`.github/workflows/ci.yml`) that runs on
**push and pull_request to `main`** and executes, in order:

`npm ci` → `npm run typecheck` → `npm run test`

- **Node 22**, matching the local development version (`v22.22.1`); no separate
  engine pin is introduced beyond the workflow.
- `npm ci` for a clean, lockfile-pinned install; npm dependency cache via
  `actions/setup-node` to keep runs fast.
- **Scope is deliberately minimal.** This is NOT the full CI. End-to-end tests
  (Playwright), Lighthouse/performance budgets, and lint-as-a-gate are out of
  scope here and belong to step 8 (Hardening), to be added when the surfaces they
  cover exist. This ADR records that boundary so the minimal pipeline is not
  mistaken for the whole story.

## Consequences

- Every push and PR to `main` enforces the typecheck and test gates that were
  previously manual — a regression in the sampler or parse/repair pipeline now
  fails CI instead of slipping through.
- The pipeline stays fast and cheap (install + two short Node steps), so it does
  not become friction.
- The evals (step 5) plug into the same `npm run test` step automatically as they
  are added — no workflow change needed.
- When step 8 adds E2E and performance budgets, they extend this workflow (or add
  sibling workflows); this ADR is superseded only if the push/PR trigger or the
  minimal-gate decision itself changes.
- CI runs against `ubuntu-latest`; it does not exercise other OSes. Acceptable
  for a single-target Vercel deployment.
