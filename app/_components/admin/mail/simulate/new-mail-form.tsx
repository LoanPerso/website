"use client";

import { Inbox, X } from "lucide-react";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { Button } from "@/_components/ui/button";
import type { MailAccount } from "@/_lib/admin/types";

export interface NewMailDraft {
  from_name: string;
  from_address: string;
  subject: string;
  body: string;
}

export const EMPTY_DRAFT: NewMailDraft = { from_name: "", from_address: "", subject: "", body: "" };

const PRESETS: { label: string; draft: NewMailDraft }[] = [
  {
    label: "Demande d'info",
    draft: {
      from_name: "Camille Durand",
      from_address: "camille.durand@gmail.com",
      subject: "Demande d'information — crédit conso",
      body: "Bonjour,\n\nJe souhaite financer un achat (~6 000 €). Quelles sont vos conditions ?\n\nCordialement,\nCamille Durand",
    },
  },
  {
    label: "Relance",
    draft: {
      from_name: "Jean Mercier",
      from_address: "jean.mercier@outlook.fr",
      subject: "Remboursement anticipé",
      body: "Bonjour,\n\nEst-il possible de solder mon crédit par anticipation ? Merci.\n\nJean Mercier",
    },
  },
];

// Inline composer (no modal — Golden Rule 9): the correspondent writing a fresh
// mail **to** Quickfund. Mirrors the live ComposePane layout (header / fields / footer).
export function NewMailForm({
  accounts,
  accountId,
  onAccountChange,
  draft,
  onDraftChange,
  onSubmit,
  onCancel,
  busy,
}: {
  accounts: MailAccount[];
  accountId: string;
  onAccountChange: (id: string) => void;
  draft: NewMailDraft;
  onDraftChange: (draft: NewMailDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const target = accounts.find((a) => a.id === accountId) ?? null;

  return (
    <section className="flex min-h-0 flex-col bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Nouveau mail entrant</h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0" title="Annuler" aria-label="Annuler">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Modèles</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => onDraftChange(p.draft)}
              className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
            >
              {p.label}
            </button>
          ))}
        </div>

        <Field label="Boîte de réception (compte Quickfund)">
          {accounts.length > 1 ? (
            <Select value={accountId} onChange={(e) => onAccountChange(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label} · {a.email}
                </option>
              ))}
            </Select>
          ) : (
            <div className="rounded-md border border-border bg-secondary/30 px-2.5 py-1.5 text-[13px] text-foreground">
              {target ? `${target.label} · ${target.email}` : "—"}
            </div>
          )}
        </Field>

        <FieldGrid>
          <Field label="Expéditeur — nom">
            <TextInput
              value={draft.from_name}
              onChange={(e) => onDraftChange({ ...draft, from_name: e.target.value })}
              placeholder="Camille Durand"
            />
          </Field>
          <Field label="Expéditeur — e-mail" required>
            <TextInput
              type="email"
              value={draft.from_address}
              onChange={(e) => onDraftChange({ ...draft, from_address: e.target.value })}
              placeholder="camille@exemple.com"
            />
          </Field>
        </FieldGrid>
        <Field label="Objet">
          <TextInput
            value={draft.subject}
            onChange={(e) => onDraftChange({ ...draft, subject: e.target.value })}
            placeholder="(sans objet)"
          />
        </Field>
        <Field label="Message">
          <Textarea
            value={draft.body}
            onChange={(e) => onDraftChange({ ...draft, body: e.target.value })}
            className="min-h-[200px]"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Annuler
        </Button>
        <Button onClick={onSubmit} disabled={busy}>
          <Inbox className="h-4 w-4" /> {busy ? "Réception…" : "Recevoir dans la boîte"}
        </Button>
      </div>
    </section>
  );
}
