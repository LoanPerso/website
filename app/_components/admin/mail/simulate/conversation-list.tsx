"use client";

import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { cn } from "@/_lib/utils";
import { EmptyState } from "@/_components/admin/panel";
import { formatRelativeDate } from "@/_lib/admin/format";
import type { SimulateConversation } from "./types";

// Left pane: the sandbox conversation list, styled like the live webmail's
// message list (search + sender / subject / preview rows).
export function ConversationList({
  conversations,
  selectedKey,
  onSelect,
  search,
  onSearch,
}: {
  conversations: SimulateConversation[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  search: string;
  onSearch: (value: string) => void;
}) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden border-border bg-background lg:border-r">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Rechercher une conversation…"
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune conversation"
              hint="Créez un mail entrant, ou envoyez-en un depuis la messagerie : il apparaîtra ici."
            />
          </div>
        ) : (
          <ul>
            {conversations.map((c) => {
              const active = c.key === selectedKey;
              // Mirror the webmail's direction cue: outbound = Quickfund wrote
              // last (↗), inbound = the correspondent answered last (↙).
              const LastIcon = c.lastDirection === "out" ? ArrowUpRight : ArrowDownLeft;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.key)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 border-b border-border px-3 py-2.5 text-left transition-colors",
                      active ? "bg-secondary" : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex-1 truncate text-[13px] font-medium text-foreground">{c.party}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatRelativeDate(c.lastAt)}</span>
                    </div>
                    <p className="truncate text-[13px] text-foreground/90">{c.subject}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <LastIcon className="h-3 w-3 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{c.lastSnippet || "—"}</span>
                      <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground/70">{c.count}</span>
                    </div>
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
