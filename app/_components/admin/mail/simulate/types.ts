import type { MailMessageListItem } from "@/_lib/admin/types";

// A simulate "conversation" = every message sharing a thread_key (or a lone
// message), seen from the sandbox: who Quickfund is talking to, and the exchange
// built so far. Mirrors how the live webmail groups a thread.
export interface SimulateConversation {
  key: string;
  subject: string;
  party: string; // correspondent display name (the side you puppet)
  partyAddress: string | null;
  items: MailMessageListItem[]; // oldest → newest
  lastAt: string;
  lastDirection: MailMessageListItem["direction"];
  lastSnippet: string;
  count: number;
}

export function msgDate(m: MailMessageListItem): string {
  return m.received_at ?? m.sent_at ?? m.created_at;
}

// The correspondent of a message = its sender (inbound) or first recipient (outbound).
export function counterparty(m: MailMessageListItem): { name: string | null; address: string | null } {
  if (m.direction === "in") return { name: m.from_name, address: m.from_address };
  const to = m.to_addresses?.[0];
  return { name: to?.name ?? null, address: to?.address ?? null };
}

export function buildConversations(messages: MailMessageListItem[]): SimulateConversation[] {
  const map = new Map<string, MailMessageListItem[]>();
  for (const m of messages) {
    const k = m.thread_key || m.id;
    const arr = map.get(k);
    if (arr) arr.push(m);
    else map.set(k, [m]);
  }
  const convs = [...map.entries()].map(([key, items]) => {
    const sorted = [...items].sort((a, b) => new Date(msgDate(a)).getTime() - new Date(msgDate(b)).getTime());
    const cp = counterparty(sorted[0]);
    const last = sorted[sorted.length - 1];
    return {
      key,
      subject: sorted[0].subject || "(sans objet)",
      party: cp.name || cp.address || "—",
      partyAddress: cp.address,
      items: sorted,
      lastAt: msgDate(last),
      lastDirection: last.direction,
      lastSnippet: last.snippet || "",
      count: sorted.length,
    } satisfies SimulateConversation;
  });
  convs.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  return convs;
}
