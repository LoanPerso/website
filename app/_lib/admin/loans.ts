import { supabase } from "@/_lib/supabase";
import { buildSchedule } from "./finance";
import type {
  Installment,
  Interaction,
  Loan,
  LoanStatus,
  LoanWithClient,
  Result,
  RiskCategory,
} from "./types";

export interface ListLoansParams {
  search?: string;
  status?: LoanStatus | "all";
  productId?: string;
  clientId?: string;
  page?: number;
  pageSize?: number;
}

const LOAN_SELECT =
  "*, client:clients(id,reference,first_name,last_name), product:products(id,slug,name)";

export async function listLoans(
  params: ListLoansParams = {}
): Promise<Result<{ rows: LoanWithClient[]; count: number }>> {
  const { search, status = "all", productId, clientId, page = 1, pageSize = 25 } = params;
  let query = supabase.from("loans").select(LOAN_SELECT, { count: "exact" });

  if (status !== "all") query = query.eq("status", status);
  if (productId) query = query.eq("product_id", productId);
  if (clientId) query = query.eq("client_id", clientId);
  if (search && search.trim()) {
    query = query.ilike("reference", `%${search.trim()}%`);
  }

  const from = (page - 1) * pageSize;
  query = query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, error: error.message };
  return { data: { rows: (data ?? []) as unknown as LoanWithClient[], count: count ?? 0 }, error: null };
}

export async function getLoan(id: string): Promise<Result<LoanWithClient>> {
  const { data, error } = await supabase.from("loans").select(LOAN_SELECT).eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as LoanWithClient, error: null };
}

export async function getLoanInstallments(loanId: string): Promise<Result<Installment[]>> {
  const { data, error } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", loanId)
    .order("sequence", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Installment[], error: null };
}

export async function listLoanInteractions(loanId: string): Promise<Result<Interaction[]>> {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("loan_id", loanId)
    .order("occurred_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Interaction[], error: null };
}

export interface CreateLoanInput {
  client_id: string;
  product_id: string | null;
  principal_amount: number;
  annual_rate: number;
  duration_months: number;
  start_date: string;
  purpose?: string | null;
  risk_category?: RiskCategory | null;
  application_fee?: number;
  status?: LoanStatus;
}

// Creates a loan and its full amortization schedule (installments) atomically
// enough for an admin tool: the loan is inserted first, then its installments.
export async function createLoan(input: CreateLoanInput): Promise<Result<Loan>> {
  const calc = buildSchedule(
    input.principal_amount,
    input.annual_rate,
    input.duration_months,
    input.start_date
  );
  const endDate = calc.schedule.at(-1)?.due_date ?? input.start_date;
  const status = input.status ?? "active";

  const { data: loan, error: loanError } = await supabase
    .from("loans")
    .insert({
      client_id: input.client_id,
      product_id: input.product_id,
      principal_amount: input.principal_amount,
      annual_rate: input.annual_rate,
      duration_months: input.duration_months,
      monthly_payment: calc.monthlyPayment,
      total_interest: calc.totalInterest,
      total_repayable: calc.totalRepayable,
      application_fee: input.application_fee ?? 0,
      purpose: input.purpose ?? null,
      risk_category: input.risk_category ?? null,
      status,
      start_date: input.start_date,
      end_date: endDate,
      // A draft loan is not disbursed yet — disbursement is an explicit servicing step.
      disbursed_at: status === "draft" ? null : input.start_date,
    })
    .select()
    .single();

  if (loanError) return { data: null, error: loanError.message };

  const rows = calc.schedule.map((s) => ({
    loan_id: loan.id,
    sequence: s.sequence,
    due_date: s.due_date,
    amount_due: s.amount_due,
    principal_component: s.principal_component,
    interest_component: s.interest_component,
  }));

  const { error: instError } = await supabase.from("installments").insert(rows);
  if (instError) {
    // roll back the loan so we never leave a loan without a schedule
    await supabase.from("loans").delete().eq("id", loan.id);
    return { data: null, error: `Échéancier: ${instError.message}` };
  }

  return { data: loan as Loan, error: null };
}

export async function updateLoanStatus(id: string, status: LoanStatus): Promise<Result<Loan>> {
  const { data, error } = await supabase
    .from("loans")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as Loan, error: null };
}

export async function deleteLoan(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("loans").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
