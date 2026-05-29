"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/_lib/utils";
import { formatRelativeDate } from "@/_lib/admin/format";
import type { MailMessageListItem } from "@/_lib/admin/types";

function counterparty(m: MailMessageListItem): string {
  if (m.direction === "out") {
    const to = m.to_addresses?.[0];
    return to?.name || to?.address || "—";
  }
  return m.from_name || m.from_address || "—";
}

// Conversation list: every message sharing the open message's thread_key (across
// folders), so a reply you just sent shows next to the original — like a real webmail.
export function MessageThread({
  thread,
  currentId,
  onOpen,
}: {
  thread: MailMessageListItem[];
  currentId: string;
  onOpen: (id: string) => void;
}) {
  if (thread.length <= 1) return null;
  return (
    <div className="mb-4 overflow-hidden rounded-md border border-border">
      <p className="border-b border-border bg-secondary/40 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        Fil de discussion ({thread.length})
      </p>
      <ul className="divide-y divide-border">
        {thread.map((m) => {
          const isCurrent = m.id === currentId;
          const Icon = m.direction === "out" ? ArrowUpRight : ArrowDownLeft;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => !isCurrent && onOpen(m.id)}
                disabled={isCurrent}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors",
                  isCurrent ? "bg-secondary/60" : "hover:bg-secondary/40"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className={cn("shrink-0 font-medium text-foreground", !m.is_seen && m.direction === "in" && "font-semibold")}>
                  {m.direction === "out" ? "À " : ""}
                  {counterparty(m)}
                </span>
                <span className="flex-1 truncate text-muted-foreground">{m.snippet || m.subject || "—"}</span>
                <span className="shrink-0 text-muted-foreground/70">
                  {formatRelativeDate(m.received_at ?? m.sent_at ?? m.created_at)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
