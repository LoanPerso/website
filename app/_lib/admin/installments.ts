import { supabase } from "@/_lib/supabase";
import { recordPayment } from "./payments";
import type { Installment, OverdueInstallment, PaymentMethod, Result } from "./types";

export interface ListOverdueParams {
  month?: string; // "YYYY-MM" — installments whose due_date falls in this month
  minDaysLate?: number;
  clientId?: string;
}

function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const start = `${y}-${String(m).padStart(2, "0")}-01`;
  const nextY = m === 12 ? y + 1 : y;
  const nextM = m === 12 ? 1 : m + 1;
  const end = `${nextY}-${String(nextM).padStart(2, "0")}-01`;
  return { start, end };
}

// Overdue installments (unpaid and past due) from the reporting view.
export async function listOverdue(params: ListOverdueParams = {}): Promise<Result<OverdueInstallment[]>> {
  const { month, minDaysLate, clientId } = params;
  let query = supabase
    .from("v_installments_status")
    .select("*")
    .eq("is_overdue", true);

  if (clientId) query = query.eq("client_id", clientId);
  if (month) {
    const { start, end } = monthRange(month);
    query = query.gte("due_date", start).lt("due_date", end);
  }
  if (minDaysLate && minDaysLate > 0) query = query.gte("days_late", minDaysLate);

  query = query.order("days_late", { ascending: false });

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as OverdueInstallment[], error: null };
}

// Marks an installment fully paid by recording a payment for the remaining amount.
export async function markInstallmentPaid(
  installment: Installment,
  loanId: string,
  clientId: string | null,
  opts: { method?: PaymentMethod; date?: string } = {}
): Promise<Result<null>> {
  const remaining = Math.round((Number(installment.amount_due) - Number(installment.amount_paid)) * 100) / 100;
  if (remaining <= 0) {
    const { error } = await supabase
      .from("installments")
      .update({ status: "paid", paid_at: opts.date ?? new Date().toISOString().slice(0, 10) })
      .eq("id", installment.id);
    return { data: null, error: error?.message ?? null };
  }

  const res = await recordPayment({
    loan_id: loanId,
    client_id: clientId,
    installment_id: installment.id,
    amount: remaining,
    payment_date: opts.date ?? new Date().toISOString().slice(0, 10),
    method: opts.method ?? "sepa",
  });
  return { data: null, error: res.error };
}

export async function waiveInstallment(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("installments").update({ status: "waived" }).eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
