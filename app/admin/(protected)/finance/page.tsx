"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Coins, Landmark, Pencil, Plus, Receipt, Trash2, TrendingDown, TrendingUp, X } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Bar, SoftBadge } from "@/_components/admin/primitives";
import { Field, TextInput, Textarea, Select } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  getPnlSummary,
  getPnlMonthly,
  listLedgerEntries,
  createLedgerEntry,
  updateLedgerEntry,
  deleteLedgerEntry,
  type LedgerInput,
} from "@/_lib/admin/finance-pnl";
import type { LedgerEntry, LedgerKind, PnlMonthly, PnlSummary } from "@/_lib/admin/types";
import { formatCurrency, formatMonth, formatPercent } from "@/_lib/admin/format";

const CATEGORY_LABELS: Record<string, string> = {
  coaching: "Coaching",
  other: "Autre",
  server_fees: "Serveurs / infra",
  management_loans: "Management loans",
  rebranding: "Rebranding",
};

const CATEGORIES: Record<LedgerKind, string[]> = {
  revenue: ["coaching", "other"],
  expense: ["server_fees", "management_loans", "rebranding", "other"],
};

function catLabel(c: string): string {
  return CATEGORY_LABELS[c] ?? c;
}

function thisMonthInput(): string {
  return new Date().toISOString().slice(0, 7);
}

interface FormState {
  kind: LedgerKind;
  category: string;
  label: string;
  amount: string;
  month: string; // YYYY-MM
  notes: string;
}

const EMPTY_FORM: FormState = {
  kind: "expense",
  category: "server_fees",
  label: "",
  amount: "",
  month: thisMonthInput(),
  notes: "",
};

export default function FinancePage() {
  const toast = useToast();
  const [summary, setSummary] = useState<PnlSummary | null>(null);
  const [monthly, setMonthly] = useState<PnlMonthly[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LedgerEntry | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [s, m, l] = await Promise.all([getPnlSummary(), getPnlMonthly(), listLedgerEntries()]);
    setSummary(s.data);
    setMonthly(m.data ?? []);
    setLedger(l.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(e: LedgerEntry) {
    setEditing(e);
    setForm({
      kind: e.kind,
      category: e.category,
      label: e.label ?? "",
      amount: String(e.amount),
      month: e.period_month.slice(0, 7),
      notes: e.notes ?? "",
    });
    setFormOpen(true);
  }

  function setKind(kind: LedgerKind) {
    setForm((f) => ({ ...f, kind, category: CATEGORIES[kind][0] }));
  }

  async function save() {
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount < 0) return toast("Montant invalide.", "error");
    if (!form.month) return toast("Mois requis.", "error");

    const payload: LedgerInput = {
      kind: form.kind,
      category: form.category,
      label: form.label.trim() || null,
      amount,
      period_month: `${form.month}-01`,
      notes: form.notes.trim() || null,
    };

    setBusy(true);
    const res = editing
      ? await updateLedgerEntry(editing.id, payload)
      : await createLedgerEntry(payload);
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast(editing ? "Écriture mise à jour." : "Écriture ajoutée.");
    setFormOpen(false);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    setBusy(true);
    const res = await deleteLedgerEntry(id);
    setBusy(false);
    setConfirmDelete(null);
    if (res.error) return toast(res.error, "error");
    toast("Écriture supprimée.");
    load();
  }

  const rev = summary?.total_revenue ?? 0;
  const revenueBars: { label: string; value: number; tone: "info" | "success" | "warning" | "default" }[] = [
    { label: "Intérêts", value: summary?.interest ?? 0, tone: "info" },
    { label: "Frais de dossier", value: summary?.application_fees ?? 0, tone: "default" },
    { label: "Pénalités", value: summary?.penalties ?? 0, tone: "warning" },
    { label: "Coaching", value: summary?.coaching ?? 0, tone: "success" },
    { label: "Autres revenus", value: summary?.other_revenue ?? 0, tone: "default" },
  ];

  const monthlyCols: Column<PnlMonthly>[] = [
    { header: "Mois", cell: (r) => <span className="font-medium">{formatMonth(r.month)}</span> },
    { header: "CA", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.total_revenue, 0)}</span> },
    { header: "Dépenses", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.expenses, 0)}</span> },
    {
      header: "Bénéfice affiché",
      align: "right",
      cell: (r) => (
        <span className={r.displayed_profit >= 0 ? "tabular-nums text-success" : "tabular-nums text-error"}>
          {formatCurrency(r.displayed_profit, 0)}
        </span>
      ),
    },
    { header: "Bad debts", align: "right", cell: (r) => <span className="tabular-nums text-error">{r.bad_debts ? formatCurrency(r.bad_debts, 0) : "—"}</span> },
    {
      header: "Bénéfice éco.",
      align: "right",
      cell: (r) => (
        <span className={r.economic_profit >= 0 ? "tabular-nums text-success" : "tabular-nums text-error"}>
          {formatCurrency(r.economic_profit, 0)}
        </span>
      ),
    },
  ];

  const ledgerCols: Column<LedgerEntry>[] = [
    { header: "Mois", cell: (e) => formatMonth(e.period_month.slice(0, 7)) },
    {
      header: "Type",
      cell: (e) => (
        <SoftBadge tone={e.kind === "revenue" ? "success" : "warning"}>
          {e.kind === "revenue" ? "Revenu" : "Dépense"}
        </SoftBadge>
      ),
    },
    { header: "Catégorie", cell: (e) => catLabel(e.category) },
    { header: "Libellé", cell: (e) => <span className="text-muted-foreground">{e.label || "—"}</span> },
    { header: "Montant", align: "right", cell: (e) => <span className="tabular-nums font-medium">{formatCurrency(e.amount, 2)}</span> },
    {
      header: "",
      align: "right",
      cell: (e) =>
        confirmDelete === e.id ? (
          <span className="inline-flex items-center gap-2">
            <button onClick={() => remove(e.id)} disabled={busy} className="text-xs font-medium text-error hover:underline">
              Confirmer
            </button>
            <button onClick={() => setConfirmDelete(null)} className="text-xs text-muted-foreground hover:underline">
              Annuler
            </button>
          </span>
        ) : (
          <span className="inline-flex items-center gap-3">
            <button onClick={() => openEdit(e)} className="text-muted-foreground hover:text-foreground" title="Modifier">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setConfirmDelete(e.id)} className="text-muted-foreground hover:text-error" title="Supprimer">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Finances (P&L)"
        description="Compte de résultat consolidé — revenus dérivés du portefeuille (intérêts, frais, pénalités) + écritures manuelles (coaching, dépenses) et coût du risque."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nouvelle écriture
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              label="Chiffre d'affaires"
              value={formatCurrency(summary?.total_revenue)}
              sub={`Intérêts ${formatCurrency(summary?.interest)} · coaching ${formatCurrency(summary?.coaching)}`}
              icon={<Landmark className="h-4 w-4" />}
            />
            <KpiCard
              label="Bénéfice affiché"
              value={formatCurrency(summary?.displayed_profit)}
              sub={`Marge ${formatPercent(summary?.displayed_margin_pct, 1)} · dépenses ${formatCurrency(summary?.expenses)}`}
              tone={Number(summary?.displayed_profit ?? 0) >= 0 ? "success" : "error"}
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <KpiCard
              label="Bénéfice économique"
              value={formatCurrency(summary?.economic_profit)}
              sub={`Après coût du risque · marge ${formatPercent(summary?.economic_margin_pct, 1)}`}
              tone={Number(summary?.economic_profit ?? 0) >= 0 ? "success" : "error"}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <KpiCard
              label="Dépenses"
              value={formatCurrency(summary?.expenses)}
              sub="Serveurs, management, rebranding"
              icon={<TrendingDown className="h-4 w-4" />}
            />
            <KpiCard
              label="Bad debts (coût du risque)"
              value={formatCurrency(summary?.bad_debts)}
              sub="Créances passées en perte"
              tone={Number(summary?.bad_debts ?? 0) > 0 ? "error" : "default"}
              icon={<Receipt className="h-4 w-4" />}
            />
            <KpiCard
              label="Coaching"
              value={formatCurrency(summary?.coaching)}
              sub="Revenu de service (hors prêt)"
              tone="success"
              icon={<Coins className="h-4 w-4" />}
            />
          </div>

          {formOpen ? (
            <Panel
              title={editing ? "Modifier l'écriture" : "Nouvelle écriture comptable"}
              actions={
                <button onClick={() => setFormOpen(false)} className="text-muted-foreground hover:text-foreground" title="Fermer">
                  <X className="h-4 w-4" />
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Type" required>
                  <Select value={form.kind} onChange={(e) => setKind(e.target.value as LedgerKind)}>
                    <option value="revenue">Revenu</option>
                    <option value="expense">Dépense</option>
                  </Select>
                </Field>
                <Field label="Catégorie" required>
                  <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES[form.kind].map((c) => (
                      <option key={c} value={c}>
                        {catLabel(c)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Mois" required>
                  <TextInput type="month" value={form.month} onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))} />
                </Field>
                <Field label="Montant (€)" required>
                  <TextInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </Field>
                <Field label="Libellé" className="sm:col-span-2 lg:col-span-2">
                  <TextInput value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="ex. Hébergement serveur" />
                </Field>
                <Field label="Notes" className="sm:col-span-2 lg:col-span-3">
                  <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={save} disabled={busy}>
                  {editing ? "Enregistrer" : "Ajouter l'écriture"}
                </Button>
                <Button variant="outline" onClick={() => setFormOpen(false)} disabled={busy}>
                  Annuler
                </Button>
              </div>
            </Panel>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Structure des revenus">
              {rev > 0 ? (
                <div className="space-y-3">
                  {revenueBars.map((b) => (
                    <Bar
                      key={b.label}
                      label={b.label}
                      pct={(b.value / rev) * 100}
                      value={`${formatCurrency(b.value)} · ${formatPercent((b.value / rev) * 100, 1)}`}
                      tone={b.tone}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState title="Pas encore de revenus" hint="Les revenus apparaissent dès qu'un prêt encaisse des intérêts ou qu'une écriture est saisie." />
              )}
            </Panel>

            <Panel title="Synthèse">
              <dl className="space-y-0">
                <Row label="Intérêts perçus" value={formatCurrency(summary?.interest)} />
                <Row label="Frais de dossier" value={formatCurrency(summary?.application_fees)} />
                <Row label="Pénalités" value={formatCurrency(summary?.penalties)} />
                <Row label="Coaching" value={formatCurrency(summary?.coaching)} />
                <Row label="Autres revenus" value={formatCurrency(summary?.other_revenue)} />
                <Row label="Chiffre d'affaires" value={formatCurrency(summary?.total_revenue)} strong />
                <Row label="Dépenses" value={`- ${formatCurrency(summary?.expenses)}`} />
                <Row label="Bénéfice affiché" value={formatCurrency(summary?.displayed_profit)} strong />
                <Row label="Coût du risque (bad debts)" value={`- ${formatCurrency(summary?.bad_debts)}`} />
                <Row label="Bénéfice économique" value={formatCurrency(summary?.economic_profit)} strong />
              </dl>
            </Panel>
          </div>

          <Panel title="Compte de résultat mensuel">
            {monthly.length ? (
              <DataTable columns={monthlyCols} rows={monthly} getKey={(r) => r.month} empty={{ title: "Aucune donnée" }} />
            ) : (
              <EmptyState title="Aucune donnée mensuelle" />
            )}
          </Panel>

          <Panel
            title="Écritures comptables (coaching & dépenses)"
            actions={<span className="text-xs text-muted-foreground">{ledger.length} écriture{ledger.length > 1 ? "s" : ""}</span>}
          >
            <DataTable
              columns={ledgerCols}
              rows={ledger}
              getKey={(e) => e.id}
              empty={{ title: "Aucune écriture", hint: "Ajoutez le coaching et les dépenses (serveurs, management, rebranding)." }}
            />
          </Panel>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2 last:border-0">
      <dt className={strong ? "text-sm font-semibold text-foreground" : "text-sm text-muted-foreground"}>{label}</dt>
      <dd className={strong ? "text-right text-sm font-semibold tabular-nums text-foreground" : "text-right text-sm tabular-nums text-foreground"}>
        {value}
      </dd>
    </div>
  );
}
