"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ban,
  Banknote,
  FileSignature,
  FileText,
  Landmark,
  PenLine,
  Send,
  Clock,
} from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { StatusBadge } from "@/_components/admin/status-badge";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { Timeline, StageStepper, type TimelineItem } from "@/_components/admin/timeline";
import { BackLink, InfoGrid } from "@/_components/admin/detail";
import { RefChip, PanelLoading } from "@/_components/admin/bits";
import { SoftBadge } from "@/_components/admin/primitives";
import { Modal, ConfirmDialog } from "@/_components/admin/dialog";
import { Field, Select, TextInput } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  getContract,
  listContractInteractions,
  sendOffer,
  signContract,
  expireContract,
  cancelContract,
} from "@/_lib/admin/contracts";
import { activateContractAsLoan } from "@/_lib/admin/origination";
import { disburseLoan } from "@/_lib/admin/servicing";
import { getLoan } from "@/_lib/admin/loans";
import { listActivity, type ActivityEntry } from "@/_lib/admin/audit";
import { DOCUMENT_PACK } from "@/_lib/admin/application";
import {
  contractStatusLabels,
  formatCurrency,
  formatDate,
  fullName,
  interactionTypeLabels,
  signatureMethodLabels,
} from "@/_lib/admin/format";
import type {
  ContractTermsSnapshot,
  ContractWithRefs,
  Interaction,
  LoanWithClient,
  SignatureMethod,
} from "@/_lib/admin/types";

type TabKey = "summary" | "terms" | "signature" | "loan" | "timeline";

const STAGES = [
  { key: "draft", label: "Brouillon" },
  { key: "offer_sent", label: "Offre" },
  { key: "signed", label: "Signé" },
  { key: "active", label: "Actif" },
  { key: "completed", label: "Soldé" },
] as const;

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const [contract, setContract] = useState<ContractWithRefs | null>(null);
  const [loan, setLoan] = useState<LoanWithClient | null>(null);
  const [events, setEvents] = useState<Interaction[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabKey>("summary");

  const [signOpen, setSignOpen] = useState(false);
  const [method, setMethod] = useState<SignatureMethod>("e_sign");
  const [genOpen, setGenOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getContract(id);
    setContract(res.data);
    const [ev, act] = await Promise.all([
      listContractInteractions(id),
      listActivity({ entity: "contracts", entityId: id }),
    ]);
    setEvents(ev.data ?? []);
    setActivity(act);
    if (res.data?.loan_id) {
      const l = await getLoan(res.data.loan_id);
      setLoan(l.data);
    } else {
      setLoan(null);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const terms = (contract?.terms ?? null) as ContractTermsSnapshot | null;

  const reachedKeys = useMemo(() => {
    if (!contract) return [] as (typeof STAGES)[number]["key"][];
    const keys: (typeof STAGES)[number]["key"][] = ["draft"];
    if (contract.offer_sent_at) keys.push("offer_sent");
    if (contract.signed_at) keys.push("signed");
    if (contract.loan_id || contract.status === "active") keys.push("active");
    if (contract.status === "completed") keys.push("completed");
    return keys;
  }, [contract]);

  const currentStage = useMemo<(typeof STAGES)[number]["key"]>(() => {
    if (!contract) return "draft";
    if (["draft", "offer_sent", "signed", "active", "completed"].includes(contract.status)) {
      return contract.status as (typeof STAGES)[number]["key"];
    }
    return reachedKeys.at(-1) ?? "draft";
  }, [contract, reachedKeys]);

  async function run(fn: () => Promise<{ error: string | null }>, ok: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(ok);
    load();
  }

  if (loading) {
    return (
      <div>
        <BackLink href="/admin/contracts" label="Contrats" />
        <PanelLoading rows={6} />
      </div>
    );
  }
  if (!contract) {
    return (
      <div>
        <BackLink href="/admin/contracts" label="Contrats" />
        <p className="text-sm text-muted-foreground">Contrat introuvable.</p>
      </div>
    );
  }

  const c = contract;
  const terminal = ["cancelled", "expired", "completed"].includes(c.status);
  const loanDraft = loan?.status === "draft";

  const tabs: TabDef<TabKey>[] = [
    { key: "summary", label: "Synthèse" },
    { key: "terms", label: "Termes & offre" },
    { key: "signature", label: "Signature" },
    { key: "loan", label: "Crédit", count: c.loan_id ? 1 : null },
    { key: "timeline", label: "Chronologie", count: events.length + activity.length || null },
  ];

  const primaryActions = (
    <div className="flex flex-wrap items-center gap-2">
      {c.status === "draft" ? (
        <Button onClick={() => run(() => sendOffer(c.id), "Offre envoyée.")} disabled={busy}>
          <Send className="h-4 w-4" /> Envoyer l'offre
        </Button>
      ) : null}
      {c.status === "offer_sent" ? (
        <>
          <Button onClick={() => setSignOpen(true)} disabled={busy}>
            <PenLine className="h-4 w-4" /> Marquer signé
          </Button>
          <Button variant="outline" onClick={() => run(() => expireContract(c.id), "Offre marquée expirée.")} disabled={busy}>
            <Clock className="h-4 w-4" /> Expirer
          </Button>
        </>
      ) : null}
      {c.status === "signed" && !c.loan_id ? (
        <Button onClick={() => setGenOpen(true)} disabled={busy}>
          <Landmark className="h-4 w-4" /> Générer le crédit
        </Button>
      ) : null}
      {loanDraft ? (
        <Button
          onClick={() => loan && run(() => disburseLoan(loan), "Fonds débloqués.")}
          disabled={busy}
        >
          <Banknote className="h-4 w-4" /> Débloquer les fonds
        </Button>
      ) : null}
      {!terminal ? (
        <Button variant="ghost" className="text-error hover:bg-error/10" onClick={() => setCancelOpen(true)} disabled={busy}>
          <Ban className="h-4 w-4" /> Annuler
        </Button>
      ) : null}
    </div>
  );

  return (
    <div>
      <BackLink href="/admin/contracts" label="Contrats" />
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-dark-gold" />
            {c.reference ?? "Contrat"}
          </span>
        }
        description={
          <>
            <Link href={`/admin/clients/${c.client_id}`} className="hover:underline">
              {fullName(c.client?.first_name, c.client?.last_name)}
            </Link>{" "}
            · {c.product?.name ?? terms?.product_name ?? "Sans produit"}
          </>
        }
        actions={primaryActions}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge kind="contract" status={c.status} />
        {c.signature_method ? <SoftBadge tone="info">{signatureMethodLabels[c.signature_method]}</SoftBadge> : null}
        <RefChip value={c.reference} />
      </div>

      <Panel className="mb-6" bodyClassName="px-4 py-5">
        <StageStepper stages={[...STAGES]} current={currentStage} reachedKeys={reachedKeys} />
      </Panel>

      <Tabs tabs={tabs} active={tab} onChange={setTab} className="mb-6" />

      {tab === "summary" ? <SummaryTab c={c} loan={loan} /> : null}
      {tab === "terms" ? <TermsTab c={c} terms={terms} /> : null}
      {tab === "signature" ? <SignatureTab c={c} /> : null}
      {tab === "loan" ? <LoanTab c={c} loan={loan} /> : null}
      {tab === "timeline" ? <TimelineTab events={events} activity={activity} /> : null}

      {/* Sign modal */}
      <Modal
        open={signOpen}
        onOpenChange={setSignOpen}
        title="Marquer le contrat signé"
        description="Ouvre le délai légal de rétractation (14 jours)."
        footer={
          <>
            <Button variant="outline" onClick={() => setSignOpen(false)} disabled={busy}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                setSignOpen(false);
                await run(() => signContract(c.id, { method }), "Signature enregistrée.");
              }}
              disabled={busy}
            >
              Confirmer la signature
            </Button>
          </>
        }
      >
        <Field label="Mode de signature">
          <Select value={method} onChange={(e) => setMethod(e.target.value as SignatureMethod)}>
            {Object.entries(signatureMethodLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </Modal>

      {/* Generate loan modal */}
      <Modal
        open={genOpen}
        onOpenChange={setGenOpen}
        title="Générer le crédit"
        description="Crée le crédit (brouillon) et son échéancier d'amortissement à partir des termes du contrat."
        footer={
          <>
            <Button variant="outline" onClick={() => setGenOpen(false)} disabled={busy}>
              Annuler
            </Button>
            <Button
              onClick={async () => {
                setGenOpen(false);
                await run(
                  () => activateContractAsLoan(c, { startDate: startDate || undefined }),
                  "Crédit généré (en attente de déblocage)."
                );
                setTab("loan");
              }}
              disabled={busy}
            >
              Générer
            </Button>
          </>
        }
      >
        <Field label="Date de 1re échéance (optionnel)" hint="Par défaut : dans un mois.">
          <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Annuler le contrat"
        message="Le contrat sera marqué annulé. Le crédit éventuellement rattaché n'est pas affecté."
        confirmLabel="Annuler le contrat"
        danger
        loading={busy}
        onConfirm={async () => {
          setCancelOpen(false);
          await run(() => cancelContract(c.id, "Annulé par l'analyste"), "Contrat annulé.");
        }}
      />
    </div>
  );
}

function SummaryTab({ c, loan }: { c: ContractWithRefs; loan: LoanWithClient | null }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Montant" value={formatCurrency(c.principal_amount)} />
        <KpiCard label="Mensualité" value={formatCurrency(c.monthly_payment, 2)} sub={`${c.duration_months ?? "—"} mois @ ${c.annual_rate ?? "—"}%`} />
        <KpiCard label="Statut" value={contractStatusLabels[c.status] ?? c.status} />
        <KpiCard label="Crédit" value={loan?.reference ?? (c.loan_id ? "lié" : "—")} tone={loan ? "success" : "default"} />
      </div>
      <Panel title="Informations">
        <InfoGrid
          cols={3}
          items={[
            { label: "Référence", value: c.reference, mono: true },
            { label: "Client", value: fullName(c.client?.first_name, c.client?.last_name) },
            { label: "Produit", value: c.product?.name ?? "—" },
            { label: "Créé le", value: formatDate(c.created_at) },
            { label: "Offre envoyée", value: c.offer_sent_at ? formatDate(c.offer_sent_at) : "—" },
            { label: "Offre expire", value: c.offer_expires_on ? formatDate(c.offer_expires_on) : "—" },
            { label: "Signé le", value: c.signed_at ? formatDate(c.signed_at) : "—" },
            { label: "Rétractation jusqu'au", value: c.withdrawal_deadline ? formatDate(c.withdrawal_deadline) : "—" },
            { label: "Début", value: c.start_date ? formatDate(c.start_date) : "—" },
          ]}
        />
      </Panel>
    </div>
  );
}

function TermsTab({ c, terms }: { c: ContractWithRefs; terms: ContractTermsSnapshot | null }) {
  return (
    <div className="space-y-6">
      <Panel title="Termes contractuels figés">
        {terms ? (
          <InfoGrid
            cols={3}
            items={[
              { label: "Montant", value: formatCurrency(terms.amount) },
              { label: "Durée", value: `${terms.duration_months} mois` },
              { label: "Taux débiteur", value: `${terms.annual_rate} %` },
              { label: "TAEG", value: terms.taeg != null ? `${terms.taeg} %` : "—" },
              { label: "Mensualité", value: formatCurrency(terms.monthly_payment, 2) },
              { label: "Mensualité (assurance incl.)", value: terms.monthly_with_insurance != null ? formatCurrency(terms.monthly_with_insurance, 2) : "—" },
              { label: "Frais de dossier", value: formatCurrency(terms.application_fee, 2) },
              { label: "Coût total du crédit", value: terms.total_cost != null ? formatCurrency(terms.total_cost, 2) : "—" },
              { label: "Montant total dû", value: terms.total_due != null ? formatCurrency(terms.total_due, 2) : "—" },
              { label: "Assurance", value: terms.insurance ? "Souscrite" : "Non souscrite" },
              { label: "Garantie", value: terms.guarantee ?? "—" },
              { label: "1re échéance", value: terms.first_due_date ? formatDate(terms.first_due_date) : "—" },
            ]}
          />
        ) : (
          <InfoGrid
            cols={3}
            items={[
              { label: "Montant", value: formatCurrency(c.principal_amount) },
              { label: "Durée", value: `${c.duration_months ?? "—"} mois` },
              { label: "Taux", value: `${c.annual_rate ?? "—"} %` },
              { label: "Mensualité", value: formatCurrency(c.monthly_payment, 2) },
            ]}
          />
        )}
      </Panel>

      {terms?.schedule_preview?.length ? (
        <Panel title="Échéancier (aperçu)">
          <ul className="space-y-0.5 text-sm">
            {terms.schedule_preview.map((s) => (
              <li key={s.sequence} className="flex justify-between border-b border-border/60 py-1.5 last:border-0">
                <span className="text-muted-foreground">Échéance {s.sequence} · {formatDate(s.due_date)}</span>
                <span className="tabular-nums font-medium">{formatCurrency(s.amount_due, 2)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel title="Pack documentaire">
        <ul className="space-y-2">
          {DOCUMENT_PACK.map((doc) => (
            <li key={doc.kind} className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground" /> {doc.label}
              </span>
              <SoftBadge tone={doc.required ? "info" : "default"}>{doc.required ? "Requis" : "Option"}</SoftBadge>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function SignatureTab({ c }: { c: ContractWithRefs }) {
  return (
    <Panel title="Signature & droit de rétractation">
      <InfoGrid
        cols={2}
        items={[
          { label: "Mode de signature", value: c.signature_method ? signatureMethodLabels[c.signature_method] : "—" },
          { label: "Signé le", value: c.signed_at ? formatDate(c.signed_at) : "Non signé" },
          { label: "Délai de rétractation", value: c.withdrawal_deadline ? `jusqu'au ${formatDate(c.withdrawal_deadline)}` : "—" },
          { label: "Offre envoyée le", value: c.offer_sent_at ? formatDate(c.offer_sent_at) : "—" },
          { label: "Offre valable jusqu'au", value: c.offer_expires_on ? formatDate(c.offer_expires_on) : "—" },
          { label: "Document signé", value: c.document_url ? <a href={c.document_url} className="text-dark-gold hover:underline" target="_blank" rel="noreferrer">Ouvrir</a> : "—" },
        ]}
      />
      {c.notes ? <p className="mt-4 rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">{c.notes}</p> : null}
    </Panel>
  );
}

function LoanTab({ c, loan }: { c: ContractWithRefs; loan: LoanWithClient | null }) {
  if (!c.loan_id || !loan) {
    return (
      <Panel title="Crédit rattaché">
        <p className="text-sm text-muted-foreground">
          Aucun crédit généré. Le crédit se crée depuis l'onglet une fois le contrat signé (action « Générer le crédit »).
        </p>
      </Panel>
    );
  }
  return (
    <Panel
      title="Crédit rattaché"
      actions={
        <Link href={`/admin/loans/${loan.id}`} className="text-xs font-medium text-dark-gold hover:underline">
          Ouvrir le crédit →
        </Link>
      }
    >
      <div className="mb-4 flex items-center gap-3">
        <StatusBadge kind="loan" status={loan.status} />
        <RefChip value={loan.reference} />
      </div>
      <InfoGrid
        cols={3}
        items={[
          { label: "Capital", value: formatCurrency(loan.principal_amount) },
          { label: "Mensualité", value: formatCurrency(loan.monthly_payment, 2) },
          { label: "Durée", value: `${loan.duration_months} mois` },
          { label: "Taux", value: `${loan.annual_rate} %` },
          { label: "Débloqué le", value: loan.disbursed_at ? formatDate(loan.disbursed_at) : "Non débloqué" },
          { label: "Fin", value: loan.end_date ? formatDate(loan.end_date) : "—" },
        ]}
      />
    </Panel>
  );
}

function TimelineTab({ events, activity }: { events: Interaction[]; activity: ActivityEntry[] }) {
  const items: TimelineItem[] = [
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

  return (
    <Panel title="Chronologie">
      <Timeline items={items} empty="Aucun évènement sur ce contrat." />
    </Panel>
  );
}
