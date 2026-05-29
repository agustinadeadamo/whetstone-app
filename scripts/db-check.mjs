// Minimal Postgres connectivity check. Uses DATABASE_URL, runs SELECT 1.
// Never prints credentials. Run with: node --env-file=.env.local scripts/db-check.mjs
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 10 });

try {
  const rows = await sql`SELECT 1 AS ok`;
  if (rows[0]?.ok === 1) {
    console.log("conexión OK");
  } else {
    console.error("Unexpected result:", rows);
    process.exitCode = 1;
  }
} catch (err) {
  // Print only the error message/code, never the connection string.
  console.error("Connection failed:", err.code ?? "", err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
