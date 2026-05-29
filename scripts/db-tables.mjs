// Lists tables in the public schema with their column counts. No row data.
// Run with: node --env-file=.env.local scripts/db-tables.mjs
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 10 });

try {
  const rows = await sql`
    SELECT t.table_name, count(c.column_name)::int AS columns
    FROM information_schema.tables t
    JOIN information_schema.columns c
      ON c.table_schema = t.table_schema AND c.table_name = t.table_name
    WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    GROUP BY t.table_name
    ORDER BY t.table_name
  `;
  console.log(`public schema — ${rows.length} table(s):`);
  for (const r of rows) {
    console.log(`  ${r.table_name.padEnd(20)} ${r.columns} columns`);
  }
} catch (err) {
  console.error("Query failed:", err.code ?? "", err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
