"use client";

import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { ScoreGauge } from "@/_components/admin/clients/score-gauge";
import {
  analyzeApplication,
  computeFraudAml,
  computePricing,
  evaluateDecision,
  OUTCOME_LABELS,
} from "@/_lib/admin/application";
import { formatCurrency, formatDate } from "@/_lib/admin/format";
import type { LoanApplicationFull, Product } from "@/_lib/admin/types";
import { KeyVal, SoftBadge, type Tone } from "./parts";

export function OverviewPanel({
  app,
  product,
  peers,
  onGoTab,
}: {
  app: LoanApplicationFull;
  product: Product | null;
  peers: LoanApplicationFull[];
  onGoTab: (tab: string) => void;
}) {
  const { analysis, pricing, fraud, decision } = useMemo(() => {
    const analysis = analyzeApplication(app);
    const pricing = computePricing(app, product);
    const fraud = computeFraudAml(app, peers);
    const decision = evaluateDecision(app, { analysis, pricing, fraud, product });
    return { analysis, pricing, fraud, decision };
  }, [app, product, peers]);

  const finTone: Tone = analysis.verdict.decision === "go" ? "success" : analysis.verdict.decision === "caution" ? "warning" : "error";
  const fraudTone: Tone = fraud.composite >= 70 ? "error" : fraud.composite >= 40 ? "warning" : "success";
  const decTone: Tone = decision.outcome === "APPROVE" ? "success" : decision.outcome === "REFER" ? "warning" : "error";

  const productName = product?.name ?? app.credit_type ?? "—";
  const docs = [
    { label: "Pièce d'identité", url: app.document_id_url },
    { label: "Justificatif de revenus", url: app.document_income_url },
    { label: "Justificatif de domicile", url: app.document_address_url },
    { label: "Relevé bancaire / RIB", url: app.document_bank_url },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Montant demandé" value={formatCurrency(app.amount)} sub={`${app.duration ?? "—"} mois`} />
        <KpiCard label="Mensualité" value={formatCurrency(pricing.amortization.monthlyPayment, 2)} sub={`TAEG ${pricing.taeg}%`} />
        <KpiCard label="Endettement après" value={`${Math.round(analysis.ratios.dtiAfter * 100)} %`} tone={analysis.ratios.dtiAfter > 0.4 ? "error" : analysis.ratios.dtiAfter > 0.33 ? "warning" : "success"} />
        <KpiCard label="Reste à vivre /pers." value={formatCurrency(analysis.residual.perHead)} tone={analysis.residual.band === "ok" ? "success" : analysis.residual.band === "warn" ? "warning" : "error"} />
        <KpiCard label="Score crédit" value={app.score != null ? `${app.score}` : "—"} sub={`cat. ${app.score_category ?? "—"}`} />
        <KpiCard label="Risque fraude" value={`${fraud.composite}`} sub={`LCB-FT ${fraud.amlRating}`} tone={fraudTone === "error" ? "error" : fraudTone === "warning" ? "warning" : "success"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Scoring crédit" className="lg:col-span-1">
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge score={app.score ?? decision.score} category={app.score_category ?? decision.category} />
            <p className="text-center text-xs text-muted-foreground">
              {app.score_category ? `Catégorie ${app.score_category}` : "Non évalué"}
            </p>
          </div>
        </Panel>

        <div className="space-y-3 lg:col-span-2">
          <VerdictCard tone={decTone} title={`Décision : ${OUTCOME_LABELS[decision.outcome]}`} detail={`Confiance ${decision.confidence}% · ${decision.knockouts.length} exclusion(s) · SLA ${decision.sla.remainingHours}h`} onClick={() => onGoTab("decision")} badge={decision.outcome} />
          <VerdictCard tone={finTone} title={`Capacité de remboursement : ${analysis.verdict.score}/100`} detail={analysis.verdict.reasons.slice(0, 2).join(" · ")} onClick={() => onGoTab("financial")} badge={analysis.verdict.decision.toUpperCase()} />
          <VerdictCard tone={fraudTone} title={`Fraude & conformité : ${fraud.composite}/100`} detail={`Recommandation ${fraud.recommended} · ${fraud.screeningHits.length} hit(s) screening`} onClick={() => onGoTab("fraud")} badge={fraud.amlRating.toUpperCase()} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Crédit demandé">
          <dl>
            <KeyVal label="Produit" value={productName} />
            <KeyVal label="Montant" value={formatCurrency(app.amount)} />
            <KeyVal label="Durée" value={app.duration ? `${app.duration} mois` : "—"} />
            <KeyVal label="Mensualité" value={formatCurrency(app.monthly_payment, 2)} />
            <KeyVal label="Taux effectif" value={app.effective_rate != null ? `${app.effective_rate} %` : "—"} />
            <KeyVal label="Pays" value={app.country} />
            <KeyVal label="Source" value={app.source} />
          </dl>
        </Panel>

        <Panel title="Identité & contact">
          <dl>
            <KeyVal label="Nom complet" value={`${app.first_name ?? ""} ${app.last_name ?? ""}`.trim() || "—"} />
            <KeyVal label="Naissance" value={`${formatDate(app.birth_date)}${app.birth_place ? ` · ${app.birth_place}` : ""}`} />
            <KeyVal label="Nationalité" value={app.nationality} />
            <KeyVal label="Situation familiale" value={app.marital_status} />
            <KeyVal label="Pièce" value={app.id_number ? `${app.id_type ?? ""} ${app.id_number}` : "—"} />
            <KeyVal label="Email" value={app.email} />
            <KeyVal label="Téléphone" value={app.phone} />
            <KeyVal label="Adresse" value={[app.address, app.postal_code, app.city].filter(Boolean).join(", ") || "—"} />
          </dl>
        </Panel>

        <Panel title="Emploi & revenus">
          <dl>
            <KeyVal label="Employeur" value={app.employer_name} />
            <KeyVal label="Poste" value={app.job_title} />
            <KeyVal label="Type de contrat" value={app.contract_type} />
            <KeyVal label="Depuis" value={formatDate(app.start_date)} />
            <KeyVal label="Revenu net mensuel" value={formatCurrency(app.monthly_net_income)} />
          </dl>
        </Panel>

        <Panel title="Pièces justificatives">
          <ul className="divide-y divide-border">
            {docs.map((d) => (
              <li key={d.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-foreground">{d.label}</span>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-dark-gold hover:underline">
                    Voir <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <SoftBadge tone="warning">Non fourni</SoftBadge>
                )}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {app.internal_notes ? (
        <Panel title="Note interne">
          <p className="whitespace-pre-line text-sm text-muted-foreground">{app.internal_notes}</p>
        </Panel>
      ) : null}
    </div>
  );
}

function VerdictCard({ tone, title, detail, onClick, badge }: { tone: Tone; title: string; detail: string; onClick: () => void; badge: string }) {
  const text: Record<Tone, string> = {
    default: "text-foreground", success: "text-success", warning: "text-alert", error: "text-error", info: "text-foreground",
  };
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary/40"
    >
      <div>
        <p className={`text-sm font-semibold ${text[tone]}`}>{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{detail || "—"}</p>
      </div>
      <SoftBadge tone={tone}>{badge}</SoftBadge>
    </button>
  );
}
