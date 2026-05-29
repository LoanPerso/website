"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileText, Landmark, FileCheck2 } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Panel } from "@/_components/admin/panel";
import { Button } from "@/_components/ui/button";
import { Select } from "@/_components/admin/form";
import { StatusBadge } from "@/_components/admin/status-badge";
import { useToast } from "@/_components/admin/toast";
import {
  buildMergeContext,
  computePricing,
  DOCUMENT_PACK,
  OFFER_BLOCKS,
} from "@/_lib/admin/application";
import { findContractByApplication } from "@/_lib/admin/contracts";
import { originateFromApplication } from "@/_lib/admin/origination";
import { contractStatusLabels, formatCurrency, formatDate } from "@/_lib/admin/format";
import type { ContractWithRefs, LoanApplicationFull, Product } from "@/_lib/admin/types";
import { KeyVal, Metric, SoftBadge } from "./parts";

const LIFECYCLE = [
  { key: "draft", label: "Offre à émettre" },
  { key: "offer_sent", label: "Offre envoyée" },
  { key: "signed", label: "Signée" },
  { key: "cooling", label: "Délai de rétractation" },
  { key: "active", label: "Activée / débloquée" },
];

function lifecycleIndex(app: LoanApplicationFull): number {
  if (app.converted_client_id) return 4;
  if (app.status === "approved") return 2;
  if (app.status === "qualified" || app.pricing) return 1;
  return 0;
}

export function ContractPanel({
  app,
  product,
  onUpdated,
}: {
  app: LoanApplicationFull;
  product: Product | null;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const router = useRouter();
  const [locale, setLocale] = useState("fr");
  const [busy, setBusy] = useState(false);
  const [contract, setContract] = useState<ContractWithRefs | null>(null);

  const refreshContract = useCallback(async () => {
    const res = await findContractByApplication(app.id);
    setContract(res.data ?? null);
  }, [app.id]);

  useEffect(() => {
    refreshContract();
  }, [refreshContract]);

  const pricing = useMemo(() => {
    if (app.pricing) {
      return computePricing(app, product, {
        amount: app.pricing.amount,
        duration: app.pricing.duration_months,
        rate: app.pricing.applied_rate,
        insurance: app.pricing.insurance,
        guarantee: app.pricing.guarantee as never,
      });
    }
    return computePricing(app, product);
  }, [app, product]);

  const ctx = useMemo(() => buildMergeContext(app, pricing), [app, pricing]);
  const step = contract
    ? contract.status === "offer_sent"
      ? 1
      : contract.status === "signed"
        ? 3
        : contract.status === "active" || contract.loan_id
          ? 4
          : 0
    : lifecycleIndex(app);
  const templateId = `cc_${(app.country ?? "ee").toLowerCase()}_v1`;
  const canGenerate = Boolean(app.pricing) || Boolean(app.amount && app.duration);

  // Persist a real contract (offer) from the locked terms, then hand off to the
  // contract dossier where the rest of the lifecycle (send/sign/disburse) lives.
  async function generateContract() {
    setBusy(true);
    const res = await originateFromApplication(app, product, { pricing: app.pricing });
    setBusy(false);
    if (res.error || !res.data) {
      toast(res.error ?? "Génération du contrat impossible.", "error");
      return;
    }
    toast("Contrat généré. Ouverture du dossier contractuel…");
    onUpdated();
    router.push(`/admin/contracts/${res.data.contract.id}`);
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Génération de l'offre"
        actions={
          <div className="flex items-center gap-2">
            <Select value={locale} onChange={(e) => setLocale(e.target.value)} className="h-8 w-28 text-xs">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
            <SoftBadge tone="info">{templateId}</SoftBadge>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Montant" value={formatCurrency(ctx.credit.amount)} />
          <Metric label="Durée" value={`${ctx.credit.durationMonths} mois`} />
          <Metric label="TAEG" value={`${ctx.credit.taeg} %`} tone="info" />
          <Metric label="Mensualité" value={formatCurrency(ctx.credit.monthlyWithInsurance, 2)} />
        </div>
        {!app.pricing ? (
          <p className="mt-3 text-xs text-alert">
            Offre non verrouillée : aperçu basé sur la tarification suggérée. Verrouillez l'offre dans l'onglet Tarification pour la figer.
          </p>
        ) : (
          <p className="mt-3 text-xs text-success">Offre verrouillée le {formatDate(app.pricing.locked_at)}.</p>
        )}
      </Panel>

      {/* Lifecycle */}
      <Panel title="Cycle de vie du contrat">
        <ol className="flex flex-wrap items-center gap-2">
          {LIFECYCLE.map((s, i) => (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold",
                  i <= step ? "border-success bg-success text-white" : "border-border bg-background text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span className={cn("text-sm", i <= step ? "font-medium text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {i < LIFECYCLE.length - 1 ? <span className="mx-1 h-px w-6 bg-border" /> : null}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {contract ? (
            <>
              <StatusBadge kind="contract" status={contract.status} />
              <Button onClick={() => router.push(`/admin/contracts/${contract.id}`)}>
                Ouvrir le dossier contractuel <ArrowRight className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Réf. {contract.reference ?? "—"} — gérez l'envoi, la signature, le déblocage dans le dossier.
              </span>
            </>
          ) : (
            <>
              <Button onClick={generateContract} disabled={busy || !canGenerate}>
                <Landmark className="h-4 w-4" /> Générer le contrat
              </Button>
              {!canGenerate ? (
                <span className="text-xs text-alert">
                  Verrouillez l'offre (montant + durée) dans l'onglet Tarification avant de générer le contrat.
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Crée le client (si besoin), le contrat et son échéancier prévisionnel — puis ouvre le dossier contractuel.
                </span>
              )}
            </>
          )}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Pack documentaire" className="lg:col-span-1">
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

        {/* Offer preview */}
        <Panel title="Aperçu de l'offre (FIPEN / SECCI)" className="lg:col-span-2">
          <div className="rounded-lg border border-border bg-background">
            <div className="border-b border-border bg-secondary/30 px-5 py-3">
              <p className="font-serif text-lg">{ctx.lender.name}</p>
              <p className="text-xs text-muted-foreground">{ctx.lender.address} · {ctx.lender.regulator}</p>
            </div>
            <div className="space-y-4 px-5 py-4 text-sm">
              <section>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Emprunteur</p>
                <p className="font-medium">{ctx.borrower.name}</p>
                <p className="text-muted-foreground">{ctx.borrower.address || "—"}</p>
                <p className="text-muted-foreground">{ctx.borrower.email} · {ctx.borrower.phone}</p>
              </section>

              <section className="rounded-md border border-border bg-secondary/40 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-dark-gold">Encadré — caractéristiques du crédit</p>
                <dl className="mt-2">
                  <KeyVal label="Produit" value={ctx.credit.product} />
                  <KeyVal label="Montant total du crédit" value={formatCurrency(ctx.credit.amount)} />
                  <KeyVal label="Durée" value={`${ctx.credit.durationMonths} mois`} />
                  <KeyVal label="Taux débiteur fixe" value={`${ctx.credit.debitRate} %`} />
                  <KeyVal label="TAEG" value={`${ctx.credit.taeg} %`} />
                  <KeyVal label="Mensualité (assurance incl.)" value={formatCurrency(ctx.credit.monthlyWithInsurance, 2)} />
                  <KeyVal label="Frais de dossier" value={formatCurrency(ctx.credit.applicationFee, 2)} />
                  <KeyVal label="Coût total du crédit" value={formatCurrency(ctx.credit.totalCost, 2)} />
                  <KeyVal label="Montant total dû" value={formatCurrency(ctx.credit.totalDue, 2)} />
                  <KeyVal label="1re échéance" value={formatDate(ctx.credit.firstDueDate)} />
                </dl>
              </section>

              <section>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assurance emprunteur</p>
                <p className="text-muted-foreground">
                  {ctx.insurance.taken ? `Souscrite — ${formatCurrency(ctx.insurance.monthly, 2)}/mois (total ${formatCurrency(ctx.insurance.total, 2)})` : "Facultative — non souscrite"}
                </p>
              </section>

              <section>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Échéancier (extrait)</p>
                <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                  {ctx.schedulePreview.map((s) => (
                    <li key={s.sequence} className="flex justify-between">
                      <span>Échéance {s.sequence} · {formatDate(s.due_date)}</span>
                      <span className="tabular-nums">{formatCurrency(s.amount_due, 2)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="text-xs text-muted-foreground">
                <p className="font-semibold uppercase tracking-wider">Droit de rétractation</p>
                <p>
                  Vous disposez d'un délai de {ctx.legal.coolingOffDays} jours pour vous rétracter. Plafond d'usure applicable : {ctx.legal.usuryCeiling} % ({ctx.legal.country}).
                </p>
              </section>

              <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                <FileCheck2 className="h-4 w-4" /> Blocs générés : {OFFER_BLOCKS.length} — {OFFER_BLOCKS.join(" · ")}
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
