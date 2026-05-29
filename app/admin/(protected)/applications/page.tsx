"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { StatusBadge, ScoreChip } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { listApplications } from "@/_lib/admin/applications";
import { listProducts } from "@/_lib/admin/products";
import type { ApplicationStatus, LoanApplication, Product } from "@/_lib/admin/types";
import { applicationStatusLabels, formatCurrency, formatDate, fullName } from "@/_lib/admin/format";

export default function ApplicationsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<LoanApplication[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [res, p] = await Promise.all([listApplications(status), listProducts()]);
    setRows(res.data ?? []);
    setProducts(p.data ?? []);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const productName = (slug: string | null) =>
    products.find((p) => p.slug === slug)?.name ?? slug ?? "—";

  const columns: Column<LoanApplication>[] = [
    { header: "Reçue", cell: (a) => formatDate(a.created_at) },
    { header: "Demandeur", cell: (a) => <span className="font-medium">{fullName(a.first_name, a.last_name)}</span> },
    { header: "Contact", cell: (a) => <span className="text-muted-foreground">{a.email || a.phone || "—"}</span> },
    { header: "Produit", cell: (a) => productName(a.credit_type) },
    { header: "Montant", align: "right", cell: (a) => formatCurrency(a.amount) },
    { header: "Score", cell: (a) => <ScoreChip score={a.score} category={a.score_category} /> },
    { header: "Statut", cell: (a) => <StatusBadge kind="application" status={a.status} /> },
    {
      header: "",
      align: "right",
      cell: (a) =>
        a.converted_client_id ? (
          <span className="text-xs font-medium text-success">Client ✓</span>
        ) : (
          <span className="text-xs text-muted-foreground">Voir →</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Demandes"
        description="Dossiers entrants depuis le site (funnel d'acquisition). Cliquez pour ouvrir le dossier complet."
      />

      <Panel
        title="Liste"
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value as ApplicationStatus | "all")} className="h-9 w-40">
            <option value="all">Tous statuts</option>
            {Object.entries(applicationStatusLabels).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(a) => a.id}
            onRowClick={(a) => router.push(`/admin/applications/${a.id}`)}
            empty={{ title: "Aucune demande" }}
          />
        )}
      </Panel>
    </div>
  );
}
