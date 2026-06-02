-- ============================================================================
-- Quickfund — Fix reference generation overflow
-- set_reference() used lpad(n::text, 4, '0'), but Postgres lpad TRUNCATES (from
-- the right) when the value is longer than the target width. Past 9999 rows the
-- sequence value (e.g. 10000 → '1000') collided with an earlier reference,
-- breaking inserts on any entity that exceeds 9999 rows (clients, loans,
-- payments, contracts). Surfaced by the smoke load (>20k payments).
-- Fix: zero-pad to a minimum of 4 digits without ever truncating.
-- ============================================================================

create or replace function public.set_reference()
returns trigger
language plpgsql
as $$
declare
  v text;
begin
  if new.reference is null or new.reference = '' then
    v := nextval(tg_argv[1])::text;
    new.reference := tg_argv[0] || case when length(v) < 4 then lpad(v, 4, '0') else v end;
  end if;
  return new;
end;
$$;
