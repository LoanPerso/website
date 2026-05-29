import { supabase } from "@/_lib/supabase";
import { logActivity } from "./audit";
import type { Payment, PaymentMethod, PaymentStatus, Result } from "./types";

export interface ListPaymentsParams {
  month?: string; // "YYYY-MM"
  method?: PaymentMethod | "all";
  status?: PaymentStatus | "all";
  loanId?: string;
  clientId?: string;
  page?: number;
  pageSize?: number;
}

export type PaymentRow = Payment & {
  loan?: { id: string; reference: string | null } | null;
  client?: { id: string; reference: string | null; first_name: string; last_name: string } | null;
};

const PAYMENT_SELECT =
  "*, loan:loans(id,reference), client:clients(id,reference,first_name,last_name)";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const end = `${nextY}-${String(nextM).padStart(2, "0")}-01`; // first day of next month (TZ-safe)
  return { start, end };
}

export async function listPayments(
  params: ListPaymentsParams = {}
): Promise<Result<{ rows: PaymentRow[]; count: number }>> {
  const { month, method = "all", status = "all", loanId, clientId, page = 1, pageSize = 25 } = params;
  let query = supabase.from("payments").select(PAYMENT_SELECT, { count: "exact" });

  if (method !== "all") query = query.eq("method", method);
  if (status !== "all") query = query.eq("status", status);
  if (loanId) query = query.eq("loan_id", loanId);
  if (clientId) query = query.eq("client_id", clientId);
  if (month) {
    const { start, end } = monthRange(month);
    query = query.gte("payment_date", start).lt("payment_date", end);
  }

  const from = (page - 1) * pageSize;
  query = query.order("payment_date", { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, error: error.message };
  return { data: { rows: (data ?? []) as unknown as PaymentRow[], count: count ?? 0 }, error: null };
}

// Recomputes an installment's paid amount/status from its completed payments.
async function recomputeInstallment(installmentId: string): Promise<void> {
  const { data: inst } = await supabase
    .from("installments")
    .select("id, amount_due")
    .eq("id", installmentId)
    .single();
  if (!inst) return;

  const { data: pays } = await supabase
    .from("payments")
    .select("amount, payment_date")
    .eq("installment_id", installmentId)
    .eq("status", "completed");

  const paid = (pays ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const lastDate = (pays ?? [])
    .map((p) => p.payment_date)
    .sort()
    .at(-1);

  let status: string;
  if (paid >= Number(inst.amount_due)) status = "paid";
  else if (paid > 0) status = "partial";
  else status = "pending";

  await supabase
    .from("installments")
    .update({
      amount_paid: Math.round(paid * 100) / 100,
      status,
      paid_at: status === "paid" ? lastDate ?? null : null,
    })
    .eq("id", installmentId);
}

// Keeps loan status in sync with its schedule. A fully-settled loan becomes
// paid_off (even if it was defaulted); a reversed paid_off loan reopens to active.
// Loans still carrying unpaid installments keep their current status.
async function recomputeLoanStatus(loanId: string): Promise<void> {
  const { data: loan } = await supabase.from("loans").select("status").eq("id", loanId).single();
  if (!loan || ["cancelled", "draft"].includes(loan.status)) return;

  const { count } = await supabase
    .from("installments")
    .select("id", { count: "exact", head: true })
    .eq("loan_id", loanId)
    .neq("status", "paid")
    .neq("status", "waived");

  let next = loan.status;
  if ((count ?? 0) === 0) next = "paid_off";
  else if (loan.status === "paid_off") next = "active";

  if (next !== loan.status) {
    await supabase.from("loans").update({ status: next }).eq("id", loanId);
  }
}

export interface RecordPaymentInput {
  loan_id: string;
  client_id?: string | null;
  installment_id?: string | null;
  amount: number;
  payment_date: string;
  method: PaymentMethod;
  notes?: string | null;
}

export async function recordPayment(input: RecordPaymentInput): Promise<Result<Payment>> {
  // Tied to one installment → single payment row.
  if (input.installment_id) {
    const { data, error } = await supabase
      .from("payments")
      .insert({ ...input, status: "completed" })
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    await recomputeInstallment(input.installment_id);
    await recomputeLoanStatus(input.loan_id);
    await logActivity({ action: "payment.record", entity: "payments", entity_id: data.id, metadata: { amount: input.amount, loan_id: input.loan_id } });
    return { data: data as Payment, error: null };
  }

  // Otherwise allocate the amount across the oldest unsettled installments so the
  // schedule (and loan status) actually advances — used by cash payments and imports.
  const { data: insts, error: instErr } = await supabase
    .from("installments")
    .select("id, amount_due, amount_paid")
    .eq("loan_id", input.loan_id)
    .neq("status", "paid")
    .neq("status", "waived")
    .order("sequence", { ascending: true });
  if (instErr) return { data: null, error: instErr.message };

  let remaining = round2(input.amount);
  let last: Payment | null = null;

  for (const inst of insts ?? []) {
    if (remaining <= 0) break;
    const due = round2(Number(inst.amount_due) - Number(inst.amount_paid));
    if (due <= 0) continue;
    const alloc = round2(Math.min(remaining, due));
    const { data, error } = await supabase
      .from("payments")
      .insert({ ...input, installment_id: inst.id, amount: alloc, status: "completed" })
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    await recomputeInstallment(inst.id);
    remaining = round2(remaining - alloc);
    last = data as Payment;
  }

  // Leftover (overpayment or no open schedule) → unlinked payment row.
  if (remaining > 0) {
    const { data, error } = await supabase
      .from("payments")
      .insert({ ...input, installment_id: null, amount: remaining, status: "completed" })
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    last = (data as Payment) ?? last;
  }

  await recomputeLoanStatus(input.loan_id);
  await logActivity({ action: "payment.record", entity: "payments", entity_id: last?.id ?? null, metadata: { amount: input.amount, loan_id: input.loan_id } });
  return { data: last, error: null };
}

export async function deletePayment(payment: Payment): Promise<Result<null>> {
  const { error } = await supabase.from("payments").delete().eq("id", payment.id);
  if (error) return { data: null, error: error.message };
  if (payment.installment_id) await recomputeInstallment(payment.installment_id);
  await recomputeLoanStatus(payment.loan_id);
  await logActivity({ action: "payment.delete", entity: "payments", entity_id: payment.id, metadata: { amount: payment.amount } });
  return { data: null, error: null };
}

// Move a payment along its status (refund / fail / re-complete). Because the
// installment/loan recompute only counts completed payments, flipping the status
// automatically reverses or re-applies the allocation on the schedule.
export async function setPaymentStatus(payment: Payment, status: PaymentStatus): Promise<Result<Payment>> {
  const { data, error } = await supabase
    .from("payments")
    .update({ status })
    .eq("id", payment.id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  if (payment.installment_id) await recomputeInstallment(payment.installment_id);
  await recomputeLoanStatus(payment.loan_id);
  await logActivity({
    action: `payment.${status}`,
    entity: "payments",
    entity_id: payment.id,
    metadata: { amount: payment.amount, loan_id: payment.loan_id },
  });
  return { data: data as Payment, error: null };
}

export async function refundPayment(payment: Payment): Promise<Result<Payment>> {
  return setPaymentStatus(payment, "refunded");
}

export async function failPayment(payment: Payment): Promise<Result<Payment>> {
  return setPaymentStatus(payment, "failed");
}
