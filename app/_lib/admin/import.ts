import { supabase } from "@/_lib/supabase";
import { createLoan } from "./loans";
import { recordPayment } from "./payments";
import type { PaymentMethod, Result } from "./types";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export interface ImportResult {
  total: number;
  inserted: number;
  failed: number;
  errors: { row: number; message: string }[];
}

// --- CSV parsing -------------------------------------------------------------
export function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] ?? "";
  const semi = (firstLine.match(/;/g) ?? []).length;
  const comma = (firstLine.match(/,/g) ?? []).length;
  return semi > comma ? ";" : ",";
}

export function parseCsv(text: string, delimiter?: string): ParsedCsv {
  const d = delimiter ?? detectDelimiter(text);
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === d) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((v) => v.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((v) => v.trim() !== "")) rows.push(row);
  }

  if (!rows.length) return { headers: [], rows: [] };
  const headers = rows[0].map((h) => h.trim());
  const objects = rows.slice(1).map((r) => {
    const o: Record<string, string> = {};
    headers.forEach((h, idx) => (o[h] = (r[idx] ?? "").trim()));
    return o;
  });
  return { headers, rows: objects };
}

// --- value helpers -----------------------------------------------------------
function norm(k: string): string {
  return k.toLowerCase().replace(/[\s_-]+/g, "").trim();
}

function pick(row: Record<string, string>, aliases: string[]): string | undefined {
  const map = new Map(Object.keys(row).map((k) => [norm(k), k]));
  for (const a of aliases) {
    const key = map.get(norm(a));
    if (key !== undefined && row[key] !== "") return row[key];
  }
  return undefined;
}

function parseNum(v: string | undefined): number | undefined {
  if (v === undefined || v === "") return undefined;
  let s = v.replace(/\s/g, "").replace(/[€$]/g, "");
  if (s.includes(",") && !s.includes(".")) s = s.replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function parseDate(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const s = v.trim();
  // DD/MM/YYYY or DD-MM-YYYY
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return undefined;
}

async function recordBatch(
  entity: "clients" | "loans" | "payments",
  filename: string | null,
  res: ImportResult
): Promise<void> {
  await supabase.from("import_batches").insert({
    entity,
    filename,
    total_rows: res.total,
    inserted_rows: res.inserted,
    failed_rows: res.failed,
    status: res.failed === 0 ? "completed" : res.inserted === 0 ? "failed" : "partial",
    error_log: res.errors.length ? res.errors : null,
  });
}

// --- Importers ---------------------------------------------------------------
export async function importClients(
  rows: Record<string, string>[],
  filename: string | null = null
): Promise<Result<ImportResult>> {
  const res: ImportResult = { total: rows.length, inserted: 0, failed: 0, errors: [] };

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const first = pick(r, ["first_name", "prenom", "firstname"]);
    const last = pick(r, ["last_name", "nom", "lastname"]);
    if (!first || !last) {
      res.failed++;
      res.errors.push({ row: i + 2, message: "first_name / last_name manquant" });
      continue;
    }
    const payload = {
      first_name: first,
      last_name: last,
      email: pick(r, ["email", "mail", "courriel"]) ?? null,
      phone: pick(r, ["phone", "telephone", "tel", "mobile"]) ?? null,
      city: pick(r, ["city", "ville"]) ?? null,
      country: pick(r, ["country", "pays"]) ?? "EE",
      address: pick(r, ["address", "adresse"]) ?? null,
      postal_code: pick(r, ["postal_code", "code_postal", "zip", "cp"]) ?? null,
      employment_status: pick(r, ["employment_status", "emploi", "statut_emploi"]) ?? null,
      monthly_net_income: parseNum(pick(r, ["monthly_net_income", "revenu", "income", "salaire"])) ?? null,
      risk_category: pick(r, ["risk_category", "categorie", "risk"]) ?? null,
      status: (pick(r, ["status", "statut"]) ?? "active") as never,
      notes: pick(r, ["notes", "note", "commentaire"]) ?? null,
    };
    const { error } = await supabase.from("clients").insert(payload);
    if (error) {
      res.failed++;
      res.errors.push({ row: i + 2, message: error.message });
    } else {
      res.inserted++;
    }
  }

  await recordBatch("clients", filename, res);
  return { data: res, error: null };
}

export async function importLoans(
  rows: Record<string, string>[],
  filename: string | null = null
): Promise<Result<ImportResult>> {
  const res: ImportResult = { total: rows.length, inserted: 0, failed: 0, errors: [] };

  const [{ data: clients }, { data: products }] = await Promise.all([
    supabase.from("clients").select("id, reference, email"),
    supabase.from("products").select("id, slug"),
  ]);
  const byRef = new Map((clients ?? []).map((c) => [norm(c.reference ?? ""), c.id]));
  const byEmail = new Map((clients ?? []).map((c) => [norm(c.email ?? ""), c.id]));
  const prodBySlug = new Map((products ?? []).map((p) => [norm(p.slug), p.id]));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const clientRef = pick(r, ["client_reference", "client_ref", "reference_client"]);
    const clientEmail = pick(r, ["client_email", "email"]);
    const clientId =
      (clientRef && byRef.get(norm(clientRef))) || (clientEmail && byEmail.get(norm(clientEmail)));
    if (!clientId) {
      res.failed++;
      res.errors.push({ row: i + 2, message: "client introuvable (reference/email)" });
      continue;
    }
    const principal = parseNum(pick(r, ["principal_amount", "montant", "amount"]));
    const rate = parseNum(pick(r, ["annual_rate", "taux", "rate"]));
    const duration = parseNum(pick(r, ["duration_months", "duree", "duration", "mois"]));
    if (!principal || rate === undefined || !duration) {
      res.failed++;
      res.errors.push({ row: i + 2, message: "montant / taux / durée invalide" });
      continue;
    }
    const productSlug = pick(r, ["product_slug", "produit", "product"]);
    const startDate = parseDate(pick(r, ["start_date", "date_debut", "date"])) ?? new Date().toISOString().slice(0, 10);

    const { error } = await createLoan({
      client_id: clientId as string,
      product_id: (productSlug && (prodBySlug.get(norm(productSlug)) as string)) || null,
      principal_amount: principal,
      annual_rate: rate,
      duration_months: Math.round(duration),
      start_date: startDate,
      purpose: pick(r, ["purpose", "objet", "motif"]) ?? null,
      status: (pick(r, ["status", "statut"]) as never) ?? "active",
    });
    if (error) {
      res.failed++;
      res.errors.push({ row: i + 2, message: error });
    } else {
      res.inserted++;
    }
  }

  await recordBatch("loans", filename, res);
  return { data: res, error: null };
}

export async function importPayments(
  rows: Record<string, string>[],
  filename: string | null = null
): Promise<Result<ImportResult>> {
  const res: ImportResult = { total: rows.length, inserted: 0, failed: 0, errors: [] };

  const { data: loans } = await supabase.from("loans").select("id, reference, client_id");
  const byRef = new Map((loans ?? []).map((l) => [norm(l.reference ?? ""), l]));

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const loanRef = pick(r, ["loan_reference", "loan_ref", "reference_pret", "reference"]);
    const loan = loanRef ? byRef.get(norm(loanRef)) : undefined;
    if (!loan) {
      res.failed++;
      res.errors.push({ row: i + 2, message: "prêt introuvable (loan_reference)" });
      continue;
    }
    const amount = parseNum(pick(r, ["amount", "montant"]));
    if (!amount) {
      res.failed++;
      res.errors.push({ row: i + 2, message: "montant invalide" });
      continue;
    }
    const payment_date = parseDate(pick(r, ["payment_date", "date_paiement", "date"])) ?? new Date().toISOString().slice(0, 10);
    const method = (pick(r, ["method", "moyen", "mode"]) ?? "transfer") as PaymentMethod;

    // Allocate against the loan's schedule so imported history settles installments.
    const { error } = await recordPayment({
      loan_id: loan.id,
      client_id: loan.client_id,
      amount,
      payment_date,
      method,
    });
    if (error) {
      res.failed++;
      res.errors.push({ row: i + 2, message: error });
    } else {
      res.inserted++;
    }
  }

  await recordBatch("payments", filename, res);
  return { data: res, error: null };
}

export async function listImportBatches(): Promise<Result<unknown[]>> {
  const { data, error } = await supabase
    .from("import_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
