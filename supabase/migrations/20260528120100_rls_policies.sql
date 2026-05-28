-- ============================================================================
-- Quickfund — Row Level Security
-- Business tables are readable/writable only by active admins (public.is_admin()).
-- The anon role may INSERT loan_applications (public website funnel) but never read.
-- The service_role key bypasses RLS for trusted server-side jobs (imports, admin
-- provisioning) and is never exposed to the browser.
-- ============================================================================

alter table public.admin_users      enable row level security;
alter table public.products         enable row level security;
alter table public.clients          enable row level security;
alter table public.loans            enable row level security;
alter table public.installments     enable row level security;
alter table public.payments         enable row level security;
alter table public.loan_applications enable row level security;
alter table public.import_batches   enable row level security;
alter table public.activity_log     enable row level security;

-- --- admin_users -----------------------------------------------------------
-- A signed-in user can always read their own row (needed for the login guard
-- to confirm admin status). Admins manage all admin rows.
drop policy if exists admin_users_self_select on public.admin_users;
create policy admin_users_self_select on public.admin_users
  for select to authenticated
  using (id = auth.uid());

drop policy if exists admin_users_admin_all on public.admin_users;
create policy admin_users_admin_all on public.admin_users
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --- Generic admin-only policies ------------------------------------------
do $$
declare
  t text;
  business_tables text[] := array[
    'products','clients','loans','installments','payments',
    'import_batches','activity_log'
  ];
begin
  foreach t in array business_tables loop
    execute format('drop policy if exists %I on public.%I;', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin());',
      t || '_admin_all', t
    );
  end loop;
end;
$$;

-- --- loan_applications -----------------------------------------------------
-- Admins: full access. Public funnel (anon + authenticated): insert only.
drop policy if exists loan_applications_admin_all on public.loan_applications;
create policy loan_applications_admin_all on public.loan_applications
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists loan_applications_public_insert on public.loan_applications;
create policy loan_applications_public_insert on public.loan_applications
  for insert to anon, authenticated
  with check (true);
