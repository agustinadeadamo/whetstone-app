# 0007 — No RAG in MVP; revisit when a feature justifies it

Date: 2026-05-29
Status: Accepted

## Context

Retrieval-Augmented Generation (RAG) is the standard pattern for
grounding LLM output in external context. The temptation in 2026 is
to add RAG to any AI feature regardless of need, because it is
visible and fashionable. The question is whether the grading pipeline
genuinely needs retrieval.

## Options considered

- **Add RAG now.** Index questions and answers as embeddings; retrieve
  at grade time. Adds latency, infrastructure (pgvector), and cost.
- **Skip RAG until a feature requires it.** Grade against the model
  answer that is already in the row being evaluated. No retrieval
  needed — the relevant context is already in hand.

## Decision

No RAG in the MVP. The grading pipeline takes the question, the model
answer, and the user's answer directly — all available without retrieval.

## Consequences

- The MVP is simpler, cheaper, and faster than it would be with RAG.
- Adding RAG later is straightforward: pgvector is a Postgres
  extension, and the schema accommodates an `embeddings` table when
  needed.
- A future feature like "grade against high-scoring community answers"
  or "feedback grounded in company-specific values" would require
  retrieval — that is the trigger for revisiting this decision.
- This choice is documented because "we don't use RAG" tends to read
  as an oversight unless the reasoning is on the record. The reasoning
  is: the relevant context is in the row, retrieval would add cost
  without improving quality.
