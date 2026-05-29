"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { StatusBadge, RiskBadge } from "@/_components/admin/status-badge";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { Timeline, type TimelineItem } from "@/_components/admin/timeline";
import { BackLink, InfoGrid } from "@/_components/admin/detail";
import { RefChip, PanelLoading } from "@/_components/admin/bits";
import { Bar, SoftBadge } from "@/_components/admin/primitives";
import { Modal, ConfirmDialog } from "@/_components/admin/dialog";
import { Field, Select, TextInput } from "@/_components/admin/form";
import { PaymentDialog } from "@/_components/admin/forms/payment-dialog";
import { useToast } from "@/_components/admin/toast";
import { getLoan, getLoanInstallments, deleteLoan, listLoanInteractions } from "@/_lib/admin/loans";
import {
  disburseLoan,
  payoffQuote,
  settleLoan,
  restructureLoan,
  writeOffLoan,
  setLoanStatus,
  type PayoffQuote,
} from "@/_lib/admin/servicing";
import { markDefault } from "@/_lib/admin/collections";
import { listPayments, type PaymentRow } from "@/_lib/admin/payments";
import { listActivity, type ActivityEntry } from "@/_lib/admin/audit";
import type { Installment, Interaction, LoanWithClient } from "@/_lib/admin/types";
import {
  formatCurrency,
  formatDate,
  fullName,
  interactionTypeLabels,
  paymentMethodLabels,
} from "@/_lib/admin/format";

type TabKey = "summary" | "schedule" | "payments" | "servicing" | "timeline";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [loan, setLoan] = useState<LoanWithClient | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [events, setEvents] = useState<Interaction[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabKey>("summary");

  const [payOpen, setPayOpen] = useState(false);
  const [activeInstallment, setActiveInstallment] = useState<Installment | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [quote, setQuote] = useState<PayoffQuote | null>(null);
  const [writeOffOpen, setWriteOffOpen] = useState(false);
  const [restructureOpen, setRestructureOpen] = useState(false);
  const [rNewRate, setRNewRate] = useState("");
  const [rMonths, setRMonths] = useState("");
  const [rFirstDue, setRFirstDue] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const [l, i, p, ev, act] = await Promise.all([
      getLoan(id),
      getLoanInstallments(id),
      listPayments({ loanId: id, pageSize: 200 }),
      listLoanInteractions(id),
      listActivity({ entity: "loans", entityId: id }),
    ]);
    setLoan(l.data);
    setInstallments(i.data ?? []);
    setPayments(p.data?.rows ?? []);
    setEvents(ev.data ?? []);
    setActivity(act);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(fn: () => Promise<{ error: string | null }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(ok);
    load();
  }

  async function openSettle() {
    setBusy(true);
    const q = await payoffQuote(id);
    setBusy(false);
    if (q.error || !q.data) return toast(q.error ?? "Calcul impossible.", "error");
    setQuote(q.data);
    setSettleOpen(true);
  }

  const stats = useMemo(() => {
    const paidCount = installments.filter((i) => i.status === "paid").length;
    const remaining = installments.reduce((s, i) => s + Math.max(Number(i.amount_due) - Number(i.amount_paid), 0), 0);
    const collected = payments.filter((p) => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
    const lateFees = installments.reduce((s, i) => s + Number(i.late_fee ?? 0), 0);
    const overdue = installments.filter(
      (i) => ["pending", "partial", "late"].includes(i.status) && new Date(i.due_date) < new Date()
    );
    const progress = installments.length ? Math.round((paidCount / installments.length) * 100) : 0;
    return { paidCount, remaining, collected, lateFees, overdueCount: overdue.length, progress };
  }, [installments, payments]);

  if (loading) {
    return (
      <div>
        <BackLink href="/admin/loans" label="Crédits" />
        <PanelLoading rows={6} />
      </div>
    );
  }
  if (!loan) {
    return (
      <div>
        <BackLink href="/admin/loans" label="Crédits" />
        <p className="text-sm text-muted-foreground">Crédit introuvable.</p>
      </div>
    );
  }

  const isDraft = loan.status === "draft";
  const isActive = loan.status === "active";
  const isClosed = ["paid_off", "cancelled"].includes(loan.status);

  const tabs: TabDef<TabKey>[] = [
    { key: "summary", label: "Synthèse" },
    { key: "schedule", label: "Échéancier", count: installments.length || null },
    { key: "payments", label: "Paiements", count: payments.length || null },
    { key: "servicing", label: "Gestion" },
    { key: "timeline", label: "Chronologie", count: events.length + activity.length || null },
  ];

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {isDraft ? (
        <Button onClick={() => run(() => disburseLoan(loan), "Fonds débloqués.")} disabled={busy}>
          <Banknote className="h-4 w-4" /> Débloquer les fonds
        </Button>
      ) : null}
      {isActive ? (
        <Button onClick={() => { setActiveInstallment(null); setPayOpen(true); }}>
          <Plus className="h-4 w-4" /> Encaisser un paiement
        </Button>
      ) : null}
    </div>
  );

  return (
    <div>
      <BackLink href="/admin/loans" label="Crédits" />
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
        actions={headerActions}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge kind="loan" status={loan.status} />
        <RiskBadge category={loan.risk_category} />
        <RefChip value={loan.reference} />
        {loan.closure_reason ? <SoftBadge tone="info">{closureLabel(loan.closure_reason)}</SoftBadge> : null}
        {stats.overdueCount > 0 ? <SoftBadge tone="error">{stats.overdueCount} échéance(s) en retard</SoftBadge> : null}
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === "summary" ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Capital prêté" value={formatCurrency(loan.principal_amount)} />
            <KpiCard label="Mensualité" value={formatCurrency(loan.monthly_payment, 2)} sub={`${loan.duration_months} mois @ ${loan.annual_rate}%`} />
            <KpiCard label="Reste à payer" value={formatCurrency(stats.remaining)} tone={stats.remaining > 0 ? "warning" : "success"} />
            <KpiCard label="Encaissé" value={formatCurrency(stats.collected)} sub={`${stats.paidCount}/${installments.length} échéances`} tone="success" />
          </div>
          <Panel title="Avancement du remboursement">
            <Bar label={`${stats.progress}% remboursé`} pct={stats.progress} value={`${stats.paidCount}/${installments.length}`} tone={stats.progress === 100 ? "success" : "info"} />
            {stats.lateFees > 0 ? (
              <p className="mt-3 text-xs text-error">Pénalités de retard cumulées : {formatCurrency(stats.lateFees, 2)}</p>
            ) : null}
          </Panel>
          <Panel title="Conditions">
            <InfoGrid
              cols={3}
              items={[
                { label: "Total à rembourser", value: formatCurrency(loan.total_repayable, 2) },
                { label: "Intérêts", value: formatCurrency(loan.total_interest, 2) },
                { label: "Frais dossier", value: formatCurrency(loan.application_fee, 2) },
                { label: "Début", value: formatDate(loan.start_date) },
                { label: "Fin", value: formatDate(loan.end_date) },
                { label: "Débloqué le", value: loan.disbursed_at ? formatDate(loan.disbursed_at) : "Non débloqué" },
                { label: "Objet", value: loan.purpose, span: true },
                ...(loan.closed_at ? [{ label: "Clôturé le", value: formatDate(loan.closed_at) }] : []),
                ...(loan.write_off_amount > 0 ? [{ label: "Montant passé en perte", value: formatCurrency(loan.write_off_amount, 2) }] : []),
              ]}
            />
          </Panel>
        </div>
      ) : null}

      {tab === "schedule" ? (
        <Panel title="Échéancier" bodyClassName="p-0">
          <div className="max-h-[34rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-secondary/40">
                <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-2.5 text-left">#</th>
                  <th className="px-4 py-2.5 text-left">Échéance</th>
                  <th className="px-4 py-2.5 text-right">Montant</th>
                  <th className="px-4 py-2.5 text-right">Capital / Intérêts</th>
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
                        {Number(inst.late_fee) > 0 ? (
                          <span className="ml-2 text-xs text-error">+{formatCurrency(inst.late_fee, 2)}</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(inst.amount_due, 2)}</td>
                      <td className="px-4 py-2 text-right text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(inst.principal_component, 2)} / {formatCurrency(inst.interest_component, 2)}
                      </td>
                      <td className="px-4 py-2">
                        <StatusBadge kind="installment" status={overdue && inst.status === "pending" ? "late" : inst.status} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        {isActive && inst.status !== "paid" && inst.status !== "waived" ? (
                          <button
                            onClick={() => { setActiveInstallment(inst); setPayOpen(true); }}
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
      ) : null}

      {tab === "payments" ? (
        <Panel
          title="Paiements"
          actions={isActive ? (
            <Button size="sm" variant="outline" onClick={() => { setActiveInstallment(null); setPayOpen(true); }}>
              <Plus className="h-4 w-4" /> Encaisser
            </Button>
          ) : null}
        >
          {payments.length ? (
            <ul className="divide-y divide-border">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    {formatDate(p.payment_date)} · {paymentMethodLabels[p.method] ?? p.method}
                    <StatusBadge kind="payment" status={p.status} />
                  </span>
                  <span className="font-medium tabular-nums">{formatCurrency(p.amount, 2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun paiement enregistré.</p>
          )}
        </Panel>
      ) : null}

      {tab === "servicing" ? (
        <div className="space-y-6">
          <Panel title="Opérations de gestion">
            {isDraft ? (
              <ServiceRow
                title="Déblocage des fonds"
                desc="Verser le capital au client et activer le crédit."
                action={<Button onClick={() => run(() => disburseLoan(loan), "Fonds débloqués.")} disabled={busy}><Banknote className="h-4 w-4" /> Débloquer</Button>}
              />
            ) : null}
            {isActive ? (
              <>
                <ServiceRow
                  title="Solde anticipé"
                  desc="Calculer le décompte de remboursement anticipé et solder le crédit."
                  action={<Button variant="outline" onClick={openSettle} disabled={busy}><Wallet className="h-4 w-4" /> Décompte de solde</Button>}
                />
                <ServiceRow
                  title="Restructuration"
                  desc="Ré-échelonner le capital restant sur de nouvelles conditions."
                  action={<Button variant="outline" onClick={() => setRestructureOpen(true)} disabled={busy}><RefreshCw className="h-4 w-4" /> Restructurer</Button>}
                />
                <ServiceRow
                  title="Mise en défaut"
                  desc="Déclarer le crédit en défaut suite à impayés persistants."
                  action={<Button variant="outline" className="text-error" onClick={() => run(() => markDefault(loan, {}), "Crédit déclaré en défaut.")} disabled={busy}><AlertTriangle className="h-4 w-4" /> Défaut</Button>}
                />
              </>
            ) : null}
            {loan.status === "defaulted" ? (
              <>
                <ServiceRow
                  title="Réactiver"
                  desc="Le client a régularisé : repasser le crédit en cours."
                  action={<Button variant="outline" onClick={() => run(() => setLoanStatus(loan, "active"), "Crédit réactivé.")} disabled={busy}>Réactiver</Button>}
                />
                <ServiceRow
                  title="Solde anticipé"
                  desc="Solder le crédit en défaut via un décompte."
                  action={<Button variant="outline" onClick={openSettle} disabled={busy}><Wallet className="h-4 w-4" /> Décompte</Button>}
                />
                <ServiceRow
                  title="Passage en perte"
                  desc="Reconnaître la perte sur un encours irrécouvrable."
                  action={<Button variant="outline" className="text-error" onClick={() => setWriteOffOpen(true)} disabled={busy}>Passer en perte</Button>}
                />
              </>
            ) : null}
            {isClosed ? (
              <p className="text-sm text-muted-foreground">Crédit clôturé{loan.closure_reason ? ` — ${closureLabel(loan.closure_reason)}` : ""}. Aucune opération disponible.</p>
            ) : null}
          </Panel>

          <Panel title="Zone sensible">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Supprimer définitivement ce crédit, son échéancier et ses paiements.</p>
              <Button variant="ghost" className="text-error hover:bg-error/10" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" /> Supprimer
              </Button>
            </div>
          </Panel>
        </div>
      ) : null}

      {tab === "timeline" ? (
        <Panel title="Chronologie">
          <Timeline items={timelineItems(events, activity)} empty="Aucun évènement sur ce crédit." />
        </Panel>
      ) : null}

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
        loading={busy}
        onConfirm={async () => {
          setBusy(true);
          const res = await deleteLoan(id);
          setBusy(false);
          if (res.error) return toast(res.error, "error");
          toast("Crédit supprimé.");
          router.push("/admin/loans");
        }}
      />

      {/* Settlement quote */}
      <Modal
        open={settleOpen}
        onOpenChange={setSettleOpen}
        title="Décompte de solde anticipé"
        description="Montant à régler pour solder le crédit aujourd'hui."
        footer={
          <>
            <Button variant="outline" onClick={() => setSettleOpen(false)} disabled={busy}>Fermer</Button>
            <Button
              onClick={async () => {
                setSettleOpen(false);
                await run(() => settleLoan(loan), "Crédit soldé par anticipation.");
              }}
              disabled={busy}
            >
              Enregistrer le règlement
            </Button>
          </>
        }
      >
        {quote ? (
          <InfoGrid
            cols={2}
            items={[
              { label: "Capital restant dû", value: formatCurrency(quote.outstanding_principal, 2) },
              { label: "Intérêts échus", value: formatCurrency(quote.accrued_interest, 2) },
              { label: "Pénalités de retard", value: formatCurrency(quote.late_fees, 2) },
              { label: "Indemnité (1%)", value: formatCurrency(quote.indemnity, 2) },
              { label: "Total à régler", value: <span className="text-base font-semibold">{formatCurrency(quote.total, 2)}</span>, span: true },
              { label: "Intérêts économisés", value: formatCurrency(quote.forgone_interest, 2), span: true },
            ]}
          />
        ) : null}
      </Modal>

      {/* Restructure */}
      <Modal
        open={restructureOpen}
        onOpenChange={setRestructureOpen}
        title="Restructurer le crédit"
        description="Le capital restant dû est ré-amorti sur de nouvelles conditions. Les échéances impayées sont remplacées."
        footer={
          <>
            <Button variant="outline" onClick={() => setRestructureOpen(false)} disabled={busy}>Annuler</Button>
            <Button
              onClick={async () => {
                const months = parseInt(rMonths, 10);
                if (!months || months <= 0) return toast("Indiquez une durée valide.", "error");
                setRestructureOpen(false);
                await run(
                  () => restructureLoan(loan, {
                    newDurationMonths: months,
                    newRate: rNewRate ? Number(rNewRate) : undefined,
                    firstDueDate: rFirstDue || undefined,
                  }),
                  "Crédit restructuré."
                );
                setRMonths(""); setRNewRate(""); setRFirstDue("");
              }}
              disabled={busy}
            >
              Restructurer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nouvelle durée (mois)" required>
            <TextInput type="number" min={1} value={rMonths} onChange={(e) => setRMonths(e.target.value)} placeholder="ex. 24" />
          </Field>
          <Field label="Nouveau taux annuel (%)" hint={`Actuel : ${loan.annual_rate}%`}>
            <TextInput type="number" step="0.1" value={rNewRate} onChange={(e) => setRNewRate(e.target.value)} placeholder={`${loan.annual_rate}`} />
          </Field>
          <Field label="Date de 1re nouvelle échéance" hint="Par défaut : dans un mois.">
            <TextInput type="date" value={rFirstDue} onChange={(e) => setRFirstDue(e.target.value)} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={writeOffOpen}
        onOpenChange={setWriteOffOpen}
        title="Passer le crédit en perte"
        message="L'encours restant sera reconnu comme perte. Le crédit reste en défaut. Action sensible."
        confirmLabel="Passer en perte"
        danger
        loading={busy}
        onConfirm={async () => {
          setWriteOffOpen(false);
          await run(() => writeOffLoan(loan, { reason: "Irrécouvrable" }), "Encours passé en perte.");
        }}
      />
    </div>
  );
}

function ServiceRow({ title, desc, action }: { title: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  );
}

function closureLabel(reason: string): string {
  const map: Record<string, string> = {
    settled_early: "Soldé par anticipation",
    paid_off: "Soldé",
    written_off: "Passé en perte",
    cancelled: "Annulé",
  };
  return map[reason] ?? reason;
}

function timelineItems(events: Interaction[], activity: ActivityEntry[]): TimelineItem[] {
  return [
    ...events.map((e) => ({
      id: `i-${e.id}`,
      title: e.subject ?? interactionTypeLabels[e.type] ?? e.type,
      meta: interactionTypeLabels[e.type] ?? e.type,
      body: e.body,
      at: formatDate(e.occurred_at),
      tone: e.type === "system" ? ("default" as const) : ("info" as const),
    })),
    ...activity.map((a) => ({
      id: `a-${a.id}`,
      title: a.action,
      meta: a.actor_email ?? "système",
      at: formatDate(a.created_at),
      tone: "default" as const,
    })),
  ].sort((x, y) => String(y.at).localeCompare(String(x.at)));
}
