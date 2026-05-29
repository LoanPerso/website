"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FlaskConical, Plus } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Select } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  listAccountMessages,
  listAccounts,
  listMessagesFullByIds,
  simulateInboundMessage,
  simulateReplyTo,
} from "@/_lib/admin/mail";
import type { MailAccount, MailMessage, MailMessageListItem } from "@/_lib/admin/types";
import { ConversationList } from "@/_components/admin/mail/simulate/conversation-list";
import { ConversationThread } from "@/_components/admin/mail/simulate/conversation-thread";
import { EMPTY_DRAFT, NewMailForm, type NewMailDraft } from "@/_components/admin/mail/simulate/new-mail-form";
import { buildConversations } from "@/_components/admin/mail/simulate/types";

// On mobile only one pane shows at a time (list → detail); on lg both panes are
// side by side (the wrappers become `display:contents`), mirroring the webmail.
type MobileView = "list" | "detail";

export default function MailSimulatePage() {
  const toast = useToast();

  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [accountId, setAccountId] = useState("");
  const [messages, setMessages] = useState<MailMessageListItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [threadFull, setThreadFull] = useState<MailMessage[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [newMode, setNewMode] = useState(false);
  const [reply, setReply] = useState("");
  const [draft, setDraft] = useState<NewMailDraft>(EMPTY_DRAFT);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const account = accounts.find((a) => a.id === accountId) ?? null;
  const selfLabel = account?.display_name ?? account?.label ?? "Quickfund";

  useEffect(() => {
    (async () => {
      const res = await listAccounts();
      const rows = res.data ?? [];
      setAccounts(rows);
      setAccountId((prev) => prev || (rows.find((a) => a.is_default) ?? rows[0])?.id || "");
    })();
  }, []);

  const loadMessages = useCallback(async () => {
    if (!accountId) {
      setMessages([]);
      return;
    }
    const res = await listAccountMessages(accountId);
    setMessages(res.data ?? []);
  }, [accountId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const conversations = useMemo(() => buildConversations(messages), [messages]);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.party.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        (c.partyAddress ?? "").toLowerCase().includes(q)
    );
  }, [conversations, search]);
  // Resolve the open conversation from the full set (not the filtered one) so a
  // search query never drops the message that is currently being read.
  const selected = useMemo(
    () => conversations.find((c) => c.key === selectedKey) ?? null,
    [conversations, selectedKey]
  );

  // Load the full bodies of the open conversation; re-runs whenever its messages
  // change (e.g. after a reply / new inbound reloads the list).
  const loadThread = useCallback(async () => {
    if (!selected) {
      setThreadFull([]);
      return;
    }
    setLoadingThread(true);
    const res = await listMessagesFullByIds(selected.items.map((i) => i.id));
    const rows = (res.data ?? [])
      .slice()
      .sort(
        (a, b) =>
          new Date(a.received_at ?? a.sent_at ?? a.created_at).getTime() -
          new Date(b.received_at ?? b.sent_at ?? b.created_at).getTime()
      );
    setThreadFull(rows);
    setLoadingThread(false);
  }, [selected]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

  function selectConversation(key: string) {
    setNewMode(false);
    setSelectedKey(key);
    setReply("");
    setMobileView("detail");
  }

  function startNew() {
    setNewMode(true);
    setSelectedKey(null);
    setDraft(EMPTY_DRAFT);
    setMobileView("detail");
  }

  async function sendReply() {
    if (!selected || threadFull.length === 0 || !reply.trim()) return;
    const latest = threadFull[threadFull.length - 1];
    setBusy(true);
    const res = await simulateReplyTo(latest, reply);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(`Réponse reçue de ${selected.party}.`);
    setReply("");
    await loadMessages(); // thread refreshes via the loadThread effect
  }

  async function createInbound() {
    if (!accountId) return toast("Sélectionnez un compte.", "error");
    if (!draft.from_address.trim()) return toast("Indiquez l'e-mail de l'expéditeur.", "error");
    setBusy(true);
    const res = await simulateInboundMessage({
      account_id: accountId,
      from_name: draft.from_name || null,
      from_address: draft.from_address,
      subject: draft.subject.trim() || "(sans objet)",
      body_text: draft.body,
    });
    setBusy(false);
    if (res.error || !res.data) return toast(res.error ?? "Erreur", "error");
    toast("Mail entrant créé.");
    setDraft(EMPTY_DRAFT);
    setNewMode(false);
    await loadMessages();
    setSelectedKey(res.data.thread_key || res.data.id);
  }

  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh_-_3.5rem)] flex-col bg-background transition-[left] lg:fixed lg:inset-y-0 lg:left-[var(--sidebar-w,15rem)] lg:right-0 lg:m-0 lg:h-auto">
      {/* Toolbar — hidden on the mobile detail view (replaced by a back bar). */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
          mobileView === "detail" && "hidden lg:flex"
        )}
      >
        <Link
          href="/admin/mail"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Messagerie
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2 py-0.5 text-xs font-medium text-foreground">
          <FlaskConical className="h-3.5 w-3.5 text-muted-foreground" /> Simulation
        </span>
        <span className="hidden text-xs text-muted-foreground md:inline">
          — l'autre côté du smoke : répondez en tant que l'interlocuteur
        </span>
        <div className="ml-auto flex items-center gap-2">
          {accounts.length > 1 ? (
            <Select
              aria-label="Compte"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="h-9 w-48 text-xs"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {a.email}
                </option>
              ))}
            </Select>
          ) : null}
          <Button size="sm" variant={newMode ? "default" : "outline"} onClick={startNew}>
            <Plus className="h-4 w-4" /> Nouveau mail
          </Button>
        </div>
      </div>

      {/* Mobile back bar (detail view only). */}
      {mobileView === "detail" ? (
        <div className="flex items-center gap-1.5 border-b border-border px-2 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => {
              setMobileView("list");
              setNewMode(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Retour"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="flex-1 truncate text-sm font-medium text-foreground">
            {newMode ? "Nouveau mail entrant" : selected?.party ?? "Conversation"}
          </span>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <div className={cn(mobileView === "list" ? "flex flex-col" : "hidden", "min-h-0 min-w-0 [&>*]:flex-1 lg:contents")}>
          <ConversationList
            conversations={visible}
            selectedKey={selectedKey}
            onSelect={selectConversation}
            search={search}
            onSearch={setSearch}
          />
        </div>

        <div className={cn(mobileView === "detail" ? "flex flex-col" : "hidden", "min-h-0 min-w-0 [&>*]:flex-1 lg:contents")}>
          {newMode ? (
            <NewMailForm
              accounts={accounts}
              accountId={accountId}
              onAccountChange={setAccountId}
              draft={draft}
              onDraftChange={setDraft}
              onSubmit={createInbound}
              onCancel={() => {
                setNewMode(false);
                setMobileView("list");
              }}
              busy={busy}
            />
          ) : selected ? (
            <ConversationThread
              conversation={selected}
              messages={threadFull}
              selfLabel={selfLabel}
              loading={loadingThread}
              reply={reply}
              onReplyChange={setReply}
              onSend={sendReply}
              busy={busy}
            />
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center bg-background p-8">
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                Sélectionnez une conversation, ou créez un mail entrant pour démarrer un échange.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
