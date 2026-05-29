"use client";

import { useState } from "react";
import { Modal } from "@/_components/admin/dialog";
import { Button } from "@/_components/ui/button";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { updateApplication, type ApplicationPatch } from "@/_lib/admin/applications";
import type { LoanApplicationFull } from "@/_lib/admin/types";

const TEXT = (v: string | number | null | undefined) => (v == null ? "" : String(v));

export function EditApplicationDialog({
  app,
  open,
  onOpenChange,
  onSaved,
}: {
  app: LoanApplicationFull;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({
    first_name: TEXT(app.first_name), last_name: TEXT(app.last_name),
    birth_date: TEXT(app.birth_date), birth_place: TEXT(app.birth_place), nationality: TEXT(app.nationality),
    marital_status: TEXT(app.marital_status), id_type: TEXT(app.id_type), id_number: TEXT(app.id_number),
    email: TEXT(app.email), phone: TEXT(app.phone), address: TEXT(app.address),
    postal_code: TEXT(app.postal_code), city: TEXT(app.city), country: TEXT(app.country), address_country: TEXT(app.address_country),
    employer_name: TEXT(app.employer_name), employer_address: TEXT(app.employer_address), job_title: TEXT(app.job_title),
    contract_type: TEXT(app.contract_type), start_date: TEXT(app.start_date), monthly_net_income: TEXT(app.monthly_net_income),
    credit_type: TEXT(app.credit_type), amount: TEXT(app.amount), duration: TEXT(app.duration),
    effective_rate: TEXT(app.effective_rate), monthly_payment: TEXT(app.monthly_payment),
    document_id_url: TEXT(app.document_id_url), document_income_url: TEXT(app.document_income_url),
    document_address_url: TEXT(app.document_address_url), document_bank_url: TEXT(app.document_bank_url),
    internal_notes: TEXT(app.internal_notes),
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const num = (v: string) => (v.trim() === "" ? null : Number(v));
    const patch: ApplicationPatch = {
      first_name: f.first_name || null, last_name: f.last_name || null,
      birth_date: f.birth_date || null, birth_place: f.birth_place || null, nationality: f.nationality || null,
      marital_status: f.marital_status || null, id_type: f.id_type || null, id_number: f.id_number || null,
      email: f.email || null, phone: f.phone || null, address: f.address || null,
      postal_code: f.postal_code || null, city: f.city || null, country: f.country || null, address_country: f.address_country || null,
      employer_name: f.employer_name || null, employer_address: f.employer_address || null, job_title: f.job_title || null,
      contract_type: f.contract_type || null, start_date: f.start_date || null, monthly_net_income: num(f.monthly_net_income),
      credit_type: f.credit_type || null, amount: num(f.amount), duration: num(f.duration),
      effective_rate: num(f.effective_rate), monthly_payment: num(f.monthly_payment),
      document_id_url: f.document_id_url || null, document_income_url: f.document_income_url || null,
      document_address_url: f.document_address_url || null, document_bank_url: f.document_bank_url || null,
      internal_notes: f.internal_notes || null,
    };
    const res = await updateApplication(app.id, patch);
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Demande mise à jour.");
    onOpenChange(false);
    onSaved();
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Modifier la demande"
      wide
      footer={<><Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Annuler</Button><Button type="submit" form="edit-app-form" disabled={saving}>Enregistrer</Button></>}
    >
      <form id="edit-app-form" onSubmit={submit} className="space-y-6">
        <Section title="Identité">
          <FieldGrid>
            <Field label="Prénom"><TextInput value={f.first_name} onChange={set("first_name")} /></Field>
            <Field label="Nom"><TextInput value={f.last_name} onChange={set("last_name")} /></Field>
            <Field label="Date de naissance"><TextInput value={f.birth_date} onChange={set("birth_date")} placeholder="AAAA-MM-JJ" /></Field>
            <Field label="Lieu de naissance"><TextInput value={f.birth_place} onChange={set("birth_place")} /></Field>
            <Field label="Nationalité"><TextInput value={f.nationality} onChange={set("nationality")} /></Field>
            <Field label="Situation familiale"><TextInput value={f.marital_status} onChange={set("marital_status")} /></Field>
            <Field label="Type de pièce"><TextInput value={f.id_type} onChange={set("id_type")} /></Field>
            <Field label="N° de pièce"><TextInput value={f.id_number} onChange={set("id_number")} /></Field>
          </FieldGrid>
        </Section>

        <Section title="Contact">
          <FieldGrid>
            <Field label="Email"><TextInput value={f.email} onChange={set("email")} /></Field>
            <Field label="Téléphone"><TextInput value={f.phone} onChange={set("phone")} /></Field>
            <Field label="Adresse"><TextInput value={f.address} onChange={set("address")} /></Field>
            <Field label="Code postal"><TextInput value={f.postal_code} onChange={set("postal_code")} /></Field>
            <Field label="Ville"><TextInput value={f.city} onChange={set("city")} /></Field>
            <Field label="Pays demande"><TextInput value={f.country} onChange={set("country")} /></Field>
            <Field label="Pays de résidence"><TextInput value={f.address_country} onChange={set("address_country")} /></Field>
          </FieldGrid>
        </Section>

        <Section title="Emploi & revenus">
          <FieldGrid>
            <Field label="Employeur"><TextInput value={f.employer_name} onChange={set("employer_name")} /></Field>
            <Field label="Adresse employeur"><TextInput value={f.employer_address} onChange={set("employer_address")} /></Field>
            <Field label="Poste"><TextInput value={f.job_title} onChange={set("job_title")} /></Field>
            <Field label="Type de contrat"><TextInput value={f.contract_type} onChange={set("contract_type")} placeholder="cdi, cdd, freelance…" /></Field>
            <Field label="Depuis"><TextInput value={f.start_date} onChange={set("start_date")} placeholder="AAAA-MM-JJ" /></Field>
            <Field label="Revenu net mensuel (€)"><TextInput type="number" value={f.monthly_net_income} onChange={set("monthly_net_income")} /></Field>
          </FieldGrid>
        </Section>

        <Section title="Crédit demandé">
          <FieldGrid>
            <Field label="Produit (slug)"><TextInput value={f.credit_type} onChange={set("credit_type")} /></Field>
            <Field label="Montant (€)"><TextInput type="number" value={f.amount} onChange={set("amount")} /></Field>
            <Field label="Durée (mois)"><TextInput type="number" value={f.duration} onChange={set("duration")} /></Field>
            <Field label="Taux effectif (%)"><TextInput type="number" step="0.01" value={f.effective_rate} onChange={set("effective_rate")} /></Field>
            <Field label="Mensualité (€)"><TextInput type="number" step="0.01" value={f.monthly_payment} onChange={set("monthly_payment")} /></Field>
          </FieldGrid>
        </Section>

        <Section title="Pièces justificatives (URL)">
          <FieldGrid>
            <Field label="Pièce d'identité"><TextInput value={f.document_id_url} onChange={set("document_id_url")} placeholder="https://…" /></Field>
            <Field label="Justificatif de revenus"><TextInput value={f.document_income_url} onChange={set("document_income_url")} placeholder="https://…" /></Field>
            <Field label="Justificatif de domicile"><TextInput value={f.document_address_url} onChange={set("document_address_url")} placeholder="https://…" /></Field>
            <Field label="Relevé bancaire / RIB"><TextInput value={f.document_bank_url} onChange={set("document_bank_url")} placeholder="https://…" /></Field>
          </FieldGrid>
        </Section>

        <Section title="Note interne">
          <Field label="Note (non communiquée au demandeur)"><Textarea value={f.internal_notes} onChange={set("internal_notes")} /></Field>
        </Section>
      </form>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
