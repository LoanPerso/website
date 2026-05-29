"use client";

import Link from "next/link";
import {
  Archive,
  FileText,
  Inbox,
  Mail,
  PenSquare,
  RefreshCw,
  Send,
  Settings2,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Select } from "@/_components/admin/form";
import { formatRelativeDate } from "@/_lib/admin/format";
import type { MailAccount, MailCheckStatus, MailFolderRole, MailFolderWithCount } from "@/_lib/admin/types";

const FOLDER_ICON: Record<MailFolderRole, LucideIcon> = {
  inbox: Inbox,
  sent: Send,
  drafts: FileText,
  trash: Trash2,
  archive: Archive,
  spam: ShieldAlert,
  other: Mail,
};

const STATUS_DOT: Record<MailCheckStatus, string> = {
  ok: "bg-success",
  error: "bg-error",
  unknown: "bg-muted-foreground/40",
};

export function AccountSidebar({
  accounts,
  accountId,
  onSelectAccount,
  folders,
  folderId,
  onSelectFolder,
  onCompose,
  onSync,
  syncing,
}: {
  accounts: MailAccount[];
  accountId: string | null;
  onSelectAccount: (id: string) => void;
  folders: MailFolderWithCount[];
  folderId: string | null;
  onSelectFolder: (id: string) => void;
  onCompose: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const account = accounts.find((a) => a.id === accountId) ?? null;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden border-border bg-secondary/20 lg:border-r">
      <div className="space-y-3 border-b border-border p-3">
        {accounts.length > 1 ? (
          <Select aria-label="Compte" value={accountId ?? ""} onChange={(e) => onSelectAccount(e.target.value)} className="h-9 bg-background">
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} · {a.email}
              </option>
            ))}
          </Select>
        ) : account ? (
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">{account.display_name ?? account.label}</p>
            <p className="truncate text-xs text-muted-foreground">{account.email}</p>
          </div>
        ) : null}

        <Button onClick={onCompose} className="w-full justify-center">
          <PenSquare className="h-4 w-4" /> Composer
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {folders.map((f) => {
          const Icon = FOLDER_ICON[f.role] ?? Mail;
          const active = f.id === folderId;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFolder(f.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")} />
              <span className="flex-1 truncate text-left">{f.name}</span>
              {f.unread > 0 ? (
                <span className="rounded-full bg-foreground/10 px-1.5 py-px text-[10px] font-semibold tabular-nums text-foreground">
                  {f.unread}
                </span>
              ) : f.total > 0 ? (
                <span className="text-[10px] tabular-nums text-muted-foreground/70">{f.total}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-2">
        {account ? (
          <div className="flex items-center gap-3 px-2.5 pb-1 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[account.last_smtp_status])} /> SMTP
            </span>
            <span className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[account.last_imap_status])} /> IMAP
            </span>
            {!account.is_active ? <span className="text-error">Inactif</span> : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
          <span className="flex-1 text-left">Synchroniser</span>
          {account?.last_synced_at ? (
            <span className="text-[10px] text-muted-foreground/70">{formatRelativeDate(account.last_synced_at)}</span>
          ) : null}
        </button>
        <Link
          href="/admin/mail/accounts"
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" /> Gérer les comptes
        </Link>
      </div>
    </aside>
  );
}
