"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Pencil, Power } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { Badge, RiskBadge } from "@/_components/admin/status-badge";
import { BackLink, InfoGrid } from "@/_components/admin/detail";
import { RefChip, PanelLoading } from "@/_components/admin/bits";
import { ProductDialog } from "@/_components/admin/forms/product-dialog";
import { useToast } from "@/_components/admin/toast";
import { getProduct, getProductStats, setProductActive, type ProductStats } from "@/_lib/admin/products";
import { monthlyPaymentFor, suggestRate } from "@/_lib/admin/finance";
import { formatCurrency, formatPercent } from "@/_lib/admin/format";
import type { Product, RiskCategory } from "@/_lib/admin/types";

const CATEGORIES: RiskCategory[] = ["A", "B", "C", "D"];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, s] = await Promise.all([getProduct(id), getProductStats(id)]);
    setProduct(p.data);
    setStats(s);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Representative amortization at the midpoint amount/duration, priced per risk
  // category from the product's rate band (mirrors the origination pricing logic).
  const grid = useMemo(() => {
    if (!product) return [];
    const amount = Math.round((product.min_amount + product.max_amount) / 2);
    const months = Math.round((product.min_duration_months + product.max_duration_months) / 2) || 1;
    return CATEGORIES.map((cat) => {
      const rate = suggestRate(product.min_rate, product.max_rate, cat);
      const monthly = monthlyPaymentFor(amount, rate, months);
      const total = Math.round(monthly * months * 100) / 100;
      const interest = Math.round((total - amount) * 100) / 100;
      return { cat, rate, monthly, total, interest };
    });
  }, [product]);

  if (loading) {
    return (
      <div>
        <BackLink href="/admin/products" label="Produits" />
        <PanelLoading rows={5} />
      </div>
    );
  }
  if (!product) {
    return (
      <div>
        <BackLink href="/admin/products" label="Produits" />
        <p className="text-sm text-muted-foreground">Produit introuvable.</p>
      </div>
    );
  }

  const p = product;
  const refAmount = Math.round((p.min_amount + p.max_amount) / 2);
  const refMonths = Math.round((p.min_duration_months + p.max_duration_months) / 2) || 1;

  return (
    <div>
      <BackLink href="/admin/products" label="Produits" />
      <PageHeader
        title={p.name}
        description={p.description ?? "Paramètres et grille tarifaire du produit."}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Modifier
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const res = await setProductActive(p.id, !p.is_active);
                setBusy(false);
                if (res.error) return toast(res.error, "error");
                toast(p.is_active ? "Produit désactivé." : "Produit activé.");
                load();
              }}
            >
              <Power className="h-4 w-4" /> {p.is_active ? "Désactiver" : "Activer"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge tone={p.is_active ? "success" : "neutral"}>{p.is_active ? "Actif" : "Inactif"}</Badge>
        <RefChip value={p.slug} />
        <span className="text-xs text-muted-foreground">Catégorie : {p.category}</span>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Crédits émis" value={String(stats?.loans_count ?? 0)} sub={`${stats?.active_count ?? 0} actifs`} />
        <KpiCard label="Capital prêté" value={formatCurrency(stats?.total_principal ?? 0)} />
        <KpiCard label="Encours restant" value={formatCurrency(stats?.outstanding_principal ?? 0)} tone="warning" />
        <KpiCard label="Taux moyen constaté" value={stats?.avg_rate != null ? formatPercent(stats.avg_rate) : "—"} sub={stats?.defaulted_count ? `${stats.defaulted_count} en défaut` : undefined} tone={stats?.defaulted_count ? "warning" : "default"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Paramètres" className="lg:col-span-1">
          <InfoGrid
            cols={2}
            items={[
              { label: "Montant", value: `${formatCurrency(p.min_amount)} – ${formatCurrency(p.max_amount)}` },
              { label: "Durée", value: `${p.min_duration_months} – ${p.max_duration_months} mois` },
              { label: "Taux", value: `${p.min_rate}% – ${p.max_rate}%` },
              { label: "Taux défaut", value: formatPercent(p.default_rate) },
              { label: "Frais dossier", value: formatPercent(p.application_fee_percent, 1) },
              { label: "Ordre", value: String(p.sort_order) },
            ]}
          />
        </Panel>

        <Panel
          title="Grille tarifaire par catégorie de risque"
          className="lg:col-span-2"
          bodyClassName="p-0"
        >
          <div className="px-4 py-2 text-xs text-muted-foreground">
            Simulation pour {formatCurrency(refAmount)} sur {refMonths} mois (montant/durée médians du produit).
          </div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 text-left">Catégorie</th>
                <th className="px-4 py-2.5 text-right">Taux</th>
                <th className="px-4 py-2.5 text-right">Mensualité</th>
                <th className="px-4 py-2.5 text-right">Intérêts</th>
                <th className="px-4 py-2.5 text-right">Coût total</th>
              </tr>
            </thead>
            <tbody>
              {grid.map((g) => (
                <tr key={g.cat} className="border-t border-border">
                  <td className="px-4 py-2.5"><RiskBadge category={g.cat} /></td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatPercent(g.rate)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(g.monthly, 2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatCurrency(g.interest, 2)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatCurrency(g.total, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Panel title="Règles d'éligibilité" className="mt-6">
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Montant demandé compris entre <span className="font-medium text-foreground">{formatCurrency(p.min_amount)}</span> et <span className="font-medium text-foreground">{formatCurrency(p.max_amount)}</span>.</li>
          <li>• Durée comprise entre <span className="font-medium text-foreground">{p.min_duration_months}</span> et <span className="font-medium text-foreground">{p.max_duration_months}</span> mois.</li>
          <li>• Taux appliqué selon la catégorie de risque, borné par le plafond d'usure du pays du demandeur.</li>
          <li>• Frais de dossier de <span className="font-medium text-foreground">{formatPercent(p.application_fee_percent, 1)}</span> du capital, prélevés au déblocage.</li>
          {!p.is_active ? <li className="text-alert">• Produit inactif : non proposé à de nouvelles demandes.</li> : null}
        </ul>
      </Panel>

      <ProductDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        product={p}
        onSaved={() => {
          load();
          toast("Produit mis à jour.");
        }}
      />
    </div>
  );
}
