-- ============================================================================
-- Quickfund — Analytics views (v_stats_*)
-- Server-side aggregations powering the "Statistiques" workspace. All cheap
-- GROUP BYs over the indexed base tables / reporting views — no large client
-- fetches. security_invoker so admin RLS applies; hidden from anon.
-- "Active book" = loans with status in ('active','defaulted').
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PORTFOLIO
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_portfolio_overview with (security_invoker = on) as
with active as (
  select l.id, l.principal_amount, l.annual_rate, l.duration_months,
         coalesce(bal.outstanding_principal, 0) as outstanding
  from public.loans l
  join public.v_loan_balances bal on bal.loan_id = l.id
  where l.status in ('active','defaulted')
)
select
  count(*)                                                                  as active_loans,
  coalesce(sum(outstanding), 0)                                             as outstanding,
  round(coalesce(avg(outstanding), 0), 2)                                   as avg_balance,
  round(coalesce(percentile_cont(0.5) within group (order by outstanding), 0)::numeric, 2) as median_balance,
  round(coalesce(percentile_cont(0.9) within group (order by outstanding), 0)::numeric, 2) as p90_balance,
  round(coalesce(avg(annual_rate), 0), 2)                                   as avg_rate,
  round(coalesce(avg(duration_months), 0), 1)                               as avg_term
from active;

create or replace view public.v_stats_amount_buckets with (security_invoker = on) as
with b as (
  select
    case when l.principal_amount <= 200 then '1' when l.principal_amount <= 400 then '2'
         when l.principal_amount <= 700 then '3' when l.principal_amount <= 1000 then '4'
         when l.principal_amount <= 1500 then '5' else '6' end as bk,
    l.principal_amount,
    coalesce(bal.outstanding_principal, 0) as outstanding
  from public.loans l
  left join public.v_loan_balances bal on bal.loan_id = l.id
  where l.status in ('active','defaulted')
)
select bk as bucket,
  case bk when '1' then '50-200 €' when '2' then '201-400 €' when '3' then '401-700 €'
          when '4' then '701-1000 €' when '5' then '1001-1500 €' else '1500 €+' end as label,
  count(*) as loans, coalesce(sum(principal_amount), 0) as principal, coalesce(sum(outstanding), 0) as outstanding
from b group by bk order by bk;

create or replace view public.v_stats_duration_buckets with (security_invoker = on) as
select
  case when duration_months <= 6 then '1' when duration_months <= 12 then '2'
       when duration_months <= 24 then '3' when duration_months <= 36 then '4' else '5' end as bucket,
  case when duration_months <= 6 then '≤ 6 mois' when duration_months <= 12 then '7-12 mois'
       when duration_months <= 24 then '13-24 mois' when duration_months <= 36 then '25-36 mois' else '37 mois +' end as label,
  count(*) as loans, coalesce(sum(principal_amount), 0) as principal
from public.loans where status in ('active','defaulted')
group by 1, 2 order by 1;

create or replace view public.v_stats_by_product with (security_invoker = on) as
select p.slug, p.name,
  count(l.id) filter (where l.status in ('active','defaulted','paid_off'))             as loans,
  count(l.id) filter (where l.status in ('active','defaulted'))                        as active_loans,
  coalesce(sum(l.principal_amount) filter (where l.status in ('active','defaulted','paid_off')), 0) as disbursed,
  coalesce(sum(bal.outstanding_principal) filter (where l.status in ('active','defaulted')), 0)      as outstanding,
  count(l.id) filter (where l.status = 'defaulted')                                    as defaulted,
  coalesce(sum(l.write_off_amount), 0)                                                 as written_off,
  round(coalesce(avg(l.annual_rate) filter (where l.status in ('active','defaulted')), 0), 2) as avg_rate,
  (select coalesce(sum(i.interest_component), 0)
     from public.installments i join public.loans l3 on l3.id = i.loan_id
     where l3.product_id = p.id and i.status = 'paid')                                 as interest_earned
from public.products p
left join public.loans l         on l.product_id = p.id
left join public.v_loan_balances bal on bal.loan_id = l.id
group by p.id, p.slug, p.name, p.sort_order
order by p.sort_order;

create or replace view public.v_stats_by_country with (security_invoker = on) as
select coalesce(c.country, '??') as country,
  count(distinct c.id)                                                                 as clients,
  count(l.id) filter (where l.status in ('active','defaulted'))                        as active_loans,
  coalesce(sum(bal.outstanding_principal) filter (where l.status in ('active','defaulted')), 0) as outstanding
from public.clients c
left join public.loans l         on l.client_id = c.id
left join public.v_loan_balances bal on bal.loan_id = l.id
group by coalesce(c.country, '??')
order by outstanding desc;

-- ---------------------------------------------------------------------------
-- RISK & SCORING
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_risk_by_category with (security_invoker = on) as
select coalesce(l.risk_category, '?') as category,
  count(*) filter (where l.status in ('active','defaulted'))                           as loans,
  coalesce(sum(bal.outstanding_principal) filter (where l.status in ('active','defaulted')), 0) as exposure,
  count(*) filter (where l.status = 'defaulted')                                       as defaulted,
  coalesce(sum(l.write_off_amount), 0)                                                 as written_off,
  round(coalesce(avg(l.annual_rate) filter (where l.status in ('active','defaulted')), 0), 2) as avg_rate,
  case when count(*) filter (where l.status in ('active','paid_off','defaulted')) > 0
    then round(100.0 * count(*) filter (where l.status = 'defaulted')
      / count(*) filter (where l.status in ('active','paid_off','defaulted')), 2) else 0 end as default_rate_pct
from public.loans l
left join public.v_loan_balances bal on bal.loan_id = l.id
group by coalesce(l.risk_category, '?')
order by category;

create or replace view public.v_stats_score_bands with (security_invoker = on) as
select
  case when credit_score is null then '0' when credit_score < 40 then '1'
       when credit_score < 60 then '2' when credit_score < 80 then '3' else '4' end as band,
  case when credit_score is null then 'Sans score' when credit_score < 40 then '0-39'
       when credit_score < 60 then '40-59' when credit_score < 80 then '60-79' else '80-100' end as label,
  count(*) as clients, round(coalesce(avg(credit_score), 0), 1) as avg_score
from public.clients group by 1, 2 order by 1;

-- ---------------------------------------------------------------------------
-- COLLECTIONS / DPD
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_dpd_buckets with (security_invoker = on) as
select
  case when s.days_late <= 30 then '1' when s.days_late <= 60 then '2'
       when s.days_late <= 90 then '3' else '4' end as bucket,
  case when s.days_late <= 30 then '1-30 j' when s.days_late <= 60 then '31-60 j'
       when s.days_late <= 90 then '61-90 j' else '90 j +' end as label,
  count(*)                          as installments,
  count(distinct s.loan_id)         as loans,
  coalesce(sum(s.amount_remaining), 0) as amount,
  coalesce(sum(i.late_fee), 0)      as late_fees
from public.v_installments_status s
join public.installments i on i.id = s.id
where s.is_overdue
group by 1, 2 order by 1;

create or replace view public.v_stats_dunning with (security_invoker = on) as
select dunning_level,
  count(*)                       as loans,
  coalesce(sum(overdue_amount), 0) as arrears,
  coalesce(sum(late_fees), 0)    as late_fees
from public.v_loan_arrears group by dunning_level order by dunning_level;

-- ---------------------------------------------------------------------------
-- CASHFLOW (realized + projected)
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_cashflow_monthly with (security_invoker = on) as
with realized as (
  select date_trunc('month', payment_date)::date as m, sum(amount) as v
  from public.payments where status = 'completed' group by 1
),
projected as (
  select date_trunc('month', due_date)::date as m,
         sum(amount_due) as due, sum(principal_component) as principal, sum(interest_component) as interest
  from public.installments where status in ('pending','partial','late') group by 1
),
months as (select m from realized union select m from projected)
select to_char(mo.m, 'YYYY-MM') as month,
  coalesce(r.v, 0)         as realized,
  coalesce(p.due, 0)       as projected_due,
  coalesce(p.principal, 0) as projected_principal,
  coalesce(p.interest, 0)  as projected_interest
from months mo
left join realized r on r.m = mo.m
left join projected p on p.m = mo.m
order by mo.m;

-- ---------------------------------------------------------------------------
-- VINTAGES / COHORTS (by origination month)
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_vintages with (security_invoker = on) as
select to_char(date_trunc('month', l.start_date), 'YYYY-MM') as cohort,
  count(*)                                                                              as loans,
  coalesce(sum(l.principal_amount), 0)                                                  as disbursed,
  coalesce(sum(l.principal_amount - coalesce(bal.outstanding_principal, 0)), 0)         as repaid_principal,
  coalesce(sum(bal.outstanding_principal) filter (where l.status in ('active','defaulted')), 0) as outstanding,
  coalesce(sum(l.write_off_amount), 0)                                                  as written_off,
  count(*) filter (where l.status = 'defaulted')                                        as defaulted,
  case when sum(l.principal_amount) > 0
    then round(100.0 * sum(l.principal_amount - coalesce(bal.outstanding_principal, 0)) / sum(l.principal_amount), 1)
    else 0 end                                                                          as repaid_pct,
  case when count(*) > 0
    then round(100.0 * count(*) filter (where l.status = 'defaulted') / count(*), 1) else 0 end as default_pct
from public.loans l
left join public.v_loan_balances bal on bal.loan_id = l.id
where l.status in ('active','paid_off','defaulted')
group by date_trunc('month', l.start_date)
order by 1;

-- ---------------------------------------------------------------------------
-- CLIENTS / SEGMENTATION
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_clients_overview with (security_invoker = on) as
select
  count(*)                                                          as total_clients,
  count(*) filter (where status = 'active')                         as active_clients,
  (select count(distinct client_id) from public.loans where status in ('active','defaulted')) as borrowers,
  (select count(*) from (select client_id from public.loans where status in ('active','defaulted')
     group by client_id having count(*) > 1) x)                     as multi_loan_clients,
  round(coalesce(avg(monthly_net_income), 0), 0)                    as avg_income
from public.clients;

create or replace view public.v_stats_clients_by_status with (security_invoker = on) as
select status, count(*) as clients from public.clients group by status order by status;

create or replace view public.v_stats_clients_by_income with (security_invoker = on) as
select
  case when monthly_net_income is null then '0' when monthly_net_income < 1500 then '1'
       when monthly_net_income < 2500 then '2' when monthly_net_income < 3500 then '3' else '4' end as band,
  case when monthly_net_income is null then 'NC' when monthly_net_income < 1500 then '< 1500 €'
       when monthly_net_income < 2500 then '1500-2500 €' when monthly_net_income < 3500 then '2500-3500 €' else '3500 €+' end as label,
  count(*) as clients
from public.clients group by 1, 2 order by 1;

create or replace view public.v_stats_client_exposure with (security_invoker = on) as
select c.id as client_id, c.reference, c.first_name, c.last_name, c.risk_category,
  count(l.id) filter (where l.status in ('active','defaulted'))                        as active_loans,
  coalesce(sum(bal.outstanding_principal) filter (where l.status in ('active','defaulted')), 0) as exposure
from public.clients c
left join public.loans l         on l.client_id = c.id
left join public.v_loan_balances bal on bal.loan_id = l.id
group by c.id, c.reference, c.first_name, c.last_name, c.risk_category;

-- ---------------------------------------------------------------------------
-- ORIGINATION / FUNNEL
-- ---------------------------------------------------------------------------
create or replace view public.v_stats_funnel with (security_invoker = on) as
select status, count(*) as apps, coalesce(sum(amount), 0) as amount, round(coalesce(avg(score), 0), 0) as avg_score
from public.loan_applications group by status order by status;

create or replace view public.v_stats_funnel_overview with (security_invoker = on) as
select
  count(*)                                                          as total,
  count(*) filter (where converted_client_id is not null)           as converted,
  count(*) filter (where status = 'approved')                       as approved,
  count(*) filter (where status = 'rejected')                       as rejected,
  case when count(*) > 0
    then round(100.0 * count(*) filter (where converted_client_id is not null) / count(*), 1) else 0 end as conversion_rate,
  round(coalesce(avg(score), 0), 0)                                 as avg_score,
  coalesce(sum(amount), 0)                                          as total_amount
from public.loan_applications;

create or replace view public.v_stats_by_source with (security_invoker = on) as
select coalesce(source, 'direct') as source,
  count(*)                                               as apps,
  count(*) filter (where converted_client_id is not null) as converted
from public.loan_applications group by coalesce(source, 'direct') order by apps desc;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
do $$
declare v text;
begin
  foreach v in array array[
    'v_stats_portfolio_overview','v_stats_amount_buckets','v_stats_duration_buckets',
    'v_stats_by_product','v_stats_by_country','v_stats_risk_by_category','v_stats_score_bands',
    'v_stats_dpd_buckets','v_stats_dunning','v_stats_cashflow_monthly','v_stats_vintages',
    'v_stats_clients_overview','v_stats_clients_by_status','v_stats_clients_by_income',
    'v_stats_client_exposure','v_stats_funnel','v_stats_funnel_overview','v_stats_by_source'
  ] loop
    execute format('grant select on public.%I to authenticated;', v);
    execute format('revoke select on public.%I from anon;', v);
  end loop;
end;
$$;
