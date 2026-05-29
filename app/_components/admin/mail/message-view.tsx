"use client";

import { useEffect, useState } from "react";
import { Forward, Link2, MailOpen, Paperclip, Reply, ReplyAll, Star, Trash2 } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Select } from "@/_components/admin/form";
import { Badge } from "@/_components/admin/status-badge";
import { formatDateTime, mailDirectionLabels } from "@/_lib/admin/format";
import type {
  Client,
  LoanApplication,
  MailAddress,
  MailFolderWithCount,
  MailMessageFull,
  MailMessageListItem,
} from "@/_lib/admin/types";
import { MessageCrm } from "./message-crm";
import { MessageThread } from "./message-thread";

function addressLine(list: MailAddress[] | null | undefined): string {
  if (!list?.length) return "—";
  return list.map((a) => (a.name ? `${a.name} <${a.address}>` : a.address)).join(", ");
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 o";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

// Prudent HTML→text fallback (no dangerouslySetInnerHTML): strip tags/scripts.
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<\/(p|div|br|li|tr|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function MessageView({
  message,
  loading,
  onReply,
  onReplyAll,
  onForward,
  onToggleFlag,
  onDelete,
  onMarkUnread,
  onMove,
  busy,
  clients,
  applications,
  onCrmChanged,
  folders,
  thread,
  onOpenThreadMessage,
}: {
  message: MailMessageFull | null;
  loading: boolean;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onToggleFlag: (flagged: boolean) => void;
  onDelete: () => void;
  onMarkUnread: () => void;
  onMove: (folderId: string) => void;
  busy: boolean;
  clients: Client[];
  applications: LoanApplication[];
  onCrmChanged: () => void;
  folders: MailFolderWithCount[];
  thread: MailMessageListItem[];
  onOpenThreadMessage: (id: string) => void;
}) {
  const [showCrm, setShowCrm] = useState(false);
  // Default the CRM panel open when the message is already linked; reset on switch.
  useEffect(() => {
    setShowCrm(!!(message?.client_id || message?.application_id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message?.id]);

  if (loading) {
    return (
      <section className="flex min-h-0 items-center justify-center bg-background p-8">
        <p className="text-sm text-muted-foreground">Chargement…</p>
      </section>
    );
  }

  if (!message) {
    return (
      <section className="flex min-h-0 items-center justify-center bg-background p-8">
        <p className="text-sm text-muted-foreground">Sélectionnez un message pour le lire.</p>
      </section>
    );
  }

  const body = message.body_text?.trim()
    ? message.body_text
    : message.body_html
    ? htmlToText(message.body_html)
    : "";
  const recipientCount = (message.to_addresses?.length ?? 0) + (message.cc_addresses?.length ?? 0);
  const moveTargets = folders.filter((f) => f.id !== message.folder_id);

  return (
    <section className="flex min-h-0 flex-col overflow-hidden bg-background">
      <div className="space-y-3 border-b border-border p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{message.subject || "(sans objet)"}</h2>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCrm((v) => !v)}
              title="Lien CRM"
              aria-label="Afficher/masquer le lien CRM"
              className={cn("h-8 w-8 p-0", showCrm && "bg-secondary")}
            >
              <Link2 className={cn("h-4 w-4", showCrm ? "text-foreground" : "text-muted-foreground")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onToggleFlag(!message.is_flagged)} title="Marquer comme suivi" aria-label="Drapeau" className="h-8 w-8 p-0">
              <Star className={cn("h-4 w-4", message.is_flagged ? "fill-alert text-alert" : "text-muted-foreground")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy} title="Supprimer" aria-label="Supprimer" className="h-8 w-8 p-0">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="space-y-1 text-[13px]">
          <div className="flex gap-2">
            <span className="w-12 shrink-0 text-muted-foreground">De</span>
            <span className="text-foreground">{addressLine(message.from_address ? [{ name: message.from_name, address: message.from_address }] : [])}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-12 shrink-0 text-muted-foreground">À</span>
            <span className="text-foreground">{addressLine(message.to_addresses)}</span>
          </div>
          {message.cc_addresses?.length ? (
            <div className="flex gap-2">
              <span className="w-12 shrink-0 text-muted-foreground">Cc</span>
              <span className="text-foreground">{addressLine(message.cc_addresses)}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge tone={message.direction === "in" ? "info" : "neutral"}>{mailDirectionLabels[message.direction]}</Badge>
          <span>{formatDateTime(message.received_at ?? message.sent_at ?? message.created_at)}</span>
          {message.is_answered ? <span className="text-success">Répondu</span> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onReply}>
            <Reply className="h-4 w-4" /> Répondre
          </Button>
          {recipientCount > 1 ? (
            <Button variant="outline" size="sm" onClick={onReplyAll}>
              <ReplyAll className="h-4 w-4" /> Répondre à tous
            </Button>
          ) : null}
          <Button variant="outline" size="sm" onClick={onForward}>
            <Forward className="h-4 w-4" /> Transférer
          </Button>
          {message.direction === "in" ? (
            <Button variant="ghost" size="sm" onClick={onMarkUnread}>
              <MailOpen className="h-4 w-4" /> Marquer non lu
            </Button>
          ) : null}
          {moveTargets.length ? (
            <Select
              aria-label="Déplacer vers"
              value=""
              onChange={(e) => e.target.value && onMove(e.target.value)}
              className="h-9 w-auto text-xs"
            >
              <option value="">Déplacer vers…</option>
              {moveTargets.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageThread thread={thread} currentId={message.id} onOpen={onOpenThreadMessage} />
        {showCrm ? (
          <MessageCrm message={message} clients={clients} applications={applications} onChanged={onCrmChanged} />
        ) : null}

        {body ? (
          <div className="whitespace-pre-line text-[13px] leading-relaxed text-foreground/90">{body}</div>
        ) : (
          <p className="text-sm text-muted-foreground">(message sans contenu)</p>
        )}

        {message.attachments?.length ? (
          <div className="mt-5 border-t border-border pt-4">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Pièces jointes ({message.attachments.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((a) => {
                const inner = (
                  <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground">
                    <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="max-w-[180px] truncate">{a.filename || "pièce jointe"}</span>
                    <span className="text-muted-foreground">{formatBytes(a.size_bytes)}</span>
                  </span>
                );
                return a.url ? (
                  <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-80">
                    {inner}
                  </a>
                ) : (
                  <span key={a.id}>{inner}</span>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
