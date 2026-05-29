// Read-only audit of tenant-isolation state: RLS enablement per table,
// policies per table, and FK ON DELETE actions. Prints no credentials.
// Run with: node --env-file=.env.local scripts/db-audit-rls.mjs
import postgres from "postgres";

const TABLES = [
  "users",
  "decks",
  "modules",
  "questions",
  "progress",
  "evaluations",
  "usage_counters",
];

const DEL_ACTION = {
  a: "NO ACTION",
  r: "RESTRICT",
  c: "CASCADE",
  n: "SET NULL",
  d: "SET DEFAULT",
};

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 10 });

try {
  // 1. RLS enabled per table
  const rls = await sql`
    SELECT c.relname AS table, c.relrowsecurity AS rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = ANY(${TABLES})
    ORDER BY c.relname
  `;
  console.log("=== RLS enabled per table ===");
  for (const r of rls) {
    console.log(`  ${r.table.padEnd(16)} ${r.rls_enabled ? "✅ ON" : "❌ OFF"}`);
  }

  // 2. Policies per table (name + command)
  const policies = await sql`
    SELECT tablename AS table, policyname AS policy, cmd
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = ANY(${TABLES})
    ORDER BY tablename, cmd, policyname
  `;
  console.log(`\n=== Policies (${policies.length} total) ===`);
  let current = null;
  for (const p of policies) {
    if (p.table !== current) {
      current = p.table;
      console.log(`  ${p.table}:`);
    }
    console.log(`    [${p.cmd.padEnd(6)}] ${p.policy}`);
  }
  // Per-table verb coverage summary
  console.log("\n=== Verb coverage (SELECT/INSERT/UPDATE/DELETE) ===");
  for (const t of TABLES) {
    const cmds = new Set(
      policies.filter((p) => p.table === t).map((p) => p.cmd),
    );
    const want = ["SELECT", "INSERT", "UPDATE", "DELETE"];
    const have = want.map((v) => (cmds.has(v) ? v : `MISSING:${v}`));
    const ok = want.every((v) => cmds.has(v));
    console.log(`  ${t.padEnd(16)} ${ok ? "✅" : "❌"} ${have.join(" ")}`);
  }

  // 3. Foreign keys + ON DELETE action
  const fks = await sql`
    SELECT
      con.conname AS constraint,
      cl.relname AS table,
      con.confdeltype AS del_type
    FROM pg_constraint con
    JOIN pg_class cl ON cl.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    WHERE con.contype = 'f' AND n.nspname = 'public'
    ORDER BY cl.relname, con.conname
  `;
  console.log(`\n=== Foreign keys ON DELETE (${fks.length} total) ===`);
  for (const f of fks) {
    const action = DEL_ACTION[f.del_type] ?? f.del_type;
    const mark = action === "CASCADE" ? "✅" : "⚠️ ";
    console.log(`  ${mark} ${f.constraint.padEnd(40)} ${action}`);
  }

  // 4. Table privileges still held by the `anon` role (should be none —
  // revoked as defense in depth; RLS is not the only barrier).
  const anonGrants = await sql`
    SELECT table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE grantee = 'anon' AND table_schema = 'public'
      AND table_name = ANY(${TABLES})
    ORDER BY table_name, privilege_type
  `;
  console.log("\n=== Table grants held by `anon` (expect: none) ===");
  if (anonGrants.length === 0) {
    console.log("  ✅ anon holds no table privileges in public");
  } else {
    for (const g of anonGrants) {
      console.log(`  ⚠️  ${g.table_name.padEnd(16)} ${g.privilege_type}`);
    }
  }
} catch (err) {
  console.error("Audit failed:", err.code ?? "", err.message);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 5 });
}
