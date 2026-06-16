// Read-only: lists rows in public.users (count, id, email, created_at) to
// verify the handle_new_user trigger populated the mirror table on signup.
// Prints no credentials. Run with: node --env-file=.env.local scripts/db-users.mjs
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 10 });

try {
  const rows = await sql`
    SELECT id, email, plan, created_at
    FROM public.users
    ORDER BY created_at DESC
  `;
  console.log(`public.users — ${rows.length} row(s):`);
  for (const r of rows) {
    console.log(
      `  ${r.email.padEnd(32)} ${r.plan.padEnd(5)} ${r.id}  ${r.created_at.toISOString()}`,
    );
  }
} catch (err) {
  console.error("Query failed:", err.code ?? "", err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
