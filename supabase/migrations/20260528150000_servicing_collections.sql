-- ============================================================================
-- Quickfund — Loan servicing & collections
-- Additive columns + an arrears view so the back office can service a live book:
--   • installments carry an accruable late fee (penalty)
--   • loans track their closure (settlement / write-off) and dunning state
--   • v_loan_arrears aggregates overdue exposure per loan for the collections desk
-- Additive and idempotent: safe to re-run.
-- ============================================================================

-- Late fee accrued on an overdue installment (penalty), kept separate from amount_due
-- so the contractual schedule stays intact while arrears can carry a charge.
alter table public.installments
  add column if not exists late_fee numeric(12,2) not null default 0;

-- Loan closure & collections state.
alter table public.loans
  add column if not exists closed_at        date,
  add column if not exists closure_reason   text
    check (closure_reason in ('settled_early','paid_off','written_off','cancelled')),
  add column if not exists write_off_amount numeric(12,2) not null default 0,
  add column if not exists dunning_level    integer not null default 0,
  add column if not exists next_action_date date;

create index if not exists idx_loans_dunning      on public.loans(dunning_level);
create index if not exists idx_loans_next_action   on public.loans(next_action_date);

-- ----------------------------------------------------------------------------
-- v_loan_arrears — per-loan overdue exposure for the collections workspace.
-- One row per loan that currently carries at least one overdue installment.
-- ----------------------------------------------------------------------------
create or replace view public.v_loan_arrears
with (security_invoker = on) as
select
  l.id                                                       as loan_id,
  l.reference                                                as loan_reference,
  l.status                                                   as loan_status,
  l.client_id,
  c.reference                                                as client_reference,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  l.dunning_level,
  l.next_action_date,
  count(*)                                                   as overdue_count,
  coalesce(sum(s.amount_remaining), 0)                       as overdue_amount,
  coalesce(sum(i.late_fee), 0)                               as late_fees,
  max(s.days_late)                                           as max_days_late,
  min(s.due_date)                                            as oldest_due_date,
  (greatest(l.total_repayable - coalesce(b.total_paid, 0), 0)) as outstanding_total
from public.loans l
join public.clients c               on c.id = l.client_id
join public.v_installments_status s on s.loan_id = l.id and s.is_overdue
join public.installments i          on i.id = s.id
left join public.v_loan_balances b  on b.loan_id = l.id
where l.status in ('active','defaulted')
group by l.id, l.reference, l.status, l.client_id, c.reference,
         c.first_name, c.last_name, c.phone, c.email, l.dunning_level,
         l.next_action_date, b.total_paid;

grant select on public.v_loan_arrears to authenticated;
revoke select on public.v_loan_arrears from anon;
