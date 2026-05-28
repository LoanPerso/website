"use client";

import { useEffect, useState } from "react";
import { Button } from "@/_components/ui/button";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { recordPayment } from "@/_lib/admin/payments";
import type { PaymentMethod } from "@/_lib/admin/types";
import { paymentMethodLabels } from "@/_lib/admin/format";

// Minimal shape shared by Installment and OverdueInstallment view rows.
export type PayableInstallment = {
  id: string;
  sequence: number;
  amount_due: number;
  amount_paid: number;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  clientId: string | null;
  installment?: PayableInstallment | null;
  defaultAmount?: number;
  onSaved?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  loanId,
  clientId,
  installment,
  defaultAmount,
  onSaved,
}: Props) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("sepa");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const remaining = installment
        ? Math.round((Number(installment.amount_due) - Number(installment.amount_paid)) * 100) / 100
        : defaultAmount ?? 0;
      setAmount(remaining ? String(remaining) : "");
      setDate(new Date().toISOString().slice(0, 10));
      setMethod("sepa");
      setNotes("");
    }
  }, [open, installment, defaultAmount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      toast("Montant invalide.", "error");
      return;
    }
    setSaving(true);
    const res = await recordPayment({
      loan_id: loanId,
      client_id: clientId,
      installment_id: installment?.id ?? null,
      amount: value,
      payment_date: date,
      method,
      notes: notes || null,
    });
    setSaving(false);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Paiement enregistré.");
    onSaved?.();
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Enregistrer un paiement"
      description={installment ? `Échéance n°${installment.sequence}` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" form="payment-form" disabled={saving}>
            {saving ? "Enregistrement…" : "Valider"}
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
        <FieldGrid>
          <Field label="Montant (€)" required>
            <TextInput type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Date" required>
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </FieldGrid>
        <Field label="Moyen de paiement">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {Object.entries(paymentMethodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
}
