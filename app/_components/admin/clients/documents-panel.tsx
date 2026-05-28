"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { Panel } from "@/_components/admin/panel";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput } from "@/_components/admin/form";
import { StatusBadge } from "@/_components/admin/status-badge";
import { useToast } from "@/_components/admin/toast";
import {
  createDocument,
  deleteDocument,
  listClientDocuments,
  updateDocumentStatus,
} from "@/_lib/admin/documents";
import { documentStatusLabels, documentTypeLabels, formatDate } from "@/_lib/admin/format";
import type { ClientDocument, DocumentStatus, DocumentType } from "@/_lib/admin/types";

const REQUIRED_TYPES: DocumentType[] = ["id", "income", "address", "bank"];

export function DocumentsPanel({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "id", label: "", url: "", issued_on: "", expires_on: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listClientDocuments(clientId);
    setRows(res.data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const verifiedRequired = REQUIRED_TYPES.filter((t) =>
    rows.some((d) => d.type === t && d.status === "verified")
  ).length;

  async function changeStatus(id: string, status: DocumentStatus) {
    const res = await updateDocumentStatus(id, status);
    if (res.error) toast(res.error, "error");
    else load();
  }

  async function remove(id: string) {
    const res = await deleteDocument(id);
    if (res.error) toast(res.error, "error");
    else load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await createDocument({
      client_id: clientId,
      type: form.type as DocumentType,
      label: form.label || null,
      url: form.url || null,
      status: form.url ? "received" : "missing",
      issued_on: form.issued_on || null,
      expires_on: form.expires_on || null,
    });
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Document ajouté.");
    setOpen(false);
    setForm({ type: "id", label: "", url: "", issued_on: "", expires_on: "" });
    load();
  }

  return (
    <Panel
      title="Pièces & KYC"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {verifiedRequired}/{REQUIRED_TYPES.length} pièces clés vérifiées
          </span>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune pièce enregistrée.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((d) => {
            const expired =
              d.expires_on && new Date(d.expires_on) < new Date() && d.status === "verified";
            return (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {documentTypeLabels[d.type] ?? d.type}
                    {d.label ? <span className="text-muted-foreground"> · {d.label}</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.expires_on ? `Expire le ${formatDate(d.expires_on)}` : "Sans échéance"}
                    {expired ? <span className="ml-1 font-semibold text-error">· expiré</span> : null}
                    {d.url ? (
                      <>
                        {" · "}
                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-dark-gold hover:underline">
                          voir
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge kind="document" status={d.status} />
                  <Select
                    value={d.status}
                    onChange={(e) => changeStatus(d.id, e.target.value as DocumentStatus)}
                    className="h-8 w-32 text-xs"
                  >
                    {Object.entries(documentStatusLabels).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </Select>
                  <button
                    onClick={() => remove(d.id)}
                    className="text-muted-foreground transition-colors hover:text-error"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Ajouter une pièce"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="doc-form" disabled={saving}>
              Ajouter
            </Button>
          </>
        }
      >
        <form id="doc-form" onSubmit={submit} className="space-y-4">
          <FieldGrid>
            <Field label="Type" required>
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {Object.entries(documentTypeLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Libellé">
              <TextInput value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </Field>
          </FieldGrid>
          <Field label="URL du document">
            <TextInput value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://…" />
          </Field>
          <FieldGrid>
            <Field label="Émis le">
              <TextInput type="date" value={form.issued_on} onChange={(e) => setForm((f) => ({ ...f, issued_on: e.target.value }))} />
            </Field>
            <Field label="Expire le">
              <TextInput type="date" value={form.expires_on} onChange={(e) => setForm((f) => ({ ...f, expires_on: e.target.value }))} />
            </Field>
          </FieldGrid>
        </form>
      </Modal>
    </Panel>
  );
}
