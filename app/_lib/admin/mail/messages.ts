import { supabase } from "@/_lib/supabase";
import type { MailMessage, MailMessageFull, MailMessageListItem, Result } from "../types";

export type MailFilter = "all" | "unread" | "flagged";

export interface ListMessagesParams {
  accountId: string;
  folderId: string;
  search?: string;
  filter?: MailFilter;
}

// List projection: no bodies (kept light for the message list).
const LIST_SELECT =
  "id,account_id,folder_id,direction,message_uid,message_id,in_reply_to,thread_key," +
  "from_name,from_address,to_addresses,cc_addresses,subject,snippet,has_attachments,size_bytes," +
  "is_seen,is_flagged,is_answered,is_draft,status,client_id,application_id," +
  "sent_at,received_at,created_at,updated_at";

// Full reader: body + attachments + resolved CRM links (client / application).
const FULL_SELECT =
  "*, attachments:mail_attachments(*)," +
  "client:clients(id,reference,first_name,last_name)," +
  "application:loan_applications(id,first_name,last_name,status)";

export async function listMessages(params: ListMessagesParams): Promise<Result<MailMessageListItem[]>> {
  const { accountId, folderId, search, filter = "all" } = params;
  let query = supabase
    .from("mail_messages")
    .select(LIST_SELECT)
    .eq("account_id", accountId)
    .eq("folder_id", folderId);

  if (filter === "unread") query = query.eq("is_seen", false);
  if (filter === "flagged") query = query.eq("is_flagged", true);
  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(`subject.ilike.${s},from_name.ilike.${s},from_address.ilike.${s},snippet.ilike.${s}`);
  }

  // Newest first: inbound sorts by received_at, outbound by sent_at, then created_at.
  query = query
    .order("received_at", { ascending: false, nullsFirst: false })
    .order("sent_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as MailMessageListItem[], error: null };
}

// Every message of an account (all folders) — for the sandbox conversation view.
export async function listAccountMessages(accountId: string): Promise<Result<MailMessageListItem[]>> {
  const { data, error } = await supabase
    .from("mail_messages")
    .select(LIST_SELECT)
    .eq("account_id", accountId)
    .order("received_at", { ascending: false, nullsFirst: false })
    .order("sent_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as MailMessageListItem[], error: null };
}

// All messages of one conversation (by thread_key), across folders, oldest first.
export async function listThread(accountId: string, threadKey: string): Promise<Result<MailMessageListItem[]>> {
  const { data, error } = await supabase
    .from("mail_messages")
    .select(LIST_SELECT)
    .eq("account_id", accountId)
    .eq("thread_key", threadKey)
    .order("received_at", { ascending: true, nullsFirst: true })
    .order("sent_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as MailMessageListItem[], error: null };
}

// Full messages (with bodies) for a set of ids — the simulate reader renders a
// whole conversation at once (snippets aren't enough to read/reply), so it loads
// the bodies of every message it already lists, threaded or standalone.
export async function listMessagesFullByIds(ids: string[]): Promise<Result<MailMessage[]>> {
  if (!ids.length) return { data: [], error: null };
  const { data, error } = await supabase.from("mail_messages").select("*").in("id", ids);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as MailMessage[], error: null };
}

export async function getMessage(id: string): Promise<Result<MailMessageFull>> {
  const { data, error } = await supabase.from("mail_messages").select(FULL_SELECT).eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as MailMessageFull, error: null };
}

export async function markSeen(id: string, seen = true): Promise<Result<null>> {
  const { error } = await supabase.from("mail_messages").update({ is_seen: seen }).eq("id", id);
  return { data: null, error: error?.message ?? null };
}

export async function toggleFlag(id: string, flagged: boolean): Promise<Result<null>> {
  const { error } = await supabase.from("mail_messages").update({ is_flagged: flagged }).eq("id", id);
  return { data: null, error: error?.message ?? null };
}

export async function moveToFolder(id: string, folderId: string): Promise<Result<null>> {
  const { error } = await supabase.from("mail_messages").update({ folder_id: folderId }).eq("id", id);
  return { data: null, error: error?.message ?? null };
}

export async function deleteMessage(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("mail_messages").delete().eq("id", id);
  return { data: null, error: error?.message ?? null };
}

// Link / unlink a message to CRM records (client and/or application). Pass null
// to clear a link; omit a key to leave it untouched.
export async function setMessageCrmLinks(
  id: string,
  links: { client_id?: string | null; application_id?: string | null }
): Promise<Result<null>> {
  const patch: Record<string, unknown> = {};
  if ("client_id" in links) patch.client_id = links.client_id ?? null;
  if ("application_id" in links) patch.application_id = links.application_id ?? null;
  if (Object.keys(patch).length === 0) return { data: null, error: null };
  const { error } = await supabase.from("mail_messages").update(patch).eq("id", id);
  return { data: null, error: error?.message ?? null };
}
