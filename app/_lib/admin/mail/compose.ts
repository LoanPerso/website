import { supabase } from "@/_lib/supabase";
import type { MailAddress, MailMessage, Result } from "../types";

export interface SendMessageInput {
  account_id: string;
  to: MailAddress[];
  cc?: MailAddress[];
  subject: string;
  body_text: string;
  in_reply_to?: string | null;
  thread_key?: string | null;
  client_id?: string | null;
  application_id?: string | null;
}

function snippetOf(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 140);
}

function sizeOf(body: string): number {
  try {
    return new TextEncoder().encode(body).length;
  } catch {
    return body.length;
  }
}

async function folderId(accountId: string, role: "sent" | "drafts"): Promise<string | null> {
  const { data } = await supabase
    .from("mail_folders")
    .select("id")
    .eq("account_id", accountId)
    .eq("role", role)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function accountIdentity(accountId: string): Promise<{ name: string | null; address: string | null }> {
  const { data } = await supabase
    .from("mail_accounts")
    .select("label,display_name,email")
    .eq("id", accountId)
    .single();
  const acc = data as { label?: string; display_name?: string | null; email?: string | null } | null;
  return { name: acc?.display_name ?? acc?.label ?? null, address: acc?.email ?? null };
}

// Mock send: inserts an outgoing message into Sent (status 'sent'), marks the
// replied-to thread answered and journals a CRM interaction when tied to a client
// or application. No real SMTP — mirrors the application comms-panel mock.
export async function sendMessage(input: SendMessageInput): Promise<Result<MailMessage>> {
  const identity = await accountIdentity(input.account_id);
  if (!identity.address) return { data: null, error: "Compte introuvable." };
  const sent = await folderId(input.account_id, "sent");
  const now = new Date().toISOString();
  // Stamp an id + thread so the message is referenceable and a conversation can
  // build (replies / simulated incoming replies thread onto this).
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const { data, error } = await supabase
    .from("mail_messages")
    .insert({
      account_id: input.account_id,
      folder_id: sent,
      direction: "out",
      message_id: `<qf-${token}@quickfund.ee>`,
      from_name: identity.name,
      from_address: identity.address,
      to_addresses: input.to,
      cc_addresses: input.cc ?? [],
      subject: input.subject,
      snippet: snippetOf(input.body_text),
      body_text: input.body_text,
      size_bytes: sizeOf(input.body_text),
      is_seen: true,
      status: "sent",
      in_reply_to: input.in_reply_to ?? null,
      thread_key: input.thread_key ?? `thread-${token}`,
      client_id: input.client_id ?? null,
      application_id: input.application_id ?? null,
      sent_at: now,
    })
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };

  if (input.in_reply_to) {
    await supabase.from("mail_messages").update({ is_answered: true }).eq("message_id", input.in_reply_to);
  }

  if (input.client_id || input.application_id) {
    await supabase.from("interactions").insert({
      client_id: input.client_id ?? null,
      application_id: input.application_id ?? null,
      type: "email",
      direction: "out",
      subject: input.subject,
      body: input.body_text,
    });
  }

  return { data: data as unknown as MailMessage, error: null };
}

// Save a draft into the Drafts folder (status 'draft').
export async function saveDraft(input: SendMessageInput): Promise<Result<MailMessage>> {
  const identity = await accountIdentity(input.account_id);
  const drafts = await folderId(input.account_id, "drafts");
  const { data, error } = await supabase
    .from("mail_messages")
    .insert({
      account_id: input.account_id,
      folder_id: drafts,
      direction: "out",
      from_name: identity.name,
      from_address: identity.address,
      to_addresses: input.to,
      cc_addresses: input.cc ?? [],
      subject: input.subject,
      snippet: snippetOf(input.body_text),
      body_text: input.body_text,
      size_bytes: sizeOf(input.body_text),
      is_seen: true,
      is_draft: true,
      status: "draft",
      thread_key: input.thread_key ?? null,
      client_id: input.client_id ?? null,
      application_id: input.application_id ?? null,
    })
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as MailMessage, error: null };
}
