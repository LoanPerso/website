"use client";

import { useState } from "react";
import { AlertTriangle, BellRing, Boxes, Clock } from "lucide-react";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Tabs, type TabDef } from "@/_components/admin/tabs";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Metric } from "@/_components/admin/primitives";
import { DonutChart } from "@/_components/admin/charts";
import {
  FilterBar,
  type DimensionConfig,
  PRODUCT_OPTIONS,
  RISK_OPTIONS,
  defaultStatsFilters,
} from "@/_components/admin/filter-bar";
import { StatGrid, MiniBars, useStatsData, StatsLoading, StatsError } from "@/_components/admin/stats-kit";
import { getCollectionsStats } from "@/_lib/admin/analytics";
import type { DpdBucketRow, DunningRow, TopArrearRow } from "@/_lib/admin/types";
import { formatCurrency, formatNumber, fullName } from "@/_lib/admin/format";

type Tab = "dpd" | "dunning" | "segments" | "top";

const DIMENSIONS: DimensionConfig[] = [
  { key: "product", label: "Produit", options: PRODUCT_OPTIONS },
  { key: "risk", label: "Risque", options: RISK_OPTIONS },
];

const TABS: TabDef<Tab>[] = [
  { key: "dpd", label: "DPD", icon: <Clock className="h-4 w-4" /> },
  { key: "dunning", label: "Relance", icon: <BellRing className="h-4 w-4" /> },
  { key: "segments", label: "Segments", icon: <Boxes className="h-4 w-4" /> },
  { key: "top", label: "Top arriérés", icon: <AlertTriangle className="h-4 w-4" /> },
];

export default function CollectionsStatsPage() {
  const [filters, setFilters] = useState(defaultStatsFilters());
  const [tab, setTab] = useState<Tab>("dpd");
  const { data, loading, error } = useStatsData(getCollectionsStats, filters);

  const dpdCols: Column<DpdBucketRow>[] = [
    { header: "Tranche", cell: (r) => <span className="font-medium">{r.label}</span> },
    { header: "Échéances", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.installments)}</span> },
    { header: "Crédits", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.loans)}</span> },
    { header: "Montant", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.amount)}</span> },
    { header: "Pénalités", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.late_fees)}</span> },
  ];

  const dunningCols: Column<DunningRow>[] = [
    { header: "Niveau", cell: (r) => <span className="font-medium">{`Niveau ${r.dunning_level}`}</span> },
    { header: "Crédits", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.loans)}</span> },
    { header: "Arriéré", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.arrears)}</span> },
    { header: "Pénalités", align: "right", cell: (r) => <span className="tabular-nums text-muted-foreground">{formatCurrency(r.late_fees)}</span> },
  ];

  const topCols: Column<TopArrearRow>[] = [
    { header: "Client", cell: (r) => <span className="font-medium">{fullName(r.first_name, r.last_name)}</span> },
    { header: "Crédit", cell: (r) => <span className="font-mono text-muted-foreground">{r.loan_reference ?? "—"}</span> },
    { header: "Arriéré", align: "right", cell: (r) => <span className="tabular-nums">{formatCurrency(r.overdue_amount)}</span> },
    { header: "Retard j", align: "right", cell: (r) => <span className="tabular-nums text-error">{formatNumber(r.max_days_late)}</span> },
    { header: "Niveau", align: "right", cell: (r) => <span className="tabular-nums">{formatNumber(r.dunning_level)}</span> },
  ];

  const sm = data?.summary;

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
          {tab === "dpd" && (
            <div className="space-y-5">
              <StatGrid cols={5}>
                <Metric label="Arriéré total" value={formatCurrency(sm?.total_overdue_amount)} sub={`${formatNumber(sm?.overdue_count)} échéances en retard`} tone="error" />
                <Metric label="Encours à risque" value={formatCurrency(sm?.outstanding_at_risk)} sub="Capital restant exposé" />
                <Metric label="Dossiers en arriéré" value={formatNumber(sm?.arrears_loans)} sub="Crédits concernés" />
                <Metric label="Clients touchés" value={formatNumber(sm?.affected_clients)} sub="Emprunteurs en retard" />
                <Metric label="Retard moyen" value={`${formatNumber(sm?.avg_days_late)} j`} sub={`${formatCurrency(sm?.total_late_fees)} de pénalités`} />
              </StatGrid>

              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Arriéré par jours de retard">
                  {data.dpd_buckets.length ? (
                    <DonutChart
                      segments={data.dpd_buckets.map((b) => ({ label: b.label, value: b.amount }))}
                      centerLabel="Arriéré total"
                      centerValue={formatCurrency(sm?.total_overdue_amount)}
                    />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Détail DPD">
                  <DataTable columns={dpdCols} rows={data.dpd_buckets} getKey={(r) => r.bucket} empty={{ title: "Aucune donnée" }} />
                </Panel>
              </div>
            </div>
          )}

          {tab === "dunning" && (
            <div className="space-y-5">
              <Panel title="Arriéré par niveau de relance">
                {data.dunning.length ? (
                  <MiniBars
                    items={data.dunning.map((d) => ({
                      label: `Niveau ${d.dunning_level} · ${formatNumber(d.loans)} crédits`,
                      value: d.arrears,
                      display: formatCurrency(d.arrears),
                      tone: d.dunning_level >= 4 ? "error" : d.dunning_level >= 2 ? "warning" : "info",
                    }))}
                  />
                ) : (
                  <EmptyState title="Aucune donnée" />
                )}
              </Panel>
              <Panel title="Détail par niveau">
                <DataTable columns={dunningCols} rows={data.dunning} getKey={(r) => String(r.dunning_level)} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}

          {tab === "segments" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Arriéré par produit">
                  {data.by_product.length ? (
                    <MiniBars items={data.by_product.map((p) => ({ label: p.name, value: p.overdue_amount, display: formatCurrency(p.overdue_amount) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
                <Panel title="Arriéré par catégorie de risque">
                  {data.by_risk.length ? (
                    <MiniBars items={data.by_risk.map((r) => ({ label: `Catégorie ${r.category}`, value: r.overdue_amount, display: formatCurrency(r.overdue_amount) }))} />
                  ) : (
                    <EmptyState title="Aucune donnée" />
                  )}
                </Panel>
              </div>
            </div>
          )}

          {tab === "top" && (
            <div className="space-y-5">
              <Panel title="Dossiers les plus en arriéré">
                <DataTable columns={topCols} rows={data.top_arrears} getKey={(r) => r.loan_id} empty={{ title: "Aucune donnée" }} />
              </Panel>
            </div>
          )}
        </>
      )}
    </div>
  );
}
