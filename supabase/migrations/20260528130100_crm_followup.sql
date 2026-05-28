-- ============================================================================
-- Quickfund — CRM: contractual follow-up
-- Contracts (offer → signature → active → completed lifecycle), KYC documents,
-- relationship interactions (timeline) and tasks (relances / reminders).
-- Also wires the application → client pipeline (converted_client_id, qualified stage).
-- Additive and idempotent: safe to re-run.
-- ============================================================================

create sequence if not exists public.contract_ref_seq start 1;

-- ----------------------------------------------------------------------------
-- contracts — one per loan; tracks the legal lifecycle around a credit
-- ----------------------------------------------------------------------------
create table if not exists public.contracts (
  id                  uuid primary key default gen_random_uuid(),
  reference           text unique,
  client_id           uuid not null references public.clients(id) on delete restrict,
  loan_id             uuid references public.loans(id) on delete set null,
  product_id          uuid references public.products(id) on delete set null,
  status              text not null default 'draft'
                        check (status in ('draft','offer_sent','signed','active','completed','cancelled','expired')),
  principal_amount    numeric(12,2),
  annual_rate         numeric(5,2),
  duration_months     integer,
  monthly_payment     numeric(12,2),
  terms               jsonb,
  offer_sent_at       timestamptz,
  offer_expires_on    date,
  signed_at           timestamptz,
  signature_method    text check (signature_method in ('e_sign','paper','in_person')),
  withdrawal_deadline date,          -- legal cooling-off / right-of-withdrawal
  document_url        text,
  start_date          date,
  end_date            date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- client_documents — KYC / supporting documents with verification + expiry
-- ----------------------------------------------------------------------------
create table if not exists public.client_documents (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references public.clients(id) on delete cascade,
  application_id   uuid references public.loan_applications(id) on delete set null,
  type             text not null
                     check (type in ('id','income','address','bank','contract','kbis','other')),
  label            text,
  url              text,
  status           text not null default 'missing'
                     check (status in ('missing','received','verified','rejected','expired')),
  issued_on        date,
  expires_on       date,
  rejection_reason text,
  verified_by      uuid references auth.users(id) on delete set null,
  verified_at      timestamptz,
  uploaded_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- tasks — follow-ups / reminders (relances), optionally linked to any entity
-- ----------------------------------------------------------------------------
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  client_id      uuid references public.clients(id) on delete cascade,
  loan_id        uuid references public.loans(id) on delete cascade,
  application_id uuid references public.loan_applications(id) on delete cascade,
  contract_id    uuid references public.contracts(id) on delete cascade,
  installment_id uuid references public.installments(id) on delete set null,
  category       text not null default 'follow_up'
                   check (category in ('follow_up','kyc','signature','collection','review','other')),
  priority       text not null default 'normal'
                   check (priority in ('low','normal','high','urgent')),
  status         text not null default 'open' check (status in ('open','done','cancelled')),
  due_date       date,
  assigned_to    uuid references auth.users(id) on delete set null,
  completed_at   timestamptz,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- interactions — relationship timeline (notes, calls, emails, system events)
-- ----------------------------------------------------------------------------
create table if not exists public.interactions (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid references public.clients(id) on delete cascade,
  application_id uuid references public.loan_applications(id) on delete set null,
  loan_id        uuid references public.loans(id) on delete set null,
  contract_id    uuid references public.contracts(id) on delete set null,
  type           text not null default 'note'
                   check (type in ('note','call','email','sms','meeting','system')),
  direction      text check (direction in ('in','out')),
  subject        text,
  body           text,
  occurred_at    timestamptz not null default now(),
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- loan_applications — pipeline link to client + qualified stage + scoring
-- ----------------------------------------------------------------------------
alter table public.loan_applications
  add column if not exists converted_client_id uuid references public.clients(id) on delete set null,
  add column if not exists rejection_reason    text,
  add column if not exists source              text,
  add column if not exists score               integer,
  add column if not exists score_category      text check (score_category in ('A','B','C','D'));

alter table public.loan_applications drop constraint if exists loan_applications_status_check;
alter table public.loan_applications add constraint loan_applications_status_check
  check (status in ('draft','submitted','under_review','qualified','approved','rejected','cancelled'));

-- ----------------------------------------------------------------------------
-- Triggers: updated_at + references
-- ----------------------------------------------------------------------------
drop trigger if exists trg_contracts_updated on public.contracts;
create trigger trg_contracts_updated before update on public.contracts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_contracts_ref on public.contracts;
create trigger trg_contracts_ref before insert on public.contracts
  for each row execute function public.set_reference('CTR-', 'contract_ref_seq');

drop trigger if exists trg_client_documents_updated on public.client_documents;
create trigger trg_client_documents_updated before update on public.client_documents
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated on public.tasks;
create trigger trg_tasks_updated before update on public.tasks
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_contracts_client          on public.contracts(client_id);
create index if not exists idx_contracts_loan            on public.contracts(loan_id);
create index if not exists idx_contracts_status          on public.contracts(status);
create index if not exists idx_client_documents_client   on public.client_documents(client_id);
create index if not exists idx_client_documents_status   on public.client_documents(status);
create index if not exists idx_client_documents_expires  on public.client_documents(expires_on);
create index if not exists idx_tasks_client              on public.tasks(client_id);
create index if not exists idx_tasks_status              on public.tasks(status);
create index if not exists idx_tasks_due                 on public.tasks(due_date);
create index if not exists idx_interactions_client       on public.interactions(client_id);
create index if not exists idx_interactions_occurred     on public.interactions(occurred_at);
create index if not exists idx_applications_converted    on public.loan_applications(converted_client_id);
