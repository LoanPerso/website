"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { StatusBadge } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { listLoans } from "@/_lib/admin/loans";
import { listProducts } from "@/_lib/admin/products";
import type { LoanStatus, LoanWithClient, Product } from "@/_lib/admin/types";
import { formatCurrency, formatDate, fullName } from "@/_lib/admin/format";

const PAGE_SIZE = 25;

export default function LoansPage() {
  const router = useRouter();
  const [rows, setRows] = useState<LoanWithClient[]>([]);
  const [count, setCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LoanStatus | "all">("all");
  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts().then((r) => setProducts(r.data ?? []));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listLoans({
      search,
      status,
      productId: productId || undefined,
      page,
      pageSize: PAGE_SIZE,
    });
    setRows(res.data?.rows ?? []);
    setCount(res.data?.count ?? 0);
    setLoading(false);
  }, [search, status, productId, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const columns: Column<LoanWithClient>[] = [
    { header: "Réf.", cell: (l) => <span className="font-mono text-xs">{l.reference}</span> },
    { header: "Client", cell: (l) => <span className="font-medium">{fullName(l.client?.first_name, l.client?.last_name)}</span> },
    { header: "Produit", cell: (l) => <span className="text-muted-foreground">{l.product?.name ?? "—"}</span> },
    { header: "Montant", align: "right", cell: (l) => formatCurrency(l.principal_amount) },
    { header: "Taux", align: "right", cell: (l) => `${l.annual_rate} %` },
    { header: "Durée", align: "right", cell: (l) => `${l.duration_months} m` },
    { header: "Début", align: "right", cell: (l) => formatDate(l.start_date) },
    { header: "Statut", cell: (l) => <StatusBadge kind="loan" status={l.status} /> },
  ];

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Crédits"
        description={`${count} crédit${count > 1 ? "s" : ""}`}
        actions={
          <Button asChild>
            <Link href="/admin/loans/new">
              <Plus className="h-4 w-4" /> Nouveau crédit
            </Link>
          </Button>
        }
      />

      <Panel
        title="Liste"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Réf. crédit…"
                className="h-9 w-36 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <Select
              value={productId}
              onChange={(e) => {
                setPage(1);
                setProductId(e.target.value);
              }}
              className="h-9 w-40"
            >
              <option value="">Tous produits</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as LoanStatus | "all");
              }}
              className="h-9 w-36"
            >
              <option value="all">Tous statuts</option>
              <option value="active">En cours</option>
              <option value="paid_off">Soldé</option>
              <option value="defaulted">En défaut</option>
              <option value="draft">Brouillon</option>
              <option value="cancelled">Annulé</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              getKey={(l) => l.id}
              onRowClick={(l) => router.push(`/admin/loans/${l.id}`)}
              empty={{ title: "Aucun crédit", hint: "Créez un crédit ou importez vos données." }}
            />
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Précédent
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}
