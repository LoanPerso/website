-- ============================================================================
-- Quickfund — Application dossier: workflow & analyst-decision fields
-- Additive columns on loan_applications so the banking-grade dossier can persist
-- the analyst's choices: ownership, priority, tags, internal notes, consent,
-- the underwriting decision, the fraud/AML review and the locked offer snapshot.
-- Heavy analytics (financial, fraud, pricing) stay DERIVED at read time.
-- Additive and idempotent: safe to re-run.
-- ============================================================================

alter table public.loan_applications
  add column if not exists assigned_to        uuid references auth.users(id) on delete set null,
  add column if not exists priority           text check (priority in ('low','normal','high','urgent')) default 'normal',
  add column if not exists tags               text[] not null default '{}',
  add column if not exists internal_notes     text,
  add column if not exists last_contacted_at  timestamptz,
  add column if not exists stage_entered_at   timestamptz,
  add column if not exists consent            jsonb,
  add column if not exists decision           jsonb,
  add column if not exists risk_review        jsonb,
  add column if not exists pricing            jsonb,
  add column if not exists analysis_overrides jsonb;

-- Backfill the stage timer so SLA ageing has a baseline on existing rows.
update public.loan_applications
   set stage_entered_at = coalesce(stage_entered_at, updated_at, created_at)
 where stage_entered_at is null;

create index if not exists idx_applications_assigned  on public.loan_applications(assigned_to);
create index if not exists idx_applications_priority  on public.loan_applications(priority);
