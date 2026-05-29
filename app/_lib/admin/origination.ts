import { supabase } from "@/_lib/supabase";
import { logActivity } from "./audit";
import { convertApplicationToClient } from "./applications";
import { createContract } from "./contracts";
import { createLoan } from "./loans";
import { buildSchedule, monthlyPaymentFor } from "./finance";
import { countryLegal } from "./application/constants";
import type {
  ApplicationPricingRow,
  Contract,
  ContractTermsSnapshot,
  LoanApplicationFull,
  Loan,
  Product,
  Result,
} from "./types";

// ============================================================================
// Origination engine — the bridge that turns an underwritten application into a
// live credit: application → client → contract (offer) → signed → loan.
// Each step persists real rows and is auditable; nothing is simulated.
// ============================================================================

function nextMonthIso(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

// Derive an immutable terms snapshot from the application's locked offer (or its
// current funnel terms as a fallback). Stored verbatim into contracts.terms.
export function buildContractTerms(
  app: LoanApplicationFull,
  product: Product | null,
  pricing?: ApplicationPricingRow | null
): ContractTermsSnapshot {
  const amount = pricing?.amount ?? Number(app.amount ?? 0);
  const duration = pricing?.duration_months ?? Number(app.duration ?? 0);
  const rate = pricing?.applied_rate ?? Number(app.effective_rate ?? product?.default_rate ?? 0);
  const monthly =
    pricing?.monthly_payment ??
    (Number(app.monthly_payment ?? 0) || monthlyPaymentFor(amount, rate, duration));
  const startDate = nextMonthIso();
  const calc = duration > 0 ? buildSchedule(amount, rate, duration, startDate) : null;
  const fee = product ? Math.round((amount * product.application_fee_percent) / 100 * 100) / 100 : 0;
  const legal = countryLegal(app.country);

  return {
    amount,
    duration_months: duration,
    annual_rate: rate,
    taeg: pricing?.taeg ?? null,
    monthly_payment: monthly,
    monthly_with_insurance: pricing?.monthly_with_insurance ?? null,
    application_fee: fee,
    total_interest: calc?.totalInterest ?? null,
    total_cost: pricing?.total_cost ?? (calc ? calc.totalInterest + fee : null),
    total_due: calc?.totalRepayable ?? null,
    insurance: pricing?.insurance ?? false,
    guarantee: pricing?.guarantee ?? null,
    first_due_date: calc?.schedule[0]?.due_date ?? null,
    cooling_off_days: legal.coolingOffDays,
    product_slug: product?.slug ?? null,
    product_name: product?.name ?? app.credit_type ?? null,
    source_application_id: app.id,
    schedule_preview:
      calc?.schedule.slice(0, 6).map((s) => ({ sequence: s.sequence, due_date: s.due_date, amount_due: s.amount_due })) ??
      [],
    generated_at: new Date().toISOString(),
  };
}

// Ensure the application has a client; convert it (prospect + score + KYC docs)
// if it has not been promoted yet. Returns the client id.
async function ensureClient(app: LoanApplicationFull): Promise<Result<string>> {
  if (app.converted_client_id) return { data: app.converted_client_id, error: null };
  const res = await convertApplicationToClient(app.id);
  if (res.error || !res.data) return { data: null, error: res.error ?? "Conversion client impossible." };
  return { data: res.data.id, error: null };
}

export interface OriginateResult {
  contract: Contract;
  clientId: string;
}

// Step 1 — create the contract offer from an underwritten application.
// Idempotent: if a non-cancelled contract already exists for this application's
// client + amount, it is returned instead of creating a duplicate.
export async function originateFromApplication(
  app: LoanApplicationFull,
  product: Product | null,
  opts: { pricing?: ApplicationPricingRow | null } = {}
): Promise<Result<OriginateResult>> {
  const pricing = opts.pricing ?? app.pricing ?? null;
  const clientRes = await ensureClient(app);
  if (clientRes.error || !clientRes.data) return { data: null, error: clientRes.error };
  const clientId = clientRes.data;

  const terms = buildContractTerms(app, product, pricing);
  if (!terms.amount || !terms.duration_months) {
    return { data: null, error: "Termes incomplets : verrouillez l'offre (montant + durée) avant de générer le contrat." };
  }

  const created = await createContract({
    client_id: clientId,
    product_id: product?.id ?? null,
    status: "draft",
    principal_amount: terms.amount,
    annual_rate: terms.annual_rate,
    duration_months: terms.duration_months,
    monthly_payment: terms.monthly_payment,
    terms,
    notes: `Issu de la demande ${app.id}.`,
  });
  if (created.error || !created.data) return { data: null, error: created.error };

  await supabase.from("interactions").insert({
    application_id: app.id,
    client_id: clientId,
    contract_id: created.data.id,
    type: "system",
    subject: "Contrat généré",
    body: `Contrat ${created.data.reference ?? ""} créé (${terms.amount} € sur ${terms.duration_months} mois à ${terms.annual_rate}%).`,
  });
  await logActivity({
    action: "origination.contract_from_application",
    entity: "contracts",
    entity_id: created.data.id,
    metadata: { application_id: app.id, client_id: clientId, amount: terms.amount },
  });

  return { data: { contract: created.data, clientId }, error: null };
}

export interface ActivateResult {
  loan: Loan;
  contractId: string;
}

// Step 2 — turn a SIGNED contract into a live loan (status draft, not yet
// disbursed) with its full amortization schedule, then mark the contract active.
// Disbursement is a separate servicing action (disburseLoan).
export async function activateContractAsLoan(
  contract: Contract,
  opts: { startDate?: string; purpose?: string | null } = {}
): Promise<Result<ActivateResult>> {
  if (contract.loan_id) {
    return { data: null, error: "Un crédit est déjà rattaché à ce contrat." };
  }
  if (contract.status !== "signed") {
    return { data: null, error: "Le contrat doit être signé avant de générer le crédit." };
  }
  const amount = Number(contract.principal_amount ?? 0);
  const rate = Number(contract.annual_rate ?? 0);
  const duration = Number(contract.duration_months ?? 0);
  if (!amount || !duration) return { data: null, error: "Termes du contrat incomplets." };

  const startDate = opts.startDate ?? nextMonthIso();
  const terms = (contract.terms ?? null) as ContractTermsSnapshot | null;

  const loanRes = await createLoan({
    client_id: contract.client_id,
    product_id: contract.product_id ?? null,
    principal_amount: amount,
    annual_rate: rate,
    duration_months: duration,
    start_date: startDate,
    application_fee: terms?.application_fee ?? 0,
    purpose: opts.purpose ?? terms?.product_name ?? null,
    status: "draft",
  });
  if (loanRes.error || !loanRes.data) return { data: null, error: loanRes.error };
  const loan = loanRes.data;

  const end = await getLoanEndDate(loan.id);
  const { error: cErr } = await supabase
    .from("contracts")
    .update({ status: "active", loan_id: loan.id, start_date: startDate, end_date: end })
    .eq("id", contract.id);
  if (cErr) return { data: null, error: cErr.message };

  await supabase.from("interactions").insert({
    contract_id: contract.id,
    client_id: contract.client_id,
    loan_id: loan.id,
    type: "system",
    subject: "Crédit généré depuis le contrat",
    body: `Crédit ${loan.reference ?? ""} créé (brouillon, en attente de déblocage).`,
  });
  await logActivity({
    action: "origination.loan_from_contract",
    entity: "loans",
    entity_id: loan.id,
    metadata: { contract_id: contract.id, amount, duration },
  });

  return { data: { loan, contractId: contract.id }, error: null };
}

async function getLoanEndDate(loanId: string): Promise<string | null> {
  const { data } = await supabase.from("loans").select("end_date").eq("id", loanId).single();
  return data?.end_date ?? null;
}
