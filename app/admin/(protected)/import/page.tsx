"use client";

import { useCallback, useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel, EmptyState } from "@/_components/admin/panel";
import { Field, Select } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import {
  parseCsv,
  importClients,
  importLoans,
  importPayments,
  listImportBatches,
  type ImportResult,
  type ParsedCsv,
} from "@/_lib/admin/import";
import { formatDate } from "@/_lib/admin/format";

type Entity = "clients" | "loans" | "payments";

const templates: Record<Entity, string> = {
  clients: "first_name, last_name, email, phone, city, country, monthly_net_income, risk_category, status",
  loans: "client_reference (ou client_email), product_slug, principal_amount, annual_rate, duration_months, start_date, purpose",
  payments: "loan_reference, amount, payment_date, method",
};

interface Batch {
  id: string;
  entity: string;
  filename: string | null;
  total_rows: number;
  inserted_rows: number;
  failed_rows: number;
  status: string;
  created_at: string;
}

export default function ImportPage() {
  const toast = useToast();
  const [entity, setEntity] = useState<Entity>("clients");
  const [raw, setRaw] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);

  const loadBatches = useCallback(async () => {
    const res = await listImportBatches();
    setBatches((res.data as Batch[]) ?? []);
  }, []);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  function handleParse(text: string) {
    setRaw(text);
    setResult(null);
    if (text.trim()) setParsed(parseCsv(text));
    else setParsed(null);
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    handleParse(await file.text());
  }

  async function runImport() {
    if (!parsed || !parsed.rows.length) {
      toast("Aucune ligne à importer.", "error");
      return;
    }
    setImporting(true);
    const fn = entity === "clients" ? importClients : entity === "loans" ? importLoans : importPayments;
    const res = await fn(parsed.rows, filename);
    setImporting(false);
    if (res.error || !res.data) {
      toast(res.error ?? "Erreur", "error");
      return;
    }
    setResult(res.data);
    toast(`${res.data.inserted} ligne(s) importée(s).`, res.data.failed ? "info" : "success");
    loadBatches();
  }

  return (
    <div>
      <PageHeader title="Import de données" description="Importez clients, crédits et paiements depuis un fichier CSV." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="1 · Source">
            <div className="space-y-4">
              <Field label="Type de données">
                <Select
                  value={entity}
                  onChange={(e) => {
                    setEntity(e.target.value as Entity);
                    setResult(null);
                  }}
                >
                  <option value="clients">Clients</option>
                  <option value="loans">Crédits</option>
                  <option value="payments">Paiements</option>
                </Select>
              </Field>

              <p className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Colonnes attendues :</span> {templates[entity]}
              </p>

              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm hover:bg-secondary/40">
                  <Upload className="h-4 w-4" />
                  Choisir un fichier CSV
                  <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
                </label>
                {filename ? <span className="text-xs text-muted-foreground">{filename}</span> : null}
              </div>

              <Field label="… ou coller le CSV">
                <textarea
                  value={raw}
                  onChange={(e) => {
                    setFilename(null);
                    handleParse(e.target.value);
                  }}
                  placeholder={`${templates[entity]}\n…`}
                  className="min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </Field>
            </div>
          </Panel>

          {parsed && parsed.rows.length ? (
            <Panel title={`2 · Aperçu (${parsed.rows.length} lignes)`} bodyClassName="p-0">
              <div className="max-h-72 overflow-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-secondary/40">
                    <tr>
                      {parsed.headers.map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.rows.slice(0, 12).map((r, i) => (
                      <tr key={i} className="border-t border-border">
                        {parsed.headers.map((h) => (
                          <td key={h} className="px-3 py-1.5">
                            {r[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          ) : null}

          {result ? (
            <Panel title="3 · Résultat">
              <div className="flex gap-6 text-sm">
                <span className="text-success">{result.inserted} importées</span>
                <span className="text-error">{result.failed} échouées</span>
                <span className="text-muted-foreground">{result.total} au total</span>
              </div>
              {result.errors.length ? (
                <div className="mt-3 max-h-40 overflow-auto rounded-md border border-error/20 bg-error/5 p-3 text-xs">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-error">
                      Ligne {e.row} : {e.message}
                    </p>
                  ))}
                </div>
              ) : null}
            </Panel>
          ) : null}
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Panel title="Action">
            <p className="mb-4 text-sm text-muted-foreground">
              {parsed?.rows.length ? `${parsed.rows.length} ligne(s) prêtes.` : "Chargez un CSV pour commencer."}
            </p>
            <Button className="w-full" onClick={runImport} disabled={!parsed?.rows.length || importing}>
              {importing ? "Import en cours…" : "Importer"}
            </Button>
          </Panel>

          <Panel title="Historique">
            {batches.length ? (
              <ul className="space-y-3 text-sm">
                {batches.map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{b.entity}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.created_at)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {b.inserted_rows}/{b.total_rows}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Aucun import" />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
