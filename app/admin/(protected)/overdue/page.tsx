"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Badge } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { PaymentDialog, type PayableInstallment } from "@/_components/admin/forms/payment-dialog";
import { listOverdue } from "@/_lib/admin/installments";
import type { OverdueInstallment } from "@/_lib/admin/types";
import { formatCurrency, formatDate, fullName } from "@/_lib/admin/format";

export default function OverduePage() {
  const router = useRouter();
  const [rows, setRows] = useState<OverdueInstallment[]>([]);
  const [month, setMonth] = useState("");
  const [minDays, setMinDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<OverdueInstallment | null>(null);
  const [payOpen, setPayOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listOverdue({ month: month || undefined, minDaysLate: minDays || undefined });
    setRows(res.data ?? []);
    setLoading(false);
  }, [month, minDays]);

  useEffect(() => {
    load();
  }, [load]);

  const totalAmount = rows.reduce((s, r) => s + Number(r.amount_remaining), 0);
  const distinctClients = new Set(rows.map((r) => r.client_id)).size;

  const columns: Column<OverdueInstallment>[] = [
    {
      header: "Client",
      cell: (r) => (
        <button onClick={() => router.push(`/admin/clients/${r.client_id}`)} className="font-medium hover:underline">
          {fullName(r.first_name, r.last_name)}
        </button>
      ),
    },
    { header: "Tél.", cell: (r) => <span className="text-muted-foreground">{r.phone ?? "—"}</span> },
    {
      header: "Crédit",
      cell: (r) => (
        <button onClick={() => router.push(`/admin/loans/${r.loan_id}`)} className="font-mono text-xs hover:underline">
          {r.loan_reference}
        </button>
      ),
    },
    { header: "Échéance", cell: (r) => `n°${r.sequence} · ${formatDate(r.due_date)}` },
    {
      header: "Retard",
      cell: (r) => (
        <Badge tone={r.days_late > 30 ? "error" : "warning"}>{r.days_late} j</Badge>
      ),
    },
    { header: "Reste dû", align: "right", cell: (r) => <span className="font-medium text-error">{formatCurrency(r.amount_remaining, 2)}</span> },
    {
      header: "",
      align: "right",
      cell: (r) => (
        <button
          onClick={() => {
            setActive(r);
            setPayOpen(true);
          }}
          className="text-xs font-medium text-dark-gold hover:underline"
        >
          Encaisser
        </button>
      ),
    },
  ];

  const payable: PayableInstallment | null = active
    ? { id: active.id, sequence: active.sequence, amount_due: active.amount_due, amount_paid: active.amount_paid }
    : null;

  return (
    <div>
      <PageHeader
        title="Impayés"
        description="Échéances échues et non réglées — qui n'a pas remboursé, et de combien."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Montant impayé" value={formatCurrency(totalAmount)} tone="error" icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Échéances en retard" value={String(rows.length)} />
        <KpiCard label="Clients concernés" value={String(distinctClients)} />
      </div>

      <Panel
        title="Liste des impayés"
        actions={
          <div className="flex items-center gap-2">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-9 rounded-md border border-input bg-white px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              title="Mois de l'échéance"
            />
            <Select value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} className="h-9 w-40">
              <option value={0}>Tout retard</option>
              <option value={10}>+ de 10 j</option>
              <option value={30}>+ de 30 j</option>
              <option value={60}>+ de 60 j</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(r) => r.id}
            empty={{ title: "Aucun impayé sur la période 🎉", hint: "Les remboursements sont à jour." }}
          />
        )}
      </Panel>

      {active ? (
        <PaymentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          loanId={active.loan_id}
          clientId={active.client_id}
          installment={payable}
          onSaved={() => load()}
        />
      ) : null}
    </div>
  );
}
