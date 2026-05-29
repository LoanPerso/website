"use client";

import { ArrowDownLeft, ArrowUpRight, FlaskConical, Send } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/admin/form";
import { formatDateTime } from "@/_lib/admin/format";
import type { MailMessage } from "@/_lib/admin/types";
import type { SimulateConversation } from "./types";

function bodyOf(m: MailMessage): string {
  return m.body_text?.trim() || m.snippet || "(message vide)";
}

function sentAt(m: MailMessage): string {
  return m.received_at ?? m.sent_at ?? m.created_at;
}

// Right pane: the conversation read as stacked cards (full bodies, like the live
// reader) with a docked composer to answer **as the correspondent**.
export function ConversationThread({
  conversation,
  messages,
  selfLabel,
  loading,
  reply,
  onReplyChange,
  onSend,
  busy,
}: {
  conversation: SimulateConversation;
  messages: MailMessage[];
  selfLabel: string;
  loading: boolean;
  reply: string;
  onReplyChange: (value: string) => void;
  onSend: () => void;
  busy: boolean;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden bg-background">
      <div className="space-y-1 border-b border-border p-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{conversation.subject}</h2>
        <p className="text-[13px] text-muted-foreground">
          avec <span className="text-foreground">{conversation.party}</span>
          {conversation.partyAddress && conversation.partyAddress !== conversation.party ? (
            <span className="text-muted-foreground/70"> · {conversation.partyAddress}</span>
          ) : null}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Conversation vide.</p>
        ) : (
          messages.map((m) => {
            const out = m.direction === "out";
            const Icon = out ? ArrowUpRight : ArrowDownLeft;
            const author = out ? selfLabel : m.from_name || m.from_address || conversation.party;
            return (
              <article
                key={m.id}
                className={cn("rounded-lg border border-border p-3.5", out ? "bg-secondary/40" : "bg-background")}
              >
                <header className="mb-1.5 flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                      out ? "bg-foreground/10 text-foreground" : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span className="truncate text-[13px] font-medium text-foreground">{author}</span>
                  <span className="ml-auto shrink-0 text-[11px] text-muted-foreground/70">{formatDateTime(sentAt(m))}</span>
                </header>
                <p className="whitespace-pre-line pl-8 text-[13px] leading-relaxed text-foreground/90">{bodyOf(m)}</p>
              </article>
            );
          })
        )}
      </div>

      <div className="border-t border-border bg-secondary/20 p-3">
        <p className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <FlaskConical className="h-3.5 w-3.5" /> Répondre en tant que {conversation.party}
        </p>
        <Textarea
          value={reply}
          onChange={(e) => onReplyChange(e.target.value)}
          placeholder={`Écrivez la réponse de ${conversation.party}…`}
          className="min-h-[84px] bg-background"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={onSend} disabled={busy || !reply.trim()}>
            <Send className="h-4 w-4" /> {busy ? "Réception…" : "Recevoir la réponse"}
          </Button>
        </div>
      </div>
    </section>
  );
}
