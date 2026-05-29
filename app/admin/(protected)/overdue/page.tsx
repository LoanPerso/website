"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Bell, CalendarClock, Coins, Gavel } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Badge } from "@/_components/admin/status-badge";
import { SoftBadge } from "@/_components/admin/primitives";
import { SegmentedTabs, type TabDef } from "@/_components/admin/tabs";
import { Select, Field, TextInput } from "@/_components/admin/form";
import { Modal } from "@/_components/admin/dialog";
import { PaymentDialog, type PayableInstallment } from "@/_components/admin/forms/payment-dialog";
import { useToast } from "@/_components/admin/toast";
import { listOverdue } from "@/_lib/admin/installments";
import {
  listArrears,
  recordDunningStep,
  assessLateFeeOnLoan,
  recordPromiseToPay,
  markDefault,
  nextDunningStep,
} from "@/_lib/admin/collections";
import type { LoanArrears, OverdueInstallment } from "@/_lib/admin/types";
import { formatCurrency, formatDate, fullName } from "@/_lib/admin/format";

type View = "loans" | "installments";

export default function OverduePage() {
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState<View>("loans");
  const [arrears, setArrears] = useState<LoanArrears[]>([]);
  const [rows, setRows] = useState<OverdueInstallment[]>([]);
  const [month, setMonth] = useState("");
  const [minDays, setMinDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<OverdueInstallment | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [collectFor, setCollectFor] = useState<LoanArrears | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, o] = await Promise.all([
      listArrears({ minDaysLate: minDays || undefined }),
      listOverdue({ month: month || undefined, minDaysLate: minDays || undefined }),
    ]);
    setArrears(a.data ?? []);
    setRows(o.data ?? []);
    setLoading(false);
  }, [month, minDays]);

  useEffect(() => {
    load();
  }, [load]);

  const kpis = useMemo(() => {
    const totalAmount = arrears.reduce((s, r) => s + Number(r.overdue_amount), 0);
    const lateFees = arrears.reduce((s, r) => s + Number(r.late_fees), 0);
    const clients = new Set(arrears.map((r) => r.client_id)).size;
    return { totalAmount, lateFees, clients };
  }, [arrears]);

  const tabs: TabDef<View>[] = [
    { key: "loans", label: "Dossiers", count: arrears.length || null },
    { key: "installments", label: "Échéances", count: rows.length || null },
  ];

  const arrearsCols: Column<LoanArrears>[] = [
    {
      header: "Client",
      cell: (r) => (
        <button onClick={() => router.push(`/admin/clients/${r.client_id}`)} className="font-medium hover:underline">
          {fullName(r.first_name, r.last_name)}
        </button>
      ),
    },
    {
      header: "Crédit",
      cell: (r) => (
        <button onClick={() => router.push(`/admin/loans/${r.loan_id}`)} className="font-mono text-xs hover:underline">
          {r.loan_reference}
        </button>
      ),
    },
    {
      header: "Relance",
      cell: (r) =>
        r.dunning_level > 0 ? (
          <SoftBadge tone={r.dunning_level >= 3 ? "error" : "warning"}>Niveau {r.dunning_level}</SoftBadge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    { header: "Échéances dues", align: "right", cell: (r) => r.overdue_count },
    {
      header: "Retard",
      cell: (r) => <Badge tone={r.max_days_late > 30 ? "error" : "warning"}>{r.max_days_late} j</Badge>,
    },
    {
      header: "Arriéré",
      align: "right",
      cell: (r) => <span className="font-medium text-error tabular-nums">{formatCurrency(r.overdue_amount, 2)}</span>,
    },
    {
      header: "Prochaine action",
      cell: (r) => (r.next_action_date ? formatDate(r.next_action_date) : "—"),
    },
    {
      header: "",
      align: "right",
      cell: (r) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCollectFor(r);
          }}
          className="text-xs font-medium text-dark-gold hover:underline"
        >
          Recouvrer
        </button>
      ),
    },
  ];

  const installmentCols: Column<OverdueInstallment>[] = [
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
    { header: "Retard", cell: (r) => <Badge tone={r.days_late > 30 ? "error" : "warning"}>{r.days_late} j</Badge> },
    { header: "Reste dû", align: "right", cell: (r) => <span className="font-medium text-error">{formatCurrency(r.amount_remaining, 2)}</span> },
    {
      header: "",
      align: "right",
      cell: (r) => (
        <button
          onClick={() => { setActive(r); setPayOpen(true); }}
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
        title="Recouvrement"
        description="Dossiers en arriéré — relances, pénalités, promesses de paiement et encaissements."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Arriéré total" value={formatCurrency(kpis.totalAmount)} tone="error" icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label="Pénalités cumulées" value={formatCurrency(kpis.lateFees, 2)} tone={kpis.lateFees ? "warning" : "default"} />
        <KpiCard label="Clients concernés" value={String(kpis.clients)} />
      </div>

      <Panel
        title={view === "loans" ? "Dossiers en recouvrement" : "Échéances impayées"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedTabs tabs={tabs} active={view} onChange={setView} />
            {view === "installments" ? (
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                title="Mois de l'échéance"
              />
            ) : null}
            <Select value={minDays} onChange={(e) => setMinDays(Number(e.target.value))} className="h-9 w-36">
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
        ) : view === "loans" ? (
          <DataTable
            columns={arrearsCols}
            rows={arrears}
            getKey={(r) => r.loan_id}
            empty={{ title: "Aucun dossier en arriéré 🎉", hint: "Tous les crédits sont à jour." }}
          />
        ) : (
          <DataTable
            columns={installmentCols}
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

      <CollectionModal
        arrear={collectFor}
        onClose={() => setCollectFor(null)}
        onDone={() => { setCollectFor(null); load(); }}
        toast={toast}
      />
    </div>
  );
}

function CollectionModal({
  arrear,
  onClose,
  onDone,
  toast,
}: {
  arrear: LoanArrears | null;
  onClose: () => void;
  onDone: () => void;
  toast: (msg: string, kind?: "success" | "error") => void;
}) {
  const [busy, setBusy] = useState(false);
  const [promiseDate, setPromiseDate] = useState("");
  const [promiseAmount, setPromiseAmount] = useState("");

  if (!arrear) return null;
  const loanRef = { id: arrear.loan_id, client_id: arrear.client_id, dunning_level: arrear.dunning_level };
  const next = nextDunningStep(arrear.dunning_level);

  async function run(fn: () => Promise<{ error: string | null }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(ok);
    onDone();
  }

  return (
    <Modal
      open={!!arrear}
      onOpenChange={(o) => !o && onClose()}
      title={`Recouvrement — ${arrear.loan_reference ?? ""}`}
      description={`${fullName(arrear.first_name, arrear.last_name)} · ${formatCurrency(arrear.overdue_amount, 2)} en arriéré · ${arrear.max_days_late} j de retard`}
      wide
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Info label="Échéances dues" value={String(arrear.overdue_count)} />
          <Info label="Pénalités cumulées" value={formatCurrency(arrear.late_fees, 2)} />
          <Info label="Plus ancienne échéance" value={formatDate(arrear.oldest_due_date)} />
          <Info label="Encours total" value={formatCurrency(arrear.outstanding_total, 2)} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={busy} onClick={() => run(() => recordDunningStep(loanRef), `Relance niveau ${next.level} envoyée.`)}>
              <Bell className="h-4 w-4" /> Relancer (niveau {next.level} · {next.label})
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => run(() => assessLateFeeOnLoan(loanRef), "Pénalité de retard appliquée.")}>
              <Coins className="h-4 w-4" /> Appliquer une pénalité
            </Button>
            <Button variant="outline" className="text-error" disabled={busy} onClick={() => run(() => markDefault(loanRef, {}), "Crédit déclaré en défaut.")}>
              <Gavel className="h-4 w-4" /> Déclarer en défaut
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarClock className="h-4 w-4 text-muted-foreground" /> Promesse de paiement
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date promise" required>
              <TextInput type="date" value={promiseDate} onChange={(e) => setPromiseDate(e.target.value)} />
            </Field>
            <Field label="Montant (€)">
              <TextInput type="number" step="0.01" value={promiseAmount} onChange={(e) => setPromiseAmount(e.target.value)} placeholder={String(arrear.overdue_amount)} />
            </Field>
          </div>
          <Button
            className="mt-3"
            variant="outline"
            disabled={busy || !promiseDate}
            onClick={() =>
              run(
                () => recordPromiseToPay(loanRef, { promiseDate, amount: promiseAmount ? Number(promiseAmount) : null }),
                "Promesse de paiement enregistrée."
              )
            }
          >
            Enregistrer la promesse
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium tabular-nums">{value}</p>
    </div>
  );
}
