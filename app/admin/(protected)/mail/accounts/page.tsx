"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FlaskConical, Plus } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { AccountForm } from "@/_components/admin/mail/account-form";
import { listAccounts } from "@/_lib/admin/mail";
import type { MailAccount, MailCheckStatus } from "@/_lib/admin/types";

const STATUS_DOT: Record<MailCheckStatus, string> = {
  ok: "bg-success",
  error: "bg-error",
  unknown: "bg-muted-foreground/40",
};

export default function MailAccountsPage() {
  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const res = await listAccounts();
    setAccounts(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (loading || creating) return;
    setSelectedId((prev) =>
      prev && accounts.some((a) => a.id === prev) ? prev : (accounts.find((a) => a.is_default) ?? accounts[0])?.id ?? null
    );
  }, [loading, creating, accounts]);

  const selected = creating ? null : accounts.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh_-_3.5rem)] flex-col bg-background transition-[left] lg:fixed lg:inset-y-0 lg:left-[var(--sidebar-w,15rem)] lg:right-0 lg:m-0 lg:h-auto">
      {/* Slim toolbar (no page title/description) */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Link
          href="/admin/mail"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Messagerie
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="flex-1 truncate text-sm font-medium text-foreground">Comptes</span>
        <Link
          href="/admin/mail/simulate"
          title="Bac à sable (données simulées)"
          aria-label="Bac à sable"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <FlaskConical className="h-4 w-4" />
        </Link>
        <Button
          size="sm"
          onClick={() => {
            setCreating(true);
            setSelectedId(null);
          }}
        >
          <Plus className="h-4 w-4" /> Nouveau
        </Button>
      </div>

      {/* Master–detail: the list keeps its own scroll (stays put while the form scrolls). */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="max-h-[38vh] shrink-0 overflow-y-auto overscroll-contain border-b border-border bg-secondary/20 p-2 lg:max-h-none lg:w-64 lg:border-b-0 lg:border-r">
          {loading ? (
            <p className="p-2 text-xs text-muted-foreground">Chargement…</p>
          ) : accounts.length === 0 && !creating ? (
            <p className="p-2 text-xs text-muted-foreground">Aucun compte.</p>
          ) : (
            <ul className="space-y-0.5">
              {accounts.map((a) => {
                const active = !creating && a.id === selectedId;
                return (
                  <li key={a.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setCreating(false);
                        setSelectedId(a.id);
                      }}
                      className={cn(
                        "w-full rounded-md px-2.5 py-1.5 text-left transition-colors",
                        active ? "bg-background shadow-sm" : "hover:bg-background/60"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="flex-1 truncate text-[13px] font-medium text-foreground">{a.label}</span>
                        <span
                          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[a.last_smtp_status])}
                          title="SMTP"
                        />
                        <span
                          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOT[a.last_imap_status])}
                          title="IMAP"
                        />
                      </div>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {a.email}
                        {a.is_default ? " · défaut" : ""}
                        {!a.is_active ? " · inactif" : ""}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {creating || selected ? (
            <div className="mx-auto max-w-2xl p-4">
              <p className="mb-3 text-sm font-semibold tracking-tight text-foreground">
                {creating ? "Nouveau compte" : selected?.label}
              </p>
              <AccountForm
                key={selected?.id ?? "new"}
                account={selected}
                onSaved={(acc) => {
                  setCreating(false);
                  setSelectedId(acc.id);
                  load();
                }}
                onDeleted={() => {
                  setCreating(false);
                  setSelectedId(null);
                  load();
                }}
                onStatusChange={load}
              />
            </div>
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Sélectionnez un compte ou créez-en un.</p>
          )}
        </div>
      </div>
    </div>
  );
}
