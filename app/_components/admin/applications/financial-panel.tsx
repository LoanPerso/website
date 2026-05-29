"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { Panel } from "@/_components/admin/panel";
import { Button } from "@/_components/ui/button";
import { useToast } from "@/_components/admin/toast";
import { analyzeApplication, type AffordabilityOverrides } from "@/_lib/admin/application";
import { updateApplication } from "@/_lib/admin/applications";
import { formatCurrency } from "@/_lib/admin/format";
import type { LoanApplicationFull } from "@/_lib/admin/types";
import { Bar, GroupTitle, KeyVal, Metric, SoftBadge, VerdictBanner, type Tone } from "./parts";

const VERDICT: Record<string, { tone: Tone; label: string }> = {
  go: { tone: "success", label: "Capacité suffisante" },
  caution: { tone: "warning", label: "Capacité à surveiller" },
  no_go: { tone: "error", label: "Capacité insuffisante" },
};

const bandTone = (b: string): Tone => (b === "ok" ? "success" : b === "warn" ? "warning" : "error");

export function FinancialPanel({ app }: { app: LoanApplicationFull }) {
  const toast = useToast();
  const [stress, setStress] = useState({ ratePlus: 3, incomeMinus: 10 });
  const [consolidate, setConsolidate] = useState(false);
  const [edits, setEdits] = useState<Partial<AffordabilityOverrides>>(
    (app.analysis_overrides as Partial<AffordabilityOverrides>) ?? {}
  );
  const [saving, setSaving] = useState(false);

  const overrides: AffordabilityOverrides = useMemo(
    () => ({ ...edits, ratePlus: stress.ratePlus, incomeMinus: stress.incomeMinus / 100, consolidate }),
    [edits, stress, consolidate]
  );
  const a = useMemo(() => analyzeApplication(app, overrides), [app, overrides]);

  const v = VERDICT[a.verdict.decision];
  const pctOfIncome = (n: number) => (a.inputs.netIncome > 0 ? (n / a.inputs.netIncome) * 100 : 0);

  async function saveOverrides() {
    setSaving(true);
    const res = await updateApplication(app.id, { analysis_overrides: edits as Record<string, number | boolean> });
    setSaving(false);
    if (res.error) toast(res.error, "error");
    else toast("Estimations enregistrées.");
  }

  return (
    <div className="space-y-6">
      <Panel title="Verdict de capacité de remboursement">
        <VerdictBanner
          tone={v.tone}
          title={`${v.label} · score ${a.verdict.score}/100`}
          detail={a.verdict.reasons.join(" · ")}
          right={<SoftBadge tone={v.tone}>{a.verdict.decision.toUpperCase()}</SoftBadge>}
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Revenu net / mois" value={formatCurrency(a.inputs.netIncome)} />
          <Metric label="Nouvelle mensualité" value={formatCurrency(a.inputs.newPayment, 2)} tone="info" />
          <Metric label="Mensualité max. tenable" value={formatCurrency(a.ratios.maxAffordablePayment, 2)} />
          <Metric
            label="Marge de manœuvre"
            value={formatCurrency(a.ratios.headroom, 2)}
            tone={a.ratios.headroom >= 0 ? "success" : "error"}
          />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Taux d'endettement">
          <div className="space-y-3">
            <Bar
              label="Avant le crédit"
              pct={a.ratios.dtiBefore * 100}
              value={`${Math.round(a.ratios.dtiBefore * 100)} %`}
              tone={bandTone(a.ratios.dtiBefore <= 0.33 ? "ok" : a.ratios.dtiBefore <= 0.4 ? "warn" : "breach")}
              marker={33}
            />
            <Bar
              label="Après le crédit (DSTI)"
              pct={a.ratios.dtiAfter * 100}
              value={`${Math.round(a.ratios.dtiAfter * 100)} %`}
              tone={bandTone(a.ratios.band)}
              marker={33}
            />
            <Bar
              label="Taux d'effort (FOIR)"
              pct={a.ratios.foir * 100}
              value={`${Math.round(a.ratios.foir * 100)} %`}
              tone={a.ratios.foir <= 0.6 ? "success" : a.ratios.foir <= 0.75 ? "warning" : "error"}
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Seuil interne : 33 % (alerte) / 40 % (blocage). Repère vertical = 33 %.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Metric label="Capacité d'emprunt" value={formatCurrency(a.ratios.maxLoanAmount)} />
            <Metric label="Montant demandé" value={formatCurrency(a.inputs.amount)} />
          </div>
        </Panel>

        <Panel title="Reste à vivre">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Foyer / mois" value={formatCurrency(a.residual.household)} tone={bandTone(a.residual.band)} />
            <Metric
              label="Par personne"
              value={formatCurrency(a.residual.perHead)}
              sub={`seuil ${formatCurrency(a.residual.floorPerHead)}`}
              tone={bandTone(a.residual.band)}
            />
            <Metric label="Composition foyer" value={`${a.inputs.householdSize} pers.`} sub={`${a.inputs.dependents} à charge`} />
            <Metric label="Unités de conso." value={a.inputs.equivalence.toFixed(2)} />
          </div>
          <div className="mt-3">
            <Bar
              label="Reste à vivre / seuil"
              pct={a.residual.floorPerHead > 0 ? (a.residual.perHead / a.residual.floorPerHead) * 50 : 0}
              value={`${Math.round(a.residual.perHead)} € / ${a.residual.floorPerHead} €`}
              tone={bandTone(a.residual.band)}
              marker={50}
            />
          </div>
        </Panel>
      </div>

      <Panel title="Reconstruction budgétaire" actions={<EditToggle edits={edits} setEdits={setEdits} onSave={saveOverrides} saving={saving} />}>
        <div className="space-y-2.5">
          {a.waterfall.map((s) => (
            <Bar
              key={s.key}
              label={s.label}
              pct={s.key === "income" ? 100 : Math.abs(pctOfIncome(s.amount))}
              value={formatCurrency(s.amount)}
              tone={
                s.tone === "income"
                  ? "info"
                  : s.tone === "residual"
                    ? s.amount >= 0
                      ? "success"
                      : "error"
                    : s.tone === "new"
                      ? "warning"
                      : s.tone === "debt"
                        ? "error"
                        : "default"
              }
            />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Charges estimées depuis le revenu, le foyer et la région (données non déclarées dans le formulaire).
        </p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Engagements en cours (estimés)" actions={<ConsolidateToggle on={consolidate} setOn={setConsolidate} />}>
          {a.commitments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun crédit en cours détecté.</p>
          ) : (
            <ul className="divide-y divide-border">
              {a.commitments.map((c, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{c.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.lender} · {c.ratePct}% · {c.monthsLeft} mois restants
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">{formatCurrency(c.monthly, 2)}/mois</p>
                    <p className="text-xs text-muted-foreground">capital {formatCurrency(c.balance)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 border-t border-border pt-3">
            <KeyVal label="Total mensualités existantes" value={formatCurrency(a.commitmentsTotalMonthly, 2)} />
            {consolidate ? <p className="mt-1 text-xs text-dark-gold">Simulation regroupement active : une seule mensualité sur la durée du crédit.</p> : null}
          </div>
        </Panel>

        <Panel title="Analyse des flux bancaires (open-banking)">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <Metric label="Solde moyen" value={formatCurrency(a.openBanking.avgBalance)} tone={a.openBanking.avgBalance < 0 ? "error" : "default"} />
            <Metric
              label="Jours à découvert"
              value={`${a.openBanking.overdraftDays} j`}
              tone={a.openBanking.overdraftDays > 15 ? "warning" : "success"}
            />
            <Metric label="Régularité salaire" value={a.openBanking.salaryRegularity} />
            <Metric label="Rejets de prélèvement" value={a.openBanking.nsfCount} tone={a.openBanking.nsfCount ? "error" : "success"} />
          </div>
          <GroupTitle>Entrées / sorties (6 mois)</GroupTitle>
          <div className="flex items-end gap-1.5">
            {a.openBanking.months.map((m) => {
              const max = Math.max(...a.openBanking.months.flatMap((x) => [x.inflow, x.outflow]), 1);
              return (
                <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-20 w-full items-end justify-center gap-0.5">
                    <div className="w-1/2 rounded-t bg-success/70" style={{ height: `${(m.inflow / max) * 100}%` }} title={`Entrées ${formatCurrency(m.inflow)}`} />
                    <div className="w-1/2 rounded-t bg-error/60" style={{ height: `${(m.outflow / max) * 100}%` }} title={`Sorties ${formatCurrency(m.outflow)}`} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{m.month.slice(5)}</span>
                </div>
              );
            })}
          </div>
          {a.openBanking.riskyMerchants.length ? (
            <div className="mt-3 flex flex-wrap gap-1">
              {a.openBanking.riskyMerchants.map((m) => (
                <SoftBadge key={m} tone="warning">{m}</SoftBadge>
              ))}
            </div>
          ) : null}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Stabilité & vérification des revenus">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Type de contrat" value={(a.inputs.contractType ?? "—").toUpperCase()} />
            <Metric label="Ancienneté" value={a.stability.seniorityBand} />
            <Metric label="Période d'essai" value={a.stability.probation ? "Oui" : "Non"} tone={a.stability.probation ? "warning" : "success"} />
            <Metric
              label="Bulletin vs déclaré"
              value={`${Math.round(a.stability.payslipVsDeclaredPct * 100)} %`}
              tone={a.stability.incomeVerified === "matched" ? "success" : "warning"}
            />
          </div>
        </Panel>

        <Panel title="Test de résistance (stress test)">
          <div className="space-y-4">
            <Slider label={`Hausse de taux : +${stress.ratePlus} pts`} min={0} max={6} step={1} value={stress.ratePlus} onChange={(v) => setStress((s) => ({ ...s, ratePlus: v }))} />
            <Slider label={`Baisse de revenu : −${stress.incomeMinus} %`} min={0} max={40} step={5} value={stress.incomeMinus} onChange={(v) => setStress((s) => ({ ...s, incomeMinus: v }))} />
            <div className="grid grid-cols-3 gap-3">
              <Metric label="Mensualité" value={formatCurrency(a.stress.paymentStressed, 2)} />
              <Metric label="Endettement" value={`${Math.round(a.stress.dtiStressed * 100)} %`} tone={a.stress.dtiStressed > 0.4 ? "error" : "warning"} />
              <Metric label="Reste à vivre" value={formatCurrency(a.stress.residualStressed)} tone={a.stress.residualStressed < a.residual.floorPerHead ? "error" : "success"} />
            </div>
            <VerdictBanner
              tone={a.stress.passes ? "success" : "error"}
              title={a.stress.passes ? "Scénario soutenable" : "Scénario non soutenable"}
              detail={`Taux +${stress.ratePlus} pts · revenu −${stress.incomeMinus} %`}
            />
          </div>
        </Panel>
      </div>

      <Panel title="Alertes & surendettement">
        <ul className="space-y-2">
          {a.flags.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <SoftBadge tone={f.severity === "critical" ? "error" : f.severity === "warn" ? "warning" : "success"}>
                {f.severity === "critical" ? "Critique" : f.severity === "warn" ? "Vigilance" : "OK"}
              </SoftBadge>
              <span className="text-foreground">{f.label}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function Slider({ label, min, max, step, value, onChange }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-dark-gold"
      />
    </div>
  );
}

function ConsolidateToggle({ on, setOn }: { on: boolean; setOn: (v: boolean) => void }) {
  return (
    <Button size="sm" variant={on ? "default" : "outline"} onClick={() => setOn(!on)}>
      Simuler regroupement
    </Button>
  );
}

function EditToggle({
  edits,
  setEdits,
  onSave,
  saving,
}: {
  edits: Partial<AffordabilityOverrides>;
  setEdits: (e: Partial<AffordabilityOverrides>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const [open, setOpen] = useState(false);
  const fields: { key: keyof AffordabilityOverrides; label: string }[] = [
    { key: "housing", label: "Logement" },
    { key: "living", label: "Vie courante" },
    { key: "utilities", label: "Charges" },
    { key: "transport", label: "Transport" },
    { key: "otherDebt", label: "Autres dettes" },
  ];
  if (!open)
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Ajuster les estimations
      </Button>
    );
  return (
    <div className="flex items-center gap-1.5">
      {fields.map((f) => (
        <input
          key={f.key}
          type="number"
          placeholder={f.label}
          value={(edits[f.key] as number | undefined) ?? ""}
          onChange={(e) => setEdits({ ...edits, [f.key]: e.target.value === "" ? undefined : Number(e.target.value) })}
          className="h-8 w-20 rounded-md border border-input bg-background px-2 text-xs"
          title={f.label}
        />
      ))}
      <Button size="sm" onClick={onSave} disabled={saving}>
        <Save className="h-3.5 w-3.5" />
      </Button>
      <Button size="sm" variant="ghost" onClick={() => { setEdits({}); setOpen(false); }}>
        <RotateCcw className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
