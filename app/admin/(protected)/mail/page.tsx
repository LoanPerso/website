"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, PenSquare, Settings2 } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { EmptyState } from "@/_components/admin/panel";
import { useToast } from "@/_components/admin/toast";
import { AccountSidebar } from "@/_components/admin/mail/account-sidebar";
import { MessageList } from "@/_components/admin/mail/message-list";
import { MessageView } from "@/_components/admin/mail/message-view";
import { ComposePane, type ComposeContext } from "@/_components/admin/mail/compose-pane";
import {
  deleteMessage,
  getMessage,
  listAccounts,
  listFoldersWithCounts,
  listMessages,
  listThread,
  markSeen,
  moveToFolder,
  syncMailbox,
  toggleFlag,
  type MailFilter,
} from "@/_lib/admin/mail";
import { listClients } from "@/_lib/admin/clients";
import { listApplications } from "@/_lib/admin/applications";
import type {
  Client,
  LoanApplication,
  MailAccount,
  MailFolderWithCount,
  MailMessageFull,
  MailMessageListItem,
} from "@/_lib/admin/types";

// On mobile, only one pane shows at a time (folders → list → message); on lg the
// three panes are displayed side by side (the wrappers become `display:contents`).
type MobileView = "folders" | "list" | "message";

export default function MailPage() {
  const toast = useToast();

  const [accounts, setAccounts] = useState<MailAccount[]>([]);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [folders, setFolders] = useState<MailFolderWithCount[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MailMessageListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState<MailMessageFull | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<MailFilter>("all");
  const [mobileView, setMobileView] = useState<MobileView>("list");

  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [composeContext, setComposeContext] = useState<ComposeContext | null>(null);

  // CRM directories for linking a message to a client / application (loaded once).
  const [crmClients, setCrmClients] = useState<Client[]>([]);
  const [crmApps, setCrmApps] = useState<LoanApplication[]>([]);
  const [thread, setThread] = useState<MailMessageListItem[]>([]);

  const account = accounts.find((a) => a.id === accountId) ?? null;
  const folder = folders.find((f) => f.id === folderId) ?? null;

  // Accounts -------------------------------------------------------------------
  const loadAccounts = useCallback(async () => {
    const res = await listAccounts();
    const rows = res.data ?? [];
    setAccounts(rows);
    setLoadingAccounts(false);
    setAccountId((prev) => {
      if (prev && rows.some((a) => a.id === prev)) return prev;
      return (rows.find((a) => a.is_default) ?? rows[0])?.id ?? null;
    });
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // CRM directories (clients + applications) for the reader's linking panel.
  useEffect(() => {
    (async () => {
      const [c, a] = await Promise.all([listClients({ pageSize: 500 }), listApplications("all")]);
      setCrmClients(c.data?.rows ?? []);
      setCrmApps(a.data ?? []);
    })();
  }, []);

  // Folders --------------------------------------------------------------------
  const loadFolders = useCallback(async (accId: string) => {
    const res = await listFoldersWithCounts(accId);
    const rows = res.data ?? [];
    setFolders(rows);
    setFolderId((prev) => {
      if (prev && rows.some((f) => f.id === prev)) return prev;
      return (rows.find((f) => f.role === "inbox") ?? rows[0])?.id ?? null;
    });
  }, []);

  useEffect(() => {
    if (!accountId) {
      setFolders([]);
      setFolderId(null);
      return;
    }
    loadFolders(accountId);
  }, [accountId, loadFolders]);

  const refreshFolders = useCallback(() => {
    if (accountId) loadFolders(accountId);
  }, [accountId, loadFolders]);

  // Messages -------------------------------------------------------------------
  const loadMessages = useCallback(async () => {
    if (!accountId || !folderId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    const res = await listMessages({ accountId, folderId, search, filter });
    setMessages(res.data ?? []);
    setLoadingMessages(false);
  }, [accountId, folderId, search, filter]);

  useEffect(() => {
    const t = setTimeout(loadMessages, 200);
    return () => clearTimeout(t);
  }, [loadMessages]);

  // Open a message: full body + mark inbound unseen as read.
  useEffect(() => {
    let active = true;
    if (!selectedId) {
      setMessage(null);
      return;
    }
    (async () => {
      setLoadingMessage(true);
      const res = await getMessage(selectedId);
      if (!active) return;
      setMessage(res.data);
      setLoadingMessage(false);
      if (res.data && res.data.direction === "in" && !res.data.is_seen) {
        await markSeen(res.data.id, true);
        setMessages((prev) => prev.map((m) => (m.id === res.data!.id ? { ...m, is_seen: true } : m)));
        refreshFolders();
      }
    })();
    return () => {
      active = false;
    };
  }, [selectedId, refreshFolders]);

  // Re-fetch the open message (after a CRM link / application status change).
  const reloadMessage = useCallback(async () => {
    if (!selectedId) return;
    const res = await getMessage(selectedId);
    setMessage(res.data);
  }, [selectedId]);

  // Conversation thread of the open message (across folders).
  const loadThread = useCallback(async () => {
    if (!accountId || !message?.thread_key) {
      setThread([]);
      return;
    }
    const res = await listThread(accountId, message.thread_key);
    setThread(res.data ?? []);
  }, [accountId, message?.thread_key]);

  useEffect(() => {
    loadThread();
  }, [loadThread, message?.id]);

  // Handlers -------------------------------------------------------------------
  function selectAccount(id: string) {
    setAccountId(id);
    setFolderId(null);
    setSelectedId(null);
    setMessage(null);
    setComposeContext(null);
    setSearch("");
    setFilter("all");
  }

  function selectFolder(id: string) {
    setFolderId(id);
    setSelectedId(null);
    setMessage(null);
    setComposeContext(null);
    setMobileView("list");
  }

  function selectMessage(id: string) {
    setComposeContext(null);
    setSelectedId(id);
    setMobileView("message");
  }

  function openCompose(mode: ComposeContext["mode"], src?: MailMessageFull | null) {
    setComposeContext({ mode, message: src ?? null });
  }

  async function handleSync() {
    if (!accountId) return;
    setSyncing(true);
    const res = await syncMailbox(accountId);
    setSyncing(false);
    if (res.error) return toast(res.error, "error");
    toast("Boîte synchronisée.");
    loadAccounts();
    refreshFolders();
    loadMessages();
  }

  async function handleToggleFlag(flagged: boolean) {
    if (!message) return;
    const res = await toggleFlag(message.id, flagged);
    if (res.error) return toast(res.error, "error");
    setMessage((m) => (m ? { ...m, is_flagged: flagged } : m));
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_flagged: flagged } : m)));
  }

  async function handleMarkUnread() {
    if (!message) return;
    const res = await markSeen(message.id, false);
    if (res.error) return toast(res.error, "error");
    setMessage((m) => (m ? { ...m, is_seen: false } : m));
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_seen: false } : m)));
    refreshFolders();
    setMobileView("list");
  }

  async function handleMove(folderId: string) {
    if (!message) return;
    setBusy(true);
    const res = await moveToFolder(message.id, folderId);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(`Déplacé vers ${folders.find((f) => f.id === folderId)?.name ?? "le dossier"}.`);
    setSelectedId(null);
    setMessage(null);
    setMobileView("list");
    loadMessages();
    refreshFolders();
  }

  async function handleDelete() {
    if (!message) return;
    setBusy(true);
    const trash = folders.find((f) => f.role === "trash");
    const inTrash = folder?.role === "trash";
    const res = trash && !inTrash ? await moveToFolder(message.id, trash.id) : await deleteMessage(message.id);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(inTrash ? "Message supprimé définitivement." : "Message déplacé dans la corbeille.");
    setSelectedId(null);
    setMessage(null);
    setMobileView("list");
    loadMessages();
    refreshFolders();
  }

  function onComposed() {
    setComposeContext(null);
    loadMessages();
    refreshFolders();
    reloadMessage();
    loadThread();
  }

  // Render ---------------------------------------------------------------------
  if (loadingAccounts) {
    return <p className="text-sm text-muted-foreground">Chargement…</p>;
  }

  if (accounts.length === 0) {
    return (
      <div className="mx-auto max-w-md py-10">
        <EmptyState title="Aucune boîte configurée" hint="Ajoutez un compte pour commencer à gérer votre messagerie." />
        <div className="mt-4 flex justify-center">
          <Button asChild>
            <Link href="/admin/mail/accounts">
              <Settings2 className="h-4 w-4" /> Configurer un compte
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const composing = !!composeContext;
  const showSidebar = mobileView === "folders" && !composing;
  const showList = mobileView === "list" && !composing;
  const showReader = composing || mobileView === "message";
  const mobileTitle =
    mobileView === "list" ? folder?.name ?? "Messages" : mobileView === "message" ? folder?.name ?? "Message" : account?.label ?? "Messagerie";

  // Full-bleed: mobile fills the viewport below the admin top bar (single pane at a
  // time); desktop fixes the client to the whole area right of the admin sidebar.
  return (
    <div className="-mx-4 -my-8 flex h-[calc(100dvh_-_3.5rem)] flex-col bg-background transition-[left] lg:fixed lg:inset-y-0 lg:left-[var(--sidebar-w,15rem)] lg:right-0 lg:m-0 lg:h-auto">
      {/* Mobile navigation bar (list / message views) */}
      {!composing && mobileView !== "folders" ? (
        <div className="flex items-center gap-1.5 border-b border-border px-2 py-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileView(mobileView === "message" ? "list" : "folders")}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Retour"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="flex-1 truncate text-sm font-medium text-foreground">{mobileTitle}</span>
          {mobileView === "list" ? (
            <button
              type="button"
              onClick={() => openCompose("new")}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Composer"
            >
              <PenSquare className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[16rem_24rem_minmax(0,1fr)]">
        <div className={cn(showSidebar ? "flex flex-col" : "hidden", "min-h-0 min-w-0 [&>*]:flex-1 lg:contents")}>
          <AccountSidebar
            accounts={accounts}
            accountId={accountId}
            onSelectAccount={selectAccount}
            folders={folders}
            folderId={folderId}
            onSelectFolder={selectFolder}
            onCompose={() => openCompose("new")}
            onSync={handleSync}
            syncing={syncing}
          />
        </div>

        <div className={cn(showList ? "flex flex-col" : "hidden", "min-h-0 min-w-0 [&>*]:flex-1 lg:contents")}>
          <MessageList
            messages={messages}
            selectedId={composing ? null : selectedId}
            onSelect={selectMessage}
            loading={loadingMessages}
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            folderRole={folder?.role}
          />
        </div>

        <div className={cn(showReader ? "flex flex-col" : "hidden", "min-h-0 min-w-0 [&>*]:flex-1 lg:contents")}>
          {composeContext ? (
            <ComposePane
              accounts={accounts}
              defaultAccountId={accountId}
              context={composeContext}
              onSent={onComposed}
              onCancel={() => setComposeContext(null)}
            />
          ) : (
            <MessageView
              message={message}
              loading={loadingMessage}
              onReply={() => message && openCompose("reply", message)}
              onReplyAll={() => message && openCompose("replyAll", message)}
              onForward={() => message && openCompose("forward", message)}
              onToggleFlag={handleToggleFlag}
              onDelete={handleDelete}
              onMarkUnread={handleMarkUnread}
              onMove={handleMove}
              busy={busy}
              clients={crmClients}
              applications={crmApps}
              onCrmChanged={reloadMessage}
              folders={folders}
              thread={thread}
              onOpenThreadMessage={selectMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
