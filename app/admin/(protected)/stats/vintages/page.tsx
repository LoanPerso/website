"use client";

import { useState } from "react";
import { Layers, ListChecks, TrendingDown, Flame } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import {
  FilterBar,
  type DimensionConfig,
  PRODUCT_OPTIONS,
  RISK_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getVintagesStats } from "@/_lib/admin/analytics";
import type { CohortRow } from "@/_lib/admin/types";
import { formatCurrency, formatMonth, formatNumber, formatPercent } from "@/_lib/admin/format";

type Tab = "table" | "repaid" | "default" | "loss";

const DIMENSIONS: DimensionConfig[] = [
  { key: "product", label: "Produit", options: PRODUCT_OPTIONS },
  { key: "risk", label: "Risque", options: RISK_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "table", label: "Cohortes", icon: <Layers className="h-4 w-4" /> },
  { key: "repaid", label: "Remboursement", icon: <ListChecks className="h-4 w-4" /> },
  { key: "default", label: "Défaut", icon: <TrendingDown className="h-4 w-4" /> },
  { key: "loss", label: "Perte", icon: <Flame className="h-4 w-4" /> },
];

export default function VintagesStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("table");
  const { data, loading, error } = useStatsData(getVintagesStats, filters);

  const cohortCols: Column<CohortRow>[] = [
    { header: "Cohorte", cell: (r) => <span className="font-medium">{formatMonth(r.cohort)}</span> },
    { header: "Crédits", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.loans)}</span> },
    { header: "Financé", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.disbursed)}</span> },
    { header: "% remboursé", align: "right", cell: (r) => <span className="tabular-nums text-success">{formatPercent(r.repaid_pct, 1)}</span> },
    {
      header: "% défaut",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.default_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.default_pct, 1)}</span>,
    },
    { header: "Encours", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.outstanding)}</span> },
    {
      header: "Perte",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.written_off > 0 ? "text-error" : "text-muted-foreground"}`}>{formatCurrency(r.written_off)}</span>,
    },
  ];

  const lossCols: Column<CohortRow>[] = [
    { header: "Cohorte", cell: (r) => <span className="font-medium">{formatMonth(r.cohort)}</span> },
    { header: "Financé", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.disbursed)}</span> },
    {
      header: "Perte",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.written_off > 0 ? "text-error" : "text-muted-foreground"}`}>{formatCurrency(r.written_off)}</span>,
    },
    {
      header: "Taux de perte",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.loss_pct > 5 ? "text-error" : "text-muted-foreground"}`}>{formatPercent(r.loss_pct, 1)}</span>,
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
          {tab === "table" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Cohortes" value={formatNumber(ov?.cohorts)} sub={`${formatNumber(ov?.loans)} crédits`} />
                <Metric label="Total financé" value={formatCurrency(ov?.disbursed)} sub={`${formatCurrency(ov?.outstanding)} d'encours`} />
                <Metric label="Remb. moyen" value={formatPercent(ov?.avg_repaid_pct, 1)} sub={`${formatCurrency(ov?.repaid_principal)} remboursés`} tone="success" />
                <Metric label="Défaut moyen" value={formatPercent(ov?.avg_default_pct, 1)} sub="Moyenne des cohortes" tone={Number(ov?.avg_default_pct) > 5 ? "error" : "default"} />
                <Metric label="Perte pondérée" value={formatPercent(ov?.weighted_loss_pct, 1)} sub={`${formatCurrency(ov?.written_off)} passés en perte`} tone={Number(ov?.weighted_loss_pct) > 5 ? "error" : "default"} />
              </StatGrid>

              <Panel title="Performance par cohorte">
                <DataTable columns={cohortCols} rows={data.cohorts} getKey={(r) => r.cohort} empty={{ title: "Aucune cohorte" }} />
              </Panel>
            </div>
          )}

          {tab === "repaid" && (
            <div className="space-y-5">
              <Panel title="Taux de remboursement par cohorte">
                {data.cohorts.length ? (
                  <MiniBars
                    items={data.cohorts.map((c) => ({
                      label: formatMonth(c.cohort),
                      value: c.repaid_pct,
                      display: formatPercent(c.repaid_pct, 1),
                      tone: "success",
                    }))}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "default" && (
            <div className="space-y-5">
              <Panel title="Taux de défaut par cohorte">
                {data.cohorts.length ? (
                  <MiniBars
                    items={data.cohorts.map((c) => ({
                      label: formatMonth(c.cohort),
                      value: c.default_pct,
                      display: formatPercent(c.default_pct, 1),
                      tone: c.default_pct > 5 ? "error" : "warning",
                    }))}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "loss" && (
            <div className="space-y-5">
              <Panel title="Taux de perte par cohorte">
                {data.cohorts.length ? (
                  <MiniBars
                    items={data.cohorts.map((c) => ({
                      label: formatMonth(c.cohort),
                      value: c.loss_pct,
                      display: formatPercent(c.loss_pct, 1),
                      tone: "error",
                    }))}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Pertes par cohorte">
                <DataTable columns={lossCols} rows={data.cohorts} getKey={(r) => r.cohort} empty={{ title: "Aucune cohorte" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
