// Apply SQL files to the Supabase project via the Management API.
// Reads SUPABASE_ACCESS_TOKEN + SUPABASE_PROJECT_REF from the environment
// (load with: set -a; source .env; set +a). Never hardcode secrets.
//
// Usage:
//   node scripts/db-apply.mjs                  # all migrations (sorted) + seed.sql
//   node scripts/db-apply.mjs path/to/file.sql # specific file(s)

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;

if (!token || !ref) {
  console.error("Missing SUPABASE_ACCESS_TOKEN or SUPABASE_PROJECT_REF (source .env first).");
  process.exit(1);
}

const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`;
const root = process.cwd();

async function runSql(sql, label) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`FAIL  ${label}  ->  HTTP ${res.status}\n${text}`);
    process.exit(1);
  }
  console.log(`OK    ${label}`);
  return text;
}

const args = process.argv.slice(2);
let targets;
if (args.length) {
  targets = args.map((f) => (f.startsWith("/") ? f : join(root, f)));
} else {
  const migDir = join(root, "supabase", "migrations");
  targets = readdirSync(migDir)
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .map((f) => join(migDir, f));
  targets.push(join(root, "supabase", "seed.sql"));
}

for (const f of targets) {
  const sql = readFileSync(f, "utf8");
  await runSql(sql, f.replace(root + "/", ""));
}
console.log("Done.");
