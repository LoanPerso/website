# Database

Primary store: **Supabase (Postgres)**. Currency EUR, base country EE.
Schema source of truth: `supabase/migrations/` (+ `supabase/seed.sql`).
Apply with `node scripts/db-apply.mjs` (reads secrets from `.env`, see CLAUDE.md §12).

## Tables

### admin_users
Back-office accounts, linked to `auth.users`.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | references `auth.users(id)` |
| email | text | |
| full_name | text | |
| role | text | `superadmin` \| `admin` \| `viewer` |
| is_active | bool | gate used by `is_admin()` |
| created_at / last_login_at | timestamptz | |

### products
Credit catalogue (what Quickfund sells).
`slug` (unique), `name`, `category`, `description`, `min_amount`, `max_amount`,
`min_duration_months`, `max_duration_months`, `min_rate`, `max_rate`, `default_rate`,
`application_fee_percent`, `is_active`, `sort_order`.

### clients
Borrowers. `reference` (auto `CLI-0001`), identity/contact fields, `employment_status`,
`employment_since`, `dependents`, `monthly_net_income`, `monthly_expenses`, `risk_category`
(A–D, score-driven), `status` (`prospect`/`active`/`inactive`/`blacklisted`), `notes`.
Scoring: `credit_score` (0-100), `score_updated_at`, `score_is_stale`, `score_override`,
`score_override_reason`. Consent (GDPR): `consent_given_at`, `marketing_opt_in`.

### loans
Credits granted. `reference` (auto `LN-0001`), `client_id` FK, `product_id` FK,
`principal_amount`, `annual_rate`, `duration_months`, `monthly_payment`, `total_interest`,
`total_repayable`, `application_fee`, `purpose`, `risk_category`, `status`
(`draft`/`active`/`paid_off`/`defaulted`/`cancelled`), `start_date`, `end_date`, `disbursed_at`.

### installments (échéancier)
One row per scheduled payment. `loan_id` FK, `sequence`, `due_date`, `amount_due`,
`principal_component`, `interest_component`, `amount_paid`, `status`
(`pending`/`partial`/`paid`/`late`/`waived`), `paid_at`. Unique `(loan_id, sequence)`.

### payments
Cash actually received. `reference` (auto `PAY-0001`), `loan_id` FK, `client_id` FK,
`installment_id` FK (optional), `amount`, `payment_date`, `method`
(`sepa`/`transfer`/`card`/`cash`/`mobile_money`/`other`), `status`, `notes`.

### loan_applications
Inbound leads from the public funnel (column set matches `app/_lib/applications.ts`).
Admin-managed; anon may insert. Pipeline: `status` adds a `qualified` stage; `score`,
`score_category`, `source`, `rejection_reason`, and `converted_client_id` (link to the
client created on conversion).

### client_scores (CRM)
Immutable score snapshots (never overwritten; latest row = current). `client_id` FK,
`score`, `category` (A–D), `factors` jsonb (per-factor breakdown), `reason_codes` jsonb,
`dti`, `is_complete`, `model_version`, `source`
(`application`/`recompute`/`manual`/`conversion`/`seed`), `computed_by`, `computed_at`.

### client_documents (CRM / KYC)
Supporting documents with verification + expiry. `client_id` FK, `application_id` FK,
`type` (`id`/`income`/`address`/`bank`/`contract`/`kbis`/`other`), `label`, `url`,
`status` (`missing`/`received`/`verified`/`rejected`/`expired`), `issued_on`, `expires_on`,
`rejection_reason`, `verified_by`, `verified_at`, `uploaded_at`.

### contracts (CRM / suivi contractuel)
One per loan; the legal lifecycle around a credit. `reference` (auto `CTR-0001`),
`client_id` FK, `loan_id` FK, `product_id` FK, `status`
(`draft`/`offer_sent`/`signed`/`active`/`completed`/`cancelled`/`expired`), amount/rate/
duration/monthly snapshot, `terms` jsonb, `offer_sent_at`, `offer_expires_on`, `signed_at`,
`signature_method`, `withdrawal_deadline` (cooling-off), `document_url`, `start_date`, `end_date`.

### interactions (CRM)
Relationship timeline. `client_id`/`application_id`/`loan_id`/`contract_id` FKs, `type`
(`note`/`call`/`email`/`sms`/`meeting`/`system`), `direction` (`in`/`out`), `subject`,
`body`, `occurred_at`, `created_by`.

### tasks (CRM / relances)
Follow-ups/reminders, linkable to any entity. `title`, `description`, `client_id`/`loan_id`/
`application_id`/`contract_id`/`installment_id` FKs, `category`
(`follow_up`/`kyc`/`signature`/`collection`/`review`/`other`), `priority`
(`low`/`normal`/`high`/`urgent`), `status` (`open`/`done`/`cancelled`), `due_date`,
`assigned_to`, `completed_at`, `created_by`.

### import_batches
History of CSV imports (`entity`, counts, `status`, `error_log`).

### activity_log
Lightweight audit trail (`actor_id`, `action`, `entity`, `entity_id`, `metadata`).

## Reporting views (security_invoker)
| View | Purpose |
|------|---------|
| `v_portfolio_kpis` | Single-row KPIs: clients, active loans, total disbursed, collected, outstanding principal, interest earned, overdue amount/count, default rate. |
| `v_loan_balances` | Per-loan collected vs outstanding (total + principal). |
| `v_installments_status` | Installments enriched with `is_overdue`, `days_late`, `amount_remaining` + client/loan fields. |
| `v_monthly_disbursements` | Volume lent per month (P&L chart). |
| `v_monthly_collections` | Cash collected per month. |
| `v_client_overview` | Clients + latest score/category, KYC completeness, open/overdue tasks, loans & active contracts (drives the client list). |
| `v_tasks_due` | Tasks + client name + `is_overdue` flag (drives the Tâches page). |

## Triggers & helpers
- `set_updated_at()` — maintains `updated_at`.
- `set_reference(prefix, sequence)` — generates human references on insert
  (`CLI-`, `LN-`, `PAY-`, `CTR-`).
- `is_admin()` — `security definer`, used by every RLS policy.

## Firebase (long-term)
Reserved for durable/archival data. Not used by the admin back office.

## Migrations
- `20260528120000_core_schema.sql`
- `20260528120100_rls_policies.sql`
- `20260528120200_reporting_views.sql`
- `20260528130000_crm_scoring.sql` (clients scoring columns + `client_scores`)
- `20260528130100_crm_followup.sql` (`contracts`, `client_documents`, `interactions`, `tasks`, application pipeline)
- `20260528130200_crm_rls_views.sql` (CRM RLS + `v_client_overview`, `v_tasks_due`)
- `seed.sql` (products + demo dataset + CRM smoke data)
