"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Wallet } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart, GroupedBars, LineChart } from "@/_components/admin/charts";
import { FilterBar, type DimensionConfig, PRODUCT_OPTIONS, defaultStatsFilters } from "@/_components/admin/filter-bar";
import { StatGrid, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getCashflowStats } from "@/_lib/admin/analytics";
import type { CashflowMethodRow, CashflowMonthRow } from "@/_lib/admin/types";
import { formatCurrency, formatMonth, formatNumber } from "@/_lib/admin/format";

type Tab = "compare" | "projection" | "methods";

const METHOD_LABELS: Record<string, string> = {
  sepa: "Prélèvement SEPA",
  transfer: "Virement",
  card: "Carte",
  cash: "Espèces",
  mobile_money: "Mobile money",
  other: "Autre",
};

const DIMENSIONS: DimensionConfig[] = [{ key: "product", label: "Produit", options: PRODUCT_OPTIONS }];

const TABS: TabDef<Tab>[] = [
  { key: "compare", label: "Comparaison", icon: <BarChart3 className="h-4 w-4" /> },
  { key: "projection", label: "Projection", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "methods", label: "Méthodes", icon: <Wallet className="h-4 w-4" /> },
];

export default function CashflowStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("compare");
  const { data, loading, error } = useStatsData(getCashflowStats, filters);

  const scheduleCols: Column<CashflowMonthRow>[] = [
    { header: "Mois", cell: (r) => <span className="font-medium">{formatMonth(r.month)}</span> },
    { header: "Principal", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.projected_principal)}</span> },
    { header: "Intérêts", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.projected_interest)}</span> },
    { header: "Total dû", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.projected_due)}</span> },
  ];

  const methodCols: Column<CashflowMethodRow>[] = [
    { header: "Méthode", cell: (r) => <span className="font-medium">{METHOD_LABELS[r.method] ?? r.method}</span> },
    { header: "Encaissé", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.amount)}</span> },
    { header: "Paiements", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatNumber(r.count)}</span> },
  ];

  return (
    <div className="space-y-5">
      <FilterBar value={filters} onChange={setFilters} dimensions={DIMENSIONS} dateLabel="Période" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <StatsLoading />
      ) : error ? (
        <StatsError message={error} />
      ) : !data ? (
        <EmptyState title="Aucune donnée" />
      ) : (
        <>
          {tab === "compare" &&
            (() => {
              const sm = data.summary;
              const recent = data.monthly.slice(-18);
              return (
                <div className="space-y-5">
                  <StatGrid cols={5}>
                    <Metric label="Encaissé réalisé" value={formatCurrency(sm.realized_total)} sub={`${formatNumber(sm.realized_count)} paiements`} tone="success" />
                    <Metric label="Projeté à venir" value={formatCurrency(sm.projected_total)} sub={`${formatNumber(sm.future_months)} mois à venir`} />
                    <Metric label="Dont principal" value={formatCurrency(sm.projected_principal)} sub="Capital projeté" />
                    <Metric label="Dont intérêts" value={formatCurrency(sm.projected_interest)} sub="Intérêts projetés" />
                    <Metric label="Mois à venir" value={formatNumber(sm.future_months)} sub={`${formatNumber(sm.months)} mois couverts`} />
                  </StatGrid>

                  <Panel title="Réalisé vs projeté (18 derniers mois)">
                    {recent.length ? (
                      <GroupedBars
                        data={recent.map((m) => ({ label: formatMonth(m.month), a: m.realized, b: m.projected_due }))}
                        labels={["Encaissé", "Projeté"]}
                        format={(n) => formatCurrency(n)}
                      />
                    ) : (
                      <EmptyState title="Aucune donnée" />
                    )}
                  </Panel>
                </div>
              );
            })()}

          {tab === "projection" &&
            (() => {
              const future = data.monthly.filter((m) => m.projected_due > 0);
              return (
                <div className="space-y-5">
                  <Panel title="Projection de l'échéancier futur">
                    {future.length ? (
                      <LineChart data={future.map((m) => ({ label: formatMonth(m.month), value: m.projected_due }))} format={(n) => formatCurrency(n)} />
                    ) : (
                      <EmptyState title="Aucune donnée" />
                    )}
                  </Panel>
                  <Panel title="Détail de l'échéancier futur">
                    <DataTable columns={scheduleCols} rows={future} getKey={(r) => r.month} empty={{ title: "Aucune donnée" }} />
                  </Panel>
                </div>
              );
            })()}

          {tab === "methods" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Encaissements par méthode">
                {data.by_method.length ? (
                  <DonutChart
                    segments={data.by_method.map((m) => ({ label: METHOD_LABELS[m.method] ?? m.method, value: m.amount }))}
                    centerLabel="Total encaissé"
                    centerValue={formatCurrency(data.summary.realized_total)}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Détail par méthode">
                <DataTable columns={methodCols} rows={data.by_method} getKey={(r) => r.method} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
