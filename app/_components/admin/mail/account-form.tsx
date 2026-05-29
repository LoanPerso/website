"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Trash2 } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  createAccount,
  deleteAccount,
  listDiagnostics,
  runSmoke,
  updateAccount,
  type MailAccountInput,
} from "@/_lib/admin/mail";
import { formatDateTime, mailSecurityLabels } from "@/_lib/admin/format";
import type { MailAccount, MailCheckStatus, MailDiagnostic, MailDiagnosticKind, MailSecurity } from "@/_lib/admin/types";

type FormState = {
  label: string;
  email: string;
  display_name: string;
  signature: string;
  imap_host: string;
  imap_port: string;
  imap_security: MailSecurity;
  imap_username: string;
  imap_password: string;
  smtp_host: string;
  smtp_port: string;
  smtp_security: MailSecurity;
  smtp_username: string;
  smtp_password: string;
  is_active: boolean;
  is_default: boolean;
};

const EMPTY: FormState = {
  label: "",
  email: "",
  display_name: "",
  signature: "",
  imap_host: "",
  imap_port: "993",
  imap_security: "ssl",
  imap_username: "",
  imap_password: "",
  smtp_host: "",
  smtp_port: "587",
  smtp_security: "starttls",
  smtp_username: "",
  smtp_password: "",
  is_active: true,
  is_default: false,
};

const STATUS_DOT: Record<MailCheckStatus | "ok-bool" | "err-bool", string> = {
  ok: "bg-success",
  error: "bg-error",
  unknown: "bg-muted-foreground/40",
  "ok-bool": "bg-success",
  "err-bool": "bg-error",
};

function fromAccount(a: MailAccount): FormState {
  return {
    label: a.label ?? "",
    email: a.email ?? "",
    display_name: a.display_name ?? "",
    signature: a.signature ?? "",
    imap_host: a.imap_host ?? "",
    imap_port: a.imap_port != null ? String(a.imap_port) : "",
    imap_security: a.imap_security ?? "ssl",
    imap_username: a.imap_username ?? "",
    imap_password: "",
    smtp_host: a.smtp_host ?? "",
    smtp_port: a.smtp_port != null ? String(a.smtp_port) : "",
    smtp_security: a.smtp_security ?? "starttls",
    smtp_username: a.smtp_username ?? "",
    smtp_password: "",
    is_active: a.is_active,
    is_default: a.is_default,
  };
}

export function AccountForm({
  account,
  onSaved,
  onDeleted,
  onStatusChange,
}: {
  account: MailAccount | null;
  onSaved: (account: MailAccount) => void;
  onDeleted: () => void;
  onStatusChange?: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [smoking, setSmoking] = useState<MailDiagnosticKind | null>(null);
  const [diagnostics, setDiagnostics] = useState<MailDiagnostic[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setForm(account ? fromAccount(account) : EMPTY);
  }, [account]);

  const loadDiagnostics = useCallback(async () => {
    if (!account) {
      setDiagnostics([]);
      return;
    }
    const res = await listDiagnostics(account.id);
    setDiagnostics(res.data ?? []);
  }, [account]);

  useEffect(() => {
    loadDiagnostics();
  }, [loadDiagnostics]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toPayload(): MailAccountInput {
    return {
      label: form.label.trim(),
      email: form.email.trim(),
      display_name: form.display_name.trim() || null,
      signature: form.signature || null,
      imap_host: form.imap_host.trim() || null,
      imap_port: form.imap_port ? Number(form.imap_port) : null,
      imap_security: form.imap_security,
      imap_username: form.imap_username.trim() || null,
      imap_password: form.imap_password || undefined,
      smtp_host: form.smtp_host.trim() || null,
      smtp_port: form.smtp_port ? Number(form.smtp_port) : null,
      smtp_security: form.smtp_security,
      smtp_username: form.smtp_username.trim() || null,
      smtp_password: form.smtp_password || undefined,
      is_active: form.is_active,
      is_default: form.is_default,
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.email.trim()) {
      toast("Le libellé et l'adresse e-mail sont requis.", "error");
      return;
    }
    setSaving(true);
    const res = account ? await updateAccount(account.id, toPayload()) : await createAccount(toPayload());
    setSaving(false);
    if (res.error || !res.data) {
      toast(res.error ?? "Erreur", "error");
      return;
    }
    toast(account ? "Compte mis à jour." : "Compte créé.");
    onSaved(res.data);
  }

  async function smoke(kind: MailDiagnosticKind) {
    if (!account) {
      toast("Enregistrez le compte avant de tester la connexion.", "error");
      return;
    }
    setSmoking(kind);
    const res = await runSmoke(account.id, kind);
    setSmoking(null);
    if (res.error || !res.data) {
      toast(res.error ?? "Erreur", "error");
      return;
    }
    toast(res.data.detail ?? "Test terminé.", res.data.ok ? "success" : "error");
    setDiagnostics((prev) => [res.data!, ...prev]);
    onStatusChange?.();
  }

  async function handleDelete() {
    if (!account) return;
    const res = await deleteAccount(account.id);
    setConfirmDelete(false);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Compte supprimé.");
    onDeleted();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FieldGrid>
        <Field label="Libellé" required>
          <TextInput value={form.label} onChange={(e) => set("label", e.target.value)} placeholder="Contact" />
        </Field>
        <Field label="Adresse e-mail" required>
          <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="contact@quickfund.ee" />
        </Field>
      </FieldGrid>
      <Field label="Nom d'affichage">
        <TextInput value={form.display_name} onChange={(e) => set("display_name", e.target.value)} placeholder="Quickfund — Contact" />
      </Field>

      <div className="rounded-md border border-border p-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Réception (IMAP)</p>
        <FieldGrid>
          <Field label="Serveur">
            <TextInput value={form.imap_host} onChange={(e) => set("imap_host", e.target.value)} placeholder="imap.quickfund.ee" />
          </Field>
          <Field label="Port">
            <TextInput type="number" value={form.imap_port} onChange={(e) => set("imap_port", e.target.value)} />
          </Field>
          <Field label="Sécurité">
            <Select value={form.imap_security} onChange={(e) => set("imap_security", e.target.value as MailSecurity)}>
              {Object.entries(mailSecurityLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Identifiant">
            <TextInput value={form.imap_username} onChange={(e) => set("imap_username", e.target.value)} />
          </Field>
        </FieldGrid>
        <Field label="Mot de passe" hint="Laisser vide pour conserver le mot de passe actuel." className="mt-4">
          <TextInput type="password" value={form.imap_password} onChange={(e) => set("imap_password", e.target.value)} autoComplete="new-password" />
        </Field>
      </div>

      <div className="rounded-md border border-border p-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Envoi (SMTP)</p>
        <FieldGrid>
          <Field label="Serveur">
            <TextInput value={form.smtp_host} onChange={(e) => set("smtp_host", e.target.value)} placeholder="smtp.quickfund.ee" />
          </Field>
          <Field label="Port">
            <TextInput type="number" value={form.smtp_port} onChange={(e) => set("smtp_port", e.target.value)} />
          </Field>
          <Field label="Sécurité">
            <Select value={form.smtp_security} onChange={(e) => set("smtp_security", e.target.value as MailSecurity)}>
              {Object.entries(mailSecurityLabels).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Identifiant">
            <TextInput value={form.smtp_username} onChange={(e) => set("smtp_username", e.target.value)} />
          </Field>
        </FieldGrid>
        <Field label="Mot de passe" hint="Laisser vide pour conserver le mot de passe actuel." className="mt-4">
          <TextInput type="password" value={form.smtp_password} onChange={(e) => set("smtp_password", e.target.value)} autoComplete="new-password" />
        </Field>
      </div>

      <Field label="Signature">
        <Textarea value={form.signature} onChange={(e) => set("signature", e.target.value)} className="min-h-[80px]" />
      </Field>

      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 accent-foreground" />
          <span className="text-foreground">Compte actif</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_default} onChange={(e) => set("is_default", e.target.checked)} className="h-4 w-4 accent-foreground" />
          <span className="text-foreground">Compte par défaut</span>
        </label>
      </div>

      {/* Connectivity smoke tests + history */}
      <div className="rounded-md border border-border bg-secondary/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3.5 w-3.5" /> Tests de connexion
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => smoke("smtp")} disabled={!account || smoking !== null}>
              {smoking === "smtp" ? "Test…" : "Test SMTP"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => smoke("imap")} disabled={!account || smoking !== null}>
              {smoking === "imap" ? "Test…" : "Test IMAP"}
            </Button>
          </div>
        </div>
        {!account ? (
          <p className="mt-2 text-xs text-muted-foreground">Enregistrez le compte pour lancer un test.</p>
        ) : diagnostics.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">Aucun test enregistré.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {diagnostics.slice(0, 6).map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-xs">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", d.ok ? STATUS_DOT["ok-bool"] : STATUS_DOT["err-bool"])} />
                <span className="font-medium uppercase text-muted-foreground">{d.kind}</span>
                <span className="flex-1 truncate text-foreground/90">{d.detail}</span>
                {d.latency_ms != null ? <span className="shrink-0 tabular-nums text-muted-foreground">{d.latency_ms} ms</span> : null}
                <span className="shrink-0 text-muted-foreground/70">{formatDateTime(d.ran_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 border-t border-border pt-4">
        {account && confirmDelete ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-error/30 bg-error/5 px-3 py-2">
            <span className="text-xs text-error">Supprimer ce compte, ses dossiers et ses messages ? Action irréversible.</span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
                Annuler
              </Button>
              <Button type="button" size="sm" onClick={handleDelete} className="bg-error text-white hover:bg-error/90">
                Supprimer
              </Button>
            </div>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          {account ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-error hover:bg-error/10">
              <Trash2 className="h-4 w-4" /> Supprimer
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : account ? "Enregistrer" : "Créer le compte"}
          </Button>
        </div>
      </div>
    </form>
  );
}
