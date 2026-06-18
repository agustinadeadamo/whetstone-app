# 0013 — Vitest as the unit test runner

Date: 2026-06-16
Status: Accepted

## Context

Step 3 of the build order ports two pure functions — the spaced-repetition
sampler (`lib/srs/sampler.ts`) and the LLM parse/repair pipeline
(`lib/ai/parse.ts`) — and CLAUDE.md makes unit tests on both mandatory before
they are "done". No test runner is configured: `npm run test` is referenced in
CLAUDE.md but the script does not exist, and the tech-stack list names no test
framework. Adding one is therefore a deliberate dependency decision.

The tests are pure logic: no DOM, no React, no Next imports. The sampler's tests
need to stub `Math.random` to make ordering deterministic and assertable.

## Options considered

- **Vitest.** Native ESM + TypeScript via esbuild, Jest-compatible API, fast,
  first-class global stubbing (`vi.stubGlobal`, `vi.spyOn`) for the sampler's
  determinism harness, minimal config. De-facto standard for the Vite/Next-era
  TS stack; Next's testing guidance recommends it for unit tests.
- **Jest.** Mature and widely known, but ESM + TS setup is heavier (ts-jest or
  babel), slower, and ESM support remains awkward — friction in an ESM/Next 16
  TypeScript project.
- **node:test (built-in).** Zero dependencies, but no built-in TS transform
  (needs a loader such as tsx) and weaker ergonomics for stubbing globals.

## Decision

Adopt **Vitest** as a dev-only dependency.

- `npm run test` runs `vitest run` (one-shot, CI-friendly); `npm run test:watch`
  runs the watcher for local development.
- `environment: 'node'` — the ported modules are pure logic, so no DOM
  environment is pulled in.
- Tests use explicit imports (`import { describe, it, expect, vi } from
  'vitest'`), not Vitest globals, so `tsconfig.json` needs no change.
- Test files live next to their modules and import relatively
  (`./sampler`), so no path-alias plumbing is required.
- Minimal install: just `vitest`. No jsdom, testing-library, or coverage
  tooling yet.

## Consequences

- The two mandatory modules can be unit-tested, satisfying CLAUDE.md's testing
  rule, and `npm run test` now exists.
- The AI grading evals (step 5) plug into the same runner later — CLAUDE.md
  describes `npm run test` as "unit tests + evals"; for now it is unit tests
  only.
- The node environment keeps the runner fast and dependency-light. Component/DOM
  testing (jsdom + a React plugin + tsconfig path resolution) is deferred to
  when the Study UI (step 4) needs it.
- Trade-off: a second test framework later would be redundant — standardize on
  Vitest. Revisit the environment and plugins when React component tests arrive.
- Adds one dev dependency outside the originally listed stack, recorded here per
  CLAUDE.md's "propose before adding a dependency" rule.
