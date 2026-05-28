"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { StatusBadge, RiskBadge } from "@/_components/admin/status-badge";
import { KpiCard } from "@/_components/admin/kpi-card";
import { ConfirmDialog } from "@/_components/admin/dialog";
import { ClientFormDialog } from "@/_components/admin/forms/client-form-dialog";
import { ScorePanel } from "@/_components/admin/clients/score-panel";
import { DocumentsPanel } from "@/_components/admin/clients/documents-panel";
import { InteractionsPanel } from "@/_components/admin/clients/interactions-panel";
import { TasksPanel } from "@/_components/admin/clients/tasks-panel";
import { ContractsPanel } from "@/_components/admin/clients/contracts-panel";
import { useToast } from "@/_components/admin/toast";
import { getClient, deleteClient } from "@/_lib/admin/clients";
import { listLoans } from "@/_lib/admin/loans";
import { listPayments, type PaymentRow } from "@/_lib/admin/payments";
import type { Client, LoanWithClient } from "@/_lib/admin/types";
import { formatCurrency, formatDate, fullName, paymentMethodLabels } from "@/_lib/admin/format";

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  const [client, setClient] = useState<Client | null>(null);
  const [loans, setLoans] = useState<LoanWithClient[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadClient = useCallback(async () => {
    const c = await getClient(id);
    setClient(c.data);
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    const [c, l, p] = await Promise.all([
      getClient(id),
      listLoans({ clientId: id, pageSize: 100 }),
      listPayments({ clientId: id, pageSize: 100 }),
    ]);
    setClient(c.data);
    setLoans(l.data?.rows ?? []);
    setPayments(p.data?.rows ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    setDeleting(true);
    const res = await deleteClient(id);
    setDeleting(false);
    if (res.error) {
      toast(res.error, "error");
      setDeleteOpen(false);
      return;
    }
    toast("Client supprimé.");
    router.push("/admin/clients");
  }

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!client) return <p className="text-sm text-muted-foreground">Client introuvable.</p>;

  const totalBorrowed = loans.reduce((s, l) => s + Number(l.principal_amount), 0);
  const activeLoans = loans.filter((l) => l.status === "active").length;
  const totalRepaid = payments.reduce((s, p) => s + Number(p.amount), 0);

  const loanColumns: Column<LoanWithClient>[] = [
    { header: "Réf.", cell: (l) => <span className="font-mono text-xs">{l.reference}</span> },
    { header: "Produit", cell: (l) => l.product?.name ?? "—" },
    { header: "Montant", align: "right", cell: (l) => formatCurrency(l.principal_amount) },
    { header: "Taux", align: "right", cell: (l) => `${l.annual_rate} %` },
    { header: "Mensualité", align: "right", cell: (l) => formatCurrency(l.monthly_payment, 2) },
    { header: "Statut", cell: (l) => <StatusBadge kind="loan" status={l.status} /> },
  ];

  const paymentColumns: Column<PaymentRow>[] = [
    { header: "Date", cell: (p) => formatDate(p.payment_date) },
    { header: "Crédit", cell: (p) => p.loan?.reference ?? "—" },
    { header: "Moyen", cell: (p) => paymentMethodLabels[p.method] ?? p.method },
    { header: "Montant", align: "right", cell: (p) => formatCurrency(p.amount, 2) },
  ];

  return (
    <div>
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Clients
      </Link>

      <PageHeader
        title={fullName(client.first_name, client.last_name)}
        description={`${client.reference} · ${client.city ?? "—"} · ${client.country ?? ""}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Modifier
            </Button>
            <Button asChild>
              <Link href={`/admin/loans/new?client=${client.id}`}>
                <Plus className="h-4 w-4" /> Nouveau crédit
              </Link>
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge kind="client" status={client.status} />
        <RiskBadge category={client.risk_category} />
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total emprunté" value={formatCurrency(totalBorrowed)} sub={`${loans.length} crédit(s)`} />
        <KpiCard label="Crédits actifs" value={String(activeLoans)} />
        <KpiCard label="Total remboursé" value={formatCurrency(totalRepaid)} tone="success" />
        <KpiCard
          label="Revenu net / charges"
          value={formatCurrency(client.monthly_net_income)}
          sub={`Charges : ${formatCurrency(client.monthly_expenses)}`}
        />
      </div>

      <div className="mb-6">
        <ScorePanel client={client} onUpdated={loadClient} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Informations" className="lg:col-span-1">
          <dl className="space-y-3 text-sm">
            <Row label="Email" value={client.email} />
            <Row label="Téléphone" value={client.phone} />
            <Row label="Naissance" value={formatDate(client.birth_date)} />
            <Row label="Personnes à charge" value={client.dependents != null ? String(client.dependents) : null} />
            <Row label="Emploi" value={client.employment_status} />
            <Row label="Depuis" value={formatDate(client.employment_since)} />
            <Row label="Employeur" value={client.employer_name} />
            <Row label="Logement" value={client.housing_status} />
            <Row label="Historique" value={client.credit_history} />
            <Row label="Consentement RGPD" value={client.consent_given_at ? formatDate(client.consent_given_at) : "Non recueilli"} />
            {client.notes ? <Row label="Notes" value={client.notes} /> : null}
          </dl>
        </Panel>

        <div className="space-y-6 lg:col-span-2">
          <Panel title="Crédits">
            <DataTable
              columns={loanColumns}
              rows={loans}
              getKey={(l) => l.id}
              onRowClick={(l) => router.push(`/admin/loans/${l.id}`)}
              empty={{ title: "Aucun crédit" }}
            />
          </Panel>

          <ContractsPanel clientId={client.id} loans={loans} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DocumentsPanel clientId={client.id} />
        <TasksPanel clientId={client.id} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <InteractionsPanel clientId={client.id} />
        <Panel title="Paiements">
          <DataTable
            columns={paymentColumns}
            rows={payments}
            getKey={(p) => p.id}
            empty={{ title: "Aucun paiement" }}
          />
        </Panel>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Button variant="ghost" className="text-error hover:bg-error/10" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" /> Supprimer ce client
        </Button>
      </div>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} onSaved={() => load()} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer le client"
        message="Cette action est irréversible. Un client avec des crédits ne peut pas être supprimé."
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
