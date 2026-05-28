# API Routes

Do not change the table structure. Add new routes by appending rows.

| Method | Route | Description | Auth | Owner |
| --- | --- | --- | --- | --- |
| GET | /api/health | Health check endpoint for uptime monitoring. | None | Platform |

> **Admin back office (`/admin`)** does not add REST routes: it reads/writes Supabase
> directly from the client with **RLS** as the trust boundary (admin-only via `is_admin()`).
> Privileged provisioning uses `scripts/*.mjs` with the service-role / management token
> from `.env` (see CLAUDE.md §12), not HTTP routes.
