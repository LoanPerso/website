# Admin Back Office (`/admin`)

Internal tool to run the lending activity: P&L, clients, credits, schedules,
payments, overdue tracking, products, inbound applications and data import.
French UI, non-localized, `noindex`.

## Access
- `/admin/login` → Supabase password auth + `admin_users` check (see SECURITY.md).
- Protected pages live under `app/admin/(protected)/`.

## Pages
| Route | Purpose |
|-------|---------|
| `/admin/dashboard` | P&L overview: KPIs (outstanding, lent this month, total lent, collected, active clients/loans, default rate, overdue), 12-month disbursed-vs-collected chart, recent loans, overdue alerts. |
| `/admin/clients` | Client list with score, KYC and open-task columns (search, filter by status/category) + create (dialog). |
| `/admin/clients/[id]` | Client detail: scoring (recompute/override/history), KYC documents, interaction timeline, tasks, contracts, loans, payments, edit/delete. |
| `/admin/loans` | Loan list (filter status/product, search by ref). |
| `/admin/loans/new` | Create a loan with a live amortization-schedule preview. |
| `/admin/loans/[id]` | Loan detail: terms, schedule (per-installment collect), payments, status change, delete. |
| `/admin/contracts` | **Suivi contractuel**: contracts by status (offer → signed → active → completed), inline transitions, KPIs. |
| `/admin/payments` | Payment history (filter by month/method) + record a payment. |
| `/admin/overdue` | **Impayés**: overdue installments by month / days-late, with one-click collect. |
| `/admin/tasks` | **Relances**: global tasks (à faire / en retard / faites), quick complete, create. |
| `/admin/products` | Credit catalogue CRUD. |
| `/admin/applications` | Inbound leads list (score, product, status); rows open the full dossier. |
| `/admin/applications/[id]` | Full application dossier: requested credit (product), identity, contact, employment & income, documents, live scoring breakdown, status workflow, convert to client (scores, copies KYC, logs interaction, opens a relance). |
| `/admin/import` | CSV import (clients/loans/payments) with preview + history. |
| `/admin/settings` | Admin users (role/active) + data connection info. |

## Data
- Reads/writes via the typed services in `app/_lib/admin/*` (Supabase + RLS).
- Aggregates come from the reporting views (see DATABASE.md).
- Amortization (annuity) computed in `app/_lib/admin/finance.ts`, mirroring the seed.

## Components
Reusable admin UI in `app/_components/admin/` (shell, KPI card, data table, bar chart,
status badges, dialog, form controls, toasts) — see CHARTE_GRAPHIQUE.md.
