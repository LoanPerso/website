"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ShieldCheck, FileWarning, Ban } from "lucide-react";
import { Panel } from "@/_components/admin/panel";
import { Button } from "@/_components/ui/button";
import { useToast } from "@/_components/admin/toast";
import {
  computeFraudAml,
  DISPOSITION_LABELS,
  GROUP_LABELS,
  type CheckGroup,
  type CheckStatus,
  type Disposition,
} from "@/_lib/admin/application";
import { saveRiskReview, createApplicationInteraction } from "@/_lib/admin/applications";
import type { LoanApplicationFull } from "@/_lib/admin/types";
import { Metric, SoftBadge, VerdictBanner, type Tone } from "./parts";

const STATUS_TONE: Record<CheckStatus, Tone> = { pass: "success", warn: "warning", fail: "error", unknown: "default" };
const STATUS_LABEL: Record<CheckStatus, string> = { pass: "OK", warn: "Vigilance", fail: "Échec", unknown: "N/A" };
const DISPO_TONE: Record<Disposition, Tone> = { clear: "success", review: "warning", escalate: "warning", block: "error" };
const GROUPS: CheckGroup[] = ["kyc", "document", "fraud", "aml", "sof"];

export function FraudPanel({
  app,
  peers,
  onUpdated,
}: {
  app: LoanApplicationFull;
  peers: LoanApplicationFull[];
  onUpdated: () => void;
}) {
  const toast = useToast();
  const r = useMemo(() => computeFraudAml(app, peers), [app, peers]);
  const [busy, setBusy] = useState(false);
  const saved = app.risk_review;

  async function setDisposition(disposition: Disposition, sar = false) {
    setBusy(true);
    const res = await saveRiskReview(app.id, {
      disposition,
      composite: r.composite,
      aml_rating: r.amlRating,
      sar_filed: sar || saved?.sar_filed || false,
      reviewed_at: new Date().toISOString(),
    });
    if (!res.error)
      await createApplicationInteraction({
        application_id: app.id,
        type: "system",
        subject: sar ? "Déclaration de soupçon (SAR) créée" : `Disposition fraude : ${DISPOSITION_LABELS[disposition]}`,
        body: `Score composite ${r.composite}/100 · LCB-FT ${r.amlRating}`,
      });
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(sar ? "Déclaration de soupçon enregistrée." : "Disposition enregistrée.");
    onUpdated();
  }

  const compositeTone: Tone = r.composite >= 70 ? "error" : r.composite >= 40 ? "warning" : "success";

  return (
    <div className="space-y-6">
      <Panel title="Synthèse risque & fraude">
        <VerdictBanner
          tone={DISPO_TONE[r.recommended]}
          title={`Recommandation : ${DISPOSITION_LABELS[r.recommended]}`}
          detail={`Score de fraude ${r.fraudScore}/100 · LCB-FT ${r.amlRating.toUpperCase()}`}
          right={<SoftBadge tone={compositeTone}>Composite {r.composite}/100</SoftBadge>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Score fraude" value={`${r.fraudScore}/100`} tone={compositeTone} />
          <Metric label="Note LCB-FT" value={r.amlRating.toUpperCase()} tone={r.amlRating === "high" ? "error" : r.amlRating === "medium" ? "warning" : "success"} />
          <Metric label="Empreinte appareil" value={r.deviceFingerprint} />
          <Metric label="IP / Géo" value={r.ipAddress} sub={r.geo} />
        </div>
        {r.reasonCodes.length ? (
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Principaux facteurs</p>
            <div className="flex flex-wrap gap-1.5">
              {r.reasonCodes.map((rc) => (
                <SoftBadge key={rc.code} tone="warning">
                  {rc.label} · {rc.points}
                </SoftBadge>
              ))}
            </div>
          </div>
        ) : null}
        {saved ? (
          <p className="mt-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            Dernière disposition : <span className="font-medium text-foreground">{DISPOSITION_LABELS[saved.disposition]}</span>
            {saved.sar_filed ? " · SAR déposée" : ""} · {new Date(saved.reviewed_at).toLocaleString("fr-FR")}
          </p>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {GROUPS.map((g) => {
          const checks = r.checks.filter((c) => c.group === g);
          if (!checks.length) return null;
          return (
            <Panel key={g} title={GROUP_LABELS[g]}>
              <ul className="divide-y divide-border">
                {checks.map((c) => (
                  <li key={c.code} className="flex items-start justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.label}</p>
                      <p className="text-xs text-muted-foreground">{c.detail}</p>
                    </div>
                    <SoftBadge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</SoftBadge>
                  </li>
                ))}
              </ul>
            </Panel>
          );
        })}

        <Panel title="Vélocité & liens">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Dossiers même e-mail" value={r.velocity.email} tone={r.velocity.email ? "warning" : "success"} />
            <Metric label="Dossiers même tél." value={r.velocity.phone} tone={r.velocity.phone ? "warning" : "success"} />
            <Metric label="Dossiers même IBAN" value={r.velocity.iban} tone={r.velocity.iban ? "warning" : "success"} />
            <Metric label="Appareils liés" value={r.velocity.device} />
          </div>
          {r.velocity.cluster.length ? (
            <div className="mt-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cluster d'identités</p>
              <div className="flex flex-wrap gap-1.5">
                {r.velocity.cluster.map((id) => (
                  <Link key={id} href={`/admin/applications/${id}`} className="text-xs text-dark-gold hover:underline">
                    {id.slice(0, 8)}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">Aucun cluster d'identité détecté.</p>
          )}
        </Panel>
      </div>

      <Panel title="Screening LCB-FT (PEP / sanctions / médias)">
        {r.screeningHits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune correspondance sur les listes de surveillance.</p>
        ) : (
          <ul className="divide-y divide-border">
            {r.screeningHits.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-foreground">
                    {h.name} <span className="text-muted-foreground">· {h.list}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{h.note}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SoftBadge tone={h.disposition === "true_positive" ? "error" : h.disposition === "false_positive" ? "default" : "warning"}>
                    {Math.round(h.matchScore * 100)} %
                  </SoftBadge>
                  <span className="text-xs text-muted-foreground">
                    {h.disposition === "true_positive" ? "Vrai positif" : h.disposition === "false_positive" ? "Faux positif" : "À statuer"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Décision de conformité">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setDisposition("clear")} disabled={busy}>
            <ShieldCheck className="h-4 w-4" /> Lever / valider
          </Button>
          <Button variant="outline" onClick={() => setDisposition("review")} disabled={busy}>
            <ShieldAlert className="h-4 w-4" /> Mettre en revue
          </Button>
          <Button variant="outline" onClick={() => setDisposition("escalate")} disabled={busy}>
            Escalader
          </Button>
          <Button variant="outline" className="text-alert" onClick={() => setDisposition("escalate", true)} disabled={busy}>
            <FileWarning className="h-4 w-4" /> Déclaration de soupçon
          </Button>
          <Button className="bg-error text-white hover:bg-error/90" onClick={() => setDisposition("block")} disabled={busy}>
            <Ban className="h-4 w-4" /> Bloquer
          </Button>
        </div>
        {r.fatcaCrsIndicia.length ? (
          <p className="mt-3 text-xs text-muted-foreground">Indices FATCA/CRS : {r.fatcaCrsIndicia.join(", ")}</p>
        ) : null}
      </Panel>
    </div>
  );
}
