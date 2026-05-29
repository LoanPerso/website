"use client";

import { Paperclip, Search, Star } from "lucide-react";
import { cn } from "@/_lib/utils";
import { SegmentedTabs } from "@/_components/admin/tabs";
import { EmptyState } from "@/_components/admin/panel";
import { PanelLoading } from "@/_components/admin/bits";
import { formatRelativeDate } from "@/_lib/admin/format";
import type { MailFolderRole, MailMessageListItem } from "@/_lib/admin/types";
import type { MailFilter } from "@/_lib/admin/mail";

const FILTERS = [
  { key: "all" as const, label: "Tous" },
  { key: "unread" as const, label: "Non lus" },
  { key: "flagged" as const, label: "Suivis" },
];

function counterparty(m: MailMessageListItem, role: MailFolderRole | undefined): string {
  if (m.direction === "out" || role === "sent" || role === "drafts") {
    const to = m.to_addresses?.[0];
    return to?.name || to?.address || "Destinataire inconnu";
  }
  return m.from_name || m.from_address || "Expéditeur inconnu";
}

function messageDate(m: MailMessageListItem): string {
  return formatRelativeDate(m.received_at ?? m.sent_at ?? m.created_at);
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  loading,
  search,
  onSearch,
  filter,
  onFilter,
  folderRole,
}: {
  messages: MailMessageListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  search: string;
  onSearch: (value: string) => void;
  filter: MailFilter;
  onFilter: (value: MailFilter) => void;
  folderRole?: MailFolderRole;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden border-border bg-background lg:border-r">
      <div className="space-y-2.5 border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher dans les messages…"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <SegmentedTabs tabs={FILTERS} active={filter} onChange={onFilter} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-3">
            <PanelLoading rows={6} />
          </div>
        ) : messages.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Aucun message" hint="Ce dossier est vide ou aucun message ne correspond au filtre." />
          </div>
        ) : (
          <ul>
            {messages.map((m) => {
              const unread = m.direction === "in" && !m.is_seen;
              const active = m.id === selectedId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(m.id)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left transition-colors",
                      active ? "bg-secondary" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", unread ? "bg-foreground" : "bg-transparent")}
                        aria-hidden
                      />
                      <span className={cn("flex-1 truncate text-[13px]", unread ? "font-semibold text-foreground" : "text-foreground")}>
                        {counterparty(m, folderRole)}
                      </span>
                      {m.is_flagged ? <Star className="h-3.5 w-3.5 shrink-0 fill-alert text-alert" /> : null}
                      {m.has_attachments ? <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
                      <span className="shrink-0 text-[11px] text-muted-foreground">{messageDate(m)}</span>
                    </div>
                    <p className={cn("truncate pl-3.5 text-[13px]", unread ? "font-medium text-foreground" : "text-foreground/90")}>
                      {m.subject || "(sans objet)"}
                    </p>
                    <p className="truncate pl-3.5 text-xs text-muted-foreground">{m.snippet || "—"}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
