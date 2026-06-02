"use client";

import { useState } from "react";
import { Landmark, Layers, Map, TrendingUp } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart, LineChart, StackedBar } from "@/_components/admin/charts";
import {
  FilterBar,
  type DimensionConfig,
  PRODUCT_OPTIONS,
  COUNTRY_OPTIONS,
  RISK_OPTIONS,
  LOAN_STATUS_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getPortfolioStats } from "@/_lib/admin/analytics";
import type { PortfolioCountry, PortfolioProduct } from "@/_lib/admin/types";
import { formatCurrency, formatMonth, formatNumber, formatPercent, loanStatusLabels } from "@/_lib/admin/format";

type Tab = "synthesis" | "composition" | "segments" | "origination";

const DIMENSIONS: DimensionConfig[] = [
  { key: "product", label: "Produit", options: PRODUCT_OPTIONS },
  { key: "country", label: "Pays", options: COUNTRY_OPTIONS },
  { key: "risk", label: "Risque", options: RISK_OPTIONS },
  { key: "status", label: "Statut", options: LOAN_STATUS_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "synthesis", label: "Synthèse", icon: <Landmark className="h-4 w-4" /> },
  { key: "composition", label: "Composition", icon: <Layers className="h-4 w-4" /> },
  { key: "segments", label: "Segments", icon: <Map className="h-4 w-4" /> },
  { key: "origination", label: "Origination", icon: <TrendingUp className="h-4 w-4" /> },
];

export default function PortfolioStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("synthesis");
  const { data, loading, error } = useStatsData(getPortfolioStats, filters);

  const productCols: Column<PortfolioProduct>[] = [
    { header: "Produit", cell: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Crédits actifs", align: "right", cell: (r) => formatNumber(r.active_loans) },
    { header: "Financé", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.disbursed)}</span> },
    { header: "Encours", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.outstanding)}</span> },
    {
      header: "Taux défaut",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.default_rate_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.default_rate_pct, 1)}</span>,
    },
  ];

  const countryCols: Column<PortfolioCountry>[] = [
    { header: "Pays", cell: (r) => <span className="font-mono">{r.country}</span> },
    { header: "Crédits", align: "right", cell: (r) => formatNumber(r.loans) },
    { header: "Crédits actifs", align: "right", cell: (r) => formatNumber(r.active_loans) },
    { header: "Encours", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.outstanding)}</span> },
  ];

  const ov = data?.overview;

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
          {tab === "synthesis" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Encours (capital)" value={formatCurrency(ov?.outstanding)} sub={`${formatNumber(ov?.active_loans)} crédits actifs`} />
                <Metric label="Capital financé" value={formatCurrency(ov?.disbursed)} sub={`${formatNumber(ov?.loans)} crédits`} />
                <Metric label="Intérêts perçus" value={formatCurrency(ov?.interest_earned)} sub="Cumul sur la sélection" />
                <Metric label="Taux de défaut" value={formatPercent(ov?.default_rate_pct, 2)} sub={`${formatNumber(ov?.defaulted)} en défaut`} tone={Number(ov?.default_rate_pct) > 5 ? "error" : "default"} />
                <Metric label="Exposition médiane" value={formatCurrency(ov?.median_balance)} sub={`P90 ${formatCurrency(ov?.p90_balance)}`} />
              </StatGrid>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Origination mensuelle (capital financé)">
                  {data.origination_monthly.length ? (
                    <LineChart data={data.origination_monthly.map((m) => ({ label: formatMonth(m.month), value: m.disbursed }))} format={(n) => formatCurrency(n)} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Distribution de l'encours par montant">
                  {data.amount_buckets.length ? (
                    <MiniBars
                      items={data.amount_buckets.map((b) => ({ label: `${b.label} · ${formatNumber(b.loans)} crédits`, value: b.outstanding, display: formatCurrency(b.outstanding) }))}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>
            </div>
          )}

          {tab === "composition" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Par tranche de montant">
                  <MiniBars items={data.amount_buckets.map((b) => ({ label: `${b.label} · ${formatNumber(b.loans)} crédits`, value: b.outstanding, display: formatCurrency(b.outstanding) }))} />
                </Panel>
                <Panel title="Par durée">
                  <MiniBars items={data.duration_buckets.map((b) => ({ label: `${b.label} · ${formatNumber(b.loans)} crédits`, value: b.principal, display: formatCurrency(b.principal) }))} />
                </Panel>
              </div>
              <Panel title="Composition par statut">
                {data.by_status.length ? (
                  <StackedBar segments={data.by_status.map((s) => ({ label: loanStatusLabels[s.status] ?? s.status, value: s.loans }))} />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "segments" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Répartition de l'encours par produit">
                  {data.by_product.length ? (
                    <DonutChart segments={data.by_product.map((p) => ({ label: p.name, value: p.outstanding }))} centerLabel="Encours" centerValue={formatCurrency(ov?.outstanding)} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Répartition géographique">
                  <DataTable columns={countryCols} rows={data.by_country} getKey={(r) => r.country} empty={{ title: "Aucune donnée" }} />
                </Panel>
              </div>
              <Panel title="Performance par produit">
                <DataTable columns={productCols} rows={data.by_product} getKey={(r) => r.slug} empty={{ title: "Aucun produit" }} />
              </Panel>
            </div>
          )}

          {tab === "origination" && (
            <div className="space-y-5">
              <Panel title="Capital financé par mois d'origination">
                {data.origination_monthly.length ? (
                  <LineChart data={data.origination_monthly.map((m) => ({ label: formatMonth(m.month), value: m.disbursed }))} format={(n) => formatCurrency(n)} />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Détail mensuel">
                <DataTable
                  columns={[
                    { header: "Mois", cell: (r) => <span className="font-medium">{formatMonth(r.month)}</span> },
                    { header: "Crédits", align: "right", cell: (r) => formatNumber(r.loans) },
                    { header: "Capital financé", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.disbursed)}</span> },
                  ]}
                  rows={data.origination_monthly}
                  getKey={(r) => r.month}
                  empty={{ title: "Aucune donnée" }}
                />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
