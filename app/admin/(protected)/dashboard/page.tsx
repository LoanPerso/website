"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  HandCoins,
  Landmark,
  PiggyBank,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  getKpis,
  getMonthlySeries,
  getRecentLoans,
  getTopOverdue,
  type MonthlyPoint,
} from "@/_lib/admin/dashboard";
import type { LoanWithClient, OverdueInstallment, PortfolioKpis } from "@/_lib/admin/types";
import { currentMonthKey, formatCurrency, formatDate, formatPercent, fullName } from "@/_lib/admin/format";
import { PageHeader } from "@/_components/admin/page-header";
import { KpiCard } from "@/_components/admin/kpi-card";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { MonthlyBarChart } from "@/_components/admin/bar-chart";
import { StatusBadge } from "@/_components/admin/status-badge";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<PortfolioKpis | null>(null);
  const [series, setSeries] = useState<MonthlyPoint[]>([]);
  const [recent, setRecent] = useState<LoanWithClient[]>([]);
  const [overdue, setOverdue] = useState<OverdueInstallment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getKpis(), getMonthlySeries(12), getRecentLoans(6), getTopOverdue(6)]).then(
      ([k, s, r, o]) => {
        setKpis(k.data);
        setSeries(s.data ?? []);
        setRecent(r.data ?? []);
        setOverdue(o.data ?? []);
        setLoading(false);
      }
    );
  }, []);

  const thisMonth = currentMonthKey();
  const lentThisMonth = series.find((p) => p.month === thisMonth)?.disbursed ?? 0;

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de l'activité de prêt — P&L, encours et impayés."
      />

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Encours (capital)"
              value={formatCurrency(kpis?.outstanding_principal)}
              sub="Capital prêté non remboursé"
              icon={<Landmark className="h-4 w-4" />}
            />
            <KpiCard
              label="Prêté ce mois"
              value={formatCurrency(lentThisMonth)}
              sub="Volume débloqué (mois en cours)"
              tone="success"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <KpiCard
              label="Total prêté"
              value={formatCurrency(kpis?.total_disbursed)}
              sub={`${kpis?.total_loans ?? 0} crédits`}
              icon={<HandCoins className="h-4 w-4" />}
            />
            <KpiCard
              label="Encaissé (total)"
              value={formatCurrency(kpis?.total_collected)}
              sub={`Intérêts perçus : ${formatCurrency(kpis?.interest_earned)}`}
              icon={<Wallet className="h-4 w-4" />}
            />
            <KpiCard
              label="Clients actifs"
              value={String(kpis?.active_clients ?? 0)}
              sub={`${kpis?.total_clients ?? 0} clients au total`}
              icon={<Users className="h-4 w-4" />}
            />
            <KpiCard
              label="Crédits actifs"
              value={String(kpis?.active_loans ?? 0)}
              sub={`${kpis?.defaulted_loans ?? 0} en défaut`}
              icon={<Banknote className="h-4 w-4" />}
            />
            <KpiCard
              label="Taux de défaut"
              value={formatPercent(kpis?.default_rate_pct)}
              sub="Cible < 5 %"
              tone={Number(kpis?.default_rate_pct ?? 0) >= 5 ? "error" : "success"}
              icon={<PiggyBank className="h-4 w-4" />}
            />
            <KpiCard
              label="Impayés"
              value={formatCurrency(kpis?.overdue_amount)}
              sub={`${kpis?.overdue_installments ?? 0} échéances · ${kpis?.overdue_loans ?? 0} crédits`}
              tone={Number(kpis?.overdue_amount ?? 0) > 0 ? "error" : "success"}
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>

          <Panel title="Débloqué vs encaissé (12 mois)">
            {series.length ? <MonthlyBarChart data={series} /> : <EmptyState title="Pas de données" />}
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel
              title="Crédits récents"
              actions={
                <Link href="/admin/loans" className="text-xs text-dark-gold hover:underline">
                  Tout voir
                </Link>
              }
            >
              {recent.length ? (
                <ul className="divide-y divide-border">
                  {recent.map((l) => (
                    <li key={l.id} className="flex items-center justify-between py-3">
                      <div>
                        <Link href={`/admin/loans/${l.id}`} className="text-sm font-medium hover:underline">
                          {l.reference}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {fullName(l.client?.first_name, l.client?.last_name)} · {formatDate(l.start_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(l.principal_amount)}</p>
                        <StatusBadge kind="loan" status={l.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Aucun crédit" />
              )}
            </Panel>

            <Panel
              title="Alertes impayés"
              actions={
                <Link href="/admin/overdue" className="text-xs text-dark-gold hover:underline">
                  Tout voir
                </Link>
              }
            >
              {overdue.length ? (
                <ul className="divide-y divide-border">
                  {overdue.map((o) => (
                    <li key={o.id} className="flex items-center justify-between py-3">
                      <div>
                        <Link href={`/admin/loans/${o.loan_id}`} className="text-sm font-medium hover:underline">
                          {fullName(o.first_name, o.last_name)}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {o.loan_reference} · échéance {formatDate(o.due_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-error">{formatCurrency(o.amount_remaining)}</p>
                        <p className="text-xs text-muted-foreground">{o.days_late} j de retard</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Aucun impayé 🎉" hint="Tous les remboursements sont à jour." />
              )}
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}
