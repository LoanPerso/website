import { supabase } from "@/_lib/supabase";
import type { MailAccount, MailSecurity, Result } from "../types";

// Read projection: every column EXCEPT the *_password columns, which are
// write-only in the mockup and must never reach the browser (see migration
// 20260528160000_mailbox + docs/SECURITY.md).
const ACCOUNT_SELECT =
  "id,label,email,display_name,signature," +
  "imap_host,imap_port,imap_security,imap_username," +
  "smtp_host,smtp_port,smtp_security,smtp_username," +
  "is_active,is_default,last_synced_at," +
  "last_smtp_status,last_smtp_checked_at,last_smtp_detail," +
  "last_imap_status,last_imap_checked_at,last_imap_detail," +
  "created_at,updated_at";

export interface MailAccountInput {
  label: string;
  email: string;
  display_name?: string | null;
  signature?: string | null;
  imap_host?: string | null;
  imap_port?: number | null;
  imap_security?: MailSecurity;
  imap_username?: string | null;
  imap_password?: string | null; // write-only
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_security?: MailSecurity;
  smtp_username?: string | null;
  smtp_password?: string | null; // write-only
  is_active?: boolean;
  is_default?: boolean;
}

export async function listAccounts(): Promise<Result<MailAccount[]>> {
  const { data, error } = await supabase
    .from("mail_accounts")
    .select(ACCOUNT_SELECT)
    .order("is_default", { ascending: false })
    .order("label", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as MailAccount[], error: null };
}

export async function getAccount(id: string): Promise<Result<MailAccount>> {
  const { data, error } = await supabase.from("mail_accounts").select(ACCOUNT_SELECT).eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as MailAccount, error: null };
}

export async function createAccount(input: MailAccountInput): Promise<Result<MailAccount>> {
  const { data, error } = await supabase
    .from("mail_accounts")
    .insert(sanitize(input))
    .select(ACCOUNT_SELECT)
    .single();
  if (error) return { data: null, error: error.message };
  const account = data as unknown as MailAccount;
  if (input.is_default) await clearOtherDefaults(account.id);
  return { data: account, error: null };
}

export async function updateAccount(id: string, input: Partial<MailAccountInput>): Promise<Result<MailAccount>> {
  const { data, error } = await supabase
    .from("mail_accounts")
    .update(sanitize(input))
    .eq("id", id)
    .select(ACCOUNT_SELECT)
    .single();
  if (error) return { data: null, error: error.message };
  if (input.is_default) await clearOtherDefaults(id);
  return { data: data as unknown as MailAccount, error: null };
}

export async function deleteAccount(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("mail_accounts").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function setDefaultAccount(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("mail_accounts").update({ is_default: true }).eq("id", id);
  if (error) return { data: null, error: error.message };
  await clearOtherDefaults(id);
  return { data: null, error: null };
}

// Keep a single default account.
async function clearOtherDefaults(keepId: string): Promise<void> {
  await supabase.from("mail_accounts").update({ is_default: false }).eq("is_default", true).neq("id", keepId);
}

// Drop empty passwords so a blank field never overwrites a stored credential.
function sanitize(input: Partial<MailAccountInput>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...input };
  if (!out.imap_password) delete out.imap_password;
  if (!out.smtp_password) delete out.smtp_password;
  return out;
}
