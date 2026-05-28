-- ============================================================================
-- Quickfund — CRM: client credit scoring
-- Adds the scoring columns to clients and an append-only score history table.
-- The scoring engine lives in app/_lib/admin/scoring.ts (single source of truth);
-- this schema only persists its output (current score + immutable snapshots).
-- Additive and idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- clients — scoring + consent (GDPR) columns
-- ----------------------------------------------------------------------------
alter table public.clients
  add column if not exists employment_since      date,
  add column if not exists credit_score          integer,
  add column if not exists score_updated_at      timestamptz,
  add column if not exists score_is_stale        boolean not null default false,
  add column if not exists score_override        integer,
  add column if not exists score_override_reason text,
  add column if not exists consent_given_at      timestamptz,
  add column if not exists marketing_opt_in      boolean not null default false;

-- ----------------------------------------------------------------------------
-- client_scores — immutable score snapshots (never overwrite; latest = current)
-- ----------------------------------------------------------------------------
create table if not exists public.client_scores (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  score         integer not null,
  category      text not null check (category in ('A','B','C','D')),
  factors       jsonb not null default '[]'::jsonb,   -- [{code,label,weight,raw,score,contribution,status}]
  reason_codes  jsonb not null default '[]'::jsonb,   -- top negative contributors
  dti           numeric(6,3),
  is_complete   boolean not null default true,
  model_version text not null default 'v1',
  source        text not null default 'recompute'
                  check (source in ('application','recompute','manual','conversion','seed')),
  computed_by   uuid references auth.users(id) on delete set null,
  computed_at   timestamptz not null default now()
);

create index if not exists idx_client_scores_client   on public.client_scores(client_id);
create index if not exists idx_client_scores_computed  on public.client_scores(computed_at);
create index if not exists idx_clients_credit_score    on public.clients(credit_score);
