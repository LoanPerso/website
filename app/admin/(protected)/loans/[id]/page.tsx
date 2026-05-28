"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { StatusBadge, RiskBadge } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { ConfirmDialog } from "@/_components/admin/dialog";
import { PaymentDialog } from "@/_components/admin/forms/payment-dialog";
import { useToast } from "@/_components/admin/toast";
import { getLoan, getLoanInstallments, updateLoanStatus, deleteLoan } from "@/_lib/admin/loans";
import { listPayments, type PaymentRow } from "@/_lib/admin/payments";
import type { Installment, LoanStatus, LoanWithClient } from "@/_lib/admin/types";
import {
  formatCurrency,
  formatDate,
  fullName,
  loanStatusLabels,
  paymentMethodLabels,
} from "@/_lib/admin/format";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [loan, setLoan] = useState<LoanWithClient | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [payOpen, setPayOpen] = useState(false);
  const [activeInstallment, setActiveInstallment] = useState<Installment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [l, i, p] = await Promise.all([
      getLoan(id),
      getLoanInstallments(id),
      listPayments({ loanId: id, pageSize: 200 }),
    ]);
    setLoan(l.data);
    setInstallments(i.data ?? []);
    setPayments(p.data?.rows ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function changeStatus(status: LoanStatus) {
    const res = await updateLoanStatus(id, status);
    if (res.error) toast(res.error, "error");
    else {
      toast("Statut mis à jour.");
      load();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteLoan(id);
    setDeleting(false);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Crédit supprimé.");
    router.push("/admin/loans");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!loan) return <p className="text-sm text-muted-foreground">Crédit introuvable.</p>;

  const paidCount = installments.filter((i) => i.status === "paid").length;
  const remaining = installments.reduce((s, i) => s + Math.max(Number(i.amount_due) - Number(i.amount_paid), 0), 0);
  const collected = payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div>
      <Link href="/admin/loans" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Crédits
      </Link>

      <PageHeader
        title={loan.reference ?? "Crédit"}
        description={
          <>
            <Link href={`/admin/clients/${loan.client_id}`} className="hover:underline">
              {fullName(loan.client?.first_name, loan.client?.last_name)}
            </Link>{" "}
            · {loan.product?.name ?? "Sans produit"}
          </>
        }
        actions={
          <Button onClick={() => { setActiveInstallment(null); setPayOpen(true); }}>
            <Plus className="h-4 w-4" /> Paiement
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge kind="loan" status={loan.status} />
        <RiskBadge category={loan.risk_category} />
        <Select
          value={loan.status}
          onChange={(e) => changeStatus(e.target.value as LoanStatus)}
          className="h-8 w-40 text-xs"
        >
          {Object.entries(loanStatusLabels).map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Capital prêté" value={formatCurrency(loan.principal_amount)} />
        <KpiCard label="Mensualité" value={formatCurrency(loan.monthly_payment, 2)} sub={`${loan.duration_months} mois @ ${loan.annual_rate}%`} />
        <KpiCard label="Reste à payer" value={formatCurrency(remaining)} tone={remaining > 0 ? "warning" : "success"} />
        <KpiCard label="Encaissé" value={formatCurrency(collected)} sub={`${paidCount}/${installments.length} échéances`} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Conditions" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <Row label="Total à rembourser" value={formatCurrency(loan.total_repayable, 2)} />
            <Row label="Intérêts" value={formatCurrency(loan.total_interest, 2)} />
            <Row label="Frais dossier" value={formatCurrency(loan.application_fee, 2)} />
            <Row label="Début" value={formatDate(loan.start_date)} />
            <Row label="Fin" value={formatDate(loan.end_date)} />
            <Row label="Objet" value={loan.purpose} />
          </dl>
        </Panel>

        <Panel title="Échéancier" className="lg:col-span-2" bodyClassName="p-0">
          <div className="max-h-[28rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left">#</th>
                  <th className="px-4 py-2.5 text-left">Échéance</th>
                  <th className="px-4 py-2.5 text-right">Montant</th>
                  <th className="px-4 py-2.5 text-left">Statut</th>
                  <th className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {installments.map((inst) => {
                  const overdue =
                    ["pending", "partial", "late"].includes(inst.status) && new Date(inst.due_date) < new Date();
                  return (
                    <tr key={inst.id} className="border-t border-border">
                      <td className="px-4 py-2 text-muted-foreground">{inst.sequence}</td>
                      <td className="px-4 py-2">
                        <span className={overdue ? "text-error" : ""}>{formatDate(inst.due_date)}</span>
                      </td>
                      <td className="px-4 py-2 text-right">{formatCurrency(inst.amount_due, 2)}</td>
                      <td className="px-4 py-2">
                        <StatusBadge kind="installment" status={overdue && inst.status === "pending" ? "late" : inst.status} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        {inst.status !== "paid" && inst.status !== "waived" ? (
                          <button
                            onClick={() => {
                              setActiveInstallment(inst);
                              setPayOpen(true);
                            }}
                            className="text-xs font-medium text-dark-gold hover:underline"
                          >
                            Encaisser
                          </button>
                        ) : inst.paid_at ? (
                          <span className="text-xs text-muted-foreground">{formatDate(inst.paid_at)}</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel title="Paiements" className="mt-6">
        {payments.length ? (
          <ul className="divide-y divide-border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  {formatDate(p.payment_date)} · {paymentMethodLabels[p.method] ?? p.method}
                </span>
                <span className="font-medium">{formatCurrency(p.amount, 2)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
        )}
      </Panel>

      <div className="mt-8 border-t border-border pt-6">
        <Button variant="ghost" className="text-error hover:bg-error/10" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" /> Supprimer ce crédit
        </Button>
      </div>

      <PaymentDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        loanId={loan.id}
        clientId={loan.client_id}
        installment={activeInstallment}
        defaultAmount={loan.monthly_payment}
        onSaved={() => load()}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le crédit"
        message="L'échéancier et les paiements liés seront également supprimés. Action irréversible."
        confirmLabel="Supprimer"
        danger
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value || "—"}</dd>
    </div>
  );
}
