# API Routes

Do not change the table structure. Add new routes by appending rows.

| Method | Route | Description | Auth | Owner |
| --- | --- | --- | --- | --- |
| GET | /api/health | Health check endpoint for uptime monitoring. | None | Platform |
| POST | /api/application/analyze | Credit application document analysis (mock). Returns **410 Gone** (`{ closed: true }`) without processing while `NEW_CREDIT_CLOSED` (acquisition funnel closed); otherwise validates fields/document and returns the analysis verdict. | None | Platform |
| POST | /api/auth/login | Public client login (smoke). Validates `{ email, password }`, simulates auth latency, and always returns **401 `ACCOUNT_NOT_FOUND`** — no public client portal yet. | None | Platform |

> **Admin back office (`/admin`)** does not add REST routes: it reads/writes Supabase
> directly from the client with **RLS** as the trust boundary (admin-only via `is_admin()`).
> Privileged provisioning uses `scripts/*.mjs` with the service-role / management token
> from `.env` (see CLAUDE.md §12), not HTTP routes.
