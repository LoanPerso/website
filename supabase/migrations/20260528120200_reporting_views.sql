-- ============================================================================
-- Quickfund — Reporting views (P&L, portfolio, overdue)
-- All views use security_invoker so the caller's RLS applies: admins see data,
-- anon sees nothing. Consumed read-only by the admin dashboard.
-- ============================================================================

-- Per-loan balances: collected vs outstanding.
create or replace view public.v_loan_balances
with (security_invoker = on) as
select
  l.id                                                         as loan_id,
  l.reference,
  l.client_id,
  l.principal_amount,
  l.total_repayable,
  l.total_interest,
  l.status,
  coalesce(pay.total_paid, 0)                                  as total_paid,
  greatest(l.total_repayable - coalesce(pay.total_paid, 0), 0) as outstanding_total,
  greatest(l.principal_amount - coalesce(prin.principal_paid, 0), 0) as outstanding_principal
from public.loans l
left join (
  select loan_id, sum(amount) as total_paid
  from public.payments
  where status = 'completed'
  group by loan_id
) pay on pay.loan_id = l.id
left join (
  select loan_id, sum(principal_component) as principal_paid
  from public.installments
  where status = 'paid'
  group by loan_id
) prin on prin.loan_id = l.id;

-- Installment status enriched with overdue flag, days late and remaining amount.
create or replace view public.v_installments_status
with (security_invoker = on) as
select
  i.id,
  i.loan_id,
  i.sequence,
  i.due_date,
  i.amount_due,
  i.principal_component,
  i.interest_component,
  i.amount_paid,
  i.status,
  i.paid_at,
  l.reference                                  as loan_reference,
  l.status                                     as loan_status,
  l.client_id,
  c.reference                                  as client_reference,
  c.first_name,
  c.last_name,
  c.phone,
  c.email,
  greatest(i.amount_due - i.amount_paid, 0)    as amount_remaining,
  (i.status in ('pending','partial','late') and i.due_date < current_date) as is_overdue,
  case
    when i.status in ('pending','partial','late') and i.due_date < current_date
      then (current_date - i.due_date)
    else 0
  end                                          as days_late
from public.installments i
join public.loans l   on l.id = i.loan_id
join public.clients c on c.id = l.client_id;

-- Single-row portfolio KPI snapshot for the dashboard header.
create or replace view public.v_portfolio_kpis
with (security_invoker = on) as
select
  (select count(*) from public.clients)                                              as total_clients,
  (select count(*) from public.clients where status = 'active')                      as active_clients,
  (select count(*) from public.loans)                                                as total_loans,
  (select count(*) from public.loans where status = 'active')                        as active_loans,
  (select count(*) from public.loans where status = 'defaulted')                     as defaulted_loans,
  (select coalesce(sum(principal_amount), 0)
     from public.loans
     where status in ('active','paid_off','defaulted'))                              as total_disbursed,
  (select coalesce(sum(amount), 0)
     from public.payments where status = 'completed')                                as total_collected,
  (select coalesce(sum(outstanding_principal), 0)
     from public.v_loan_balances where status in ('active','defaulted'))             as outstanding_principal,
  (select coalesce(sum(interest_component), 0)
     from public.installments where status = 'paid')                                 as interest_earned,
  (select coalesce(sum(amount_remaining), 0)
     from public.v_installments_status where is_overdue)                             as overdue_amount,
  (select count(*) from public.v_installments_status where is_overdue)               as overdue_installments,
  (select count(distinct loan_id)
     from public.v_installments_status where is_overdue)                             as overdue_loans,
  case
    when (select count(*) from public.loans where status in ('active','paid_off','defaulted')) > 0
      then round(
        100.0 * (select count(*) from public.loans where status = 'defaulted')::numeric
        / (select count(*) from public.loans where status in ('active','paid_off','defaulted')), 2)
    else 0
  end                                                                                as default_rate_pct;

-- Monthly disbursements (volume lent per month) — fuels the P&L bar chart.
create or replace view public.v_monthly_disbursements
with (security_invoker = on) as
select
  to_char(date_trunc('month', start_date), 'YYYY-MM') as month,
  count(*)                                            as loans_count,
  coalesce(sum(principal_amount), 0)                  as total_principal,
  coalesce(sum(total_interest), 0)                    as total_interest
from public.loans
where status in ('active','paid_off','defaulted')
group by 1
order by 1;

-- Monthly collections (cash received per month).
create or replace view public.v_monthly_collections
with (security_invoker = on) as
select
  to_char(date_trunc('month', payment_date), 'YYYY-MM') as month,
  count(*)                                              as payments_count,
  coalesce(sum(amount), 0)                              as total_collected
from public.payments
where status = 'completed'
group by 1
order by 1;

grant select on
  public.v_loan_balances,
  public.v_installments_status,
  public.v_portfolio_kpis,
  public.v_monthly_disbursements,
  public.v_monthly_collections
to authenticated;

-- Defense in depth: keep reporting views off the public (anon) key entirely.
-- (Row views already return nothing for anon via RLS; this also hides the
-- scalar KPI view, which would otherwise expose an all-zeros row.)
revoke select on
  public.v_loan_balances,
  public.v_installments_status,
  public.v_portfolio_kpis,
  public.v_monthly_disbursements,
  public.v_monthly_collections
from anon;
