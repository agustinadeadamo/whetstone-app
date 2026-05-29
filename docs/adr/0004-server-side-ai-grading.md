# 0004 — Server-side AI grading, key never on client

Date: 2026-05-29
Status: Accepted

## Context

The AI grading feature calls the Anthropic API to evaluate user
answers. The Anthropic key is a paid credential — anyone who obtains
it can burn cost on the account. The most common leak vector for these
apps is putting the key in a client-side environment variable or
shipping it in a bundle.

## Options considered

- **Client-side fetch to Anthropic with the key in `NEXT_PUBLIC_*`.**
  Simple to implement, catastrophic to secure. Anyone opening DevTools
  sees the key.
- **Server Action / Route Handler that proxies the call.** The key
  lives in a server-only env var. The client sends the prompt and
  receives the response without ever seeing the credential.

## Decision

All Anthropic API calls go through a Next.js Server Action. The key
is read from `ANTHROPIC_API_KEY` (no `NEXT_PUBLIC_` prefix) inside
modules that import `'server-only'` to prevent accidental bundling.

## Consequences

- The AI grading path requires a round-trip to the server, which is
  fine: the latency dominator is the model call itself, not the proxy.
- Rate limiting and usage counting happen on the server, where the
  client cannot tamper with them.
- The Anthropic key never appears in browser-visible code, network
  payloads, or env vars exposed to the client.
- This is a non-negotiable boundary captured in `CLAUDE.md` Golden Rule 1.
