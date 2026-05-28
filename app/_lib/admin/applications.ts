import { supabase } from "@/_lib/supabase";
import { computeClientScore, type ScoreResult } from "./scoring";
import type {
  ApplicationStatus,
  LoanApplication,
  LoanApplicationFull,
  Result,
  RiskCategory,
} from "./types";

const LIST_SELECT =
  "id,status,credit_type,amount,duration,monthly_payment,effective_rate,country," +
  "first_name,last_name,email,phone,city,converted_client_id,rejection_reason,source," +
  "score,score_category,created_at,updated_at";

export async function listApplications(
  status: ApplicationStatus | "all" = "all"
): Promise<Result<LoanApplication[]>> {
  let query = supabase
    .from("loan_applications")
    .select(LIST_SELECT)
    .order("created_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as LoanApplication[], error: null };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Result<LoanApplication>> {
  const { data, error } = await supabase
    .from("loan_applications")
    .update({ status })
    .eq("id", id)
    .select(LIST_SELECT)
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as LoanApplication, error: null };
}

function toIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const m = value.match(/^(\d{2})[/.-](\d{2})[/.-](\d{4})$/); // DD/MM/YYYY
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// Promote an inbound application to a client (prospect), wiring the realistic
// pipeline: score the file, carry over KYC documents, log the conversion as an
// interaction and open a follow-up task. Idempotent on the application link.
export async function convertApplicationToClient(appId: string): Promise<Result<{ id: string }>> {
  const { data: app, error: appErr } = await supabase
    .from("loan_applications")
    .select("*")
    .eq("id", appId)
    .single();
  if (appErr || !app) return { data: null, error: appErr?.message ?? "Demande introuvable." };
  if (app.converted_client_id) return { data: { id: app.converted_client_id }, error: null };

  const birthDate = toIsoDate(app.birth_date);
  const employment = app.contract_type ? String(app.contract_type).toLowerCase() : null;

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      first_name: app.first_name ?? "—",
      last_name: app.last_name ?? "—",
      email: app.email,
      phone: app.phone,
      address: app.address,
      postal_code: app.postal_code,
      city: app.city,
      country: app.country ?? app.address_country ?? "EE",
      birth_date: birthDate,
      employer_name: app.employer_name,
      employment_status: employment,
      monthly_net_income: app.monthly_net_income,
      status: "prospect",
      consent_given_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error || !client) return { data: null, error: error?.message ?? "Création client impossible." };

  const result = computeClientScore({
    employmentStatus: employment,
    monthlyNetIncome: app.monthly_net_income,
    birthDate,
  });
  await supabase.from("client_scores").insert({
    client_id: client.id,
    score: result.score,
    category: result.category,
    factors: result.factors,
    reason_codes: result.reasonCodes,
    dti: result.dti,
    is_complete: result.complete,
    model_version: result.modelVersion,
    source: "conversion",
  });
  await supabase
    .from("clients")
    .update({
      credit_score: result.score,
      risk_category: result.category,
      score_updated_at: new Date().toISOString(),
    })
    .eq("id", client.id);

  const docs = [
    { type: "id", url: app.document_id_url },
    { type: "income", url: app.document_income_url },
    { type: "address", url: app.document_address_url },
    { type: "bank", url: app.document_bank_url },
  ].map((d) => ({
    client_id: client.id,
    application_id: app.id,
    type: d.type,
    url: d.url ?? null,
    status: d.url ? "received" : "missing",
    uploaded_at: d.url ? new Date().toISOString() : null,
  }));
  await supabase.from("client_documents").insert(docs);

  await supabase.from("interactions").insert({
    client_id: client.id,
    application_id: app.id,
    type: "system",
    subject: "Demande convertie en client",
    body: `Issue de la demande ${app.credit_type ?? ""} (${app.amount ?? "—"} €).`,
  });

  const due = new Date();
  due.setDate(due.getDate() + 3);
  await supabase.from("tasks").insert({
    client_id: client.id,
    application_id: app.id,
    title: "Compléter le dossier KYC & préparer le contrat",
    category: "kyc",
    priority: "high",
    due_date: due.toISOString().slice(0, 10),
  });

  await supabase
    .from("loan_applications")
    .update({ status: "approved", converted_client_id: client.id })
    .eq("id", app.id);

  return { data: { id: client.id }, error: null };
}

export async function getApplicationFull(id: string): Promise<Result<LoanApplicationFull>> {
  const { data, error } = await supabase.from("loan_applications").select("*").eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as LoanApplicationFull, error: null };
}

// Score an application from the funnel data we have at this stage (employment,
// income, age, employment seniority). Housing/credit-history are unknown until KYC,
// so the engine renormalises and flags the result incomplete.
export function computeApplicationScore(app: LoanApplicationFull): ScoreResult {
  return computeClientScore({
    employmentStatus: app.contract_type,
    employmentSince: toIsoDate(app.start_date),
    monthlyNetIncome: app.monthly_net_income,
    monthlyExpenses: null,
    existingMonthlyDebt: 0,
    birthDate: toIsoDate(app.birth_date),
  });
}

export async function recomputeApplicationScore(
  app: LoanApplicationFull
): Promise<Result<{ score: number; category: RiskCategory }>> {
  const r = computeApplicationScore(app);
  const { error } = await supabase
    .from("loan_applications")
    .update({ score: r.score, score_category: r.category })
    .eq("id", app.id);
  if (error) return { data: null, error: error.message };
  return { data: { score: r.score, category: r.category }, error: null };
}
