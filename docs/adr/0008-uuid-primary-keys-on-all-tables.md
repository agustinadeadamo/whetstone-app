# 0008 — UUID primary keys on all tables for consistency

Date: 2026-05-29
Status: Accepted

## Context

The initial schema design (ADR 0006) defined entities with relational
PKs that varied by table. Specifically, `usage_counters` was designed
with `(user_id, period)` as a composite PK rather than an artificial
id, since those two columns already identify a row uniquely.

When implementing the schema, the question came up: should every
table have a synthetic UUID id, or should some tables use natural
composite keys?

## Options considered

- **Natural composite PKs where applicable.** Pure relational modeling.
  `usage_counters` would use `(user_id, period)` directly as PK,
  without an extra id column.
- **UUID id on every table, composite unique constraints for business
  keys.** Every row has a synthetic stable identifier; business
  uniqueness is enforced via UNIQUE constraints.

## Decision

Every table has a UUID id as PK. Business uniqueness (where it exists,
as in `progress` and `usage_counters`) is enforced via UNIQUE
constraints, not by making those columns the PK.

## Consequences

- All tables behave consistently — every row is referenceable by a
  stable, opaque id.
- Future FK references (if any) are simpler: one column, not a
  composite.
- Slight storage overhead per row (16 bytes for the UUID) is
  negligible at expected scale.
- The unique constraints still enforce business rules: a user cannot
  have two progress rows for the same question, nor two usage counters
  for the same period.
- Trade-off accepted: a slight departure from "pure" relational
  modeling in exchange for schema-wide consistency and operational
  simplicity.
