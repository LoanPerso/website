-- ============================================================================
-- Quickfund — Core admin schema
-- Lending back office: products, clients, loans, installments (échéanciers),
-- payments, applications (leads), import batches, activity log, admin users.
-- Currency: EUR. Country base: EE (Estonia).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Shared helpers
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Generates a human reference (e.g. CLI-0001) from a sequence when missing.
-- TG_ARGV[0] = prefix, TG_ARGV[1] = sequence name.
create or replace function public.set_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := tg_argv[0] || lpad(nextval(tg_argv[1])::text, 4, '0');
  end if;
  return new;
end;
$$;

create sequence if not exists public.client_ref_seq start 1;
create sequence if not exists public.loan_ref_seq start 1;
create sequence if not exists public.payment_ref_seq start 1;

-- ----------------------------------------------------------------------------
-- admin_users — who can access the back office (linked to Supabase auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.admin_users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  role          text not null default 'admin' check (role in ('superadmin','admin','viewer')),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- RLS-safe admin check (security definer bypasses admin_users RLS to avoid recursion).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users au
    where au.id = auth.uid() and au.is_active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- products — credit catalogue (what Quickfund sells)
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id                       uuid primary key default gen_random_uuid(),
  slug                     text unique not null,
  name                     text not null,
  category                 text not null default 'credit',
  description              text,
  min_amount               numeric(12,2) not null default 0,
  max_amount               numeric(12,2) not null default 0,
  min_duration_months      integer not null default 1,
  max_duration_months      integer not null default 12,
  min_rate                 numeric(5,2) not null default 0,
  max_rate                 numeric(5,2) not null default 0,
  default_rate             numeric(5,2) not null default 0,
  application_fee_percent  numeric(5,2) not null default 0,
  is_active                boolean not null default true,
  sort_order               integer not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- clients — borrowers
-- ----------------------------------------------------------------------------
create table if not exists public.clients (
  id                  uuid primary key default gen_random_uuid(),
  reference           text unique,
  first_name          text not null,
  last_name           text not null,
  email               text,
  phone               text,
  birth_date          date,
  national_id         text,
  address             text,
  postal_code         text,
  city                text,
  country             text default 'EE',
  marital_status      text,
  dependents          integer default 0,
  employment_status   text,
  employer_name       text,
  monthly_net_income  numeric(12,2),
  monthly_expenses    numeric(12,2),
  housing_status      text,
  credit_history      text,
  risk_category       text check (risk_category in ('A','B','C','D')),
  status              text not null default 'active'
                        check (status in ('prospect','active','inactive','blacklisted')),
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- loans — credits granted
-- ----------------------------------------------------------------------------
create table if not exists public.loans (
  id                 uuid primary key default gen_random_uuid(),
  reference          text unique,
  client_id          uuid not null references public.clients(id) on delete restrict,
  product_id         uuid references public.products(id) on delete set null,
  principal_amount   numeric(12,2) not null,
  annual_rate        numeric(5,2) not null,
  duration_months    integer not null,
  monthly_payment    numeric(12,2) not null default 0,
  total_interest     numeric(12,2) not null default 0,
  total_repayable    numeric(12,2) not null default 0,
  application_fee    numeric(12,2) not null default 0,
  purpose            text,
  risk_category      text check (risk_category in ('A','B','C','D')),
  status             text not null default 'active'
                       check (status in ('draft','active','paid_off','defaulted','cancelled')),
  start_date         date not null default current_date,
  end_date           date,
  disbursed_at       date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- installments — repayment schedule (échéancier) per loan
-- ----------------------------------------------------------------------------
create table if not exists public.installments (
  id                   uuid primary key default gen_random_uuid(),
  loan_id              uuid not null references public.loans(id) on delete cascade,
  sequence             integer not null,
  due_date             date not null,
  amount_due           numeric(12,2) not null,
  principal_component  numeric(12,2) not null default 0,
  interest_component   numeric(12,2) not null default 0,
  amount_paid          numeric(12,2) not null default 0,
  status               text not null default 'pending'
                         check (status in ('pending','partial','paid','late','waived')),
  paid_at              date,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (loan_id, sequence)
);

-- ----------------------------------------------------------------------------
-- payments — money actually received
-- ----------------------------------------------------------------------------
create table if not exists public.payments (
  id              uuid primary key default gen_random_uuid(),
  reference       text unique,
  loan_id         uuid not null references public.loans(id) on delete cascade,
  client_id       uuid references public.clients(id) on delete set null,
  installment_id  uuid references public.installments(id) on delete set null,
  amount          numeric(12,2) not null,
  payment_date    date not null default current_date,
  method          text not null default 'sepa'
                    check (method in ('sepa','transfer','card','cash','mobile_money','other')),
  status          text not null default 'completed'
                    check (status in ('pending','completed','failed','refunded')),
  notes           text,
  created_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- loan_applications — inbound leads from the public site funnel
-- (column set matches app/_lib/applications.ts)
-- ----------------------------------------------------------------------------
create table if not exists public.loan_applications (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid,
  status               text not null default 'submitted'
                         check (status in ('draft','submitted','under_review','approved','rejected','cancelled')),
  credit_type          text,
  amount               numeric(12,2),
  duration             integer,
  monthly_payment      numeric(12,2),
  effective_rate       numeric(6,2),
  country              text,
  first_name           text,
  last_name            text,
  birth_date           text,
  birth_place          text,
  nationality          text,
  marital_status       text,
  id_type              text,
  id_number            text,
  email                text,
  phone                text,
  address              text,
  postal_code          text,
  city                 text,
  address_country      text,
  employer_name        text,
  employer_address     text,
  job_title            text,
  contract_type        text,
  start_date           text,
  monthly_net_income   numeric(12,2),
  document_id_url      text,
  document_income_url  text,
  document_address_url text,
  document_bank_url    text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- import_batches — history of CSV imports
-- ----------------------------------------------------------------------------
create table if not exists public.import_batches (
  id             uuid primary key default gen_random_uuid(),
  entity         text not null check (entity in ('clients','loans','payments')),
  filename       text,
  total_rows     integer not null default 0,
  inserted_rows  integer not null default 0,
  failed_rows    integer not null default 0,
  status         text not null default 'completed'
                   check (status in ('pending','completed','partial','failed')),
  error_log      jsonb,
  created_by     uuid references auth.users(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- activity_log — lightweight audit trail of admin actions
-- ----------------------------------------------------------------------------
create table if not exists public.activity_log (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references auth.users(id) on delete set null,
  actor_email  text,
  action       text not null,
  entity       text,
  entity_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Triggers: updated_at + references
-- ----------------------------------------------------------------------------
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_updated on public.clients;
create trigger trg_clients_updated before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists trg_loans_updated on public.loans;
create trigger trg_loans_updated before update on public.loans
  for each row execute function public.set_updated_at();

drop trigger if exists trg_installments_updated on public.installments;
create trigger trg_installments_updated before update on public.installments
  for each row execute function public.set_updated_at();

drop trigger if exists trg_applications_updated on public.loan_applications;
create trigger trg_applications_updated before update on public.loan_applications
  for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_ref on public.clients;
create trigger trg_clients_ref before insert on public.clients
  for each row execute function public.set_reference('CLI-', 'client_ref_seq');

drop trigger if exists trg_loans_ref on public.loans;
create trigger trg_loans_ref before insert on public.loans
  for each row execute function public.set_reference('LN-', 'loan_ref_seq');

drop trigger if exists trg_payments_ref on public.payments;
create trigger trg_payments_ref before insert on public.payments
  for each row execute function public.set_reference('PAY-', 'payment_ref_seq');

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_clients_status         on public.clients(status);
create index if not exists idx_loans_client           on public.loans(client_id);
create index if not exists idx_loans_status           on public.loans(status);
create index if not exists idx_loans_product          on public.loans(product_id);
create index if not exists idx_loans_start_date        on public.loans(start_date);
create index if not exists idx_installments_loan       on public.installments(loan_id);
create index if not exists idx_installments_due        on public.installments(due_date);
create index if not exists idx_installments_status     on public.installments(status);
create index if not exists idx_payments_loan           on public.payments(loan_id);
create index if not exists idx_payments_client         on public.payments(client_id);
create index if not exists idx_payments_date           on public.payments(payment_date);
create index if not exists idx_applications_status     on public.loan_applications(status);
