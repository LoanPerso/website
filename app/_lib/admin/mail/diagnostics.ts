import { supabase } from "@/_lib/supabase";
import { currentActor } from "../audit";
import type { MailDiagnostic, MailDiagnosticKind, Result } from "../types";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulated connectivity smoke test (~600 ms). No network: it checks that the
// chosen channel's host/port/username are filled, records a diagnostic row and
// reflects the result on the account's last_*_status. Wire to a real probe later.
export async function runSmoke(accountId: string, kind: MailDiagnosticKind): Promise<Result<MailDiagnostic>> {
  const fields =
    kind === "smtp"
      ? "smtp_host,smtp_port,smtp_username,smtp_security"
      : "imap_host,imap_port,imap_username,imap_security";
  const { data: acc, error: accErr } = await supabase.from("mail_accounts").select(fields).eq("id", accountId).single();
  if (accErr || !acc) return { data: null, error: accErr?.message ?? "Compte introuvable." };

  const latency = 480 + Math.floor(Math.random() * 320);
  await delay(latency);

  const cfg = acc as Record<string, unknown>;
  const host = (kind === "smtp" ? cfg.smtp_host : cfg.imap_host) as string | null;
  const port = (kind === "smtp" ? cfg.smtp_port : cfg.imap_port) as number | null;
  const username = (kind === "smtp" ? cfg.smtp_username : cfg.imap_username) as string | null;
  const security = (kind === "smtp" ? cfg.smtp_security : cfg.imap_security) as string | null;

  const ok = Boolean(host && port && username);
  const proto = kind === "smtp" ? "SMTP" : "IMAP";
  const detail = ok
    ? `Connexion ${proto} réussie — ${host}:${port} (${security}).`
    : `Configuration ${proto} incomplète : renseignez serveur, port et identifiant.`;

  const actor = await currentActor();
  const { data, error } = await supabase
    .from("mail_diagnostics")
    .insert({ account_id: accountId, kind, ok, detail, latency_ms: latency, ran_by: actor.id })
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };

  const now = new Date().toISOString();
  const patch =
    kind === "smtp"
      ? { last_smtp_status: ok ? "ok" : "error", last_smtp_checked_at: now, last_smtp_detail: detail }
      : { last_imap_status: ok ? "ok" : "error", last_imap_checked_at: now, last_imap_detail: detail };
  await supabase.from("mail_accounts").update(patch).eq("id", accountId);

  return { data: data as unknown as MailDiagnostic, error: null };
}

export async function listDiagnostics(accountId: string, limit = 20): Promise<Result<MailDiagnostic[]>> {
  const { data, error } = await supabase
    .from("mail_diagnostics")
    .select("*")
    .eq("account_id", accountId)
    .order("ran_at", { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as MailDiagnostic[], error: null };
}

// Simulated sync: just stamps last_synced_at (no real IMAP fetch).
export async function syncMailbox(accountId: string): Promise<Result<null>> {
  await delay(500 + Math.floor(Math.random() * 300));
  const { error } = await supabase
    .from("mail_accounts")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", accountId);
  return { data: null, error: error?.message ?? null };
}
