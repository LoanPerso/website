"use client";

import { useState } from "react";
import { Filter, GitMerge, Share2, UserSearch } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart, StackedBar } from "@/_components/admin/charts";
import {
  FilterBar,
  type DimensionConfig,
  SOURCE_OPTIONS,
  APP_STATUS_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getFunnelStats } from "@/_lib/admin/analytics";
import type { FunnelStatusRow, FunnelSourceRow, FunnelScoreBandRow } from "@/_lib/admin/types";
import { formatCurrency, formatNumber, formatPercent, applicationStatusLabels } from "@/_lib/admin/format";

type Tab = "funnel" | "conversion" | "sources" | "profiles";

const DIMENSIONS: DimensionConfig[] = [
  { key: "source", label: "Source", options: SOURCE_OPTIONS },
  { key: "status", label: "Statut", options: APP_STATUS_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "funnel", label: "Entonnoir", icon: <Filter className="h-4 w-4" /> },
  { key: "conversion", label: "Conversion", icon: <GitMerge className="h-4 w-4" /> },
  { key: "sources", label: "Sources", icon: <Share2 className="h-4 w-4" /> },
  { key: "profiles", label: "Profils", icon: <UserSearch className="h-4 w-4" /> },
];

export default function FunnelStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("funnel");
  const { data, loading, error } = useStatsData(getFunnelStats, filters);

  const statusCols: Column<FunnelStatusRow>[] = [
    { header: "Statut", cell: (r) => <span className="font-medium">{applicationStatusLabels[r.status] ?? r.status}</span> },
    { header: "Demandes", align: "right", cell: (r) => formatNumber(r.apps) },
    { header: "Montant", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.amount)}</span> },
    { header: "Score moyen", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.avg_score, 1)}</span> },
  ];

  const sourceCols: Column<FunnelSourceRow>[] = [
    { header: "Source", cell: (r) => <span className="font-medium">{r.source}</span> },
    { header: "Demandes", align: "right", cell: (r) => formatNumber(r.apps) },
    { header: "Converties", align: "right", cell: (r) => formatNumber(r.converted) },
    {
      header: "Taux",
      align: "right",
      cell: (r) => <span className={`tabular-nums ${r.conversion_rate < 5 ? "text-error" : "text-success"}`}>{formatPercent(r.conversion_rate, 1)}</span>,
    },
    { header: "Montant", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.amount)}</span> },
  ];

  const scoreBandCols: Column<FunnelScoreBandRow>[] = [
    { header: "Tranche", cell: (r) => <span className="font-medium">{r.label}</span> },
    { header: "Demandes", align: "right", cell: (r) => formatNumber(r.apps) },
    { header: "Converties", align: "right", cell: (r) => formatNumber(r.converted) },
    {
      header: "Taux",
      align: "right",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{formatPercent(r.apps ? Math.round((100 * r.converted) / r.apps) : 0, 0)}</span>,
    },
  ];

  const ov = data?.overview;

  return (
    <div className="space-y-5">
      <FilterBar value={filters} onChange={setFilters} dimensions={DIMENSIONS} dateLabel="Demande" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <StatsLoading />
      ) : error ? (
        <StatsError message={error} />
      ) : !data ? (
        <EmptyState title="Aucune donnée" />
      ) : (
        <>
          {tab === "funnel" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Demandes" value={formatNumber(ov?.total)} sub="Sur la sélection" />
                <Metric label="Taux de conversion" value={formatPercent(ov?.conversion_rate, 1)} sub={`${formatNumber(ov?.converted)} converties`} />
                <Metric label="Taux d'approbation" value={formatPercent(ov?.approval_rate, 1)} sub={`${formatNumber(ov?.approved)} approuvées`} />
                <Metric label="Score moyen" value={formatNumber(ov?.avg_score, 1)} sub="Demandes reçues" />
                <Metric label="Montant moyen" value={formatCurrency(ov?.avg_amount)} sub={`${formatCurrency(ov?.total_amount)} demandés`} />
              </StatGrid>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Demandes par statut">
                  {data.by_status.length ? (
                    <DonutChart
                      segments={data.by_status.map((s) => ({ label: applicationStatusLabels[s.status] ?? s.status, value: s.apps }))}
                      centerLabel="Demandes"
                      centerValue={formatNumber(ov?.total)}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Détail par statut">
                  <DataTable columns={statusCols} rows={data.by_status} getKey={(r) => r.status} empty={{ title: "Aucune donnée" }} />
                </Panel>
              </div>
            </div>
          )}

          {tab === "conversion" && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                <Metric label="Converties" value={formatNumber(ov?.converted)} sub="Devenues crédits" tone="success" />
                <Metric label="Approuvées" value={formatNumber(ov?.approved)} sub="Décision favorable" />
                <Metric label="En étude" value={formatNumber(ov?.under_review)} sub="En cours d'analyse" />
                <Metric label="Rejetées" value={formatNumber(ov?.rejected)} sub="Décision défavorable" tone="error" />
              </div>

              <Panel title="Issue des demandes">
                <StackedBar
                  segments={[
                    { label: "Converties", value: Number(ov?.converted ?? 0) },
                    { label: "Approuvées", value: Number(ov?.approved ?? 0) },
                    { label: "En étude", value: Number(ov?.under_review ?? 0) },
                    { label: "Rejetées", value: Number(ov?.rejected ?? 0) },
                  ]}
                />
              </Panel>
            </div>
          )}

          {tab === "sources" && (
            <div className="space-y-5">
              <Panel title="Performance par source">
                <DataTable columns={sourceCols} rows={data.by_source} getKey={(r) => r.source} empty={{ title: "Aucune source" }} />
              </Panel>
              <Panel title="Volume par source">
                {data.by_source.length ? (
                  <MiniBars
                    items={data.by_source.map((s) => ({
                      label: `${s.source} · ${formatNumber(s.converted)} converties`,
                      value: s.apps,
                      display: `${formatNumber(s.apps)} demandes`,
                    }))}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "profiles" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Demandes par tranche de score">
                  {data.by_score_band.length ? (
                    <MiniBars items={data.by_score_band.map((b) => ({ label: b.label, value: b.apps, display: formatNumber(b.apps) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Demandes par tranche de montant">
                  {data.by_amount_band.length ? (
                    <MiniBars items={data.by_amount_band.map((b) => ({ label: b.label, value: b.apps, display: formatNumber(b.apps) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>

              <Panel title="Conversion par tranche de score">
                <DataTable columns={scoreBandCols} rows={data.by_score_band} getKey={(r) => r.band} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
