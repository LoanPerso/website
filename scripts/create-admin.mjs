// Create (or promote) an admin user for the back office.
// Creates a confirmed Supabase Auth user via the service_role key, then inserts
// the matching public.admin_users row via the Management API. Reads secrets from
// the environment (set -a; source .env; set +a). Never hardcode secrets.
//
// Usage:
//   node scripts/create-admin.mjs <email> [password] [full_name] [role]
//   role defaults to "superadmin".

import { randomBytes } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;

if (!url || !service || !token || !ref) {
  console.error("Missing env (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF).");
  process.exit(1);
}

const email = process.argv[2];
let password = process.argv[3];
const fullName = process.argv[4] ?? null;
const role = process.argv[5] ?? "superadmin";

if (!email) {
  console.error("Usage: node scripts/create-admin.mjs <email> [password] [full_name] [role]");
  process.exit(1);
}
if (!password) password = randomBytes(18).toString("base64url");

const authHeaders = {
  apikey: service,
  Authorization: `Bearer ${service}`,
  "Content-Type": "application/json",
};

async function findUserByEmail(target) {
  const res = await fetch(`${url}/auth/v1/admin/users?per_page=200`, { headers: authHeaders });
  const body = await res.json();
  const users = body.users ?? body ?? [];
  return users.find((u) => (u.email ?? "").toLowerCase() === target.toLowerCase()) ?? null;
}

async function main() {
  let userId;
  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const createBody = await createRes.json();

  if (createRes.ok && createBody.id) {
    userId = createBody.id;
    console.log("Auth user created.");
  } else {
    const existing = await findUserByEmail(email);
    if (!existing) {
      console.error("Failed to create user and none found:", JSON.stringify(createBody));
      process.exit(1);
    }
    userId = existing.id;
    // reset password so the provided credentials work
    await fetch(`${url}/auth/v1/admin/users/${userId}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ password, email_confirm: true }),
    });
    console.log("Auth user already existed — password reset.");
  }

  const esc = (s) => s.replace(/'/g, "''");
  const nameSql = fullName ? `'${esc(fullName)}'` : "null";
  const sql = `insert into public.admin_users (id, email, full_name, role, is_active)
    values ('${userId}', '${esc(email)}', ${nameSql}, '${esc(role)}', true)
    on conflict (id) do update set is_active = true, role = excluded.role, email = excluded.email, full_name = coalesce(excluded.full_name, public.admin_users.full_name);`;

  const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (!sqlRes.ok) {
    console.error("Failed to insert admin_users row:", await sqlRes.text());
    process.exit(1);
  }

  console.log(`Admin ready: ${email} (role=${role}, id=${userId})`);
}

main();
