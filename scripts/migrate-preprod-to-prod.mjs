// ============================================================================
// Quickfund — Migrate business data PREPROD → PROD
// Copies the live business tables from the preprod project to the prod project,
// preserving primary keys and human references so every foreign key stays valid.
//
// By design this EXCLUDES users (admin_users) and the mailbox (mail_*). The
// kpis_cache table is NOT copied — it is rebuilt afterwards via
// refresh_portfolio_kpis(). The CRM annex tables (contracts, client_scores,
// client_documents, interactions, tasks, import_batches, activity_log) are empty
// in preprod and therefore not listed.
//
// Tables are migrated in foreign-key topological order (parents before children).
// All auth.users foreign keys (created_by, assigned_to, computed_by, …) are NULL
// in the preprod dataset, so no user rows are required on the target.
//
// Reads secrets from the environment (source .env first; never hardcode):
//   set -a; source .env; set +a
//   node scripts/migrate-preprod-to-prod.mjs --dry    # read + count only, no writes
//   node scripts/migrate-preprod-to-prod.mjs          # perform the copy
//   node scripts/migrate-preprod-to-prod.mjs --force  # copy even if prod is non-empty
// ============================================================================

import { createClient } from "@supabase/supabase-js";

const ARGS = new Set(process.argv.slice(2));
const DRY = ARGS.has("--dry");
const FORCE = ARGS.has("--force");

const SRC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; // preprod runtime URL
const SRC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DST_URL = process.env.SUPABASE_PROD_URL;
const DST_KEY = process.env.SUPABASE_PROD_SERVICE_ROLE_KEY;
const SRC_REF = process.env.SUPABASE_PROJECT_REF;
const DST_REF = process.env.SUPABASE_PROD_PROJECT_REF;

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!SRC_URL || !SRC_KEY) die("Missing preprod NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (source .env first).");
if (!DST_URL || !DST_KEY) die("Missing prod SUPABASE_PROD_URL / SUPABASE_PROD_SERVICE_ROLE_KEY (source .env first).");
if (!DST_REF) die("Missing SUPABASE_PROD_PROJECT_REF (source .env first).");
if (SRC_URL === DST_URL) die("Source and target URLs are identical — refusing.");
if (SRC_REF && DST_REF && SRC_REF === DST_REF) die("Source and target project refs are identical — refusing.");
if (!DST_URL.includes(DST_REF)) die(`Target URL does not match the prod ref (${DST_REF}) — refusing for safety.`);

const src = createClient(SRC_URL, SRC_KEY, { auth: { persistSession: false } });
const dst = createClient(DST_URL, DST_KEY, { auth: { persistSession: false } });

// FK-topological order: parents before children.
//   clients ← loan_applications.converted_client_id
//   clients, products ← loans     (products already exist on prod, same UUIDs)
//   loans ← installments ← payments (+ payments → clients)
//   ledger_entries is standalone.
const TABLES = ["clients", "loan_applications", "loans", "installments", "payments", "ledger_entries"];
const CHUNK = { installments: 1000, payments: 1000 };

async function countRows(client, table) {
  const { count, error } = await client.from(table).select("*", { count: "exact", head: true });
  if (error) die(`count ${table}: ${error.message}`);
  return count ?? 0;
}

async function readAll(table) {
  const PAGE = 1000;
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await src
      .from(table)
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + PAGE - 1);
    if (error) die(`read ${table} [${from}..]: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    process.stdout.write(`\r  read ${table}: ${rows.length}   `);
    if (data.length < PAGE) break;
  }
  if (rows.length) process.stdout.write("\n");
  return rows;
}

async function insertAll(table, rows, size) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await dst.from(table).insert(chunk);
    if (error) die(`insert ${table} [${i}..${i + chunk.length}]: ${error.message}`);
    process.stdout.write(`\r  insert ${table}: ${Math.min(i + size, rows.length)}/${rows.length}   `);
  }
  if (rows.length) process.stdout.write("\n");
}

console.log(`\n  Source (preprod): ${SRC_REF}\n  Target (prod):    ${DST_REF}\n  Mode:             ${DRY ? "DRY (no writes)" : FORCE ? "WRITE (--force)" : "WRITE"}\n`);

// Guard: prod business tables must be empty unless --force (avoids PK collisions).
console.log("Checking the target is empty…");
let prodRows = 0;
for (const t of TABLES) {
  const n = await countRows(dst, t);
  if (n > 0) {
    console.log(`  prod.${t} = ${n}`);
    prodRows += n;
  }
}
if (prodRows > 0 && !FORCE) die(`Prod already holds ${prodRows} business rows. Re-run with --force only if you know what you're doing (PK collisions likely).`);

// Migrate table by table in FK order: read from preprod, insert into prod.
console.log("\nMigrating…");
const summary = [];
for (const t of TABLES) {
  const srcCount = await countRows(src, t);
  if (DRY) {
    summary.push({ table: t, src: srcCount, dst: "(dry)" });
    console.log(`  ${t}: ${srcCount} (dry — not copied)`);
    continue;
  }
  const rows = await readAll(t);
  await insertAll(t, rows, CHUNK[t] ?? 500);
  const dstCount = await countRows(dst, t);
  summary.push({ table: t, src: srcCount, dst: dstCount });
  console.log(`  ${t}: src ${srcCount} → dst ${dstCount}${srcCount === dstCount ? " ✓" : "  ⚠ MISMATCH"}`);
}

console.log("\n──────── Summary ────────");
for (const s of summary) console.log(`  ${s.table.padEnd(18)} src=${s.src}  dst=${s.dst}`);
console.log("──────────────────────────");

if (DRY) {
  console.log("\n--dry: no writes performed. Done.");
} else {
  const mismatch = summary.some((s) => s.src !== s.dst);
  console.log(mismatch ? "\n⚠ Some counts do not match — inspect above." : "\n✓ Data copy complete; all counts match.");
  if (mismatch) process.exit(1);
}
