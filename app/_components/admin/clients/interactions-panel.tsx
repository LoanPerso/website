"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MessageSquare, Phone, Plus, StickyNote, Users, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Panel } from "@/_components/admin/panel";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { createInteraction, listInteractions } from "@/_lib/admin/interactions";
import { interactionTypeLabels } from "@/_lib/admin/format";
import type { Interaction, InteractionType } from "@/_lib/admin/types";

const ICONS: Record<InteractionType, LucideIcon> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  meeting: Users,
  system: Zap,
};

function when(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InteractionsPanel({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "note", direction: "", subject: "", body: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listInteractions(clientId);
    setRows(res.data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject.trim() && !form.body.trim()) return toast("Sujet ou contenu requis.", "error");
    setSaving(true);
    const res = await createInteraction({
      client_id: clientId,
      type: form.type as InteractionType,
      direction: form.direction ? (form.direction as "in" | "out") : null,
      subject: form.subject || null,
      body: form.body || null,
    });
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Interaction enregistrée.");
    setOpen(false);
    setForm({ type: "note", direction: "", subject: "", body: "" });
    load();
  }

  return (
    <Panel
      title="Suivi relationnel"
      actions={
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Interaction
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune interaction enregistrée.</p>
      ) : (
        <ol className="relative space-y-4 border-l border-border pl-6">
          {rows.map((it) => {
            const Icon = ICONS[it.type] ?? StickyNote;
            return (
              <li key={it.id} className="relative">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                  <Icon className="h-3 w-3" />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {interactionTypeLabels[it.type] ?? it.type}
                    {it.direction ? (it.direction === "in" ? " · entrant" : " · sortant") : ""}
                  </span>
                  <span className="text-xs text-muted-foreground/70">{when(it.occurred_at)}</span>
                </div>
                {it.subject ? <p className="mt-0.5 text-sm font-medium text-foreground">{it.subject}</p> : null}
                {it.body ? <p className="mt-0.5 text-sm text-muted-foreground">{it.body}</p> : null}
              </li>
            );
          })}
        </ol>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Nouvelle interaction"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="interaction-form" disabled={saving}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="interaction-form" onSubmit={submit} className="space-y-4">
          <FieldGrid>
            <Field label="Type" required>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {Object.entries(interactionTypeLabels)
                  .filter(([v]) => v !== "system")
                  .map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
              </Select>
            </Field>
            <Field label="Sens">
              <Select value={form.direction} onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))}>
                <option value="">—</option>
                <option value="in">Entrant</option>
                <option value="out">Sortant</option>
              </Select>
            </Field>
          </FieldGrid>
          <Field label="Sujet">
            <TextInput value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </Field>
          <Field label="Détail">
            <Textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </Panel>
  );
}
