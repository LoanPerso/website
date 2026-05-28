"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Badge } from "@/_components/admin/status-badge";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { listProducts, createProduct, updateProduct, type ProductInput } from "@/_lib/admin/products";
import type { Product } from "@/_lib/admin/types";
import { formatCurrency, formatPercent } from "@/_lib/admin/format";

export default function ProductsPage() {
  const toast = useToast();
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
            onRowClick={(p) => {
              setEditing(p);
              setOpen(true);
            }}
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

const emptyForm = {
  name: "",
  slug: "",
  category: "credit",
  description: "",
  min_amount: "0",
  max_amount: "0",
  min_duration_months: "1",
  max_duration_months: "12",
  min_rate: "0",
  max_rate: "0",
  default_rate: "0",
  application_fee_percent: "0",
  sort_order: "0",
  is_active: "true",
};

function ProductDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: Product | null;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      product
        ? {
            name: product.name,
            slug: product.slug,
            category: product.category,
            description: product.description ?? "",
            min_amount: String(product.min_amount),
            max_amount: String(product.max_amount),
            min_duration_months: String(product.min_duration_months),
            max_duration_months: String(product.max_duration_months),
            min_rate: String(product.min_rate),
            max_rate: String(product.max_rate),
            default_rate: String(product.default_rate),
            application_fee_percent: String(product.application_fee_percent),
            sort_order: String(product.sort_order),
            is_active: String(product.is_active),
          }
        : { ...emptyForm }
    );
  }, [open, product]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.slug) return toast("Nom et slug requis.", "error");
    setSaving(true);
    const payload: ProductInput = {
      name: form.name,
      slug: form.slug,
      category: form.category,
      description: form.description || null,
      min_amount: Number(form.min_amount),
      max_amount: Number(form.max_amount),
      min_duration_months: Number(form.min_duration_months),
      max_duration_months: Number(form.max_duration_months),
      min_rate: Number(form.min_rate),
      max_rate: Number(form.max_rate),
      default_rate: Number(form.default_rate),
      application_fee_percent: Number(form.application_fee_percent),
      sort_order: Number(form.sort_order),
      is_active: form.is_active === "true",
    };
    const res = product ? await updateProduct(product.id, payload) : await createProduct(payload);
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={product ? "Modifier le produit" : "Nouveau produit"}
      wide
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" form="product-form" disabled={saving}>
            {saving ? "…" : "Enregistrer"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4">
        <FieldGrid>
          <Field label="Nom" required>
            <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Slug" required>
            <TextInput value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="micro-credit" />
          </Field>
        </FieldGrid>
        <Field label="Description">
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <FieldGrid>
          <Field label="Montant min (€)">
            <TextInput type="number" value={form.min_amount} onChange={(e) => set("min_amount", e.target.value)} />
          </Field>
          <Field label="Montant max (€)">
            <TextInput type="number" value={form.max_amount} onChange={(e) => set("max_amount", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Durée min (mois)">
            <TextInput type="number" value={form.min_duration_months} onChange={(e) => set("min_duration_months", e.target.value)} />
          </Field>
          <Field label="Durée max (mois)">
            <TextInput type="number" value={form.max_duration_months} onChange={(e) => set("max_duration_months", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Taux min (%)">
            <TextInput type="number" step="0.01" value={form.min_rate} onChange={(e) => set("min_rate", e.target.value)} />
          </Field>
          <Field label="Taux max (%)">
            <TextInput type="number" step="0.01" value={form.max_rate} onChange={(e) => set("max_rate", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Taux par défaut (%)">
            <TextInput type="number" step="0.01" value={form.default_rate} onChange={(e) => set("default_rate", e.target.value)} />
          </Field>
          <Field label="Frais dossier (%)">
            <TextInput type="number" step="0.01" value={form.application_fee_percent} onChange={(e) => set("application_fee_percent", e.target.value)} />
          </Field>
        </FieldGrid>
        <FieldGrid>
          <Field label="Ordre d'affichage">
            <TextInput type="number" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} />
          </Field>
          <Field label="Statut">
            <Select value={form.is_active} onChange={(e) => set("is_active", e.target.value)}>
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </Select>
          </Field>
        </FieldGrid>
      </form>
    </Modal>
  );
}
