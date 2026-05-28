# Security

## Principles
- Least privilege for data access.
- Clear separation between public site and admin back office.
- All secrets in `.env` (git-ignored). Never hardcode/print secrets. See CLAUDE.md §12.

## Admin authentication
- Provider: **Supabase Auth** (email/password).
- Login: `/admin/login` (`signInWithPassword`). The session lives in the browser
  Supabase client (auto-refresh).
- Authorization: a user is an admin only if a row exists in `public.admin_users`
  with `is_active = true`. `AdminAuthProvider` loads it; `AdminGuard` blocks the
  protected layout otherwise and offers sign-out.
- `/admin` is excluded from the i18n middleware (non-localized back office) and is
  `noindex` (layout metadata + `robots.ts`).
- Adding an admin: create the Auth user, then insert an `admin_users` row with the
  same `id` (`scripts/create-admin.mjs` does both).

## Data access model (defense in depth)
- The real protection is **Postgres RLS**, not the client UI.
- Every business table has RLS enabled; the only policy for `authenticated` is
  `public.is_admin()` (active admin) for select/insert/update/delete.
- The CRM tables (`client_scores`, `client_documents`, `contracts`, `interactions`,
  `tasks`) follow the same admin-only `is_admin()` policy; `v_client_overview` and
  `v_tasks_due` are `security_invoker` and revoked from `anon`.
- `loan_applications` additionally allows `anon` **insert** (public funnel), never select.
- Reporting views use `security_invoker = on`, so RLS of the caller applies (admins
  see data; anon sees nothing).
- The browser uses the **anon key** (RLS enforced). The **service_role key** bypasses
  RLS and is used only by server/CLI scripts (`scripts/`), never shipped to the client.

## Keys & roles
| Key | Where | RLS |
|-----|-------|-----|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | enforced |
| `SUPABASE_SERVICE_ROLE_KEY` | server/CLI only | bypassed |
| `SUPABASE_ACCESS_TOKEN` | Management API/CLI | n/a (project admin) |

## Compliance (CRM)
- Scoring is explainable: each computation is stored as an immutable `client_scores`
  snapshot (factors + reason codes + model version), and manual overrides require a
  justification — supporting EU consumer-credit transparency / adverse-action reasoning.
- GDPR consent is captured on the client (`consent_given_at`, `marketing_opt_in`); KYC
  documents track expiry; contracts carry a cooling-off `withdrawal_deadline`.

## Follow-ups
- Move the admin session to cookie-based SSR (`@supabase/ssr`) for server-side route
  protection (currently client-side guard + RLS).
- Populate `activity_log` from admin mutations for a full audit trail.
- Rotate the bootstrap admin password after first login.
