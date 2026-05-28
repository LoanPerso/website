"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { listPayments, recordPayment, type PaymentRow } from "@/_lib/admin/payments";
import { listLoans } from "@/_lib/admin/loans";
import type { LoanWithClient, PaymentMethod } from "@/_lib/admin/types";
import { formatCurrency, formatDate, fullName, paymentMethodLabels } from "@/_lib/admin/format";

export default function PaymentsPage() {
  const toast = useToast();
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [count, setCount] = useState(0);
  const [month, setMonth] = useState("");
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listPayments({ month: month || undefined, method, pageSize: 100 });
    setRows(res.data?.rows ?? []);
    setCount(res.data?.count ?? 0);
    setLoading(false);
  }, [month, method]);

  useEffect(() => {
    load();
  }, [load]);

  const total = rows.reduce((s, p) => s + Number(p.amount), 0);

  const columns: Column<PaymentRow>[] = [
    { header: "Date", cell: (p) => formatDate(p.payment_date) },
    { header: "Client", cell: (p) => fullName(p.client?.first_name, p.client?.last_name) },
    { header: "Crédit", cell: (p) => <span className="font-mono text-xs">{p.loan?.reference ?? "—"}</span> },
    { header: "Moyen", cell: (p) => paymentMethodLabels[p.method] ?? p.method },
    { header: "Montant", align: "right", cell: (p) => <span className="font-medium">{formatCurrency(p.amount, 2)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Paiements"
        description={`${count} paiement(s) · ${formatCurrency(total)} sur la période`}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouveau paiement
          </Button>
        }
      />

      <Panel
        title="Historique"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod | "all")} className="h-9 w-40">
              <option value="all">Tous moyens</option>
              {Object.entries(paymentMethodLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <DataTable columns={columns} rows={rows} getKey={(p) => p.id} empty={{ title: "Aucun paiement" }} />
        )}
      </Panel>

      <RecordPaymentDialog open={open} onOpenChange={setOpen} onSaved={() => load()} />
    </div>
  );
}

function RecordPaymentDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [loans, setLoans] = useState<LoanWithClient[]>([]);
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<PaymentMethod>("sepa");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      listLoans({ status: "active", pageSize: 200 }).then((r) => setLoans(r.data?.rows ?? []));
      setLoanId("");
      setAmount("");
      setDate(new Date().toISOString().slice(0, 10));
      setMethod("sepa");
    }
  }, [open]);

  const selected = loans.find((l) => l.id === loanId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!loanId) return toast("Sélectionnez un crédit.", "error");
    const value = Number(amount);
    if (!value) return toast("Montant invalide.", "error");
    setSaving(true);
    const res = await recordPayment({
      loan_id: loanId,
      client_id: selected?.client_id ?? null,
      amount: value,
      payment_date: date,
      method,
    });
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Paiement enregistré.");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Nouveau paiement"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" form="global-payment-form" disabled={saving}>
            {saving ? "…" : "Valider"}
          </Button>
        </>
      }
    >
      <form id="global-payment-form" onSubmit={submit} className="space-y-4">
        <Field label="Crédit" required>
          <Select value={loanId} onChange={(e) => setLoanId(e.target.value)}>
            <option value="">— Sélectionner —</option>
            {loans.map((l) => (
              <option key={l.id} value={l.id}>
                {l.reference} — {fullName(l.client?.first_name, l.client?.last_name)}
              </option>
            ))}
          </Select>
        </Field>
        <FieldGrid>
          <Field label="Montant (€)" required>
            <TextInput
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={selected ? String(selected.monthly_payment) : ""}
            />
          </Field>
          <Field label="Date" required>
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </FieldGrid>
        <Field label="Moyen de paiement">
          <Select value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
            {Object.entries(paymentMethodLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
