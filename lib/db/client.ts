import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to .env.local.');
}

// Reuse the postgres connection across hot reloads in dev so we don't exhaust
// the pool. `prepare: false` is required behind Supabase's transaction pooler
// (pgBouncer), which does not support prepared statements.
const globalForDb = globalThis as unknown as {
  pg: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.pg ?? postgres(connectionString, { prepare: false });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pg = client;
}

// Passing the schema enables the typed relational query API (db.query.*).
export const db = drizzle(client, { schema });
