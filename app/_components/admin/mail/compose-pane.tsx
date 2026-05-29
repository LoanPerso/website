"use client";

import { useEffect, useState } from "react";
import { Save, Send, X } from "lucide-react";
import { Field, Select, TextInput, Textarea } from "@/_components/admin/form";
import { Button } from "@/_components/ui/button";
import { useToast } from "@/_components/admin/toast";
import { saveDraft, sendMessage } from "@/_lib/admin/mail";
import { formatDateTime } from "@/_lib/admin/format";
import type { MailAccount, MailAddress, MailMessageFull } from "@/_lib/admin/types";

export type ComposeMode = "new" | "reply" | "replyAll" | "forward";

export interface ComposeContext {
  mode: ComposeMode;
  message?: MailMessageFull | null;
}

function parseRecipients(value: string): MailAddress[] {
  return value
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((address) => ({ address }));
}

function withPrefix(prefix: string, subject: string | null | undefined): string {
  const s = (subject ?? "").trim();
  return s.toLowerCase().startsWith(prefix.toLowerCase()) ? s : `${prefix}${s}`;
}

function quote(original: MailMessageFull): string {
  const who = original.from_name || original.from_address || "l'expéditeur";
  const when = formatDateTime(original.received_at ?? original.sent_at ?? original.created_at);
  const body = (original.body_text ?? "").split("\n").map((l) => `> ${l}`).join("\n");
  return `\n\nLe ${when}, ${who} a écrit :\n${body}`;
}

// Inline composer pane (no modal — Golden Rule 9). Lives in the reader column and
// replaces the message view while composing/replying/forwarding.
export function ComposePane({
  accounts,
  defaultAccountId,
  context,
  onSent,
  onCancel,
}: {
  accounts: MailAccount[];
  defaultAccountId: string | null;
  context: ComposeContext;
  onSent: () => void;
  onCancel: () => void;
}) {
  const toast = useToast();
  const [accountId, setAccountId] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const src = context.message ?? null;
    const accId = src?.account_id ?? defaultAccountId ?? accounts[0]?.id ?? "";
    const account = accounts.find((a) => a.id === accId) ?? null;
    const signature = account?.signature ? `\n\n${account.signature}` : "";
    setAccountId(accId);
    if ((context.mode === "reply" || context.mode === "replyAll") && src) {
      // Reply target depends on direction: an inbound mail replies to its sender,
      // an outbound mail replies to its original recipients. Reply-all adds the rest.
      const self = (account?.email ?? "").toLowerCase();
      const fmt = (xs: MailAddress[]) => xs.map((a) => a.address).filter(Boolean).join(", ");
      const toList: MailAddress[] =
        src.direction === "in"
          ? src.from_address
            ? [{ address: src.from_address, name: src.from_name }]
            : []
          : src.to_addresses ?? [];
      let ccList: MailAddress[] = [];
      if (context.mode === "replyAll") {
        ccList = [...(src.to_addresses ?? []), ...(src.cc_addresses ?? [])].filter(
          (a) =>
            a.address &&
            a.address.toLowerCase() !== self &&
            !toList.some((t) => t.address.toLowerCase() === a.address.toLowerCase())
        );
      }
      setTo(fmt(toList));
      setCc(fmt(ccList));
      setSubject(withPrefix("Re: ", src.subject));
      setBody(`${signature}${quote(src)}`);
    } else if (context.mode === "forward" && src) {
      setTo("");
      setCc("");
      setSubject(withPrefix("Fwd: ", src.subject));
      setBody(`${signature}${quote(src)}`);
    } else {
      setTo("");
      setCc("");
      setSubject("");
      setBody(signature);
    }
  }, [context, defaultAccountId, accounts]);

  function crmLinks(): { client_id: string | null; application_id: string | null } {
    if ((context.mode === "reply" || context.mode === "replyAll") && context.message) {
      return { client_id: context.message.client_id ?? null, application_id: context.message.application_id ?? null };
    }
    return { client_id: null, application_id: null };
  }

  async function handleSend() {
    const recipients = parseRecipients(to);
    if (!accountId) return toast("Sélectionnez un compte d'envoi.", "error");
    if (!recipients.length) return toast("Indiquez au moins un destinataire.", "error");
    setBusy(true);
    const res = await sendMessage({
      account_id: accountId,
      to: recipients,
      cc: parseRecipients(cc),
      subject: subject.trim() || "(sans objet)",
      body_text: body,
      in_reply_to:
        context.mode === "reply" || context.mode === "replyAll" ? context.message?.message_id ?? null : null,
      thread_key: context.message?.thread_key ?? null,
      ...crmLinks(),
    });
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Message envoyé.");
    onSent();
  }

  async function handleDraft() {
    if (!accountId) return toast("Sélectionnez un compte d'envoi.", "error");
    setBusy(true);
    const res = await saveDraft({
      account_id: accountId,
      to: parseRecipients(to),
      cc: parseRecipients(cc),
      subject: subject.trim() || "(sans objet)",
      body_text: body,
      thread_key: context.message?.thread_key ?? null,
    });
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Brouillon enregistré.");
    onSent();
  }

  const title =
    context.mode === "reply"
      ? "Répondre"
      : context.mode === "replyAll"
      ? "Répondre à tous"
      : context.mode === "forward"
      ? "Transférer"
      : "Nouveau message";

  return (
    <section className="flex min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0" title="Annuler" aria-label="Annuler">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <Field label="De">
          <Select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {(a.display_name ?? a.label)} &lt;{a.email}&gt;
              </option>
            ))}
          </Select>
        </Field>
        <Field label="À" hint="Séparez plusieurs adresses par une virgule.">
          <TextInput value={to} onChange={(e) => setTo(e.target.value)} placeholder="destinataire@exemple.com" />
        </Field>
        <Field label="Cc">
          <TextInput value={cc} onChange={(e) => setCc(e.target.value)} placeholder="(optionnel)" />
        </Field>
        <Field label="Objet">
          <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Message">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[220px]" />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <Button variant="outline" onClick={handleDraft} disabled={busy}>
          <Save className="h-4 w-4" /> Brouillon
        </Button>
        <Button onClick={handleSend} disabled={busy}>
          <Send className="h-4 w-4" /> {busy ? "Envoi…" : "Envoyer"}
        </Button>
      </div>
    </section>
  );
}
