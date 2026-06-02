-- ============================================================================
-- Quickfund — Performance & scale
-- Prepares the back office for a realistic book (~1.4k clients, ~45k installments):
--   • composite indexes for the heavy lateral aggregations and overdue scans
--   • kpis_cache + refresh/get functions so the dashboard stops re-running the
--     13 scalar subqueries of v_portfolio_kpis on every page load
--   • v_arrears_summary — single-row collections totals (so the overdue page can
--     paginate its tables yet still show correct KPIs)
-- Additive and idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Composite indexes
-- ----------------------------------------------------------------------------
-- Overdue filter: status IN (...) AND due_date < today (v_installments_status).
create index if not exists idx_installments_status_due
  on public.installments(status, due_date);
-- Per-loan principal-paid aggregation (v_loan_balances) and arrears joins.
create index if not exists idx_installments_loan_status
  on public.installments(loan_id, status);
-- Collections / monthly collections scans on completed payments.
create index if not exists idx_payments_status_date
  on public.payments(status, payment_date);
-- v_client_overview lateral aggregations (open/overdue tasks, KYC, contracts).
create index if not exists idx_tasks_client_status
  on public.tasks(client_id, status);
create index if not exists idx_client_documents_client_status
  on public.client_documents(client_id, status);
create index if not exists idx_contracts_client_status
  on public.contracts(client_id, status);

-- ----------------------------------------------------------------------------
-- kpis_cache — materialized snapshot of v_portfolio_kpis
-- ----------------------------------------------------------------------------
create table if not exists public.kpis_cache (
  key          text primary key,
  data         jsonb not null,
  computed_at  timestamptz not null default now()
);

alter table public.kpis_cache enable row level security;
drop policy if exists kpis_cache_admin_read on public.kpis_cache;
create policy kpis_cache_admin_read on public.kpis_cache
  for select to authenticated using (public.is_admin());
-- Writes go only through refresh_portfolio_kpis() (security definer, runs as owner).

-- Recompute the snapshot from the live view and upsert it. Owner-definer so the
-- security_invoker view returns full data; callers never touch the view directly.
create or replace function public.refresh_portfolio_kpis()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
begin
  select to_jsonb(k) into payload from public.v_portfolio_kpis k;
  insert into public.kpis_cache (key, data, computed_at)
  values ('portfolio', coalesce(payload, '{}'::jsonb), now())
  on conflict (key) do update
    set data = excluded.data, computed_at = excluded.computed_at;
  return payload;
end;
$$;

-- Return cached KPIs, recomputing only when older than max_age_seconds. Admins
-- only — returns null otherwise (mirrors the RLS gate on the view).
create or replace function public.get_portfolio_kpis(max_age_seconds int default 300)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cached public.kpis_cache%rowtype;
begin
  if not public.is_admin() then
    return null;
  end if;
  select * into cached from public.kpis_cache where key = 'portfolio';
  if found and cached.computed_at > now() - make_interval(secs => max_age_seconds) then
    return cached.data;
  end if;
  return public.refresh_portfolio_kpis();
end;
$$;

revoke all on function public.refresh_portfolio_kpis()  from public;
revoke all on function public.get_portfolio_kpis(int)   from public;
grant execute on function public.refresh_portfolio_kpis() to authenticated, service_role;
grant execute on function public.get_portfolio_kpis(int)  to authenticated;

-- ----------------------------------------------------------------------------
-- v_arrears_summary — collections totals (one row), independent of pagination.
-- ----------------------------------------------------------------------------
create or replace view public.v_arrears_summary
with (security_invoker = on) as
select
  coalesce(sum(overdue_amount), 0) as total_overdue_amount,
  coalesce(sum(late_fees), 0)      as total_late_fees,
  count(*)                         as arrears_loans,
  count(distinct client_id)        as affected_clients
from public.v_loan_arrears;

grant select on public.v_arrears_summary to authenticated;
revoke select on public.v_arrears_summary from anon;
