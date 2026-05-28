"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, RefreshCw, UserPlus } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { Select } from "@/_components/admin/form";
import { StatusBadge } from "@/_components/admin/status-badge";
import { ScoreGauge } from "@/_components/admin/clients/score-gauge";
import { useToast } from "@/_components/admin/toast";
import {
  computeApplicationScore,
  convertApplicationToClient,
  getApplicationFull,
  recomputeApplicationScore,
  updateApplicationStatus,
} from "@/_lib/admin/applications";
import { listProducts } from "@/_lib/admin/products";
import type { ApplicationStatus, LoanApplicationFull, Product } from "@/_lib/admin/types";
import { applicationStatusLabels, formatCurrency, formatDate, fullName } from "@/_lib/admin/format";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  const [app, setApp] = useState<LoanApplicationFull | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, p] = await Promise.all([getApplicationFull(id), listProducts()]);
    setApp(a.data);
    setProducts(p.data ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const score = useMemo(() => (app ? computeApplicationScore(app) : null), [app]);

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!app) return <p className="text-sm text-muted-foreground">Demande introuvable.</p>;

  const productName = products.find((p) => p.slug === app.credit_type)?.name ?? app.credit_type ?? "—";

  async function changeStatus(status: ApplicationStatus) {
    if (!app) return;
    const res = await updateApplicationStatus(app.id, status);
    if (res.error) toast(res.error, "error");
    else {
      toast("Statut mis à jour.");
      load();
    }
  }

  async function recompute() {
    if (!app) return;
    setBusy(true);
    const res = await recomputeApplicationScore(app);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Score recalculé et enregistré.");
    load();
  }

  async function convert() {
    if (!app) return;
    setBusy(true);
    const res = await convertApplicationToClient(app.id);
    setBusy(false);
    if (res.error || !res.data) return toast(res.error ?? "Erreur", "error");
    toast("Demande convertie en client.");
    router.push(`/admin/clients/${res.data.id}`);
  }

  const docs: { label: string; url: string | null }[] = [
    { label: "Pièce d'identité", url: app.document_id_url },
    { label: "Justificatif de revenus", url: app.document_income_url },
    { label: "Justificatif de domicile", url: app.document_address_url },
    { label: "Relevé bancaire / RIB", url: app.document_bank_url },
  ];

  return (
    <div>
      <Link
        href="/admin/applications"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Demandes
      </Link>

      <PageHeader
        title={fullName(app.first_name, app.last_name)}
        description={`Demande reçue le ${formatDate(app.created_at)}${app.source ? ` · source : ${app.source}` : ""}`}
        actions={
          <>
            <Select
              value={app.status}
              onChange={(e) => changeStatus(e.target.value as ApplicationStatus)}
              className="h-9 w-40"
            >
              {Object.entries(applicationStatusLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
            {app.converted_client_id ? (
              <Button asChild>
                <Link href={`/admin/clients/${app.converted_client_id}`}>Voir le client</Link>
              </Button>
            ) : (
              <Button onClick={convert} disabled={busy}>
                <UserPlus className="h-4 w-4" /> Convertir en client
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <StatusBadge kind="application" status={app.status} />
        {app.converted_client_id ? (
          <span className="rounded-full bg-success/12 px-2.5 py-0.5 text-xs font-medium text-success">
            Convertie en client
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Scoring */}
        <Panel
          title="Scoring (pré-évaluation)"
          className="lg:col-span-1"
          actions={
            <Button variant="outline" size="sm" onClick={recompute} disabled={busy}>
              <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} /> Recalculer
            </Button>
          }
        >
          {score ? (
            <div className="flex flex-col items-center gap-4">
              <ScoreGauge score={score.score} category={score.category} />
              {!score.complete ? (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Pré-éval. (logement & historique inconnus)
                </span>
              ) : null}
              <div className="w-full space-y-2.5">
                {score.factors.map((f) => (
                  <FactorBar key={f.code} label={f.label} weight={f.weight} score={f.score} raw={f.raw} unknown={f.status === "unknown"} />
                ))}
              </div>
              {score.reasonCodes.length ? (
                <div className="w-full">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Points de vigilance
                  </p>
                  <ul className="space-y-1 text-sm">
                    {score.reasonCodes.map((r) => (
                      <li key={r.code} className="flex items-center justify-between gap-3">
                        <span>{r.label}</span>
                        <span className="font-mono text-xs text-alert">{r.score}/100</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </Panel>

        {/* Dossier */}
        <div className="space-y-6 lg:col-span-2">
          <InfoPanel
            title="Crédit demandé"
            rows={[
              ["Produit", productName],
              ["Montant", formatCurrency(app.amount)],
              ["Durée", app.duration ? `${app.duration} mois` : "—"],
              ["Mensualité", formatCurrency(app.monthly_payment, 2)],
              ["Taux effectif", app.effective_rate != null ? `${app.effective_rate} %` : "—"],
              ["Pays", app.country],
            ]}
          />

          <InfoPanel
            title="Identité"
            rows={[
              ["Prénom", app.first_name],
              ["Nom", app.last_name],
              ["Date de naissance", app.birth_date],
              ["Lieu de naissance", app.birth_place],
              ["Nationalité", app.nationality],
              ["Situation familiale", app.marital_status],
              ["Type de pièce", app.id_type],
              ["N° de pièce", app.id_number],
            ]}
          />

          <InfoPanel
            title="Contact"
            rows={[
              ["Email", app.email],
              ["Téléphone", app.phone],
              ["Adresse", app.address],
              ["Code postal", app.postal_code],
              ["Ville", app.city],
              ["Pays de résidence", app.address_country],
            ]}
          />

          <InfoPanel
            title="Emploi & revenus"
            rows={[
              ["Employeur", app.employer_name],
              ["Adresse employeur", app.employer_address],
              ["Poste", app.job_title],
              ["Type de contrat", app.contract_type],
              ["Depuis", app.start_date],
              ["Revenu net mensuel", app.monthly_net_income != null ? formatCurrency(app.monthly_net_income) : "—"],
            ]}
          />

          <Panel title="Pièces justificatives">
            <ul className="divide-y divide-border">
              {docs.map((d) => (
                <li key={d.label} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-foreground">{d.label}</span>
                  {d.url ? (
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-dark-gold hover:underline"
                    >
                      Voir <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Non fourni</span>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ title, rows }: { title: string; rows: [string, string | number | null | undefined][] }) {
  return (
    <Panel title={title}>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 border-b border-border/60 pb-2 sm:border-0 sm:pb-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-right text-sm font-medium text-foreground">
              {value === null || value === undefined || value === "" ? "—" : value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function FactorBar({
  label,
  weight,
  score,
  raw,
  unknown,
}: {
  label: string;
  weight: number;
  score: number | null;
  raw: string;
  unknown: boolean;
}) {
  const pct = score ?? 0;
  const tone =
    score == null
      ? "bg-muted-foreground/30"
      : pct >= 75
        ? "bg-success"
        : pct >= 50
          ? "bg-dark-gold"
          : pct >= 30
            ? "bg-alert"
            : "bg-error";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">
          {label} <span className="text-muted-foreground">· {weight}%</span>
        </span>
        <span className={cn("tabular-nums", unknown ? "text-muted-foreground" : "text-foreground")}>
          {unknown ? "—" : `${score}/100`} <span className="text-muted-foreground">({raw})</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${unknown ? 0 : pct}%` }} />
      </div>
    </div>
  );
}
