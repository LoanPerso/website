"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Badge } from "@/_components/admin/status-badge";
import { ProductDialog } from "@/_components/admin/forms/product-dialog";
import { useToast } from "@/_components/admin/toast";
import { listProducts } from "@/_lib/admin/products";
import type { Product } from "@/_lib/admin/types";
import { formatCurrency, formatPercent } from "@/_lib/admin/format";

export default function ProductsPage() {
  const toast = useToast();
  const router = useRouter();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listProducts();
    setRows(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<Product>[] = [
    {
      header: "Produit",
      cell: (p) => (
        <div>
          <span className="font-medium">{p.name}</span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">{p.slug}</span>
        </div>
      ),
    },
    {
      header: "Montant",
      align: "right",
      cell: (p) => `${formatCurrency(p.min_amount)} – ${formatCurrency(p.max_amount)}`,
    },
    {
      header: "Durée",
      align: "right",
      cell: (p) => `${p.min_duration_months}–${p.max_duration_months} m`,
    },
    {
      header: "Taux",
      align: "right",
      cell: (p) => `${p.min_rate}–${p.max_rate}%`,
    },
    { header: "Frais", align: "right", cell: (p) => formatPercent(p.application_fee_percent, 1) },
    {
      header: "Statut",
      cell: (p) => <Badge tone={p.is_active ? "success" : "neutral"}>{p.is_active ? "Actif" : "Inactif"}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Produits"
        description="Catalogue des crédits proposés et leurs paramètres."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nouveau produit
          </Button>
        }
      />

      <Panel title="Catalogue">
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            getKey={(p) => p.id}
            onRowClick={(p) => router.push(`/admin/products/${p.id}`)}
            empty={{ title: "Aucun produit" }}
          />
        )}
      </Panel>

      <ProductDialog
        open={open}
        onOpenChange={setOpen}
        product={editing}
        onSaved={() => {
          load();
          toast(editing ? "Produit mis à jour." : "Produit créé.");
        }}
      />
    </div>
  );
}
