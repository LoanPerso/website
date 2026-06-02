-- ============================================================================
-- Quickfund — Analytics RPC (rpc_stats_*)
-- Parameterised, server-side aggregations powering the "Statistiques" workspace.
-- The book exceeds the PostgREST 1000-row cap (~2k loans, ~48k installments), so
-- every page aggregates server-side and returns ONE json payload per call:
--   • one round-trip per page, all sub-aggregations share the same filtered base
--   • a common filter surface: date window (origination / period) + dimensions
--     (product, country, risk, status, source) — each null = "all".
-- security_invoker (default) so admin RLS applies exactly like the v_* views.
-- "Active book" = loans with status in ('active','defaulted').
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PORTFOLIO
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_portfolio(
  p_from date default null, p_to date default null,
  p_product text default null, p_country text default null,
  p_risk text default null, p_status text default null
) returns json language sql stable security invoker set search_path = public as $$
with f as (
  select l.id, l.principal_amount, l.annual_rate, l.duration_months, l.status,
         l.start_date, coalesce(l.write_off_amount,0) as write_off_amount, l.risk_category,
         coalesce(b.outstanding_principal,0) as out_principal,
         p.slug as product_slug, p.name as product_name, p.sort_order, c.country
  from public.loans l
  left join public.v_loan_balances b on b.loan_id = l.id
  left join public.products p on p.id = l.product_id
  left join public.clients c on c.id = l.client_id
  where (p_from is null or l.start_date >= p_from)
    and (p_to is null or l.start_date <= p_to)
    and (p_product is null or p.slug = p_product)
    and (p_country is null or c.country = p_country)
    and (p_risk is null or l.risk_category = p_risk)
    and (p_status is null or l.status = p_status)
),
ie as (
  select coalesce(sum(i.interest_component),0) as interest_earned
  from public.installments i where i.status='paid' and i.loan_id in (select id from f)
)
select json_build_object(
  'overview', (select json_build_object(
    'loans', count(*),
    'active_loans', count(*) filter (where status in ('active','defaulted')),
    'disbursed', coalesce(sum(principal_amount),0),
    'outstanding', coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0),
    'avg_balance', round(coalesce(avg(out_principal) filter (where status in ('active','defaulted')),0),2),
    'median_balance', round(coalesce((select percentile_cont(0.5) within group (order by out_principal) from f where status in ('active','defaulted')),0)::numeric,2),
    'p90_balance', round(coalesce((select percentile_cont(0.9) within group (order by out_principal) from f where status in ('active','defaulted')),0)::numeric,2),
    'avg_rate', round(coalesce(avg(annual_rate) filter (where status in ('active','defaulted')),0),2),
    'avg_term', round(coalesce(avg(duration_months) filter (where status in ('active','defaulted')),0),1),
    'written_off', coalesce(sum(write_off_amount),0),
    'defaulted', count(*) filter (where status='defaulted'),
    'default_rate_pct', case when count(*) filter (where status in ('active','paid_off','defaulted'))>0
      then round(100.0*count(*) filter (where status='defaulted')/count(*) filter (where status in ('active','paid_off','defaulted')),2) else 0 end,
    'interest_earned', (select interest_earned from ie)
  ) from f),
  'amount_buckets', (select coalesce(json_agg(json_build_object('bucket',bk,'label',lbl,'loans',loans,'principal',principal,'outstanding',outstanding) order by bk),'[]'::json) from (
    select bk, max(lbl) lbl, count(*) loans, coalesce(sum(principal_amount),0) principal,
           coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) outstanding
    from (select f.*,
      case when principal_amount<=200 then '1' when principal_amount<=400 then '2' when principal_amount<=700 then '3'
           when principal_amount<=1000 then '4' when principal_amount<=1500 then '5' else '6' end bk,
      case when principal_amount<=200 then '50-200 €' when principal_amount<=400 then '201-400 €' when principal_amount<=700 then '401-700 €'
           when principal_amount<=1000 then '701-1000 €' when principal_amount<=1500 then '1001-1500 €' else '1500 €+' end lbl
      from f) x group by bk) z),
  'duration_buckets', (select coalesce(json_agg(json_build_object('bucket',bk,'label',lbl,'loans',loans,'principal',principal,'outstanding',outstanding) order by bk),'[]'::json) from (
    select bk, max(lbl) lbl, count(*) loans, coalesce(sum(principal_amount),0) principal,
           coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) outstanding
    from (select f.*,
      case when duration_months<=6 then '1' when duration_months<=12 then '2' when duration_months<=24 then '3'
           when duration_months<=36 then '4' else '5' end bk,
      case when duration_months<=6 then '≤ 6 mois' when duration_months<=12 then '7-12 mois' when duration_months<=24 then '13-24 mois'
           when duration_months<=36 then '25-36 mois' else '37 mois +' end lbl
      from f) x group by bk) z),
  'by_product', (select coalesce(json_agg(json_build_object('slug',product_slug,'name',product_name,'loans',loans,
    'active_loans',active_loans,'disbursed',disbursed,'outstanding',outstanding,'avg_rate',avg_rate,'default_rate_pct',default_rate_pct) order by sort_order),'[]'::json) from (
    select product_slug, product_name, sort_order, count(*) loans,
      count(*) filter (where status in ('active','defaulted')) active_loans,
      coalesce(sum(principal_amount),0) disbursed,
      coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) outstanding,
      round(coalesce(avg(annual_rate) filter (where status in ('active','defaulted')),0),2) avg_rate,
      case when count(*) filter (where status in ('active','paid_off','defaulted'))>0
        then round(100.0*count(*) filter (where status='defaulted')/count(*) filter (where status in ('active','paid_off','defaulted')),2) else 0 end default_rate_pct
    from f where product_slug is not null group by product_slug, product_name, sort_order) z),
  'by_country', (select coalesce(json_agg(json_build_object('country',country,'loans',loans,'active_loans',active_loans,'outstanding',outstanding) order by outstanding desc),'[]'::json) from (
    select coalesce(country,'??') country, count(*) loans,
      count(*) filter (where status in ('active','defaulted')) active_loans,
      coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) outstanding
    from f group by coalesce(country,'??')) z),
  'by_status', (select coalesce(json_agg(json_build_object('status',status,'loans',loans,'principal',principal,'outstanding',outstanding) order by loans desc),'[]'::json) from (
    select status, count(*) loans, coalesce(sum(principal_amount),0) principal,
      coalesce(sum(out_principal),0) outstanding from f group by status) z),
  'origination_monthly', (select coalesce(json_agg(json_build_object('month',to_char(m,'YYYY-MM'),'loans',loans,'disbursed',disbursed) order by m),'[]'::json) from (
    select date_trunc('month',start_date) m, count(*) loans, coalesce(sum(principal_amount),0) disbursed from f group by 1) z)
);
$$;

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_products(
  p_from date default null, p_to date default null,
  p_country text default null, p_risk text default null
) returns json language sql stable security invoker set search_path = public as $$
with f as (
  select l.id, l.principal_amount, l.annual_rate, l.duration_months, l.status,
         coalesce(l.write_off_amount,0) as write_off_amount,
         coalesce(b.outstanding_principal,0) as out_principal,
         p.id as product_id, p.slug as product_slug, p.name as product_name, p.sort_order
  from public.loans l
  left join public.v_loan_balances b on b.loan_id = l.id
  left join public.products p on p.id = l.product_id
  left join public.clients c on c.id = l.client_id
  where (p_from is null or l.start_date >= p_from)
    and (p_to is null or l.start_date <= p_to)
    and (p_country is null or c.country = p_country)
    and (p_risk is null or l.risk_category = p_risk)
    and p.id is not null
),
ie as (
  select l.product_id, coalesce(sum(i.interest_component),0) interest_earned
  from public.installments i join public.loans l on l.id = i.loan_id
  where i.status='paid' and i.loan_id in (select id from f) group by l.product_id
),
agg as (
  select f.product_slug, f.product_name, f.sort_order, f.product_id,
    count(*) loans, count(*) filter (where status in ('active','defaulted')) active_loans,
    coalesce(sum(principal_amount),0) disbursed,
    coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) outstanding,
    count(*) filter (where status='defaulted') defaulted,
    coalesce(sum(write_off_amount),0) written_off,
    round(coalesce(avg(annual_rate) filter (where status in ('active','defaulted')),0),2) avg_rate,
    round(coalesce(avg(duration_months) filter (where status in ('active','defaulted')),0),1) avg_term,
    case when count(*) filter (where status in ('active','paid_off','defaulted'))>0
      then round(100.0*count(*) filter (where status='defaulted')/count(*) filter (where status in ('active','paid_off','defaulted')),2) else 0 end default_rate_pct
  from f group by f.product_slug, f.product_name, f.sort_order, f.product_id
)
select json_build_object(
  'totals', (select json_build_object('products',count(*),'loans',coalesce(sum(loans),0),'active_loans',coalesce(sum(active_loans),0),
    'disbursed',coalesce(sum(disbursed),0),'outstanding',coalesce(sum(outstanding),0),
    'interest_earned',(select coalesce(sum(interest_earned),0) from ie),'written_off',coalesce(sum(written_off),0)) from agg),
  'products', (select coalesce(json_agg(json_build_object('slug',product_slug,'name',product_name,'loans',loans,'active_loans',active_loans,
    'disbursed',disbursed,'outstanding',outstanding,'defaulted',defaulted,'written_off',written_off,'avg_rate',avg_rate,'avg_term',avg_term,
    'default_rate_pct',default_rate_pct,'interest_earned',coalesce(ie.interest_earned,0),
    'yield_pct', case when disbursed>0 then round(100.0*coalesce(ie.interest_earned,0)/disbursed,2) else 0 end,
    'avg_ticket', case when loans>0 then round(disbursed/loans,2) else 0 end) order by sort_order),'[]'::json)
    from agg left join ie on ie.product_id = agg.product_id)
);
$$;

-- ---------------------------------------------------------------------------
-- RISK & SCORING
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_risk(
  p_from date default null, p_to date default null,
  p_product text default null, p_country text default null, p_risk text default null
) returns json language sql stable security invoker set search_path = public as $$
with f as (
  select l.id, l.principal_amount, l.annual_rate, l.duration_months, l.status,
         coalesce(l.write_off_amount,0) as write_off_amount, l.risk_category,
         coalesce(b.outstanding_principal,0) as out_principal,
         p.slug as product_slug, p.name as product_name, p.sort_order
  from public.loans l
  left join public.v_loan_balances b on b.loan_id = l.id
  left join public.products p on p.id = l.product_id
  left join public.clients c on c.id = l.client_id
  where (p_from is null or l.start_date >= p_from)
    and (p_to is null or l.start_date <= p_to)
    and (p_product is null or p.slug = p_product)
    and (p_country is null or c.country = p_country)
    and (p_risk is null or l.risk_category = p_risk)
),
cf as (
  select c.id, c.credit_score, coalesce(sum(b.outstanding_principal) filter (where l.status in ('active','defaulted')),0) exposure
  from public.clients c
  left join public.loans l on l.client_id = c.id
  left join public.v_loan_balances b on b.loan_id = l.id
  where (p_country is null or c.country = p_country) and (p_risk is null or c.risk_category = p_risk)
  group by c.id, c.credit_score
)
select json_build_object(
  'overview', (select json_build_object(
    'exposure', coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0),
    'loans', count(*) filter (where status in ('active','defaulted')),
    'defaulted', count(*) filter (where status='defaulted'),
    'written_off', coalesce(sum(write_off_amount),0),
    'avg_rate', round(coalesce(avg(annual_rate) filter (where status in ('active','defaulted')),0),2),
    'default_rate_pct', case when count(*) filter (where status in ('active','paid_off','defaulted'))>0
      then round(100.0*count(*) filter (where status='defaulted')/count(*) filter (where status in ('active','paid_off','defaulted')),2) else 0 end
  ) from f),
  'by_category', (select coalesce(json_agg(json_build_object('category',category,'loans',loans,'exposure',exposure,'disbursed',disbursed,
    'defaulted',defaulted,'written_off',written_off,'avg_rate',avg_rate,'default_rate_pct',default_rate_pct,
    'share_pct', case when (select nullif(sum(exposure),0) from (select coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) exposure from f group by coalesce(risk_category,'?')) s) is not null
      then round(100.0*exposure/(select sum(exposure) from (select coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) exposure from f group by coalesce(risk_category,'?')) s2),1) else 0 end) order by category),'[]'::json) from (
    select coalesce(risk_category,'?') category,
      count(*) filter (where status in ('active','defaulted')) loans,
      coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) exposure,
      coalesce(sum(principal_amount),0) disbursed,
      count(*) filter (where status='defaulted') defaulted,
      coalesce(sum(write_off_amount),0) written_off,
      round(coalesce(avg(annual_rate) filter (where status in ('active','defaulted')),0),2) avg_rate,
      case when count(*) filter (where status in ('active','paid_off','defaulted'))>0
        then round(100.0*count(*) filter (where status='defaulted')/count(*) filter (where status in ('active','paid_off','defaulted')),2) else 0 end default_rate_pct
    from f group by coalesce(risk_category,'?')) z),
  'score_bands', (select coalesce(json_agg(json_build_object('band',band,'label',lbl,'clients',clients,'avg_score',avg_score,'exposure',exposure) order by band),'[]'::json) from (
    select band, max(lbl) lbl, count(*) clients, round(coalesce(avg(credit_score),0),1) avg_score, coalesce(sum(exposure),0) exposure
    from (select cf.*,
      case when credit_score is null then '0' when credit_score<40 then '1' when credit_score<60 then '2' when credit_score<80 then '3' else '4' end band,
      case when credit_score is null then 'Sans score' when credit_score<40 then '0-39' when credit_score<60 then '40-59' when credit_score<80 then '60-79' else '80-100' end lbl
      from cf) x group by band) z),
  'default_by_amount', (select coalesce(json_agg(json_build_object('bucket',bk,'label',lbl,'loans',loans,'defaulted',defaulted,'default_rate_pct',default_rate_pct) order by bk),'[]'::json) from (
    select bk, max(lbl) lbl, count(*) loans, count(*) filter (where status='defaulted') defaulted,
      case when count(*) filter (where status in ('active','paid_off','defaulted'))>0
        then round(100.0*count(*) filter (where status='defaulted')/count(*) filter (where status in ('active','paid_off','defaulted')),2) else 0 end default_rate_pct
    from (select f.*,
      case when principal_amount<=200 then '1' when principal_amount<=400 then '2' when principal_amount<=700 then '3'
           when principal_amount<=1000 then '4' when principal_amount<=1500 then '5' else '6' end bk,
      case when principal_amount<=200 then '50-200 €' when principal_amount<=400 then '201-400 €' when principal_amount<=700 then '401-700 €'
           when principal_amount<=1000 then '701-1000 €' when principal_amount<=1500 then '1001-1500 €' else '1500 €+' end lbl
      from f) x group by bk) z),
  'exposure_by_product', (select coalesce(json_agg(json_build_object('slug',product_slug,'name',product_name,'exposure',exposure) order by exposure desc),'[]'::json) from (
    select product_slug, product_name, coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) exposure
    from f where product_slug is not null group by product_slug, product_name) z)
);
$$;

-- ---------------------------------------------------------------------------
-- VINTAGES / COHORTS (by origination month)
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_vintages(
  p_from date default null, p_to date default null,
  p_product text default null, p_risk text default null
) returns json language sql stable security invoker set search_path = public as $$
with f as (
  select l.id, l.principal_amount, l.annual_rate, l.duration_months, l.status, l.start_date,
         coalesce(l.write_off_amount,0) as write_off_amount,
         coalesce(b.outstanding_principal,0) as out_principal
  from public.loans l
  left join public.v_loan_balances b on b.loan_id = l.id
  left join public.products p on p.id = l.product_id
  where l.status in ('active','paid_off','defaulted')
    and (p_from is null or l.start_date >= p_from)
    and (p_to is null or l.start_date <= p_to)
    and (p_product is null or p.slug = p_product)
    and (p_risk is null or l.risk_category = p_risk)
),
v as (
  select to_char(date_trunc('month',start_date),'YYYY-MM') cohort, date_trunc('month',start_date) m,
    count(*) loans, coalesce(sum(principal_amount),0) disbursed,
    coalesce(sum(principal_amount - out_principal),0) repaid_principal,
    coalesce(sum(out_principal) filter (where status in ('active','defaulted')),0) outstanding,
    coalesce(sum(write_off_amount),0) written_off, count(*) filter (where status='defaulted') defaulted,
    round(coalesce(avg(annual_rate),0),2) avg_rate, round(coalesce(avg(duration_months),0),1) avg_term,
    case when sum(principal_amount)>0 then round(100.0*sum(principal_amount - out_principal)/sum(principal_amount),1) else 0 end repaid_pct,
    case when count(*)>0 then round(100.0*count(*) filter (where status='defaulted')/count(*),1) else 0 end default_pct,
    case when sum(principal_amount)>0 then round(100.0*sum(write_off_amount)/sum(principal_amount),1) else 0 end loss_pct
  from f group by 1,2
)
select json_build_object(
  'overview', (select json_build_object('cohorts',count(*),'disbursed',coalesce(sum(disbursed),0),
    'repaid_principal',coalesce(sum(repaid_principal),0),'outstanding',coalesce(sum(outstanding),0),
    'written_off',coalesce(sum(written_off),0),'loans',coalesce(sum(loans),0),
    'avg_repaid_pct',round(coalesce(avg(repaid_pct),0),1),'avg_default_pct',round(coalesce(avg(default_pct),0),1),
    'weighted_loss_pct', case when sum(disbursed)>0 then round(100.0*sum(written_off)/sum(disbursed),2) else 0 end) from v),
  'cohorts', (select coalesce(json_agg(json_build_object('cohort',cohort,'loans',loans,'disbursed',disbursed,
    'repaid_principal',repaid_principal,'outstanding',outstanding,'written_off',written_off,'defaulted',defaulted,
    'avg_rate',avg_rate,'avg_term',avg_term,'repaid_pct',repaid_pct,'default_pct',default_pct,'loss_pct',loss_pct) order by m),'[]'::json) from v)
);
$$;

-- ---------------------------------------------------------------------------
-- COLLECTIONS / DPD
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_collections(
  p_from date default null, p_to date default null,
  p_product text default null, p_risk text default null
) returns json language sql stable security invoker set search_path = public as $$
with fl as (
  select l.id, l.risk_category, p.slug as product_slug, p.name as product_name
  from public.loans l
  left join public.products p on p.id = l.product_id
  where l.status in ('active','defaulted')
    and (p_from is null or l.start_date >= p_from)
    and (p_to is null or l.start_date <= p_to)
    and (p_product is null or p.slug = p_product)
    and (p_risk is null or l.risk_category = p_risk)
),
a as (
  select ar.* from public.v_loan_arrears ar where ar.loan_id in (select id from fl)
)
select json_build_object(
  'summary', (select json_build_object(
    'total_overdue_amount', coalesce(sum(overdue_amount),0), 'total_late_fees', coalesce(sum(late_fees),0),
    'arrears_loans', count(*), 'affected_clients', count(distinct client_id),
    'overdue_count', coalesce(sum(overdue_count),0), 'outstanding_at_risk', coalesce(sum(outstanding_total),0),
    'avg_days_late', round(coalesce(avg(max_days_late),0),0)) from a),
  'dpd_buckets', (select coalesce(json_agg(json_build_object('bucket',bk,'label',lbl,'installments',installments,'loans',loans,'amount',amount,'late_fees',late_fees) order by bk),'[]'::json) from (
    select bk, max(lbl) lbl, count(*) installments, count(distinct loan_id) loans,
      coalesce(sum(amount_remaining),0) amount, coalesce(sum(late_fee),0) late_fees
    from (select s.loan_id, s.amount_remaining, i.late_fee, s.days_late,
      case when s.days_late<=30 then '1' when s.days_late<=60 then '2' when s.days_late<=90 then '3' else '4' end bk,
      case when s.days_late<=30 then '1-30 j' when s.days_late<=60 then '31-60 j' when s.days_late<=90 then '61-90 j' else '90 j +' end lbl
      from public.v_installments_status s join public.installments i on i.id = s.id
      where s.is_overdue and s.loan_id in (select id from fl)) x group by bk) z),
  'dunning', (select coalesce(json_agg(json_build_object('dunning_level',dunning_level,'loans',loans,'arrears',arrears,'late_fees',late_fees) order by dunning_level),'[]'::json) from (
    select dunning_level, count(*) loans, coalesce(sum(overdue_amount),0) arrears, coalesce(sum(late_fees),0) late_fees
    from a group by dunning_level) z),
  'by_product', (select coalesce(json_agg(json_build_object('slug',product_slug,'name',product_name,'arrears_loans',arrears_loans,'overdue_amount',overdue_amount,'late_fees',late_fees) order by overdue_amount desc),'[]'::json) from (
    select fl.product_slug, fl.product_name, count(a.loan_id) arrears_loans, coalesce(sum(a.overdue_amount),0) overdue_amount, coalesce(sum(a.late_fees),0) late_fees
    from fl join a on a.loan_id = fl.id where fl.product_slug is not null group by fl.product_slug, fl.product_name) z),
  'by_risk', (select coalesce(json_agg(json_build_object('category',category,'arrears_loans',arrears_loans,'overdue_amount',overdue_amount) order by category),'[]'::json) from (
    select coalesce(fl.risk_category,'?') category, count(a.loan_id) arrears_loans, coalesce(sum(a.overdue_amount),0) overdue_amount
    from fl join a on a.loan_id = fl.id group by coalesce(fl.risk_category,'?')) z),
  'top_arrears', (select coalesce(json_agg(t),'[]'::json) from (
    select loan_id, loan_reference, first_name, last_name, overdue_amount, late_fees, max_days_late, dunning_level, overdue_count
    from a order by overdue_amount desc limit 12) t)
);
$$;

-- ---------------------------------------------------------------------------
-- CASHFLOW (realized + projected)
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_cashflow(
  p_from date default null, p_to date default null, p_product text default null
) returns json language sql stable security invoker set search_path = public as $$
with realized as (
  select date_trunc('month', pmt.payment_date)::date m, sum(pmt.amount) v, count(*) c
  from public.payments pmt join public.loans l on l.id = pmt.loan_id left join public.products p on p.id = l.product_id
  where pmt.status='completed'
    and (p_from is null or pmt.payment_date >= p_from) and (p_to is null or pmt.payment_date <= p_to)
    and (p_product is null or p.slug = p_product)
  group by 1
),
projected as (
  select date_trunc('month', i.due_date)::date m, sum(i.amount_due) due, sum(i.principal_component) principal, sum(i.interest_component) interest
  from public.installments i join public.loans l on l.id = i.loan_id left join public.products p on p.id = l.product_id
  where i.status in ('pending','partial','late')
    and (p_from is null or i.due_date >= p_from) and (p_to is null or i.due_date <= p_to)
    and (p_product is null or p.slug = p_product)
  group by 1
),
months as (select m from realized union select m from projected),
bymethod as (
  select pmt.method, sum(pmt.amount) amount, count(*) c
  from public.payments pmt join public.loans l on l.id = pmt.loan_id left join public.products p on p.id = l.product_id
  where pmt.status='completed'
    and (p_from is null or pmt.payment_date >= p_from) and (p_to is null or pmt.payment_date <= p_to)
    and (p_product is null or p.slug = p_product)
  group by pmt.method
)
select json_build_object(
  'summary', json_build_object(
    'realized_total', (select coalesce(sum(v),0) from realized), 'realized_count', (select coalesce(sum(c),0) from realized),
    'projected_total', (select coalesce(sum(due),0) from projected), 'projected_principal', (select coalesce(sum(principal),0) from projected),
    'projected_interest', (select coalesce(sum(interest),0) from projected),
    'months', (select count(*) from months), 'future_months', (select count(*) from projected where due>0)),
  'monthly', (select coalesce(json_agg(json_build_object('month',to_char(mo.m,'YYYY-MM'),'realized',coalesce(r.v,0),'realized_count',coalesce(r.c,0),
    'projected_due',coalesce(p.due,0),'projected_principal',coalesce(p.principal,0),'projected_interest',coalesce(p.interest,0)) order by mo.m),'[]'::json)
    from months mo left join realized r on r.m=mo.m left join projected p on p.m=mo.m),
  'by_method', (select coalesce(json_agg(json_build_object('method',method,'amount',amount,'count',c) order by amount desc),'[]'::json) from bymethod)
);
$$;

-- ---------------------------------------------------------------------------
-- CLIENTS / SEGMENTATION
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_clients(
  p_from date default null, p_to date default null,
  p_country text default null, p_risk text default null, p_status text default null
) returns json language sql stable security invoker set search_path = public as $$
with cf as (
  select c.id, c.reference, c.first_name, c.last_name, c.status, c.country, c.risk_category,
         c.credit_score, c.monthly_net_income, c.created_at,
         coalesce(sum(b.outstanding_principal) filter (where l.status in ('active','defaulted')),0) exposure,
         count(l.id) filter (where l.status in ('active','defaulted')) active_loans
  from public.clients c
  left join public.loans l on l.client_id = c.id
  left join public.v_loan_balances b on b.loan_id = l.id
  where (p_from is null or c.created_at::date >= p_from) and (p_to is null or c.created_at::date <= p_to)
    and (p_country is null or c.country = p_country) and (p_risk is null or c.risk_category = p_risk)
    and (p_status is null or c.status = p_status)
  group by c.id, c.reference, c.first_name, c.last_name, c.status, c.country, c.risk_category, c.credit_score, c.monthly_net_income, c.created_at
)
select json_build_object(
  'overview', (select json_build_object('total_clients',count(*),'active_clients',count(*) filter (where status='active'),
    'blacklisted',count(*) filter (where status='blacklisted'),'borrowers',count(*) filter (where active_loans>0),
    'multi_loan_clients',count(*) filter (where active_loans>1),'avg_income',round(coalesce(avg(monthly_net_income),0),0),
    'avg_score',round(coalesce(avg(credit_score),0),0),'total_exposure',coalesce(sum(exposure),0)) from cf),
  'by_status', (select coalesce(json_agg(json_build_object('status',status,'clients',clients) order by clients desc),'[]'::json) from (
    select status, count(*) clients from cf group by status) z),
  'by_income', (select coalesce(json_agg(json_build_object('band',band,'label',lbl,'clients',clients) order by band),'[]'::json) from (
    select band, max(lbl) lbl, count(*) clients from (select cf.*,
      case when monthly_net_income is null then '0' when monthly_net_income<1500 then '1' when monthly_net_income<2500 then '2' when monthly_net_income<3500 then '3' else '4' end band,
      case when monthly_net_income is null then 'NC' when monthly_net_income<1500 then '< 1500 €' when monthly_net_income<2500 then '1500-2500 €' when monthly_net_income<3500 then '2500-3500 €' else '3500 €+' end lbl
      from cf) x group by band) z),
  'by_score_band', (select coalesce(json_agg(json_build_object('band',band,'label',lbl,'clients',clients,'avg_score',avg_score) order by band),'[]'::json) from (
    select band, max(lbl) lbl, count(*) clients, round(coalesce(avg(credit_score),0),1) avg_score from (select cf.*,
      case when credit_score is null then '0' when credit_score<40 then '1' when credit_score<60 then '2' when credit_score<80 then '3' else '4' end band,
      case when credit_score is null then 'Sans score' when credit_score<40 then '0-39' when credit_score<60 then '40-59' when credit_score<80 then '60-79' else '80-100' end lbl
      from cf) x group by band) z),
  'by_country', (select coalesce(json_agg(json_build_object('country',country,'clients',clients,'borrowers',borrowers,'exposure',exposure) order by exposure desc),'[]'::json) from (
    select coalesce(country,'??') country, count(*) clients, count(*) filter (where active_loans>0) borrowers, coalesce(sum(exposure),0) exposure from cf group by coalesce(country,'??')) z),
  'by_risk', (select coalesce(json_agg(json_build_object('category',category,'clients',clients,'exposure',exposure) order by category),'[]'::json) from (
    select coalesce(risk_category,'?') category, count(*) clients, coalesce(sum(exposure),0) exposure from cf group by coalesce(risk_category,'?')) z),
  'top_exposure', (select coalesce(json_agg(t),'[]'::json) from (
    select id client_id, reference, first_name, last_name, risk_category, active_loans, exposure from cf order by exposure desc limit 12) t),
  'new_clients_monthly', (select coalesce(json_agg(json_build_object('month',to_char(m,'YYYY-MM'),'clients',clients) order by m),'[]'::json) from (
    select date_trunc('month',created_at) m, count(*) clients from cf group by 1) z)
);
$$;

-- ---------------------------------------------------------------------------
-- ORIGINATION / FUNNEL
-- ---------------------------------------------------------------------------
create or replace function public.rpc_stats_funnel(
  p_from date default null, p_to date default null,
  p_source text default null, p_status text default null
) returns json language sql stable security invoker set search_path = public as $$
with af as (
  select a.id, a.status, a.amount, a.score, coalesce(a.source,'direct') source, a.converted_client_id, a.created_at
  from public.loan_applications a
  where (p_from is null or a.created_at::date >= p_from) and (p_to is null or a.created_at::date <= p_to)
    and (p_source is null or coalesce(a.source,'direct') = p_source)
    and (p_status is null or a.status = p_status)
)
select json_build_object(
  'overview', (select json_build_object('total',count(*),'converted',count(*) filter (where converted_client_id is not null),
    'approved',count(*) filter (where status='approved'),'rejected',count(*) filter (where status='rejected'),
    'under_review',count(*) filter (where status in ('submitted','under_review')),
    'conversion_rate', case when count(*)>0 then round(100.0*count(*) filter (where converted_client_id is not null)/count(*),1) else 0 end,
    'approval_rate', case when count(*) filter (where status in ('approved','rejected'))>0 then round(100.0*count(*) filter (where status='approved')/count(*) filter (where status in ('approved','rejected')),1) else 0 end,
    'avg_score',round(coalesce(avg(score),0),0),'total_amount',coalesce(sum(amount),0),'avg_amount',round(coalesce(avg(amount),0),0)) from af),
  'by_status', (select coalesce(json_agg(json_build_object('status',status,'apps',apps,'amount',amount,'avg_score',avg_score) order by apps desc),'[]'::json) from (
    select status, count(*) apps, coalesce(sum(amount),0) amount, round(coalesce(avg(score),0),0) avg_score from af group by status) z),
  'by_source', (select coalesce(json_agg(json_build_object('source',source,'apps',apps,'converted',converted,'conversion_rate',conversion_rate,'amount',amount) order by apps desc),'[]'::json) from (
    select source, count(*) apps, count(*) filter (where converted_client_id is not null) converted,
      case when count(*)>0 then round(100.0*count(*) filter (where converted_client_id is not null)/count(*),1) else 0 end conversion_rate,
      coalesce(sum(amount),0) amount from af group by source) z),
  'by_score_band', (select coalesce(json_agg(json_build_object('band',band,'label',lbl,'apps',apps,'converted',converted) order by band),'[]'::json) from (
    select band, max(lbl) lbl, count(*) apps, count(*) filter (where converted_client_id is not null) converted from (select af.*,
      case when score is null then '0' when score<40 then '1' when score<60 then '2' when score<80 then '3' else '4' end band,
      case when score is null then 'Sans score' when score<40 then '0-39' when score<60 then '40-59' when score<80 then '60-79' else '80-100' end lbl
      from af) x group by band) z),
  'by_amount_band', (select coalesce(json_agg(json_build_object('band',band,'label',lbl,'apps',apps,'amount',amount) order by band),'[]'::json) from (
    select band, max(lbl) lbl, count(*) apps, coalesce(sum(amount),0) amount from (select af.*,
      case when amount is null then '0' when amount<=500 then '1' when amount<=1000 then '2' when amount<=1500 then '3' else '4' end band,
      case when amount is null then 'NC' when amount<=500 then '≤ 500 €' when amount<=1000 then '501-1000 €' when amount<=1500 then '1001-1500 €' else '1500 €+' end lbl
      from af) x group by band) z)
);
$$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
do $$
declare sig text;
begin
  foreach sig in array array[
    'rpc_stats_portfolio(date,date,text,text,text,text)',
    'rpc_stats_products(date,date,text,text)',
    'rpc_stats_risk(date,date,text,text,text)',
    'rpc_stats_vintages(date,date,text,text)',
    'rpc_stats_collections(date,date,text,text)',
    'rpc_stats_cashflow(date,date,text)',
    'rpc_stats_clients(date,date,text,text,text)',
    'rpc_stats_funnel(date,date,text,text)'
  ] loop
    execute format('revoke all on function public.%s from public, anon;', sig);
    execute format('grant execute on function public.%s to authenticated;', sig);
  end loop;
end;
$$;
