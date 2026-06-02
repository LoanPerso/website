"use client";

import { useState } from "react";
import { Package, PieChart, TrendingUp, ShieldAlert } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart } from "@/_components/admin/charts";
import {
  FilterBar,
  type DimensionConfig,
  COUNTRY_OPTIONS,
  RISK_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getProductsStats } from "@/_lib/admin/analytics";
import type { ProductRow } from "@/_lib/admin/types";
import { formatCurrency, formatNumber, formatPercent } from "@/_lib/admin/format";

type Tab = "performance" | "outstanding" | "yield" | "risk";

const DIMENSIONS: DimensionConfig[] = [
  { key: "country", label: "Pays", options: COUNTRY_OPTIONS },
  { key: "risk", label: "Risque", options: RISK_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "performance", label: "Performance", icon: <Package className="h-4 w-4" /> },
  { key: "outstanding", label: "Encours", icon: <PieChart className="h-4 w-4" /> },
  { key: "yield", label: "Rendement", icon: <TrendingUp className="h-4 w-4" /> },
  { key: "risk", label: "Risque", icon: <ShieldAlert className="h-4 w-4" /> },
];

export default function ProductsStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("performance");
  const { data, loading, error } = useStatsData(getProductsStats, filters);

  const performanceCols: Column<ProductRow>[] = [
    { header: "Produit", cell: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Actifs", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.active_loans)}</span> },
    { header: "Financé", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.disbursed)}</span> },
    { header: "Encours", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.outstanding)}</span> },
    { header: "Intérêts", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.interest_earned)}</span> },
    { header: "Rendement", align: "right", cell: (r) => <span className="tabular-nums text-success">{formatPercent(r.yield_pct, 1)}</span> },
    { header: "Ticket moyen", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.avg_ticket)}</span> },
    {
      header: "Taux défaut",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.default_rate_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.default_rate_pct, 1)}</span>,
    },
  ];

  const riskCols: Column<ProductRow>[] = [
    { header: "Produit", cell: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Défauts", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.defaulted)}</span> },
    { header: "Perte", align: "right", cell: (r) => <span className="tabular-nums text-error">{formatCurrency(r.written_off)}</span> },
    {
      header: "Taux défaut",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.default_rate_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.default_rate_pct, 1)}</span>,
    },
  ];

  const totals = data?.totals;

  return (
    <div className="space-y-5">
      <FilterBar value={filters} onChange={setFilters} dimensions={DIMENSIONS} dateLabel="Origination" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <StatsLoading />
      ) : error ? (
        <StatsError message={error} />
      ) : !data ? (
        <EmptyState title="Aucune donnée" />
      ) : (
        <>
          {tab === "performance" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Encours total" value={formatCurrency(totals?.outstanding)} sub={`${formatNumber(totals?.products)} produits`} />
                <Metric label="Capital financé" value={formatCurrency(totals?.disbursed)} sub={`${formatNumber(totals?.loans)} crédits`} />
                <Metric label="Intérêts perçus" value={formatCurrency(totals?.interest_earned)} sub="Cumul sur la sélection" />
                <Metric label="Créances en perte" value={formatCurrency(totals?.written_off)} tone={Number(totals?.written_off) > 0 ? "error" : "default"} />
                <Metric label="Produits actifs" value={formatNumber(totals?.active_loans)} sub="Crédits en cours" />
              </StatGrid>

              <Panel title="Performance par produit">
                <DataTable columns={performanceCols} rows={data.products} getKey={(r) => r.slug} empty={{ title: "Aucun produit" }} />
              </Panel>
            </div>
          )}

          {tab === "outstanding" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Répartition de l'encours">
                {data.products.length ? (
                  <DonutChart
                    segments={data.products.map((p) => ({ label: p.name, value: p.outstanding }))}
                    centerLabel="Encours total"
                    centerValue={formatCurrency(totals?.outstanding)}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Encours par produit">
                {data.products.length ? (
                  <MiniBars items={data.products.map((p) => ({ label: p.name, value: p.outstanding, display: formatCurrency(p.outstanding) }))} />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "yield" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Panel title="Rendement par produit">
                {data.products.length ? (
                  <MiniBars items={data.products.map((p) => ({ label: p.name, value: p.yield_pct, display: formatPercent(p.yield_pct, 1) }))} />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Intérêts perçus par produit">
                {data.products.length ? (
                  <MiniBars items={data.products.map((p) => ({ label: p.name, value: p.interest_earned, display: formatCurrency(p.interest_earned) }))} />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "risk" && (
            <div className="space-y-5">
              <Panel title="Taux de défaut par produit">
                {data.products.length ? (
                  <MiniBars
                    items={data.products.map((p) => ({
                      label: p.name,
                      value: p.default_rate_pct,
                      display: formatPercent(p.default_rate_pct, 1),
                      tone: p.default_rate_pct > 5 ? "error" : "warning",
                    }))}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Défauts & pertes">
                <DataTable columns={riskCols} rows={data.products} getKey={(r) => r.slug} empty={{ title: "Aucun produit" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
