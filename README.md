# Whetstone

> AI-graded technical interview trainer. Write your answer, get it scored
> against a reference, and let weighted spaced-repetition surface what you
> actually don't know.

<!-- Live demo coming soon -->

[Architecture](#architecture) · [Engineering decisions](#engineering-decisions)

## Context

Most interview prep is passive recognition — you re-read Q&A until the
answers feel familiar, then freeze when you have to produce one cold. This
tool optimizes for the opposite: active recall, calibrated difficulty, and
an honest signal on whether a written answer would actually survive an
interviewer. Built originally for a single real interview, then generalized
into a multi-tenant platform where any user loads their own decks.

The interesting engineering isn't the flashcard UI — it's serving an LLM
grading loop cheaply, safely, and reliably enough to put behind a paywall.

## What it does

- **Spaced-repetition flashcards** — cards are ordered with weighted
  randomness: questions you mark as weak surface ~4x more often than ones
  you've mastered, but the order is reshuffled every session so you learn
  the answers, not the sequence.
- **AI answer evaluation** — optionally type your answer before revealing
  the model answer. An LLM scores it 1–10, lists the key points you
  covered, flags what you missed or got weak, and gives one concrete
  suggestion to improve.
- **Glossary mode** — key terms as a separate flashcard set, since
  interviews often open with "what is X?" before the deeper question.
- **Timed mock interview** — random questions on a countdown to simulate
  real interview pressure, with a session summary at the end.
- **Explain mode** — practice answering out loud, with a thinking timer
  before the model answer is shown.
- **Visual mind map** — every module rendered as a color-coded node with
  its questions around it; node size and color reflect mastery, so progress
  is legible at a glance.
- **Fully editable, multi-tenant content** — create, edit, and delete
  modules (custom names and colors) and questions. Any user loads their own
  decks for any subject, not just programming interviews.
- **Persistent progress** — mastery state, weak/strong tracking, and
  session history are scoped per user.

## Architecture

```
Browser ──▶ Next.js Route Handler (Edge)
                │  auth (Supabase JWT) + per-user rate limit (Upstash)
                ▼
          Server Action ──▶ Anthropic Claude API
                │                   │
                │            structured-output schema
                ▼                   ▼
          Postgres (RLS)     parse → validate → repair
          progress, decks          │
                                    ▼
                            graceful fallback on malformed output
```

Key constraints that shaped the design:

- **Secrets never reach the client.** All Claude calls run server-side; the
  API key is a server-only env var. Shipping it to the browser is the most
  common way these apps leak, so isolation is enforced structurally, not by
  convention.
- **Cost is a product constraint, not an afterthought.** Each grade is a
  paid model call. The free tier is capped via per-user token-bucket rate
  limiting (Upstash Redis); the cap _is_ the paywall boundary.
- **Tenant isolation at the database layer.** Postgres Row-Level Security
  scopes every read/write to the authenticated user, so isolation doesn't
  depend on application code remembering to filter.

## Stack

| Layer          | Choice                          | Rationale & rejected alternative                                                                                                                                               |
| -------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework      | Next.js App Router + TypeScript | Co-located server actions keep the AI call server-side without a separate backend service. _Rejected:_ SPA + standalone API — more infra, no upside at this scale.             |
| Database       | Postgres + RLS (Supabase)       | Relational model fits decks → modules → questions → progress; RLS pushes tenant isolation below the app layer. _Rejected:_ document store — the data is inherently relational. |
| Cache / limits | Upstash Redis                   | Serverless token-bucket rate limiting that survives Edge cold starts.                                                                                                          |
| AI             | Claude API, server-side         | Structured outputs for schema-stable grading. _Rejected:_ client-side calls — leaks the key.                                                                                   |
| Auth           | Supabase Auth                   | Email + OAuth, multi-tenant from day one.                                                                                                                                      |
| Payments       | Stripe + webhooks               | Subscription state reconciled via webhook → DB, never trusted from the client.                                                                                                 |
| Hosting        | Vercel                          | Native App Router + Edge runtime support.                                                                                                                                      |

## Engineering decisions

**Weighted spaced repetition.** Card ordering uses Efraimidis–Spirakis
weighted reservoir sampling — each card's sort key is `random^(1/weight)`,
with weights of 4/3/2/1 for weak/new/learning/mastered. Weak cards bias
toward the front _probabilistically_, so the queue is reordered every
session. Deterministic "weak-first" ordering was rejected because it lets
you memorize the sequence instead of the material — the exact failure mode
the tool exists to prevent.

**Defensive LLM output handling.** Model output is untrusted input. The
parser attempts, in order: (1) direct parse, (2) fence stripping,
(3) first-balanced-`{...}` extraction respecting string escapes,
(4) structural repair of token-truncated JSON by closing open
strings/arrays/objects. On total failure it degrades to manual comparison
rather than throwing — a broken grade never blocks the study flow. This is
the most heavily unit-tested module in the codebase precisely because it's
the least deterministic.

**Idempotent Stripe reconciliation.** Subscription status is derived from
Stripe webhooks written to Postgres, keyed by event ID to dedupe retries.
The client is never the source of truth for entitlement — it reads
materialized state.

**Cost & latency profile.** Each evaluation is one Claude call
Cost and latency will be measured once the first grading flow is implemented. Grading is the only paid path;
everything else (flashcards, mock, progress) is free to serve, which keeps
the unit economics of the free tier viable. _(Replace X/Y with measured
numbers before publishing.)_

## Testing & quality

- Unit tests on the spaced-repetition sampler and the JSON parse/repair
  module — the two highest-risk, least-deterministic pieces.
- Type-safe end to end: shared TypeScript types flow from DB schema →
  server action → client, with no `any` at boundaries.
- CI on every PR: typecheck, lint, test.

## Running locally

```bash
git clone https://github.com/agustinadeadamo/whetstone-app.git
cd whetstone-app
npm install
cp .env.example .env.local   # fill in keys (see below)
npm run db:check             # verify the DB connection (SELECT 1)
npm run db:tables            # list public tables + column counts (schema sanity check)
npm run db:generate          # generate SQL migration from lib/db/schema.ts
npm run db:exec lib/db/migrations/<file>.sql   # apply a migration (transactional)
npm run db:exec lib/db/rls.sql                 # apply RLS policies + auth trigger
npm run db:audit             # verify RLS, policies, and FK cascades
npm run dev
```

> Migrations are applied with `db:exec` (a small transactional SQL runner), not
> `db:push`. drizzle-kit's `push` crashes introspecting this schema's CHECK
> constraints; see ADR 0011. The authoring loop is: edit `lib/db/schema.ts` →
> `db:generate` → review the SQL → `db:exec` it.

Required environment variables (`.env.example`):

```
ANTHROPIC_API_KEY=          # server-only
DATABASE_URL=               # Postgres connection string
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=  # server-only
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
STRIPE_SECRET_KEY=          # server-only
STRIPE_WEBHOOK_SECRET=
```

## Project structure

```
app/
  (study)/            # flashcards, glossary, mock, explain, mind map
  (account)/          # auth, billing, settings
  api/                # route handlers (grading, stripe webhooks)
lib/
  srs/                # spaced-repetition sampler + tests
  ai/                 # Claude client, prompt, parse/repair + tests
  db/                 # schema, queries, RLS policies
components/           # UI primitives + study-mode components
```

## Known tradeoffs & roadmap

These are deliberate scope cuts, not oversights:

- **No E2E suite yet** — unit coverage is on the risky logic; Playwright
  flows are the next priority before scaling traffic.
- **Rate limiting is per-user, not per-org** — fine for current B2C scope,
  would need rework for team plans.
- **Grading is single-shot** — no retry/ensemble on low-confidence scores;
  acceptable given cost, flagged for revisit if quality complaints surface.
  Roadmap: CSV bulk import, shareable public decks, and an SM-2 scheduling
  layer on top of the current weighting.
