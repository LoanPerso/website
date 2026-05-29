import { supabase } from "@/_lib/supabase";
import type { MailMessage, Result } from "../types";

// Minimal shape needed to simulate a reply (body not required) — satisfied by
// both MailMessageFull (reader) and MailMessageListItem (sandbox conversation).
type ReplyTarget = Pick<
  MailMessage,
  | "id"
  | "account_id"
  | "direction"
  | "subject"
  | "thread_key"
  | "message_id"
  | "from_name"
  | "from_address"
  | "to_addresses"
  | "client_id"
  | "application_id"
>;

// Mock-data tooling: inject a fake INCOMING message into an account's inbox.
// The mailbox is a DB-backed mockup (no IMAP), so "receiving" mail is just an
// insert — this powers the hidden simulation panel (/admin/mail/simulate).
export interface SimulateInboundInput {
  account_id: string;
  from_name?: string | null;
  from_address: string;
  subject: string;
  body_text: string;
  is_seen?: boolean;
  is_flagged?: boolean;
  has_attachments?: boolean;
  client_id?: string | null;
  application_id?: string | null;
  thread_key?: string; // continue an existing conversation
  in_reply_to?: string; // message_id being answered
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

export async function simulateInboundMessage(input: SimulateInboundInput): Promise<Result<MailMessage>> {
  const { data: acc } = await supabase
    .from("mail_accounts")
    .select("email,display_name,label")
    .eq("id", input.account_id)
    .single();
  if (!acc) return { data: null, error: "Compte introuvable." };
  const account = acc as { email?: string | null; display_name?: string | null; label?: string | null };

  // Target the inbox (fall back to the first folder if absent).
  let folderId: string | null = null;
  const { data: inbox } = await supabase
    .from("mail_folders")
    .select("id")
    .eq("account_id", input.account_id)
    .eq("role", "inbox")
    .maybeSingle();
  folderId = (inbox as { id: string } | null)?.id ?? null;
  if (!folderId) {
    const { data: first } = await supabase
      .from("mail_folders")
      .select("id")
      .eq("account_id", input.account_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    folderId = (first as { id: string } | null)?.id ?? null;
  }

  const now = new Date().toISOString();
  const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const { data, error } = await supabase
    .from("mail_messages")
    .insert({
      account_id: input.account_id,
      folder_id: folderId,
      direction: "in",
      message_id: `<sim-${token}@quickfund.ee>`,
      in_reply_to: input.in_reply_to ?? null,
      thread_key: input.thread_key ?? `sim-${token}`,
      from_name: input.from_name?.trim() || null,
      from_address: input.from_address.trim(),
      to_addresses: [{ name: account.display_name ?? account.label ?? null, address: account.email }],
      subject: input.subject,
      snippet: snippetOf(input.body_text),
      body_text: input.body_text,
      has_attachments: input.has_attachments ?? false,
      size_bytes: sizeOf(input.body_text),
      is_seen: input.is_seen ?? false,
      is_flagged: input.is_flagged ?? false,
      status: "received",
      client_id: input.client_id ?? null,
      application_id: input.application_id ?? null,
      received_at: now,
    })
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as MailMessage, error: null };
}

// Simulate the counterparty replying to a message, in the SAME conversation:
// an outbound message gets a reply from its recipient, an inbound one a follow-up
// from its sender — so a back-and-forth thread can be built from the reader.
export async function simulateReplyTo(message: ReplyTarget, bodyText: string): Promise<Result<MailMessage>> {
  const party =
    message.direction === "out"
      ? message.to_addresses?.[0] ?? null
      : message.from_address
      ? { name: message.from_name, address: message.from_address }
      : null;
  if (!party?.address) return { data: null, error: "Aucun interlocuteur identifiable pour simuler une réponse." };

  // Ensure the original carries a thread_key so both messages group together.
  let threadKey = message.thread_key;
  if (!threadKey) {
    threadKey = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    await supabase.from("mail_messages").update({ thread_key: threadKey }).eq("id", message.id);
  }

  const subject = (message.subject ?? "").trim();
  const reSubject = subject.toLowerCase().startsWith("re:") ? subject : `Re: ${subject}`;

  return simulateInboundMessage({
    account_id: message.account_id,
    from_name: party.name ?? null,
    from_address: party.address,
    subject: reSubject || "(sans objet)",
    body_text: bodyText,
    thread_key: threadKey,
    in_reply_to: message.message_id ?? undefined,
    client_id: message.client_id ?? null,
    application_id: message.application_id ?? null,
  });
}
