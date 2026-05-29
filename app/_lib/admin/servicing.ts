import { supabase } from "@/_lib/supabase";
import { logActivity } from "./audit";
import { buildSchedule } from "./finance";
import type { Installment, Loan, LoanStatus, PaymentMethod, Result } from "./types";

// ============================================================================
// Loan servicing engine — operations on a live credit after origination:
// disbursement, early settlement, restructuring, write-off and reactivation.
// All steps persist real rows, keep the schedule coherent and are auditable.
// ============================================================================

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface LoanBalance {
  total_paid: number;
  outstanding_total: number;
  outstanding_principal: number;
}

// Read the canonical balances from the reporting view (collected vs outstanding).
export async function getLoanBalance(loanId: string): Promise<LoanBalance> {
  const { data } = await supabase
    .from("v_loan_balances")
    .select("total_paid, outstanding_total, outstanding_principal")
    .eq("loan_id", loanId)
    .single();
  return {
    total_paid: Number(data?.total_paid ?? 0),
    outstanding_total: Number(data?.outstanding_total ?? 0),
    outstanding_principal: Number(data?.outstanding_principal ?? 0),
  };
}

// ----------------------------------------------------------------------------
// Disbursement — release the funds on a draft loan.
// ----------------------------------------------------------------------------
export async function disburseLoan(
  loan: Loan,
  opts: { date?: string; method?: PaymentMethod; note?: string } = {}
): Promise<Result<Loan>> {
  if (loan.status !== "draft") {
    return { data: null, error: "Seul un crédit en brouillon peut être débloqué." };
  }
  const date = opts.date ?? todayIso();
  const { data, error } = await supabase
    .from("loans")
    .update({ status: "active", disbursed_at: date, start_date: date })
    .eq("id", loan.id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };

  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "system",
    subject: "Fonds débloqués",
    body: `${loan.principal_amount} € versés le ${date}${opts.note ? ` — ${opts.note}` : ""}.`,
  });
  await logActivity({
    action: "loan.disburse",
    entity: "loans",
    entity_id: loan.id,
    metadata: { amount: loan.principal_amount, date, method: opts.method ?? "transfer" },
  });
  return { data: data as Loan, error: null };
}

// ----------------------------------------------------------------------------
// Early settlement — quote then settle.
// Payoff = outstanding principal + interest already due but unpaid + accrued
// late fees + a capped early-repayment indemnity (EU consumer-credit: ≤ 1%).
// ----------------------------------------------------------------------------
export interface PayoffQuote {
  outstanding_principal: number;
  accrued_interest: number;
  late_fees: number;
  indemnity: number;
  total: number;
  forgone_interest: number; // interest the borrower saves by settling now
}

export async function payoffQuote(loanId: string, asOf?: string): Promise<Result<PayoffQuote>> {
  const date = asOf ?? todayIso();
  const balance = await getLoanBalance(loanId);
  const { data: insts, error } = await supabase
    .from("installments")
    .select("*")
    .eq("loan_id", loanId)
    .order("sequence", { ascending: true });
  if (error) return { data: null, error: error.message };

  let accrued = 0; // interest on installments already due but not yet settled
  let forgone = 0; // interest on installments still in the future
  for (const i of (insts ?? []) as Installment[]) {
    if (i.status === "paid" || i.status === "waived") continue;
    if (i.due_date <= date) accrued += Number(i.interest_component);
    else forgone += Number(i.interest_component);
  }
  const lateFees = ((insts ?? []) as Installment[]).reduce((s, i) => s + Number(i.late_fee ?? 0), 0);
  const principal = round2(balance.outstanding_principal);
  const indemnity = round2(principal * 0.01);
  const total = round2(principal + accrued + lateFees + indemnity);
  return {
    data: {
      outstanding_principal: principal,
      accrued_interest: round2(accrued),
      late_fees: round2(lateFees),
      indemnity,
      total,
      forgone_interest: round2(forgone),
    },
    error: null,
  };
}

// Settle a loan early: record the payoff cash, close the schedule (due-but-unpaid
// installments are marked paid → their interest is earned; future installments are
// waived → their interest is forgone) and close the loan as settled_early.
export async function settleLoan(
  loan: Loan,
  opts: { date?: string; method?: PaymentMethod } = {}
): Promise<Result<Loan>> {
  if (!["active", "defaulted"].includes(loan.status)) {
    return { data: null, error: "Seul un crédit actif ou en défaut peut être soldé." };
  }
  const date = opts.date ?? todayIso();
  const q = await payoffQuote(loan.id, date);
  if (q.error || !q.data) return { data: null, error: q.error };

  // Cash received for the early settlement.
  const { error: payErr } = await supabase.from("payments").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    amount: q.data.total,
    payment_date: date,
    method: opts.method ?? "transfer",
    status: "completed",
    notes: `Solde anticipé (capital ${q.data.outstanding_principal} € + intérêts ${q.data.accrued_interest} € + indemnité ${q.data.indemnity} €).`,
  });
  if (payErr) return { data: null, error: payErr.message };

  // Close the schedule: due-but-unpaid → paid ; future → waived.
  const { data: insts } = await supabase
    .from("installments")
    .select("id, due_date, amount_due, status")
    .eq("loan_id", loan.id)
    .not("status", "in", "(paid,waived)");
  for (const i of (insts ?? []) as Pick<Installment, "id" | "due_date" | "amount_due" | "status">[]) {
    const settled = i.due_date <= date;
    await supabase
      .from("installments")
      .update(
        settled
          ? { status: "paid", amount_paid: i.amount_due, paid_at: date }
          : { status: "waived" }
      )
      .eq("id", i.id);
  }

  const { data, error } = await supabase
    .from("loans")
    .update({ status: "paid_off", closed_at: date, closure_reason: "settled_early" })
    .eq("id", loan.id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };

  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "system",
    subject: "Crédit soldé par anticipation",
    body: `Règlement de ${q.data.total} € le ${date}. Intérêts économisés : ${q.data.forgone_interest} €.`,
  });
  await logActivity({
    action: "loan.settle_early",
    entity: "loans",
    entity_id: loan.id,
    metadata: { total: q.data.total, forgone_interest: q.data.forgone_interest, date },
  });
  return { data: data as Loan, error: null };
}

// ----------------------------------------------------------------------------
// Restructuring — re-amortize the remaining balance over new terms.
// Keeps already-paid installments; replaces the unpaid tail with a fresh schedule.
// ----------------------------------------------------------------------------
export interface RestructureInput {
  newRate?: number; // annual %, defaults to current
  newDurationMonths: number; // number of remaining installments after restructure
  firstDueDate?: string; // ISO date of the first new installment
  reason?: string;
}

export async function restructureLoan(loan: Loan, input: RestructureInput): Promise<Result<Loan>> {
  if (loan.status !== "active") {
    return { data: null, error: "Seul un crédit actif peut être restructuré." };
  }
  const balance = await getLoanBalance(loan.id);
  const principal = round2(balance.outstanding_principal);
  if (principal <= 0) return { data: null, error: "Aucun capital restant à restructurer." };
  if (input.newDurationMonths <= 0) return { data: null, error: "Durée invalide." };

  const rate = input.newRate ?? Number(loan.annual_rate);
  const start = input.firstDueDate ?? (() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); })();

  // Anchor the new sequence numbers after the highest existing one.
  const { data: maxRow } = await supabase
    .from("installments")
    .select("sequence")
    .eq("loan_id", loan.id)
    .order("sequence", { ascending: false })
    .limit(1)
    .single();
  const { data: paidRows } = await supabase
    .from("installments")
    .select("interest_component")
    .eq("loan_id", loan.id)
    .eq("status", "paid");
  const baseSeq = Number(maxRow?.sequence ?? 0);
  const paidInterest = ((paidRows ?? []) as { interest_component: number }[]).reduce(
    (s, r) => s + Number(r.interest_component),
    0
  );

  // Remove the unpaid tail (it is being replaced).
  const { error: delErr } = await supabase
    .from("installments")
    .delete()
    .eq("loan_id", loan.id)
    .in("status", ["pending", "partial", "late"]);
  if (delErr) return { data: null, error: delErr.message };

  // The schedule helper bases its due dates one month after `start`, so anchor on
  // the month before the requested first due date.
  const anchor = (() => { const d = new Date(start + "T00:00:00"); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10); })();
  const calc = buildSchedule(principal, rate, input.newDurationMonths, anchor);
  const rows = calc.schedule.map((s) => ({
    loan_id: loan.id,
    sequence: baseSeq + s.sequence,
    due_date: s.due_date,
    amount_due: s.amount_due,
    principal_component: s.principal_component,
    interest_component: s.interest_component,
  }));
  const { error: insErr } = await supabase.from("installments").insert(rows);
  if (insErr) return { data: null, error: insErr.message };

  // Recompute loan headline figures from the kept + new installments.
  const totalInterest = round2(paidInterest + calc.totalInterest);
  const endDate = rows.at(-1)?.due_date ?? loan.end_date;
  const { data, error } = await supabase
    .from("loans")
    .update({
      annual_rate: rate,
      duration_months: baseSeq + input.newDurationMonths,
      monthly_payment: calc.monthlyPayment,
      total_interest: totalInterest,
      total_repayable: round2(Number(loan.principal_amount) + totalInterest),
      end_date: endDate,
    })
    .eq("id", loan.id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };

  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "system",
    subject: "Crédit restructuré",
    body: `Capital restant ${principal} € ré-échelonné sur ${input.newDurationMonths} mois à ${rate}%${input.reason ? ` — ${input.reason}` : ""}.`,
  });
  await logActivity({
    action: "loan.restructure",
    entity: "loans",
    entity_id: loan.id,
    metadata: { principal, rate, months: input.newDurationMonths },
  });
  return { data: data as Loan, error: null };
}

// ----------------------------------------------------------------------------
// Write-off — recognise the loss on an unrecoverable loan.
// ----------------------------------------------------------------------------
export async function writeOffLoan(loan: Loan, opts: { reason?: string } = {}): Promise<Result<Loan>> {
  if (["paid_off", "cancelled"].includes(loan.status)) {
    return { data: null, error: "Crédit déjà clôturé." };
  }
  const date = todayIso();
  const balance = await getLoanBalance(loan.id);
  const { data, error } = await supabase
    .from("loans")
    .update({
      status: "defaulted",
      closed_at: date,
      closure_reason: "written_off",
      write_off_amount: round2(balance.outstanding_total),
    })
    .eq("id", loan.id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };

  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "system",
    subject: "Passage en perte (write-off)",
    body: `Encours ${round2(balance.outstanding_total)} € passé en perte${opts.reason ? ` — ${opts.reason}` : ""}.`,
  });
  await logActivity({
    action: "loan.write_off",
    entity: "loans",
    entity_id: loan.id,
    metadata: { amount: round2(balance.outstanding_total), reason: opts.reason },
  });
  return { data: data as Loan, error: null };
}

export async function setLoanStatus(loan: Loan, status: LoanStatus): Promise<Result<Loan>> {
  const patch: Record<string, unknown> = { status };
  if (status === "active") {
    patch.closed_at = null;
    patch.closure_reason = null;
  }
  const { data, error } = await supabase.from("loans").update(patch).eq("id", loan.id).select().single();
  if (error) return { data: null, error: error.message };
  await logActivity({ action: `loan.status.${status}`, entity: "loans", entity_id: loan.id });
  return { data: data as Loan, error: null };
}
