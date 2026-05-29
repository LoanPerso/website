import { supabase } from "@/_lib/supabase";
import { currentActor, logActivity } from "./audit";
import { computeClientScore, type ScoreResult } from "./scoring";
import type {
  ApplicationConsentRow,
  ApplicationDecisionRow,
  ApplicationPricingRow,
  ApplicationPriority,
  ApplicationRiskReviewRow,
  Interaction,
  InteractionDirection,
  InteractionType,
  LoanApplication,
  LoanApplicationFull,
  Result,
  RiskCategory,
  Task,
  TaskCategory,
  TaskPriority,
} from "./types";
import type { ApplicationStatus } from "./types";

const LIST_SELECT =
  "id,status,credit_type,amount,duration,monthly_payment,effective_rate,country," +
  "first_name,last_name,email,phone,city,converted_client_id,rejection_reason,source," +
  "score,score_category,priority,assigned_to,tags,last_contacted_at,created_at,updated_at";

// Light projection used for cross-application checks (fraud velocity, duplicates).
const PEER_SELECT =
  "id,first_name,last_name,email,phone,id_number,birth_date,country,address_country," +
  "document_bank_url,amount,monthly_net_income,created_at,status";

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

// --- Dossier: edits, workflow, decision, offer, comms --------------------------

// Editable subset of the application (identity, contact, employment, credit terms,
// workflow). Used by the "Modifier" dialog and inline term adjustments.
export type ApplicationPatch = Partial<
  Pick<
    LoanApplicationFull,
    | "first_name" | "last_name" | "email" | "phone" | "birth_date" | "birth_place"
    | "nationality" | "marital_status" | "id_type" | "id_number"
    | "address" | "postal_code" | "city" | "country" | "address_country"
    | "employer_name" | "employer_address" | "job_title" | "contract_type"
    | "start_date" | "monthly_net_income"
    | "credit_type" | "amount" | "duration" | "monthly_payment" | "effective_rate"
    | "document_id_url" | "document_income_url" | "document_address_url" | "document_bank_url"
    | "internal_notes" | "priority" | "tags" | "assigned_to" | "analysis_overrides"
  >
>;

export async function updateApplication(
  id: string,
  patch: ApplicationPatch
): Promise<Result<LoanApplicationFull>> {
  const { data, error } = await supabase
    .from("loan_applications")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as LoanApplicationFull, error: null };
}

// Status transition that stamps the SLA stage timer and logs a system event.
export async function transitionApplication(
  id: string,
  status: ApplicationStatus,
  opts: { rejection_reason?: string | null } = {}
): Promise<Result<LoanApplicationFull>> {
  const patch: Record<string, unknown> = {
    status,
    stage_entered_at: new Date().toISOString(),
  };
  if (opts.rejection_reason !== undefined) patch.rejection_reason = opts.rejection_reason;
  const { data, error } = await supabase
    .from("loan_applications")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  await createApplicationInteraction({
    application_id: id,
    type: "system",
    subject: "Changement de statut",
    body: `Statut → ${status}${opts.rejection_reason ? ` (${opts.rejection_reason})` : ""}`,
  });
  return { data: data as unknown as LoanApplicationFull, error: null };
}

export async function saveDecision(
  id: string,
  decision: ApplicationDecisionRow
): Promise<Result<LoanApplicationFull>> {
  const actor = await currentActor();
  const stamped: ApplicationDecisionRow = {
    ...decision,
    decided_by: decision.decided_by ?? actor.email ?? actor.id,
  };
  const patch: Record<string, unknown> = {
    decision: stamped,
    status: stamped.status,
    stage_entered_at: new Date().toISOString(),
  };
  if (stamped.outcome === "DECLINE") patch.rejection_reason = stamped.justification ?? "Décision défavorable";
  const { data, error } = await supabase
    .from("loan_applications")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  await createApplicationInteraction({
    application_id: id,
    type: "system",
    subject: `Décision : ${stamped.outcome}`,
    body: stamped.justification ?? `Confiance ${stamped.confidence ?? "—"}%`,
  });
  await logActivity({
    action: "application.decide",
    entity: "loan_applications",
    entity_id: id,
    metadata: { outcome: stamped.outcome, status: stamped.status, confidence: stamped.confidence },
  });
  return { data: data as unknown as LoanApplicationFull, error: null };
}

export async function saveRiskReview(
  id: string,
  review: ApplicationRiskReviewRow
): Promise<Result<LoanApplicationFull>> {
  const actor = await currentActor();
  const stamped: ApplicationRiskReviewRow = {
    ...review,
    reviewed_by: review.reviewed_by ?? actor.email ?? actor.id,
  };
  const { data, error } = await supabase
    .from("loan_applications")
    .update({ risk_review: stamped })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  await logActivity({
    action: "application.risk_review",
    entity: "loan_applications",
    entity_id: id,
    metadata: { disposition: stamped.disposition, aml_rating: stamped.aml_rating, sar_filed: stamped.sar_filed },
  });
  return { data: data as unknown as LoanApplicationFull, error: null };
}

export async function saveConsent(
  id: string,
  consent: ApplicationConsentRow
): Promise<Result<LoanApplicationFull>> {
  const { data, error } = await supabase
    .from("loan_applications")
    .update({ consent })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as LoanApplicationFull, error: null };
}

// Persist the locked offer snapshot + move the case to "qualified" and log it.
export async function saveOffer(
  id: string,
  pricing: ApplicationPricingRow
): Promise<Result<LoanApplicationFull>> {
  const { data, error } = await supabase
    .from("loan_applications")
    .update({
      pricing,
      amount: pricing.amount,
      duration: pricing.duration_months,
      effective_rate: pricing.applied_rate,
      monthly_payment: pricing.monthly_payment,
      status: "qualified",
      stage_entered_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return { data: null, error: error.message };
  await createApplicationInteraction({
    application_id: id,
    type: "system",
    subject: "Offre verrouillée",
    body: `${pricing.amount} € sur ${pricing.duration_months} mois à ${pricing.applied_rate}% (TAEG ${pricing.taeg}%)`,
  });
  await createApplicationTask({
    application_id: id,
    title: "Envoyer l'offre et relancer pour signature",
    category: "signature",
    priority: "high",
    due_date: addDays(3),
  });
  return { data: data as unknown as LoanApplicationFull, error: null };
}

export async function markContacted(id: string): Promise<Result<null>> {
  const { error } = await supabase
    .from("loan_applications")
    .update({ last_contacted_at: new Date().toISOString() })
    .eq("id", id);
  return { data: null, error: error?.message ?? null };
}

export async function assignApplication(
  id: string,
  assignedTo: string | null
): Promise<Result<null>> {
  const { error } = await supabase.from("loan_applications").update({ assigned_to: assignedTo }).eq("id", id);
  return { data: null, error: error?.message ?? null };
}

export async function setApplicationPriority(
  id: string,
  priority: ApplicationPriority
): Promise<Result<null>> {
  const { error } = await supabase.from("loan_applications").update({ priority }).eq("id", id);
  return { data: null, error: error?.message ?? null };
}

// --- Dossier: timeline, tasks, peers ------------------------------------------

export interface ApplicationInteractionInput {
  application_id: string;
  type: InteractionType;
  direction?: InteractionDirection | null;
  subject?: string | null;
  body?: string | null;
}

export async function listApplicationInteractions(applicationId: string): Promise<Result<Interaction[]>> {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("application_id", applicationId)
    .order("occurred_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Interaction[], error: null };
}

export async function createApplicationInteraction(
  input: ApplicationInteractionInput
): Promise<Result<Interaction>> {
  const { data, error } = await supabase.from("interactions").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Interaction, error: null };
}

export interface ApplicationTaskInput {
  application_id: string;
  title: string;
  description?: string | null;
  category?: TaskCategory;
  priority?: TaskPriority;
  due_date?: string | null;
}

export async function listApplicationTasks(applicationId: string): Promise<Result<Task[]>> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("application_id", applicationId)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Task[], error: null };
}

export async function createApplicationTask(input: ApplicationTaskInput): Promise<Result<Task>> {
  const { data, error } = await supabase.from("tasks").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Task, error: null };
}

export async function listApplicationPeers(): Promise<Result<LoanApplicationFull[]>> {
  const { data, error } = await supabase.from("loan_applications").select(PEER_SELECT);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as LoanApplicationFull[], error: null };
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
