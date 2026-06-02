-- ============================================================================
-- Quickfund — Finance / P&L
-- Adds the accounting layer the loan portfolio cannot derive on its own:
--   • ledger_entries — manual revenue (coaching, misc) and operating expenses
--     (server fees, management loans, rebranding) booked per month.
--   • v_pnl_monthly — consolidated P&L: loan-derived revenue (interest, fees,
--     penalties) + ledger revenue/expenses + bad debts (write-offs), per month.
--   • v_pnl_summary — single-row totals for the dashboard KPIs.
-- Loan revenue stays DERIVED from installments/loans (never hand-entered); the
-- ledger only holds what the portfolio has no way to know.
-- Currency: EUR.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ledger_entries — manual financial entries (non-loan revenue + expenses)
-- ----------------------------------------------------------------------------
create table if not exists public.ledger_entries (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('revenue','expense')),
  -- free text so categories can grow; known values:
  --   revenue: 'coaching', 'other'
  --   expense: 'server_fees', 'management_loans', 'rebranding', 'other'
  category      text not null default 'other',
  label         text,
  amount        numeric(12,2) not null check (amount >= 0),
  currency      text not null default 'EUR',
  period_month  date not null,            -- normalized to the 1st of its month
  notes         text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Normalize period_month to the first day of the month on insert/update.
create or replace function public.normalize_ledger_period()
returns trigger
language plpgsql
as $$
begin
  new.period_month := date_trunc('month', new.period_month)::date;
  return new;
end;
$$;

drop trigger if exists trg_ledger_normalize on public.ledger_entries;
create trigger trg_ledger_normalize before insert or update on public.ledger_entries
  for each row execute function public.normalize_ledger_period();

drop trigger if exists trg_ledger_updated on public.ledger_entries;
create trigger trg_ledger_updated before update on public.ledger_entries
  for each row execute function public.set_updated_at();

create index if not exists idx_ledger_period   on public.ledger_entries(period_month);
create index if not exists idx_ledger_kind_cat  on public.ledger_entries(kind, category);

-- RLS: admin-only, mirrors the other business tables.
alter table public.ledger_entries enable row level security;
drop policy if exists ledger_entries_admin_all on public.ledger_entries;
create policy ledger_entries_admin_all on public.ledger_entries
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- v_pnl_monthly — consolidated profit & loss per month.
-- ----------------------------------------------------------------------------
create or replace view public.v_pnl_monthly
with (security_invoker = on) as
with
  interest as (
    select date_trunc('month', paid_at)::date as m, sum(interest_component) as v
    from public.installments
    where status = 'paid' and paid_at is not null
    group by 1
  ),
  fees as (
    select date_trunc('month', start_date)::date as m, sum(application_fee) as v
    from public.loans
    where status in ('active','paid_off','defaulted') and coalesce(application_fee,0) > 0
    group by 1
  ),
  penalties as (
    select date_trunc('month', coalesce(paid_at, due_date))::date as m, sum(late_fee) as v
    from public.installments
    where coalesce(late_fee,0) > 0
    group by 1
  ),
  ledger_rev as (
    select period_month as m,
           sum(amount)                                          as total,
           coalesce(sum(amount) filter (where category = 'coaching'), 0) as coaching
    from public.ledger_entries
    where kind = 'revenue'
    group by 1
  ),
  ledger_exp as (
    select period_month as m, sum(amount) as v
    from public.ledger_entries
    where kind = 'expense'
    group by 1
  ),
  baddebt as (
    select date_trunc('month', coalesce(closed_at, updated_at::date))::date as m,
           sum(write_off_amount) as v
    from public.loans
    where closure_reason = 'written_off' and coalesce(write_off_amount,0) > 0
    group by 1
  ),
  months as (
    select m from interest
    union select m from fees
    union select m from penalties
    union select m from ledger_rev
    union select m from ledger_exp
    union select m from baddebt
  )
select
  to_char(mo.m, 'YYYY-MM')                                       as month,
  coalesce(i.v, 0)                                               as interest,
  coalesce(f.v, 0)                                               as application_fees,
  coalesce(p.v, 0)                                               as penalties,
  coalesce(lr.coaching, 0)                                       as coaching,
  greatest(coalesce(lr.total, 0) - coalesce(lr.coaching, 0), 0)  as other_revenue,
  (coalesce(i.v,0) + coalesce(f.v,0) + coalesce(p.v,0) + coalesce(lr.total,0)) as total_revenue,
  coalesce(le.v, 0)                                              as expenses,
  ((coalesce(i.v,0) + coalesce(f.v,0) + coalesce(p.v,0) + coalesce(lr.total,0)) - coalesce(le.v,0)) as displayed_profit,
  coalesce(bd.v, 0)                                              as bad_debts,
  ((coalesce(i.v,0) + coalesce(f.v,0) + coalesce(p.v,0) + coalesce(lr.total,0)) - coalesce(le.v,0) - coalesce(bd.v,0)) as economic_profit
from months mo
left join interest   i  on i.m  = mo.m
left join fees       f  on f.m  = mo.m
left join penalties  p  on p.m  = mo.m
left join ledger_rev lr on lr.m = mo.m
left join ledger_exp le on le.m = mo.m
left join baddebt    bd on bd.m = mo.m
order by mo.m;

-- ----------------------------------------------------------------------------
-- v_pnl_summary — single-row totals (drives the Finance page KPIs).
-- ----------------------------------------------------------------------------
create or replace view public.v_pnl_summary
with (security_invoker = on) as
select
  coalesce(sum(interest), 0)         as interest,
  coalesce(sum(application_fees), 0) as application_fees,
  coalesce(sum(penalties), 0)        as penalties,
  coalesce(sum(coaching), 0)         as coaching,
  coalesce(sum(other_revenue), 0)    as other_revenue,
  coalesce(sum(total_revenue), 0)    as total_revenue,
  coalesce(sum(expenses), 0)         as expenses,
  coalesce(sum(displayed_profit), 0) as displayed_profit,
  coalesce(sum(bad_debts), 0)        as bad_debts,
  coalesce(sum(economic_profit), 0)  as economic_profit,
  case when coalesce(sum(total_revenue),0) > 0
    then round(100.0 * sum(displayed_profit) / sum(total_revenue), 1) else 0 end as displayed_margin_pct,
  case when coalesce(sum(total_revenue),0) > 0
    then round(100.0 * sum(economic_profit) / sum(total_revenue), 1) else 0 end as economic_margin_pct
from public.v_pnl_monthly;

-- ----------------------------------------------------------------------------
-- Grants: reporting views readable by authenticated admins, hidden from anon.
-- ----------------------------------------------------------------------------
grant select on public.v_pnl_monthly, public.v_pnl_summary to authenticated;
revoke select on public.v_pnl_monthly, public.v_pnl_summary from anon;
