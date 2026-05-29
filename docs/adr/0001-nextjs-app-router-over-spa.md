# 0001 — Next.js App Router over SPA + standalone API

Date: 2026-05-29
Status: Accepted

## Context

The project needs a frontend that serves UI to users and a backend that
handles authenticated database queries and server-side calls to the
Anthropic API. The core constraint is that the Anthropic key must never
reach the browser.

## Options considered

- **SPA (Vite + React) + separate API service.** Two deployments, two
  codebases, more infrastructure. Reasonable for larger teams.
- **Next.js Pages Router.** Older Next pattern, still supported but
  not the direction the framework is moving.
- **Next.js App Router with Server Actions and Route Handlers.** Single
  codebase, server code colocated with UI, native support for hiding
  secrets server-side.

## Decision

Next.js App Router with TypeScript.

## Consequences

- One codebase, one deployment target (Vercel), one language end-to-end.
- Server-side AI calls can live next to the components that trigger them,
  making the data flow easy to follow.
- Some bleeding-edge App Router behavior changes between Next versions;
  the project pins versions and reads the local docs (`node_modules/next/dist/docs/`)
  before assuming patterns from older training data still apply.
