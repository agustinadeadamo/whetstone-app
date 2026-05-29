# CLAUDE.md

Project rules for Claude Code. Read this fully before making any change.
When a request conflicts with a rule here, stop and flag it instead of
proceeding.

---

## What this project is

Whetstone — an AI-graded technical interview trainer. Users study flashcards
with weighted spaced repetition, optionally write their own answers, and get
those answers scored by an LLM against a reference answer. Multi-tenant: every
user owns their decks and progress.

The hard parts are not the UI. They are: (1) serving an LLM grading loop
safely and cheaply, (2) tenant isolation, (3) resilient handling of
non-deterministic model output. Optimize attention accordingly.

---

## Golden rules (never violate)

1. **The Anthropic API key never reaches the client.** Every Claude call runs
   server-side (route handler or server action). If a task seems to require
   the key in client code, stop and flag it — the design is wrong, not the
   rule.
2. **Tenant isolation is enforced at the database layer (RLS), not in app
   code.** Never write a query that depends on application code remembering to
   filter by user. Every table with user data has a Row-Level Security policy.
3. **Model output is untrusted input.** Never `JSON.parse` an LLM response
   directly. Always go through the parse → validate → repair pipeline in
   `lib/ai/parse.ts`.
4. **The client is never the source of truth for entitlement.** Subscription
   and rate-limit state are read from the DB, derived from Stripe webhooks and
   server-side counters. Never trust a client claim about plan or usage.
5. **No secrets in the repo.** All keys come from environment variables.
   `.env.local` is gitignored. Update `.env.example` (with empty values) when
   adding a new variable.
6. **Never edit files containing real secrets while a Claude Code session is
   active.** This includes `.env.local`, `.env.production`, or any file with
   real credentials. The file-tracking system auto-attaches modified file
   contents to the model context, which would expose secrets in the
   conversation transcript. Edit secret files outside of Claude Code sessions —
   close the session first, edit in your regular editor, then resume.

---

## Tech stack (do not introduce alternatives without asking)

- Next.js (App Router) + TypeScript — strict mode, no `any` at module
  boundaries.
- Tailwind CSS — use the design tokens in `app/globals.css`. Do not hardcode
  hex colors in components.
- Postgres via Supabase — schema and RLS policies live in `lib/db/`.
- Drizzle ORM for queries (typed, schema-first).
- Anthropic Claude API — server-side only, structured outputs for grading.
- Upstash Redis — per-user rate limiting.
- Stripe — subscriptions via webhooks.
- Vercel — hosting.

If a task would be easier with a library not listed here, propose it and wait
for approval before adding a dependency.

---

## Code conventions

- TypeScript strict. Shared types flow from the DB schema outward; derive
  types, don't redeclare them.
- Server actions and route handlers validate input with Zod before doing
  anything. Never trust the shape of incoming data.
- Components are small and focused. Business logic lives in `lib/`, not in
  components.
- Pure logic (the spaced-repetition sampler, the parse/repair module) has no
  framework or network dependencies, so it stays unit-testable in isolation.
- Naming: descriptive over clever. `getReviewQueueForUser` over `getQueue`.
- No dead code, no commented-out blocks left behind, no `console.log` in
  committed code (use the logger in `lib/log.ts`).
- Significant architectural or technical decisions are documented as ADRs in
  `docs/adr/`. Before implementing a meaningful choice — choice of library,
  architectural pattern, security boundary, or non-trivial trade-off — write an
  ADR capturing context, options, decision, and consequences. ADRs are short
  (1 page) and immutable; reversed decisions are superseded by new ADRs, not
  edited.

---

## Testing rules

- The two highest-risk modules MUST have unit tests before they are
  considered done: the spaced-repetition sampler (`lib/srs/`) and the LLM
  parse/repair pipeline (`lib/ai/parse.ts`).
- The AI grading pipeline has **evals**: a fixed set of (answer, expected
  score range) cases in `lib/ai/evals/`. Changing the grading prompt requires
  re-running evals and confirming no regression.
- Run `npm run test` and `npm run typecheck` before declaring any task
  complete. Do not mark work done if either fails.

---

## Working style for the agent

- **Work in small, reviewable steps.** One concern per change. Do not
  refactor unrelated code in the same pass.
- **Read before writing.** Inspect existing patterns in the file/module before
  adding to it. Match the established style.
- **Never invent requirements.** If a task is ambiguous, ask one specific
  question rather than guessing and building the wrong thing.
- **Commit messages**: imperative mood, scoped. `feat(srs): add weighted
sampler`, `fix(ai): handle truncated JSON`, `chore: bump deps`. Commits never
  include Co-Authored-By footers. Author is the repository owner; Claude Code is
  a tool, not a co-author.
- **Don't touch**: migrations already applied, `lib/ai/parse.ts` test cases
  (those encode real failure modes — extend, don't delete), and anything in
  `.env*`.
- After a multi-file change, summarize what changed and why in 3–5 lines.

---

## Commands

```bash
npm run dev          # local dev server
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run test         # unit tests + evals
npm run db:generate  # generate a SQL migration from lib/db/schema.ts
npm run db:exec <f>  # apply a .sql file (migration or rls.sql), transactional
npm run db:audit     # verify RLS, policies, and FK cascades
npm run db:studio    # inspect the database
```

> Migrations are applied with `db:exec`, NOT `db:push` — drizzle-kit's `push`
> crashes introspecting this schema's CHECK constraints (ADR 0011). The
> TypeScript schema stays the source of truth: edit `lib/db/schema.ts`,
> `db:generate`, review, then `db:exec` the generated file.

---

## When in doubt

Prefer the boring, secure, well-tested option over the clever one. This is a
portfolio piece meant to demonstrate engineering judgment — the judgment to
NOT over-engineer is as valued as the ability to build complex things. If a
feature doesn't have a clear user need, flag it before building it.
