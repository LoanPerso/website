-- ============================================================================
-- Quickfund — CRM: Row Level Security + reporting views
-- New CRM tables are admin-only (public.is_admin()), mirroring the core schema.
-- Views use security_invoker so the caller's RLS applies (admins see data, anon none).
-- Idempotent: safe to re-run.
-- ============================================================================

alter table public.client_scores    enable row level security;
alter table public.client_documents enable row level security;
alter table public.tasks            enable row level security;
alter table public.interactions     enable row level security;
alter table public.contracts        enable row level security;

do $$
declare
  t text;
  crm_tables text[] := array[
    'client_scores','client_documents','tasks','interactions','contracts'
  ];
begin
  foreach t in array crm_tables loop
    execute format('drop policy if exists %I on public.%I;', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin());',
      t || '_admin_all', t
    );
  end loop;
end;
$$;

-- ----------------------------------------------------------------------------
-- v_client_overview — clients enriched with latest score, KYC + tasks + loans
-- (drives the client list: score, document completeness, open follow-ups)
-- ----------------------------------------------------------------------------
create or replace view public.v_client_overview
with (security_invoker = on) as
select
  c.*,
  ls.score        as latest_score,
  ls.category     as latest_category,
  ls.computed_at  as latest_score_at,
  ls.is_complete  as latest_score_complete,
  coalesce(t.open_tasks, 0)      as open_tasks,
  coalesce(t.overdue_tasks, 0)   as overdue_tasks,
  coalesce(d.docs_total, 0)      as docs_total,
  coalesce(d.docs_verified, 0)   as docs_verified,
  coalesce(d.docs_expiring, 0)   as docs_expiring,
  coalesce(ln.loans_count, 0)    as loans_count,
  coalesce(ln.active_loans, 0)   as active_loans,
  coalesce(ln.total_borrowed, 0) as total_borrowed,
  coalesce(ct.active_contracts, 0) as active_contracts
from public.clients c
left join lateral (
  select score, category, computed_at, is_complete
  from public.client_scores s
  where s.client_id = c.id
  order by computed_at desc
  limit 1
) ls on true
left join (
  select client_id,
    count(*) filter (where status = 'open') as open_tasks,
    count(*) filter (where status = 'open' and due_date is not null and due_date < current_date) as overdue_tasks
  from public.tasks
  group by client_id
) t on t.client_id = c.id
left join (
  select client_id,
    count(*) as docs_total,
    count(*) filter (where status = 'verified') as docs_verified,
    count(*) filter (where status = 'verified' and expires_on is not null
                       and expires_on <= current_date + interval '30 days') as docs_expiring
  from public.client_documents
  group by client_id
) d on d.client_id = c.id
left join (
  select client_id,
    count(*) as loans_count,
    count(*) filter (where status = 'active') as active_loans,
    coalesce(sum(principal_amount), 0) as total_borrowed
  from public.loans
  group by client_id
) ln on ln.client_id = c.id
left join (
  select client_id, count(*) filter (where status in ('signed','active')) as active_contracts
  from public.contracts
  group by client_id
) ct on ct.client_id = c.id;

-- ----------------------------------------------------------------------------
-- v_tasks_due — tasks enriched with client name + overdue flag (Tâches page)
-- ----------------------------------------------------------------------------
create or replace view public.v_tasks_due
with (security_invoker = on) as
select
  t.*,
  c.reference  as client_reference,
  c.first_name,
  c.last_name,
  (t.status = 'open' and t.due_date is not null and t.due_date < current_date) as is_overdue
from public.tasks t
left join public.clients c on c.id = t.client_id;

grant select on public.v_client_overview, public.v_tasks_due to authenticated;
revoke select on public.v_client_overview, public.v_tasks_due from anon;
