# ARCHITECTURE.md

Technical blueprint for Whetstone. This is the plan Claude Code follows.
`CLAUDE.md` holds the rules; this holds the design and the build order.

---

## 1. System overview

```
Browser (Next.js client components)
   │
   │  fetch / server action call
   ▼
Next.js server (App Router)
   ├─ Auth middleware (Supabase JWT) ─ rejects unauthenticated requests
   ├─ Rate limiter (Upstash) ─ per-user token bucket, gates free tier
   ├─ Server Actions / Route Handlers
   │     ├─ study queries  ──▶ Postgres (RLS-scoped)
   │     ├─ grade answer    ──▶ Anthropic Claude API ──▶ parse/repair
   │     └─ stripe webhook  ──▶ Postgres (entitlement state)
   ▼
Postgres (Supabase) — Row-Level Security on every user table
```

The single most important invariant: **the Claude API key and all
entitlement logic live on the server.** The client renders state and sends
intent; it never holds secrets or decides what a user is allowed to do.

---

## 2. Data model

Postgres. Every user-owned table has an RLS policy: `user_id = auth.uid()`.
IDs are UUIDs. Timestamps are `timestamptz`.

### `users`

Managed by Supabase Auth. Mirror table holds app-level fields.

```
id            uuid  pk   (= auth user id)
email         text
plan          text       enum: 'free' | 'pro'   default 'free'
created_at    timestamptz
```

### `decks`

A study set owned by a user (e.g. "Senior Frontend Interview").

```
id            uuid  pk
user_id       uuid  fk → users.id
title         text
created_at    timestamptz
```

### `modules`

A themed group within a deck. Has display metadata (color, label).

```
id            uuid  pk
deck_id       uuid  fk → decks.id
number        int        ordering within the deck
title         text
short_label   text
color         text       hex
created_at    timestamptz
```

### `questions`

A flashcard: a question, a model answer, optional short answer.
Glossary terms are questions with `kind = 'term'`.

```
id            uuid  pk
module_id     uuid  fk → modules.id
kind          text       enum: 'question' | 'term'   default 'question'
prompt        text       the question or term
model_answer  text       the reference answer/definition
short_answer  text       nullable
created_at    timestamptz
```

### `progress`

Per-user, per-question mastery state. Drives spaced repetition.

```
id            uuid  pk
user_id       uuid  fk → users.id
question_id   uuid  fk → questions.id
status        text       enum: 'new' | 'weak' | 'learning' | 'mastered'
times_seen    int        default 0
times_correct int        default 0
last_seen_at  timestamptz
unique (user_id, question_id)
```

### `evaluations`

Audit log of AI grades. Also the basis for cost/latency observability.

```
id            uuid  pk
user_id       uuid  fk → users.id
question_id   uuid  fk → questions.id
user_answer   text
score         int        1..10
covered       jsonb      string[]
missing       jsonb      string[]
tip           text
latency_ms    int
created_at    timestamptz
```

### `usage_counters`

Server-side source of truth for the free-tier cap.

```
id            uuid  pk   defaultRandom
user_id       uuid  fk → users.id
period        text       e.g. '2026-05'  (monthly bucket)
ai_grades     int        default 0
unique (user_id, period)   -- the real business key; the id is a synthetic surrogate (see ADR 0008)
```

> RLS: `decks`, `modules`, `questions` are readable/writable only by the
> owning user (joined through `deck.user_id`). `progress`, `evaluations`,
> `usage_counters` filter directly on `user_id`. Seed/default decks, if any,
> are owned by a system user and cloned into a user's account on signup.

---

## 3. Folder structure

```
app/
  (study)/
    flashcards/        # weighted SRS flashcards
    glossary/          # term flashcards + list view
    mock/              # timed mock interview
    explain/           # out-loud practice
    map/               # mind map of progress
  (account)/
    login/
    billing/
    settings/
  api/
    grade/route.ts     # POST: grade a written answer (server-side AI)
    stripe/webhook/route.ts
  globals.css          # design tokens (CSS custom properties)
  layout.tsx
lib/
  srs/
    sampler.ts         # weighted random ordering (pure, tested)
    sampler.test.ts
  ai/
    client.ts          # Anthropic client (server-only)
    prompt.ts          # grading prompt builder
    parse.ts           # parse → validate → repair (pure, tested)
    parse.test.ts
    evals/
      cases.ts         # (answer, expected score range) fixtures
      run.test.ts      # regression test for the grading pipeline
  db/
    schema.ts          # Drizzle schema
    queries.ts         # typed query functions
    rls.sql            # Row-Level Security policies
  auth.ts              # Supabase auth helpers
  ratelimit.ts         # Upstash token bucket
  stripe.ts            # checkout + webhook handling
  log.ts               # structured logger
components/
  ui/                  # primitives (button, card, badge, ...)
  study/               # flashcard, timer, mind-map, feedback panel
```

---

## 4. Key contracts

### Grade endpoint — `POST /api/grade`

The core server-side AI path.

```ts
// Request (validated with Zod)
{
  questionId: string;
  userAnswer: string;
}

// Server steps:
// 1. Auth: resolve user from JWT (reject if absent).
// 2. Rate limit: check usage_counters; if free tier over cap → 402.
// 3. Load question + model_answer from DB (RLS-scoped).
// 4. Call Claude with structured-output schema.
// 5. parse → validate → repair the response.
// 6. Persist to `evaluations`, increment `usage_counters`.
// 7. Return feedback.

// Response
{
  score: number;        // 1..10
  covered: string[];
  missing: string[];
  tip: string;
}
// On model failure: 200 with { degraded: true } so the client falls back
// to manual comparison instead of erroring.
```

### Spaced-repetition sampler — `lib/srs/sampler.ts`

Pure function, no I/O. Weighted reservoir sampling
(Efraimidis–Spirakis): each item's key is `random ** (1 / weight)`, sorted
ascending. Weights: `weak: 4, new: 3, learning: 2, mastered: 1`. Reordered
on every call — no deterministic ordering.

### Parse/repair — `lib/ai/parse.ts`

Pure function. Order: direct parse → strip code fences → extract first
balanced `{...}` (respecting string escapes) → repair truncated JSON (close
open strings/arrays/objects). Returns `null` on unrecoverable input; the
caller degrades gracefully.

---

## 5. The AI layer (modern LLM practices)

Build in this order, and only as far as a real need justifies:

1. **Structured outputs.** Grading returns a fixed schema. This makes the
   parse step reliable and the data storable. Do this first — it's the
   foundation.
2. **Evals.** A fixed set of graded answers with expected score ranges. A
   test asserts the pipeline stays within range. This is what lets you change
   the prompt without silently degrading quality. High signal, low effort —
   prioritize it.
3. **Study-coach agent (optional, high value).** An LLM that, given a user's
   progress, _decides_ what to drill: it has tools to read progress, select
   questions, and assemble a session. This is a genuine agent — it makes
   decisions in a loop toward a goal — not a decorative one. Build it only
   after grading + evals are solid.
4. **RAG — only if a feature needs it.** Current grading does NOT need
   retrieval: the model answer is already in hand. RAG earns its place only
   if you add something like "grade against the strongest community answers"
   or "feedback grounded in how this is answered in real interviews." If you
   add that feature, store embeddings in Postgres via `pgvector` (no separate
   vector DB) and retrieve relevant context at grade time. Until then,
   omitting RAG is the correct, defensible choice.

> Judgment note for the agent: do not add RAG or an agent loop "because it's
> modern." Each must trace to a user-facing need. The ability to justify NOT
> using them is a senior signal.

---

## 6. Build order (each step is a Claude Code task)

Do these sequentially. Each must compile, pass typecheck/tests, and deploy
before moving on.

1. **Scaffold.** `create-next-app` (TS, Tailwind, App Router). Wire Tailwind
   tokens from the design system into `globals.css`. Deploy a placeholder to
   Vercel so the pipeline works end to end.
2. **DB + auth.** Drizzle schema, RLS policies, Supabase Auth. Login works;
   a logged-in user can be resolved server-side.
3. **Migrate proven logic.** Port the spaced-repetition sampler and the
   parse/repair module from the prototype, with their unit tests. These are
   pure functions — port, don't reinvent.
4. **Study UI.** Flashcards, glossary, mock, explain, mind map as components
   reading from the DB. Reference the prototype for behavior.
5. **AI grading.** The `/api/grade` endpoint with structured outputs +
   parse/repair + persistence. Then evals.
6. **Entitlement.** Rate limiting (Upstash) + Stripe subscriptions + webhook
   reconciliation. Free tier capped, pro unlimited.
7. **Study-coach agent.** Tool-using agent that assembles adaptive sessions
   from progress. Optional but high-value for the portfolio.
8. **Hardening.** Playwright E2E on the main flows, CI on every PR
   (typecheck + lint + test), logging/observability on the AI path.

---

## 7. Non-goals (intentional scope cuts)

- No team/org plans yet — rate limiting is per-user.
- No mobile native app — responsive web only.
- No real-time/multiplayer.
- No retry/ensemble on grading — single-shot, revisit if quality complaints
  appear.

Naming these as non-goals is deliberate: scope discipline is part of the
design, not an omission.
