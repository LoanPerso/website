"use client";

import { useState } from "react";
import { Crosshair, Gauge, Layers } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart } from "@/_components/admin/charts";
import {
  FilterBar,
  type DimensionConfig,
  PRODUCT_OPTIONS,
  COUNTRY_OPTIONS,
  RISK_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getRiskStats } from "@/_lib/admin/analytics";
import type { RiskCategoryRow, ScoreBandRow, DefaultByAmountRow } from "@/_lib/admin/types";
import { formatCurrency, formatNumber, formatPercent } from "@/_lib/admin/format";

type Tab = "categories" | "score" | "concentration";

const DIMENSIONS: DimensionConfig[] = [
  { key: "product", label: "Produit", options: PRODUCT_OPTIONS },
  { key: "country", label: "Pays", options: COUNTRY_OPTIONS },
  { key: "risk", label: "Risque", options: RISK_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "categories", label: "Catégories", icon: <Layers className="h-4 w-4" /> },
  { key: "score", label: "Score", icon: <Gauge className="h-4 w-4" /> },
  { key: "concentration", label: "Concentration", icon: <Crosshair className="h-4 w-4" /> },
];

export default function RiskStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("categories");
  const { data, loading, error } = useStatsData(getRiskStats, filters);

  const categoryCols: Column<RiskCategoryRow>[] = [
    { header: "Catégorie", cell: (r) => <span className="font-mono">{r.category}</span> },
    { header: "Crédits", align: "right", cell: (r) => formatNumber(r.loans) },
    { header: "Exposition", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.exposure)}</span> },
    { header: "Part", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatPercent(r.share_pct, 1)}</span> },
    {
      header: "Taux défaut",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.default_rate_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.default_rate_pct, 1)}</span>,
    },
    { header: "Taux moyen", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatPercent(r.avg_rate, 1)}</span> },
    { header: "Perte", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.written_off)}</span> },
  ];

  const scoreCols: Column<ScoreBandRow>[] = [
    { header: "Tranche", cell: (r) => <span className="font-medium">{r.label}</span> },
    { header: "Clients", align: "right", cell: (r) => formatNumber(r.clients) },
    { header: "Score moyen", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.avg_score)}</span> },
    { header: "Exposition", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.exposure)}</span> },
  ];

  const amountCols: Column<DefaultByAmountRow>[] = [
    { header: "Tranche", cell: (r) => <span className="font-medium">{r.label}</span> },
    { header: "Crédits", align: "right", cell: (r) => formatNumber(r.loans) },
    { header: "Défauts", align: "right", cell: (r) => formatNumber(r.defaulted) },
    {
      header: "Taux défaut",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.default_rate_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.default_rate_pct, 1)}</span>,
    },
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
          {tab === "categories" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Exposition" value={formatCurrency(ov?.exposure)} sub={`${formatNumber(ov?.loans)} crédits actifs`} />
                <Metric label="Crédits actifs" value={formatNumber(ov?.loans)} sub={`Taux moyen ${formatPercent(ov?.avg_rate, 1)}`} />
                <Metric label="# Défauts" value={formatNumber(ov?.defaulted)} sub="Crédits en défaut" tone={Number(ov?.defaulted) > 0 ? "error" : "default"} />
                <Metric label="Créances en perte" value={formatCurrency(ov?.written_off)} sub="Passées en perte" tone={Number(ov?.written_off) > 0 ? "warning" : "default"} />
                <Metric label="Taux de défaut" value={formatPercent(ov?.default_rate_pct, 2)} sub="Sur la sélection" tone={Number(ov?.default_rate_pct) > 5 ? "error" : "default"} />
              </StatGrid>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Exposition par catégorie">
                  {data.by_category.length ? (
                    <DonutChart
                      segments={data.by_category.map((c) => ({ label: `Catégorie ${c.category}`, value: c.exposure }))}
                      centerLabel="Exposition"
                      centerValue={formatCurrency(ov?.exposure)}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Taux de défaut par catégorie">
                  {data.by_category.length ? (
                    <MiniBars
                      items={data.by_category.map((c) => ({
                        label: `Catégorie ${c.category}`,
                        value: c.default_rate_pct,
                        display: formatPercent(c.default_rate_pct, 1),
                        tone: c.default_rate_pct > 5 ? "error" : "warning",
                      }))}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>

              <Panel title="Détail par catégorie">
                <DataTable columns={categoryCols} rows={data.by_category} getKey={(r) => r.category} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}

          {tab === "score" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Clients par tranche de score">
                  {data.score_bands.length ? (
                    <MiniBars items={data.score_bands.map((s) => ({ label: s.label, value: s.clients, display: formatNumber(s.clients) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Détail par tranche de score">
                  <DataTable columns={scoreCols} rows={data.score_bands} getKey={(r) => r.band} empty={{ title: "Aucune donnée" }} />
                </Panel>
              </div>
            </div>
          )}

          {tab === "concentration" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Défaut par tranche de montant">
                  {data.default_by_amount.length ? (
                    <MiniBars
                      items={data.default_by_amount.map((b) => ({
                        label: b.label,
                        value: b.default_rate_pct,
                        display: formatPercent(b.default_rate_pct, 1),
                        tone: b.default_rate_pct > 5 ? "error" : "warning",
                      }))}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Exposition par produit">
                  {data.exposure_by_product.length ? (
                    <DonutChart
                      segments={data.exposure_by_product.map((p) => ({ label: p.name, value: p.exposure }))}
                      centerLabel="Exposition"
                      centerValue={formatCurrency(ov?.exposure)}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>

              <Panel title="Détail par tranche de montant">
                <DataTable columns={amountCols} rows={data.default_by_amount} getKey={(r) => r.bucket} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
