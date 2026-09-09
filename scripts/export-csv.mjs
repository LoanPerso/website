// ============================================================================
// Quickfund — Export every business/CRM/mailbox table to CSV (one file/table).
// Reads all rows through the Supabase Management API (service-role equivalent,
// bypasses RLS) and writes UTF-8 CSV files under exports/<env>_<date>/.
//
// Secrets come from the environment (source .env first; never hardcode):
//   set -a; source .env; set +a
//   node scripts/export-csv.mjs prod       # export quickfundProd
//   node scripts/export-csv.mjs preprod    # export quickfundPreprod (default)
//
// The target project must be ACTIVE (not paused) or the API times out.
// ============================================================================

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENV = (process.argv[2] || "preprod").toLowerCase();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const REF = ENV === "prod" ? process.env.SUPABASE_PROD_PROJECT_REF : process.env.SUPABASE_PROJECT_REF;

if (!TOKEN || !REF) {
  console.error("Missing SUPABASE_ACCESS_TOKEN or project ref (source .env first).");
  process.exit(1);
}

// Every public table, grouped for readability. admin_users + kpis_cache included
// for completeness; drop them from this list if you only want business data.
const TABLES = [
  "clients", "loan_applications", "loans", "installments", "payments",
  "ledger_entries", "products", "contracts",
  "client_scores", "client_documents", "interactions", "tasks",
  "import_batches", "activity_log",
  "mail_accounts", "mail_folders", "mail_messages", "mail_attachments", "mail_diagnostics",
  "admin_users", "kpis_cache",
];

const endpoint = `https://api.supabase.com/v1/projects/${REF}/database/query`;

async function query(sql) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: sql }),
    });
    const text = await res.text();
    if (res.ok) return JSON.parse(text);
    // Paused projects answer with a timeout message on the first hits — retry.
    if (attempt < 4 && text.includes("timeout")) {
      process.stdout.write(`  (waking project, retry ${attempt})\n`);
      await new Promise((r) => setTimeout(r, 4000));
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
}

function csvCell(v) {
  if (v === null || v === undefined) return "";
  let s = typeof v === "object" ? JSON.stringify(v) : String(v);
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(columns, rows) {
  const lines = [columns.map(csvCell).join(",")];
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c])).join(","));
  return lines.join("\r\n") + "\r\n";
}

async function columnsOf(table) {
  const rows = await query(
    `select column_name from information_schema.columns ` +
    `where table_schema='public' and table_name='${table}' order by ordinal_position`
  );
  return rows.map((r) => r.column_name);
}

const date = new Date().toISOString().slice(0, 10);
const outDir = join(process.cwd(), "exports", `${ENV}_${date}`);
mkdirSync(outDir, { recursive: true });

console.log(`\n  Export ${ENV} (${REF}) -> exports/${ENV}_${date}/\n`);

const summary = [];
for (const table of TABLES) {
  try {
    const rows = await query(`select * from public.${table} order by 1`);
    const columns = rows.length ? Object.keys(rows[0]) : await columnsOf(table);
    writeFileSync(join(outDir, `${table}.csv`), toCsv(columns, rows), "utf8");
    summary.push({ table, rows: rows.length });
    console.log(`  ${table.padEnd(20)} ${String(rows.length).padStart(6)} rows`);
  } catch (e) {
    summary.push({ table, rows: `ERROR: ${e.message}` });
    console.log(`  ${table.padEnd(20)} FAILED  ${e.message}`);
  }
}

const total = summary.reduce((n, s) => n + (typeof s.rows === "number" ? s.rows : 0), 0);
console.log(`\n  Done. ${summary.length} tables, ${total} rows total.`);
console.log(`  Folder: ${outDir}\n`);
