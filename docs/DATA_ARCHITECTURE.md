# Data Architecture

## Separation of Concerns
- Supabase handles dynamic and transactional data.
- Firebase stores long-term or archival data.

## Data Flow
1. Client interacts with Next.js routes.
2. Server actions or API routes read/write to Supabase.
3. Long-term or archival updates sync to Firebase.

## Entities (Supabase) — implemented
Lending domain lives in Supabase Postgres (see DATABASE.md):
`admin_users`, `products`, `clients`, `loans`, `installments` (échéancier),
`payments`, `loan_applications` (funnel leads), `import_batches`, `activity_log`.
CRM domain: `client_scores` (score history), `client_documents` (KYC),
`contracts` (lifecycle), `interactions` (timeline), `tasks` (relances).
Finance domain: `ledger_entries` (manual revenue/expenses — coaching, server fees,
management, rebranding) feeding the consolidated P&L; `kpis_cache` (dashboard KPI
snapshot). Reporting views power the dashboard P&L, overdue tracking, the enriched
client list (`v_client_overview`), the tasks page (`v_tasks_due`), the Finance
P&L page (`v_pnl_monthly`/`v_pnl_summary`, `v_arrears_summary`) and the
**Statistiques** workspace (18 `v_stats_*` aggregate views: portfolio, risk,
DPD/collections, cashflow, vintages, products, client segmentation, funnel).

**Loan revenue is derived, accounting is dual-source:** interest/fees/penalties are
computed from `loans`+`installments`+`payments` (never hand-entered); only non-loan
revenue (coaching) and operating expenses live in `ledger_entries`. The P&L views
union the two; bad debts come from `loans.write_off_amount`.

Relationships: `clients 1—* loans 1—* installments`; `loans 1—* payments`;
`payments *—1 installments` (optional allocation); `loans *—1 products`.
CRM: `clients 1—* client_scores`; `clients 1—* client_documents`;
`clients 1—* interactions`; `clients 1—* tasks`; `loans 1—1 contracts`;
`loan_applications 1—1 clients` via `converted_client_id` (conversion).

## Acquisition → client pipeline
`loan_applications` (submitted → under_review → qualified → approved/rejected/cancelled)
convert into a `clients` row (prospect). Conversion scores the file, carries over KYC
documents, logs an interaction and opens a follow-up task; a `contract` then moves from
offer → signed → active alongside the loan and its schedule.

## Open Questions
- Whether/what to mirror to Firebase for long-term archival (currently Supabase only).
- Cookie-based SSR session vs current client-side guard + RLS.
