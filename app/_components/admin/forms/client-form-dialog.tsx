"use client";

import { useEffect, useState } from "react";
import { Button } from "@/_components/ui/button";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { createClient, updateClient } from "@/_lib/admin/clients";
import type { Client } from "@/_lib/admin/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSaved?: (client: Client) => void;
}

const empty = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  birth_date: "",
  city: "",
  country: "EE",
  employment_status: "",
  monthly_net_income: "",
  monthly_expenses: "",
  risk_category: "",
  status: "active",
  notes: "",
};

export function ClientFormDialog({ open, onOpenChange, client, onSaved }: Props) {
  const toast = useToast();
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        client
          ? {
              first_name: client.first_name ?? "",
              last_name: client.last_name ?? "",
              email: client.email ?? "",
              phone: client.phone ?? "",
              birth_date: client.birth_date ?? "",
              city: client.city ?? "",
              country: client.country ?? "EE",
              employment_status: client.employment_status ?? "",
              monthly_net_income: client.monthly_net_income?.toString() ?? "",
              monthly_expenses: client.monthly_expenses?.toString() ?? "",
              risk_category: client.risk_category ?? "",
              status: client.status ?? "active",
              notes: client.notes ?? "",
            }
          : { ...empty }
      );
    }
  }, [open, client]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.first_name || !form.last_name) {
      toast("Prénom et nom requis.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      birth_date: form.birth_date || null,
      city: form.city || null,
      country: form.country || null,
      employment_status: form.employment_status || null,
      monthly_net_income: form.monthly_net_income ? Number(form.monthly_net_income) : null,
      monthly_expenses: form.monthly_expenses ? Number(form.monthly_expenses) : null,
      risk_category: (form.risk_category || null) as Client["risk_category"],
      status: form.status as Client["status"],
      notes: form.notes || null,
    };

    const res = client
      ? await updateClient(client.id, payload)
      : await createClient(payload);
    setSaving(false);

    if (res.error || !res.data) {
      toast(res.error ?? "Erreur", "error");
      return;
    }
    toast(client ? "Client mis à jour." : "Client créé.");
    onSaved?.(res.data);
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={client ? "Modifier le client" : "Nouveau client"}
      wide
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" form="client-form" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
        <FieldGrid>
          <Field label="Prénom" required>
            <TextInput value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
          </Field>
          <Field label="Nom" required>
            <TextInput value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Email">
            <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Téléphone">
            <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Date de naissance">
            <TextInput type="date" value={form.birth_date} onChange={(e) => set("birth_date", e.target.value)} />
          </Field>
          <Field label="Ville">
            <TextInput value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Pays">
            <TextInput value={form.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Statut emploi">
            <TextInput
              value={form.employment_status}
              onChange={(e) => set("employment_status", e.target.value)}
              placeholder="cdi, cdd, freelance…"
            />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Revenu net mensuel (€)">
            <TextInput
              type="number"
              value={form.monthly_net_income}
              onChange={(e) => set("monthly_net_income", e.target.value)}
            />
          </Field>
          <Field label="Charges mensuelles (€)">
            <TextInput
              type="number"
              value={form.monthly_expenses}
              onChange={(e) => set("monthly_expenses", e.target.value)}
            />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Catégorie de risque">
            <Select value={form.risk_category} onChange={(e) => set("risk_category", e.target.value)}>
              <option value="">—</option>
              <option value="A">A — Faible risque</option>
              <option value="B">B — Risque modéré</option>
              <option value="C">C — Risque élevé</option>
              <option value="D">D — Risque limite</option>
            </Select>
          </Field>
          <Field label="Statut">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="prospect">Prospect</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="blacklisted">Bloqué</option>
            </Select>
          </Field>
        </FieldGrid>
        <Field label="Notes">
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
