"use client";

import { useMemo, useState } from "react";
import { Lock, AlertTriangle } from "lucide-react";
import { Panel } from "@/_components/admin/panel";
import { Button } from "@/_components/ui/button";
import { Select } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { computePricing, type GuaranteeKind } from "@/_lib/admin/application";
import { saveOffer } from "@/_lib/admin/applications";
import { formatCurrency } from "@/_lib/admin/format";
import type { LoanApplicationFull, Product } from "@/_lib/admin/types";
import { Bar, GroupTitle, KeyVal, Metric, VerdictBanner } from "./parts";

const GUARANTEES: { value: GuaranteeKind; label: string }[] = [
  { value: "none", label: "Aucune garantie" },
  { value: "guarantor", label: "Caution / garant" },
  { value: "co_borrower", label: "Co-emprunteur" },
  { value: "collateral", label: "Gage / nantissement" },
];

export function PricingPanel({
  app,
  product,
  onUpdated,
}: {
  app: LoanApplicationFull;
  product: Product | null;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [amount, setAmount] = useState(Number(app.amount ?? 0));
  const [duration, setDuration] = useState(Number(app.duration ?? 12) || 12);
  const [rate, setRate] = useState<number | null>(app.effective_rate != null ? Number(app.effective_rate) : null);
  const [insurance, setInsurance] = useState(false);
  const [guarantee, setGuarantee] = useState<GuaranteeKind>("none");
  const [saving, setSaving] = useState(false);

  const p = useMemo(
    () => computePricing(app, product, { amount, duration, rate: rate ?? undefined, insurance, guarantee }),
    [app, product, amount, duration, rate, insurance, guarantee]
  );

  // keep the rate slider in sync with the suggested applied rate until edited
  const effectiveRate = rate ?? p.appliedRate;

  async function lock() {
    setSaving(true);
    const res = await saveOffer(app.id, {
      amount: p.amount,
      duration_months: p.durationMonths,
      applied_rate: p.appliedRate,
      taeg: p.taeg,
      monthly_payment: p.amortization.monthlyPayment,
      monthly_with_insurance: p.totals.monthlyWithInsurance,
      insurance: p.insurance.enabled,
      guarantee: p.guarantee,
      total_cost: p.totals.totalCost,
      locked_at: new Date().toISOString(),
    });
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Offre verrouillée et dossier qualifié.");
    onUpdated();
  }

  const build = p.rateBuildUp;
  const buildMax = Math.max(build.nominalRate, p.appliedRate, 1);

  return (
    <div className="space-y-6">
      <Panel title="Simulateur d'offre (what-if)">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <RangeRow label="Montant" value={formatCurrency(amount)} min={p.amountBounds.min} max={p.amountBounds.max} step={100} v={amount} set={setAmount} />
            <RangeRow label="Durée" value={`${duration} mois`} min={p.durationBounds.min} max={p.durationBounds.max} step={1} v={duration} set={setDuration} />
            <RangeRow label="Taux débiteur" value={`${effectiveRate.toFixed(2)} %`} min={p.rateBounds.min} max={p.rateBounds.max} step={0.1} v={effectiveRate} set={(x) => setRate(x)} />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={insurance} onChange={(e) => setInsurance(e.target.checked)} className="h-4 w-4 accent-dark-gold" />
                Assurance emprunteur (ADI)
              </label>
              <Select value={guarantee} onChange={(e) => setGuarantee(e.target.value as GuaranteeKind)} className="h-8 w-44 text-xs">
                {GUARANTEES.map((g) => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 self-start">
            <Metric label="Mensualité" value={formatCurrency(p.amortization.monthlyPayment, 2)} tone="info" />
            <Metric label="Avec assurance" value={formatCurrency(p.totals.monthlyWithInsurance, 2)} />
            <Metric label="TAEG" value={`${p.taeg} %`} tone={p.usury.exceeds ? "error" : "default"} />
            <Metric label="Coût total du crédit" value={formatCurrency(p.totals.totalCost)} />
          </div>
        </div>
      </Panel>

      {p.usury.exceeds ? (
        <VerdictBanner
          tone="error"
          title="TAEG au-dessus du taux d'usure"
          detail={`TAEG ${p.taeg}% > plafond ${p.usury.ceiling}% (réf. ${p.usury.reference}% × ${p.usury.multiplier}) — offre non conforme`}
        />
      ) : (
        <VerdictBanner
          tone="success"
          title="TAEG conforme au taux d'usure"
          detail={`TAEG ${p.taeg}% ≤ plafond ${p.usury.ceiling}% (${p.country})`}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Décomposition du taux">
          <div className="space-y-2.5">
            <Bar label="Coût de refinancement" pct={(build.funding / buildMax) * 100} value={`${build.funding} %`} tone="default" />
            <Bar label="Prime de risque" pct={(build.riskPremium / buildMax) * 100} value={`${build.riskPremium} %`} tone="warning" />
            <Bar label="Coûts opérationnels" pct={(build.opex / buildMax) * 100} value={`${build.opex} %`} tone="info" />
            <Bar label="Marge" pct={(build.margin / buildMax) * 100} value={`${build.margin} %`} tone="success" />
            {build.guaranteeBonus !== 0 ? (
              <Bar label="Bonus garantie" pct={(Math.abs(build.guaranteeBonus) / buildMax) * 100} value={`${build.guaranteeBonus} %`} tone="success" />
            ) : null}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            <KeyVal label="Taux théorique (build-up)" value={`${build.nominalRate} %`} />
            <KeyVal label={`Taux appliqué (cat. ${p.category})`} value={`${p.appliedRate} %`} />
          </div>
        </Panel>

        <Panel title="Frais, assurance & totaux">
          <KeyVal label={`Frais de dossier (${p.fees.applicationFeePercent}%)`} value={formatCurrency(p.fees.applicationFee, 2)} />
          <KeyVal label="Assurance / mois" value={p.insurance.enabled ? formatCurrency(p.insurance.monthlyCost, 2) : "Non souscrite"} />
          <KeyVal label="Assurance totale" value={p.insurance.enabled ? formatCurrency(p.insurance.totalCost, 2) : "—"} />
          <KeyVal label="Intérêts totaux" value={formatCurrency(p.amortization.totalInterest, 2)} />
          <KeyVal label="Coût total du crédit" value={formatCurrency(p.totals.totalCost, 2)} />
          <KeyVal label="Montant total dû" value={formatCurrency(p.totals.totalDue, 2)} />
          <div className="mt-4">
            <Button onClick={lock} disabled={saving || p.usury.exceeds}>
              <Lock className="h-4 w-4" /> Verrouiller l'offre
            </Button>
            {p.usury.exceeds ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-error">
                <AlertTriangle className="h-3 w-3" /> Verrouillage bloqué : taux d'usure dépassé.
              </p>
            ) : null}
          </div>
        </Panel>
      </div>

      <Panel title="Aperçu de l'échéancier">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2 text-left">Éch.</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Mensualité</th>
                <th className="px-3 py-2 text-right">Capital</th>
                <th className="px-3 py-2 text-right">Intérêts</th>
              </tr>
            </thead>
            <tbody>
              {previewRows(p.amortization.schedule).map((s) => (
                <tr key={s.sequence} className="border-b border-border last:border-0">
                  <td className="px-3 py-1.5 tabular-nums">{s.ellipsis ? "…" : s.sequence}</td>
                  <td className="px-3 py-1.5">{s.ellipsis ? "" : s.due_date}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{s.ellipsis ? "" : formatCurrency(s.amount_due, 2)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{s.ellipsis ? "" : formatCurrency(s.principal_component, 2)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{s.ellipsis ? "" : formatCurrency(s.interest_component, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function previewRows(schedule: { sequence: number; due_date: string; amount_due: number; principal_component: number; interest_component: number }[]) {
  if (schedule.length <= 8) return schedule.map((s) => ({ ...s, ellipsis: false }));
  const head = schedule.slice(0, 5).map((s) => ({ ...s, ellipsis: false }));
  const tail = schedule.slice(-2).map((s) => ({ ...s, ellipsis: false }));
  return [...head, { sequence: -1, due_date: "", amount_due: 0, principal_component: 0, interest_component: 0, ellipsis: true }, ...tail];
}

function RangeRow({
  label,
  value,
  min,
  max,
  step,
  v,
  set,
}: {
  label: string;
  value: string;
  min: number;
  max: number;
  step: number;
  v: number;
  set: (n: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-dark-gold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-dark-gold"
      />
    </div>
  );
}
