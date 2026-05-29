# Database

Primary store: **Supabase (Postgres)**. Currency EUR, base country EE.
Schema source of truth: `supabase/migrations/` (+ `supabase/seed.sql`).
Apply with `node scripts/db-apply.mjs` (reads secrets from `.env`, see CLAUDE.md §12).

## Environments
Two Supabase projects in the same org (both `eu-central-1`):
- **Preprod** — `quickfundPreprod` (ref `vysqrahewfxamwxabhnh`): the working DB; local dev and the
  `NEXT_PUBLIC_SUPABASE_*` runtime vars point here. Schema **+ `seed.sql`** (demo data).
- **Prod** — `quickfundProd` (ref `aqwenqsxdubyhhjkfekh`): **schema only, no seed** (vierge — 0 row,
  RLS on all 19 base tables). Keys live in `.env` as `SUPABASE_PROD_*`; wire them into the runtime
  vars on the prod host. Promote schema by applying `supabase/migrations/` here — never copy data.

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
Servicing & collections (migration `20260528150000`): `closed_at`, `closure_reason`
(`settled_early`/`paid_off`/`written_off`/`cancelled`), `write_off_amount`, `dunning_level`,
`next_action_date`. A `draft` loan is **not** disbursed (`disbursed_at` null until `disburseLoan`).

### installments (échéancier)
One row per scheduled payment. `loan_id` FK, `sequence`, `due_date`, `amount_due`,
`principal_component`, `interest_component`, `amount_paid`, `late_fee` (collections penalty,
migration `20260528150000`), `status`
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
`terms` holds the **frozen offer snapshot** (`ContractTermsSnapshot`: amount/duration/rate/TAEG/
insurance/fees/first due/schedule preview + `source_application_id`) written at origination —
the link back to the originating application is queried via `terms->>source_application_id`.

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

### mail_accounts / mail_folders / mail_messages / mail_attachments / mail_diagnostics (Messagerie)
Company inbox — a **DB-backed mockup** (no real SMTP/IMAP; see DECISIONS). Admin-only RLS
(`*_admin_all` via `is_admin()`). The `*_password` columns are **write-only**: the data layer
never selects them back to the browser.
- **mail_accounts** — a configured box/address. `label`, `email` (unique), `display_name`,
  `signature`, IMAP config (`imap_host/port/security/username/password`), SMTP config
  (`smtp_host/port/security/username/password`), `is_active`, `is_default`, `last_synced_at`,
  smoke state (`last_smtp_status/checked_at/detail`, `last_imap_status/checked_at/detail`;
  status `unknown`/`ok`/`error`). `*_security` ∈ `ssl`/`starttls`/`none`.
- **mail_folders** — folders per account. `account_id` FK, `name`, `path`, `role`
  (`inbox`/`sent`/`drafts`/`trash`/`archive`/`spam`/`other`), `sort_order`. Unique `(account_id, path)`.
- **mail_messages** — incoming + outgoing messages. `account_id`/`folder_id` FKs, `direction`
  (`in`/`out`), `message_uid`, `message_id`, `in_reply_to`, `thread_key`, `from_name`/`from_address`,
  `to_addresses`/`cc_addresses` jsonb `[{name,address}]`, `subject`, `snippet`, `body_text`,
  `body_html`, `has_attachments`, `size_bytes`, `is_seen`/`is_flagged`/`is_answered`/`is_draft`,
  `status` (`received`/`sent`/`draft`/`queued`/`failed`), CRM links `client_id`/`application_id`
  (FK `on delete set null`), `sent_at`, `received_at`.
- **mail_attachments** — file metadata (binary out of scope). `message_id` FK (cascade),
  `filename`, `content_type`, `size_bytes`, `is_inline`, `url`.
- **mail_diagnostics** — smoke-test history. `account_id` FK, `kind` (`smtp`/`imap`), `ok`,
  `detail`, `latency_ms`, `ran_by`, `ran_at`.

## Reporting views (security_invoker)
| View | Purpose |
|------|---------|
| `v_portfolio_kpis` | Single-row KPIs: clients, active loans, total disbursed, collected, outstanding principal, interest earned, overdue amount/count, default rate. |
| `v_loan_balances` | Per-loan collected vs outstanding (total + principal). |
| `v_installments_status` | Installments enriched with `is_overdue`, `days_late`, `amount_remaining` + client/loan fields. |
| `v_monthly_disbursements` | Volume lent per month (P&L chart). |
| `v_monthly_collections` | Cash collected per month. |
| `v_loan_arrears` | Per-loan overdue exposure (collections desk): overdue count/amount, late fees, max days late, oldest due date, `dunning_level`, `next_action_date`, outstanding total — one row per `active`/`defaulted` loan with ≥1 overdue installment (migration `20260528150000`). |
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
- `20260528140000_application_workflow.sql` (workflow/décision sur `loan_applications`)
- `20260528150000_servicing_collections.sql` (`installments.late_fee` ; `loans` clôture/perte/dunning ; vue `v_loan_arrears`)
- `20260528160000_mailbox.sql` (`mail_accounts`, `mail_folders`, `mail_messages`, `mail_attachments`, `mail_diagnostics` + RLS admin-only)

## `loan_applications` — colonnes workflow / décision (migration `20260528140000`)
Additives et idempotentes. Couvertes par la RLS existante (`loan_applications_admin_all`).
Les analyses lourdes (financière, fraude, tarification) restent **dérivées** à la lecture
(`app/_lib/admin/application/`, seedées par l'id) ; seules les décisions de l'analyste persistent ici.

| Colonne | Type | Rôle |
| --- | --- | --- |
| `assigned_to` | uuid → auth.users | Propriétaire du dossier (file/affectation). |
| `priority` | text (`low/normal/high/urgent`) | Priorité de traitement. |
| `tags` | text[] | Étiquettes libres. |
| `internal_notes` | text | Note interne (non communiquée au demandeur). |
| `last_contacted_at` | timestamptz | Dernier contact (ancienneté recontact). |
| `stage_entered_at` | timestamptz | Entrée dans l'étape courante (chrono SLA). |
| `consent` | jsonb | Consentement & contactabilité (canaux, opt-in, heures calmes, ne-pas-contacter). |
| `decision` | jsonb | Décision d'octroi (outcome, confiance, motifs, conditions, justification). |
| `risk_review` | jsonb | Disposition fraude/LCB-FT (composite, note AML, SAR). |
| `pricing` | jsonb | Snapshot de l'offre verrouillée (montant/durée/taux/TAEG/mensualité). |
| `analysis_overrides` | jsonb | Surcharges analyste des charges estimées (analyse financière). |
- `seed.sql` (products + demo dataset + CRM smoke data)
