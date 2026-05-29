-- ============================================================================
-- Quickfund — Mailbox (company inbox)
-- A back-office mail client: configured accounts/boxes, their folders, incoming
-- and outgoing messages, attachments and connectivity diagnostics (SMTP/IMAP
-- smoke tests). This is a DB-backed mockup — no network, no real send/receive.
-- The schema already carries host/port/security/credentials so it can be wired
-- to real SMTP/IMAP later. Credentials are stored in clear for the mockup; the
-- read layer never selects the *_password columns (write-only in the UI).
-- Additive and idempotent: safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- mail_accounts — one configured box/address (IMAP+SMTP config + smoke state)
-- ----------------------------------------------------------------------------
create table if not exists public.mail_accounts (
  id                    uuid primary key default gen_random_uuid(),
  label                 text not null,
  email                 text unique not null,
  display_name          text,
  signature             text,
  imap_host             text,
  imap_port             integer,
  imap_security         text not null default 'ssl' check (imap_security in ('ssl','starttls','none')),
  imap_username         text,
  imap_password         text,
  smtp_host             text,
  smtp_port             integer,
  smtp_security         text not null default 'starttls' check (smtp_security in ('ssl','starttls','none')),
  smtp_username         text,
  smtp_password         text,
  is_active             boolean not null default true,
  is_default            boolean not null default false,
  last_synced_at        timestamptz,
  last_smtp_status      text not null default 'unknown' check (last_smtp_status in ('unknown','ok','error')),
  last_smtp_checked_at  timestamptz,
  last_smtp_detail      text,
  last_imap_status      text not null default 'unknown' check (last_imap_status in ('unknown','ok','error')),
  last_imap_checked_at  timestamptz,
  last_imap_detail      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- mail_folders — folders per account (mailbox tree)
-- ----------------------------------------------------------------------------
create table if not exists public.mail_folders (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.mail_accounts(id) on delete cascade,
  name        text not null,
  path        text not null,
  role        text not null default 'other'
                check (role in ('inbox','sent','drafts','trash','archive','spam','other')),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (account_id, path)
);

-- ----------------------------------------------------------------------------
-- mail_messages — messages (incoming + outgoing), optionally linked to CRM
-- ----------------------------------------------------------------------------
create table if not exists public.mail_messages (
  id              uuid primary key default gen_random_uuid(),
  account_id      uuid not null references public.mail_accounts(id) on delete cascade,
  folder_id       uuid references public.mail_folders(id) on delete set null,
  direction       text not null check (direction in ('in','out')),
  message_uid     text,
  message_id      text,
  in_reply_to     text,
  thread_key      text,
  from_name       text,
  from_address    text,
  to_addresses    jsonb not null default '[]'::jsonb,   -- [{name,address}]
  cc_addresses    jsonb not null default '[]'::jsonb,   -- [{name,address}]
  subject         text,
  snippet         text,
  body_text       text,
  body_html       text,
  has_attachments boolean not null default false,
  size_bytes      integer not null default 0,
  is_seen         boolean not null default false,
  is_flagged      boolean not null default false,
  is_answered     boolean not null default false,
  is_draft        boolean not null default false,
  status          text not null default 'received'
                    check (status in ('received','sent','draft','queued','failed')),
  client_id       uuid references public.clients(id) on delete set null,
  application_id  uuid references public.loan_applications(id) on delete set null,
  sent_at         timestamptz,
  received_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- mail_attachments — file metadata per message (binary stays out of scope)
-- ----------------------------------------------------------------------------
create table if not exists public.mail_attachments (
  id            uuid primary key default gen_random_uuid(),
  message_id    uuid not null references public.mail_messages(id) on delete cascade,
  filename      text,
  content_type  text,
  size_bytes    integer not null default 0,
  is_inline     boolean not null default false,
  url           text,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- mail_diagnostics — smoke-test history (SMTP / IMAP connectivity checks)
-- ----------------------------------------------------------------------------
create table if not exists public.mail_diagnostics (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references public.mail_accounts(id) on delete cascade,
  kind        text not null check (kind in ('smtp','imap')),
  ok          boolean not null,
  detail      text,
  latency_ms  integer,
  ran_by      uuid references auth.users(id) on delete set null,
  ran_at      timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Triggers: updated_at
-- ----------------------------------------------------------------------------
drop trigger if exists trg_mail_accounts_updated on public.mail_accounts;
create trigger trg_mail_accounts_updated before update on public.mail_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_mail_folders_updated on public.mail_folders;
create trigger trg_mail_folders_updated before update on public.mail_folders
  for each row execute function public.set_updated_at();

drop trigger if exists trg_mail_messages_updated on public.mail_messages;
create trigger trg_mail_messages_updated before update on public.mail_messages
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------------------
create index if not exists idx_mail_folders_account      on public.mail_folders(account_id);
create index if not exists idx_mail_messages_account      on public.mail_messages(account_id);
create index if not exists idx_mail_messages_folder       on public.mail_messages(folder_id);
create index if not exists idx_mail_messages_direction    on public.mail_messages(direction);
create index if not exists idx_mail_messages_received     on public.mail_messages(received_at desc);
create index if not exists idx_mail_messages_seen         on public.mail_messages(is_seen);
create index if not exists idx_mail_messages_client       on public.mail_messages(client_id);
create index if not exists idx_mail_messages_application  on public.mail_messages(application_id);
create index if not exists idx_mail_attachments_message   on public.mail_attachments(message_id);
create index if not exists idx_mail_diagnostics_account   on public.mail_diagnostics(account_id);

-- ----------------------------------------------------------------------------
-- Row Level Security — admin-only on every mailbox table
-- ----------------------------------------------------------------------------
alter table public.mail_accounts    enable row level security;
alter table public.mail_folders     enable row level security;
alter table public.mail_messages    enable row level security;
alter table public.mail_attachments enable row level security;
alter table public.mail_diagnostics enable row level security;

do $$
declare
  t text;
  mail_tables text[] := array[
    'mail_accounts','mail_folders','mail_messages','mail_attachments','mail_diagnostics'
  ];
begin
  foreach t in array mail_tables loop
    execute format('drop policy if exists %I on public.%I;', t || '_admin_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin());',
      t || '_admin_all', t
    );
  end loop;
end;
$$;
