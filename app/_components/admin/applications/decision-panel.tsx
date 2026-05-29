"use client";

import { useMemo, useState } from "react";
import { Check, Gavel, ThumbsDown, ThumbsUp, Scale } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Panel } from "@/_components/admin/panel";
import { Button } from "@/_components/ui/button";
import { Modal } from "@/_components/admin/dialog";
import { Field, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  analyzeApplication,
  computeFraudAml,
  computePricing,
  evaluateDecision,
  OUTCOME_LABELS,
  type Outcome,
} from "@/_lib/admin/application";
import { saveDecision, updateApplication } from "@/_lib/admin/applications";
import { formatCurrency } from "@/_lib/admin/format";
import type { ApplicationStatus, LoanApplicationFull, Product } from "@/_lib/admin/types";
import { Bar, KeyVal, Metric, SoftBadge, VerdictBanner, type Tone } from "./parts";

const OUTCOME_TONE: Record<Outcome, Tone> = { APPROVE: "success", REFER: "warning", DECLINE: "error" };
const OUTCOME_STATUS: Record<Outcome, ApplicationStatus> = { APPROVE: "approved", REFER: "under_review", DECLINE: "rejected" };

export function DecisionPanel({
  app,
  product,
  peers,
  onUpdated,
}: {
  app: LoanApplicationFull;
  product: Product | null;
  peers: LoanApplicationFull[];
  onUpdated: () => void;
}) {
  const toast = useToast();
  const d = useMemo(() => {
    const analysis = analyzeApplication(app);
    const pricing = computePricing(app, product);
    const fraud = computeFraudAml(app, peers);
    return evaluateDecision(app, { analysis, pricing, fraud, product });
  }, [app, product, peers]);

  const [satisfied, setSatisfied] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<Outcome | null>(null);
  const [justification, setJustification] = useState("");
  const [busy, setBusy] = useState(false);

  const saved = app.decision;

  async function decide(outcome: Outcome) {
    setBusy(true);
    const res = await saveDecision(app.id, {
      outcome,
      status: OUTCOME_STATUS[outcome],
      confidence: d.confidence,
      reason_codes: d.reasonCodes,
      stipulations: d.stipulations.map((s) => ({ ...s, satisfied: !!satisfied[s.code] })),
      justification: justification || null,
      decided_at: new Date().toISOString(),
    });
    setBusy(false);
    setModal(null);
    setJustification("");
    if (res.error) return toast(res.error, "error");
    toast(`Décision enregistrée : ${OUTCOME_LABELS[outcome]}.`);
    onUpdated();
  }

  async function applyCounterOffer() {
    if (!d.counterOffer) return;
    setBusy(true);
    const res = await updateApplication(app.id, {
      amount: d.counterOffer.amount,
      duration: d.counterOffer.duration,
      effective_rate: d.counterOffer.rate,
      monthly_payment: d.counterOffer.monthlyPayment,
    });
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Contre-offre appliquée à la demande.");
    onUpdated();
  }

  return (
    <div className="space-y-6">
      <Panel title="Recommandation du moteur de décision">
        <VerdictBanner
          tone={OUTCOME_TONE[d.outcome]}
          title={`${OUTCOME_LABELS[d.outcome]} — confiance ${d.confidence}%`}
          detail={`Score ${d.score}/100 (cat. ${d.category}) · modèle ${d.modelVersion}`}
          right={<SoftBadge tone={OUTCOME_TONE[d.outcome]}>{d.outcome}</SoftBadge>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Endettement avant" value={`${Math.round(d.dti * 100)} %`} />
          <Metric label="Endettement après" value={`${Math.round(d.dsti * 100)} %`} tone={d.dsti > 0.4 ? "error" : d.dsti > 0.33 ? "warning" : "success"} />
          <Metric label="Délégation" value={d.authority.tier} sub={d.authority.role} tone={d.authority.withinLimit ? "default" : "warning"} />
          <Metric label="SLA restant" value={`${d.sla.remainingHours} h`} tone={d.sla.band === "breach" ? "error" : d.sla.band === "warn" ? "warning" : "success"} />
        </div>
        <div className="mt-4 space-y-2">
          <Bar label="Endettement après crédit" pct={d.dsti * 100} value={`${Math.round(d.dsti * 100)} %`} tone={d.dsti > 0.4 ? "error" : d.dsti > 0.33 ? "warning" : "success"} marker={33} />
        </div>
        {saved ? (
          <p className="mt-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            Décision enregistrée : <span className="font-medium text-foreground">{OUTCOME_LABELS[saved.outcome]}</span> · {new Date(saved.decided_at).toLocaleString("fr-FR")}
            {saved.justification ? ` — ${saved.justification}` : ""}
          </p>
        ) : null}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Critères d'exclusion (knockouts)">
          {d.knockouts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun critère d'exclusion déclenché.</p>
          ) : (
            <ul className="space-y-2">
              {d.knockouts.map((k) => (
                <li key={k.code} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground">{k.label} <span className="text-muted-foreground">· {k.detail}</span></span>
                  <SoftBadge tone={k.severity === "hard" ? "error" : "warning"}>{k.severity === "hard" ? "Bloquant" : "Souple"}</SoftBadge>
                </li>
              ))}
            </ul>
          )}
          {d.referralTriggers.length ? (
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Déclencheurs de revue</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {d.referralTriggers.map((t, i) => (
                  <li key={i} className="flex items-center gap-2"><Scale className="h-3 w-3 text-alert" /> {t}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Panel>

        <Panel title="Conditions (stipulations)">
          {d.stipulations.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune condition requise.</p>
          ) : (
            <ul className="space-y-2">
              {d.stipulations.map((s) => {
                const done = !!satisfied[s.code];
                return (
                  <li key={s.code} className="flex items-start gap-3">
                    <button
                      onClick={() => setSatisfied((m) => ({ ...m, [s.code]: !m[s.code] }))}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                        done ? "border-success bg-success text-white" : "border-border hover:border-accent"
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : null}
                    </button>
                    <div className="min-w-0">
                      <p className={cn("text-sm", done ? "text-muted-foreground line-through" : "text-foreground")}>{s.label}</p>
                      <SoftBadge tone={s.required ? "warning" : "default"}>{s.required ? "Obligatoire" : "Optionnelle"}</SoftBadge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {d.needsCounterOffer && d.counterOffer ? (
        <Panel title="Contre-offre proposée">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Montant" value={formatCurrency(d.counterOffer.amount)} sub={`${d.counterOffer.deltaAmount >= 0 ? "+" : ""}${formatCurrency(d.counterOffer.deltaAmount)}`} />
            <Metric label="Durée" value={`${d.counterOffer.duration} mois`} />
            <Metric label="Mensualité" value={formatCurrency(d.counterOffer.monthlyPayment, 2)} tone="info" />
            <Metric label="Atteignable" value={d.counterOffer.reachable ? "Oui" : "Non"} tone={d.counterOffer.reachable ? "success" : "error"} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            La mensualité demandée dépasse la capacité. Proposition ajustée pour rester sous le seuil d'endettement.
          </p>
          <Button className="mt-3" variant="outline" onClick={applyCounterOffer} disabled={busy}>
            Appliquer la contre-offre
          </Button>
        </Panel>
      ) : null}

      <Panel title="Motifs (transparence / refus motivé)">
        {d.reasonCodes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun motif défavorable.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {d.reasonCodes.map((r) => (
              <SoftBadge key={r.code} tone="warning">{r.label}</SoftBadge>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Décision de l'analyste">
        <div className="flex flex-wrap gap-2">
          <Button className="bg-success text-white hover:bg-success/90" onClick={() => setModal("APPROVE")} disabled={busy}>
            <ThumbsUp className="h-4 w-4" /> Accorder
          </Button>
          <Button variant="outline" onClick={() => setModal("REFER")} disabled={busy}>
            <Gavel className="h-4 w-4" /> Mettre à l'étude
          </Button>
          <Button className="bg-error text-white hover:bg-error/90" onClick={() => setModal("DECLINE")} disabled={busy}>
            <ThumbsDown className="h-4 w-4" /> Refuser
          </Button>
        </div>
        {!d.authority.withinLimit ? (
          <p className="mt-3 text-xs text-alert">
            Montant {formatCurrency(d.authority.amount)} au-delà de la délégation — validation {d.authority.role} requise (double regard).
          </p>
        ) : null}
      </Panel>

      <Modal
        open={modal !== null}
        onOpenChange={(o) => !o && setModal(null)}
        title={modal ? `Confirmer : ${OUTCOME_LABELS[modal]}` : ""}
        description="La décision est tracée dans la chronologie du dossier."
        footer={
          <>
            <Button variant="outline" onClick={() => setModal(null)} disabled={busy}>Annuler</Button>
            <Button onClick={() => modal && decide(modal)} disabled={busy} className={modal ? cn(modal === "DECLINE" && "bg-error text-white hover:bg-error/90", modal === "APPROVE" && "bg-success text-white hover:bg-success/90") : undefined}>
              Confirmer
            </Button>
          </>
        }
      >
        <Field label={modal === "DECLINE" ? "Motif du refus" : "Commentaire"} required={modal === "DECLINE"}>
          <Textarea value={justification} onChange={(e) => setJustification(e.target.value)} placeholder={modal === "DECLINE" ? "Motif communiqué au demandeur…" : "Optionnel"} />
        </Field>
      </Modal>
    </div>
  );
}
