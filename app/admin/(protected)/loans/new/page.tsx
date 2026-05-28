"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { Field, FieldGrid, Select, TextInput } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { listClients } from "@/_lib/admin/clients";
import { listProducts } from "@/_lib/admin/products";
import { createLoan } from "@/_lib/admin/loans";
import { buildSchedule, suggestRate } from "@/_lib/admin/finance";
import type { Client, Product, RiskCategory } from "@/_lib/admin/types";
import { formatCurrency, formatDate } from "@/_lib/admin/format";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function NewLoanForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const presetClient = searchParams.get("client") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clientId, setClientId] = useState(presetClient);
  const [productId, setProductId] = useState("");
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(12);
  const [duration, setDuration] = useState(12);
  const [startDate, setStartDate] = useState(todayIso());
  const [purpose, setPurpose] = useState("");
  const [category, setCategory] = useState<RiskCategory | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listClients({ pageSize: 500 }).then((r) => setClients(r.data?.rows ?? []));
    listProducts(true).then((r) => setProducts(r.data ?? []));
  }, []);

  const selectedProduct = products.find((p) => p.id === productId) ?? null;

  // Prefill sensible defaults when the client (risk) or product changes.
  useEffect(() => {
    const client = clients.find((c) => c.id === clientId);
    if (client?.risk_category) setCategory(client.risk_category);
  }, [clientId, clients]);

  useEffect(() => {
    if (!selectedProduct) return;
    const mid = Math.round((selectedProduct.min_amount + selectedProduct.max_amount) / 2);
    setAmount(mid || selectedProduct.min_amount);
    setDuration(selectedProduct.min_duration_months);
    setRate(suggestRate(selectedProduct.min_rate, selectedProduct.max_rate, (category || null) as RiskCategory | null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (selectedProduct) {
      setRate(suggestRate(selectedProduct.min_rate, selectedProduct.max_rate, (category || null) as RiskCategory | null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const calc = useMemo(
    () => buildSchedule(Number(amount) || 0, Number(rate) || 0, Number(duration) || 1, startDate),
    [amount, rate, duration, startDate]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId) {
      toast("Sélectionnez un client.", "error");
      return;
    }
    if (!amount || !duration) {
      toast("Montant et durée requis.", "error");
      return;
    }
    setSaving(true);
    const fee = selectedProduct ? Math.round(((amount * selectedProduct.application_fee_percent) / 100) * 100) / 100 : 0;
    const res = await createLoan({
      client_id: clientId,
      product_id: productId || null,
      principal_amount: Number(amount),
      annual_rate: Number(rate),
      duration_months: Number(duration),
      start_date: startDate,
      purpose: purpose || null,
      risk_category: (category || null) as RiskCategory | null,
      application_fee: fee,
    });
    setSaving(false);
    if (res.error || !res.data) {
      toast(res.error ?? "Erreur", "error");
      return;
    }
    toast("Crédit créé avec échéancier.");
    router.push(`/admin/loans/${res.data.id}`);
  }

  return (
    <div>
      <Link href="/admin/loans" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Crédits
      </Link>
      <PageHeader title="Nouveau crédit" description="Création d'un crédit et de son échéancier." />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Paramètres">
            <div className="space-y-4">
              <FieldGrid>
                <Field label="Client" required>
                  <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.reference} — {c.first_name} {c.last_name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Produit">
                  <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                    <option value="">— Aucun —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field
                  label="Montant (€)"
                  required
                  hint={selectedProduct ? `${formatCurrency(selectedProduct.min_amount)} – ${formatCurrency(selectedProduct.max_amount)}` : undefined}
                >
                  <TextInput type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={0} />
                </Field>
                <Field
                  label="Durée (mois)"
                  required
                  hint={selectedProduct ? `${selectedProduct.min_duration_months} – ${selectedProduct.max_duration_months} mois` : undefined}
                >
                  <TextInput type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field
                  label="Taux annuel (%)"
                  required
                  hint={selectedProduct ? `${selectedProduct.min_rate}% – ${selectedProduct.max_rate}%` : undefined}
                >
                  <TextInput type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} min={0} />
                </Field>
                <Field label="Date de début" required>
                  <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </Field>
              </FieldGrid>

              <FieldGrid>
                <Field label="Catégorie de risque">
                  <Select value={category} onChange={(e) => setCategory(e.target.value as RiskCategory | "")}>
                    <option value="">—</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </Select>
                </Field>
                <Field label="Objet">
                  <TextInput value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="auto, travaux…" />
                </Field>
              </FieldGrid>
            </div>
          </Panel>

          <Panel title={`Échéancier (${calc.schedule.length} échéances)`}>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary/40">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Échéance</th>
                    <th className="px-3 py-2 text-right">Mensualité</th>
                    <th className="px-3 py-2 text-right">Capital</th>
                    <th className="px-3 py-2 text-right">Intérêts</th>
                  </tr>
                </thead>
                <tbody>
                  {calc.schedule.map((s) => (
                    <tr key={s.sequence} className="border-t border-border">
                      <td className="px-3 py-1.5 text-muted-foreground">{s.sequence}</td>
                      <td className="px-3 py-1.5">{formatDate(s.due_date)}</td>
                      <td className="px-3 py-1.5 text-right">{formatCurrency(s.amount_due, 2)}</td>
                      <td className="px-3 py-1.5 text-right text-muted-foreground">{formatCurrency(s.principal_component, 2)}</td>
                      <td className="px-3 py-1.5 text-right text-muted-foreground">{formatCurrency(s.interest_component, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <Panel title="Récapitulatif" className="lg:sticky lg:top-6">
            <dl className="space-y-3 text-sm">
              <SummaryRow label="Mensualité" value={formatCurrency(calc.monthlyPayment, 2)} strong />
              <SummaryRow label="Capital prêté" value={formatCurrency(Number(amount))} />
              <SummaryRow label="Intérêts totaux" value={formatCurrency(calc.totalInterest, 2)} />
              <SummaryRow label="Total à rembourser" value={formatCurrency(calc.totalRepayable, 2)} />
              {selectedProduct && selectedProduct.application_fee_percent > 0 ? (
                <SummaryRow
                  label={`Frais dossier (${selectedProduct.application_fee_percent}%)`}
                  value={formatCurrency((Number(amount) * selectedProduct.application_fee_percent) / 100, 2)}
                />
              ) : null}
            </dl>
            <Button type="submit" className="mt-6 w-full" disabled={saving}>
              {saving ? "Création…" : "Créer le crédit"}
            </Button>
          </Panel>
        </div>
      </form>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-serif text-lg text-foreground" : "font-medium"}>{value}</dd>
    </div>
  );
}

export default function NewLoanPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
      <NewLoanForm />
    </Suspense>
  );
}
