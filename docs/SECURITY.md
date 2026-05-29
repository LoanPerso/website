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

**Environments:** the same keys exist per project — **preprod** (`quickfundPreprod`) values are the
local `.env` defaults; **prod** (`quickfundProd`) values live in `.env` as `SUPABASE_PROD_*` and are
wired into the runtime vars only on the production host. `service_role` keys (both projects) are
server/CLI only, never shipped to the browser. Prod enforces RLS on all base tables (19/19).

## Compliance (CRM)
- Scoring is explainable: each computation is stored as an immutable `client_scores`
  snapshot (factors + reason codes + model version), and manual overrides require a
  justification — supporting EU consumer-credit transparency / adverse-action reasoning.
- GDPR consent is captured on the client (`consent_given_at`, `marketing_opt_in`); KYC
  documents track expiry; contracts carry a cooling-off `withdrawal_deadline`.

## Messagerie (maquette)
- L'onglet `/admin/mail` est une **maquette adossée à la base** (cf. DECISIONS) : pas de SMTP/IMAP réel.
- Les tables `mail_*` sont en **RLS admin-only** (`*_admin_all` via `is_admin()`), comme le reste du métier.
- Les identifiants de boîte (`imap_password` / `smtp_password`) sont stockés **en clair** pour la
  maquette et **jamais renvoyés au navigateur** : la couche données ne sélectionne pas ces colonnes
  (champ write-only dans l'UI ; on saisit un nouveau mot de passe, on ne le relit jamais).
- **Au branchement réel :** déplacer l'envoi/réception côté **serveur** (clé privilégiée hors
  navigateur), **chiffrer** les identifiants au repos (coffre / at-rest encryption), et ne jamais
  exposer les mots de passe via l'API.

## Follow-ups
- Move the admin session to cookie-based SSR (`@supabase/ssr`) for server-side route
  protection (currently client-side guard + RLS).
- Populate `activity_log` from admin mutations for a full audit trail.
- Rotate the bootstrap admin password after first login.
- Mailbox: encrypt box credentials and move SMTP/IMAP server-side when wiring real send/receive.
