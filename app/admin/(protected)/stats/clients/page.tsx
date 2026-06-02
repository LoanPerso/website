"use client";

import { useState } from "react";
import { Gauge, Map, Trophy, Users } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart, LineChart } from "@/_components/admin/charts";
import {
  FilterBar,
  type DimensionConfig,
  COUNTRY_OPTIONS,
  RISK_OPTIONS,
  CLIENT_STATUS_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getClientsStats } from "@/_lib/admin/analytics";
import type { ClientScoreBandRow, ClientsCountryRow, ClientExposureRow } from "@/_lib/admin/types";
import { formatCurrency, formatMonth, formatNumber, clientStatusLabels, fullName } from "@/_lib/admin/format";

type Tab = "segmentation" | "score" | "geography" | "exposure";

const DIMENSIONS: DimensionConfig[] = [
  { key: "country", label: "Pays", options: COUNTRY_OPTIONS },
  { key: "risk", label: "Risque", options: RISK_OPTIONS },
  { key: "status", label: "Statut", options: CLIENT_STATUS_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "segmentation", label: "Segmentation", icon: <Users className="h-4 w-4" /> },
  { key: "score", label: "Score", icon: <Gauge className="h-4 w-4" /> },
  { key: "geography", label: "Géographie", icon: <Map className="h-4 w-4" /> },
  { key: "exposure", label: "Exposition", icon: <Trophy className="h-4 w-4" /> },
];

export default function ClientsStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("segmentation");
  const { data, loading, error } = useStatsData(getClientsStats, filters);

  const scoreCols: Column<ClientScoreBandRow>[] = [
    { header: "Tranche", cell: (r) => <span className="font-medium">{r.label}</span> },
    { header: "Clients", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.clients)}</span> },
    { header: "Score moyen", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatNumber(r.avg_score)}</span> },
  ];

  const countryCols: Column<ClientsCountryRow>[] = [
    { header: "Pays", cell: (r) => <span className="font-mono">{r.country}</span> },
    { header: "Clients", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.clients)}</span> },
    { header: "Emprunteurs", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatNumber(r.borrowers)}</span> },
    { header: "Exposition", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.exposure)}</span> },
  ];

  const exposureCols: Column<ClientExposureRow>[] = [
    { header: "Client", cell: (r) => <span className="font-medium">{fullName(r.first_name, r.last_name)}</span> },
    { header: "Réf.", cell: (r) => <span className="font-mono text-muted-foreground">{r.reference ?? "—"}</span> },
    { header: "Risque", align: "center", cell: (r) => <span className="tabular-nums">{r.risk_category ?? "—"}</span> },
    { header: "Crédits actifs", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.active_loans)}</span> },
    { header: "Exposition", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.exposure)}</span> },
  ];

  const ov = data?.overview;

  return (
    <div className="space-y-5">
      <FilterBar value={filters} onChange={setFilters} dimensions={DIMENSIONS} dateLabel="Création" />
      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {loading ? (
        <StatsLoading />
      ) : error ? (
        <StatsError message={error} />
      ) : !data ? (
        <EmptyState title="Aucune donnée" />
      ) : (
        <>
          {tab === "segmentation" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Clients" value={formatNumber(ov?.total_clients)} sub={`${formatNumber(ov?.active_clients)} actifs · ${formatNumber(ov?.blacklisted)} bloqués`} />
                <Metric label="Emprunteurs" value={formatNumber(ov?.borrowers)} sub="Au moins un crédit" />
                <Metric label="Multi-crédits" value={formatNumber(ov?.multi_loan_clients)} sub="Plusieurs crédits actifs" />
                <Metric label="Revenu moyen" value={formatCurrency(ov?.avg_income)} sub="Revenu mensuel déclaré" />
                <Metric label="Score moyen" value={formatNumber(ov?.avg_score)} sub={`Exposition ${formatCurrency(ov?.total_exposure)}`} />
              </StatGrid>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Répartition par statut">
                  {data.by_status.length ? (
                    <DonutChart
                      segments={data.by_status.map((s) => ({ label: clientStatusLabels[s.status] ?? s.status, value: s.clients }))}
                      centerLabel="Clients"
                      centerValue={formatNumber(ov?.total_clients)}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Par tranche de revenu">
                  {data.by_income.length ? (
                    <MiniBars items={data.by_income.map((b) => ({ label: b.label, value: b.clients, display: formatNumber(b.clients) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>
            </div>
          )}

          {tab === "score" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Clients par tranche de score">
                  {data.by_score_band.length ? (
                    <MiniBars items={data.by_score_band.map((b) => ({ label: b.label, value: b.clients, display: formatNumber(b.clients) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Détail par tranche de score">
                  <DataTable columns={scoreCols} rows={data.by_score_band} getKey={(r) => r.band} empty={{ title: "Aucune donnée" }} />
                </Panel>
              </div>
            </div>
          )}

          {tab === "geography" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Par pays">
                  <DataTable columns={countryCols} rows={data.by_country} getKey={(r) => r.country} empty={{ title: "Aucune donnée" }} />
                </Panel>
                <Panel title="Exposition par catégorie de risque">
                  {data.by_risk.length ? (
                    <MiniBars items={data.by_risk.map((r) => ({ label: `Catégorie ${r.category}`, value: r.exposure, display: formatCurrency(r.exposure) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>
              <Panel title="Nouveaux clients par mois">
                {data.new_clients_monthly.length ? (
                  <LineChart data={data.new_clients_monthly.map((m) => ({ label: formatMonth(m.month), value: m.clients }))} format={(n) => formatNumber(n)} />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
            </div>
          )}

          {tab === "exposure" && (
            <div className="space-y-5">
              <Panel title="Top exposition client">
                <DataTable columns={exposureCols} rows={data.top_exposure} getKey={(r) => r.client_id} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
