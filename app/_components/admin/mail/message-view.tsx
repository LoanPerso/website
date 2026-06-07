"use client";

import { useEffect, useState } from "react";
import { Check, Copy, FolderInput, Forward, Languages, Link2, MailOpen, Paperclip, Reply, ReplyAll, Star, Trash2 } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { translateText } from "@/_lib/admin/mail";
import { formatDateTime, formatRelativeDate } from "@/_lib/admin/format";
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

// Source-language label for the translation banner ("Traduit depuis …").
const LANG_FR: Record<string, string> = {
  en: "l'anglais",
  de: "l'allemand",
  es: "l'espagnol",
  it: "l'italien",
  et: "l'estonien",
  nl: "le néerlandais",
  pt: "le portugais",
  ru: "le russe",
  ar: "l'arabe",
};

// Two-letter monogram for the sender avatar (initials of the display name, or
// the first letters of the address as a fallback).
function senderInitials(name: string | null, address: string | null): string {
  const base = (name && name.trim()) || address || "";
  const parts = base.replace(/[<>]/g, " ").trim().split(/[\s.@_-]+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// Heuristic: does the body already read as French? (Accents + common stopwords.)
// When it does we don't surface the translate prompt — like real mail clients
// that only offer translation for a foreign-language message.
function isLikelyFrench(text: string): boolean {
  const sample = ` ${text.slice(0, 1500).toLowerCase()} `;
  const accents = (sample.match(/[éèêàâîïôûùçœ]/g) || []).length;
  const FR = [" le ", " la ", " les ", " des ", " une ", " est ", " vous ", " nous ", " votre ", " bonjour ", " cordialement ", " merci ", " pour ", " avec ", " dans ", " au ", " du "];
  const EN = [" the ", " and ", " you ", " your ", " is ", " are ", " please ", " regards ", " hello ", " thank ", " with ", " for ", " best ", " we ", " our ", " this ", " have "];
  const fr = accents * 2 + FR.reduce((n, w) => n + (sample.includes(w) ? 1 : 0), 0);
  const en = EN.reduce((n, w) => n + (sample.includes(w) ? 1 : 0), 0);
  return fr > 0 && fr >= en;
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
  const [copied, setCopied] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [detected, setDetected] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [transError, setTransError] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  // Reset per-message view state when the open message changes (CRM panel opens
  // when already linked; translation/copy state starts fresh).
  useEffect(() => {
    setShowCrm(!!(message?.client_id || message?.application_id));
    setCopied(false);
    setTranslated(null);
    setDetected(null);
    setTranslating(false);
    setTransError(null);
    setShowOriginal(false);
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
  const canTranslate = !!body && !isLikelyFrench(body);

  async function handleTranslate() {
    setTranslating(true);
    setTransError(null);
    const res = await translateText(body, "fr");
    setTranslating(false);
    if (res.error || !res.data) return setTransError(res.error ?? "Échec de la traduction.");
    setTranslated(res.data.text);
    setDetected(res.data.detected);
    setShowOriginal(false);
  }

  // Copy the whole mail (headers + the body as currently shown — translated or
  // original) to the clipboard.
  async function handleCopy() {
    const shown = translated && !showOriginal ? translated : body;
    const header = [
      message!.subject ? `Objet : ${message!.subject}` : null,
      `De : ${addressLine(message!.from_address ? [{ name: message!.from_name, address: message!.from_address }] : [])}`,
      message!.to_addresses?.length ? `À : ${addressLine(message!.to_addresses)}` : null,
      message!.cc_addresses?.length ? `Cc : ${addressLine(message!.cc_addresses)}` : null,
      `Date : ${formatDateTime(message!.received_at ?? message!.sent_at ?? message!.created_at)}`,
    ]
      .filter(Boolean)
      .join("\n");
    const text = `${header}\n\n${shown}`.trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-col overflow-hidden bg-background">
      {/* Slim action toolbar — one line, always visible, icon-only. The heavy meta
          (subject, sender, recipients) lives in the scroll area below and scrolls
          away naturally, so there is no jumpy collapse-on-scroll. */}
      <div className="flex shrink-0 items-center gap-0.5 overflow-x-auto border-b border-border px-1.5 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Button variant="ghost" size="sm" onClick={onReply} title="Répondre" aria-label="Répondre" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
          <Reply className="h-[18px] w-[18px] text-muted-foreground" />
        </Button>
        {recipientCount > 1 ? (
          <Button variant="ghost" size="sm" onClick={onReplyAll} title="Répondre à tous" aria-label="Répondre à tous" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
            <ReplyAll className="h-[18px] w-[18px] text-muted-foreground" />
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onForward} title="Transférer" aria-label="Transférer" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
          <Forward className="h-[18px] w-[18px] text-muted-foreground" />
        </Button>
        {message.direction === "in" ? (
          <Button variant="ghost" size="sm" onClick={onMarkUnread} title="Marquer non lu" aria-label="Marquer non lu" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
            <MailOpen className="h-[18px] w-[18px] text-muted-foreground" />
          </Button>
        ) : null}
        {moveTargets.length ? (
          <div className="relative h-10 w-10 shrink-0 sm:h-9 sm:w-9" title="Déplacer vers">
            <FolderInput className="pointer-events-none absolute inset-0 m-auto h-[18px] w-[18px] text-muted-foreground" />
            <select
              aria-label="Déplacer vers"
              value=""
              onChange={(e) => e.target.value && onMove(e.target.value)}
              className="h-full w-full cursor-pointer appearance-none rounded-md bg-transparent text-transparent outline-none transition-colors hover:bg-secondary"
            >
              <option value="" disabled>
                Déplacer vers…
              </option>
              {moveTargets.map((f) => (
                <option key={f.id} value={f.id} className="text-foreground">
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden />

        <Button variant="ghost" size="sm" onClick={() => onToggleFlag(!message.is_flagged)} title="Marquer comme suivi" aria-label="Drapeau" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
          <Star className={cn("h-[18px] w-[18px]", message.is_flagged ? "fill-alert text-alert" : "text-muted-foreground")} />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleCopy} title={copied ? "Copié !" : "Copier le message"} aria-label="Copier le message" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
          {copied ? <Check className="h-[18px] w-[18px] text-success" /> : <Copy className="h-[18px] w-[18px] text-muted-foreground" />}
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} disabled={busy} title="Supprimer" aria-label="Supprimer" className="h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9">
          <Trash2 className="h-[18px] w-[18px] text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowCrm((v) => !v)} title="Lien CRM" aria-label="Afficher/masquer le lien CRM" className={cn("h-10 w-10 shrink-0 p-0 sm:h-9 sm:w-9", showCrm && "bg-secondary")}>
          <Link2 className={cn("h-[18px] w-[18px]", showCrm ? "text-foreground" : "text-muted-foreground")} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain admin-scroll p-4">
        {/* Subject + sender + recipients live here so they scroll away as you read
            — no fixed mega-header, no jumpy collapse. */}
        <h2 className="mb-3 break-words text-[17px] font-semibold leading-snug tracking-tight text-foreground">
          {message.subject || "(sans objet)"}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
            {senderInitials(message.from_name, message.from_address)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {message.from_name || message.from_address || "—"}
            </p>
            {message.from_name && message.from_address ? (
              <p className="truncate text-xs text-muted-foreground">{message.from_address}</p>
            ) : null}
          </div>
          <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
            {formatRelativeDate(message.received_at ?? message.sent_at ?? message.created_at)}
          </span>
        </div>
        <p className="mb-4 mt-1.5 break-words pl-12 text-xs text-muted-foreground">
          À {addressLine(message.to_addresses)}
          {message.cc_addresses?.length ? `  ·  Cc ${addressLine(message.cc_addresses)}` : ""}
          {message.is_answered ? "  ·  Répondu" : ""}
        </p>
        <MessageThread thread={thread} currentId={message.id} onOpen={onOpenThreadMessage} />
        {showCrm ? (
          <MessageCrm message={message} clients={clients} applications={applications} onChanged={onCrmChanged} />
        ) : null}

        {body ? (
          <>
            {/* Translate banner — Gmail-style; only offered for a foreign-language
                message (hidden when the body already reads as French). */}
            {(canTranslate || translated) && (
              <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
              {translated ? (
                <>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Languages className="h-3.5 w-3.5" />
                    {showOriginal
                      ? "Message original"
                      : `Traduit${detected && LANG_FR[detected] ? ` depuis ${LANG_FR[detected]}` : " en français"}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowOriginal((v) => !v)}
                    className="select-none font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    {showOriginal ? "Voir la traduction" : "Afficher l'original"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={translating}
                  className="inline-flex select-none items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 font-medium text-foreground transition-colors hover:bg-secondary active:bg-secondary disabled:opacity-60"
                >
                  <Languages className="h-3.5 w-3.5 text-muted-foreground" />
                  {translating ? "Traduction…" : "Traduire en français"}
                </button>
              )}
              {transError ? <span className="text-error">{transError}</span> : null}
              </div>
            )}
            <div className="max-w-2xl whitespace-pre-line break-words text-sm leading-7 text-foreground/90">
              {translated && !showOriginal ? translated : body}
            </div>
          </>
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
