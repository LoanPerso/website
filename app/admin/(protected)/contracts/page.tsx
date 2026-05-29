"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { StatusBadge } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { listContracts, setContractStatus } from "@/_lib/admin/contracts";
import { contractStatusLabels, formatCurrency, formatDate, fullName } from "@/_lib/admin/format";
import type { ContractStatus, ContractWithRefs } from "@/_lib/admin/types";

export default function ContractsPage() {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<ContractWithRefs[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ContractStatus | "all">("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listContracts({});
    setRows(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      offer: rows.filter((c) => c.status === "offer_sent").length,
      signed: rows.filter((c) => c.status === "signed").length,
      active: rows.filter((c) => c.status === "active").length,
    }),
    [rows]
  );

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (s && !(c.reference ?? "").toLowerCase().includes(s)) return false;
      return true;
    });
  }, [rows, status, search]);

  async function changeStatus(id: string, next: ContractStatus) {
    const res = await setContractStatus(id, next);
    if (res.error) toast(res.error, "error");
    else load();
  }

  const columns: Column<ContractWithRefs>[] = [
    { header: "Réf.", cell: (c) => <span className="font-mono text-xs">{c.reference}</span> },
    {
      header: "Client",
      cell: (c) => <span className="font-medium">{fullName(c.client?.first_name, c.client?.last_name)}</span>,
    },
    { header: "Crédit", cell: (c) => <span className="font-mono text-xs">{c.loan?.reference ?? "—"}</span> },
    { header: "Montant", align: "right", cell: (c) => formatCurrency(c.principal_amount) },
    { header: "Mensualité", align: "right", cell: (c) => formatCurrency(c.monthly_payment, 2) },
    {
      header: "Échéances",
      cell: (c) => (
        <span className="text-xs text-muted-foreground">
          {c.signed_at
            ? `Signé ${formatDate(c.signed_at)}`
            : c.offer_expires_on
              ? `Offre → ${formatDate(c.offer_expires_on)}`
              : "—"}
        </span>
      ),
    },
    {
      header: "Statut",
      cell: (c) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <StatusBadge kind="contract" status={c.status} />
          <Select
            value={c.status}
            onChange={(e) => changeStatus(c.id, e.target.value as ContractStatus)}
            className="h-8 w-36 text-xs"
          >
            {Object.entries(contractStatusLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Contrats" description="Suivi contractuel : de l'offre à la signature et au solde." />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="Offres envoyées" value={String(counts.offer)} tone={counts.offer ? "warning" : "default"} />
        <KpiCard label="Signés" value={String(counts.signed)} />
        <KpiCard label="Actifs" value={String(counts.active)} tone="success" />
      </div>

      <Panel
        title="Liste"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Réf…"
                className="h-9 w-40 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <Select value={status} onChange={(e) => setStatus(e.target.value as ContractStatus | "all")} className="h-9 w-40">
              <option value="all">Tous statuts</option>
              {Object.entries(contractStatusLabels).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getKey={(c) => c.id}
            onRowClick={(c) => router.push(`/admin/contracts/${c.id}`)}
            empty={{ title: "Aucun contrat", hint: "Les contrats se créent depuis le dossier d'une demande qualifiée." }}
          />
        )}
      </Panel>
    </div>
  );
}
