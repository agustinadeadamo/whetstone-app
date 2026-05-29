// Executes a .sql file against DATABASE_URL inside a single transaction.
// Used to apply lib/db/rls.sql (RLS policies, auth trigger, FK cascades).
// Never prints credentials, even on error.
//
// Usage: node --env-file=.env.local scripts/db-exec-sql.mjs <path-to-sql>
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const file = process.argv[2];
if (!file) {
  console.error("Usage: db-exec-sql.mjs <path-to-sql>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const content = await readFile(file, "utf8");
const sql = postgres(url, {
  max: 1,
  idle_timeout: 5,
  connect_timeout: 10,
  // Suppress NOTICE noise from idempotent `drop ... if exists` statements.
  onnotice: () => {},
});

try {
  // Wrap in a transaction: if any statement fails, nothing is applied.
  // .simple() runs the whole multi-statement file in one round-trip.
  await sql.begin((tx) => [tx.unsafe(content).simple()]);
  console.log(`Applied ${file} — OK`);
} catch (err) {
  // Print only error code + message + position; never the connection string.
  console.error("Apply failed:", err.code ?? "", err.message);
  if (err.position) console.error("  at character position:", err.position);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
