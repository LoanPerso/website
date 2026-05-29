import { supabase } from "@/_lib/supabase";
import { logActivity } from "./audit";
import type { InteractionType, Loan, LoanArrears, Result } from "./types";

// ============================================================================
// Collections engine — the dunning desk on top of the arrears view.
// Drives the reminder ladder, accrues late fees, books promises-to-pay and
// recognises default. Every step writes the timeline + an audit entry.
// ============================================================================

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function addDaysIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface ListArrearsParams {
  minDaysLate?: number;
  clientId?: string;
}

// Loans currently carrying overdue installments, worst first.
export async function listArrears(params: ListArrearsParams = {}): Promise<Result<LoanArrears[]>> {
  let query = supabase.from("v_loan_arrears").select("*");
  if (params.clientId) query = query.eq("client_id", params.clientId);
  if (params.minDaysLate && params.minDaysLate > 0) query = query.gte("max_days_late", params.minDaysLate);
  query = query.order("max_days_late", { ascending: false });
  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as LoanArrears[], error: null };
}

// Reminder ladder: each step maps a dunning level to a channel + tone + delay
// before the next action. Level 0 = no reminder sent yet.
export interface DunningStep {
  level: number;
  label: string;
  channel: Extract<InteractionType, "email" | "sms" | "call">;
  nextActionDays: number;
  tone: "info" | "warning" | "error";
}

export const DUNNING_LADDER: DunningStep[] = [
  { level: 1, label: "Rappel amiable", channel: "email", nextActionDays: 7, tone: "info" },
  { level: 2, label: "Relance ferme", channel: "sms", nextActionDays: 7, tone: "warning" },
  { level: 3, label: "Mise en demeure", channel: "call", nextActionDays: 5, tone: "warning" },
  { level: 4, label: "Dernier avis avant contentieux", channel: "email", nextActionDays: 5, tone: "error" },
];

export function nextDunningStep(currentLevel: number): DunningStep {
  return DUNNING_LADDER[Math.min(currentLevel, DUNNING_LADDER.length - 1)];
}

// Send the next reminder in the ladder: bump dunning_level, log the outbound
// interaction, schedule the follow-up (next_action_date + a collection task).
export async function recordDunningStep(
  loan: Pick<Loan, "id" | "client_id" | "dunning_level">,
  opts: { note?: string; channel?: DunningStep["channel"] } = {}
): Promise<Result<DunningStep>> {
  const step = nextDunningStep(loan.dunning_level);
  const channel = opts.channel ?? step.channel;
  const nextDate = addDaysIso(step.nextActionDays);

  const { error } = await supabase
    .from("loans")
    .update({ dunning_level: step.level, next_action_date: nextDate })
    .eq("id", loan.id);
  if (error) return { data: null, error: error.message };

  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: channel,
    direction: "out",
    subject: `${step.label} (niveau ${step.level})`,
    body: opts.note ?? `Relance ${channel.toUpperCase()} envoyée. Prochaine action le ${nextDate}.`,
  });
  await supabase.from("tasks").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    title: `Recouvrement — suivi niveau ${step.level} (${step.label})`,
    category: "collection",
    priority: step.tone === "error" ? "urgent" : "high",
    due_date: nextDate,
  });
  await logActivity({
    action: "collection.dunning",
    entity: "loans",
    entity_id: loan.id,
    metadata: { level: step.level, channel, next_action_date: nextDate },
  });
  return { data: { ...step, channel }, error: null };
}

// Accrue a late fee on a specific overdue installment. Default policy: 8% of the
// remaining amount, floored at 15 € (kept on installments.late_fee, separate from
// the contractual schedule).
export async function assessLateFee(
  installmentId: string,
  loan: Pick<Loan, "id" | "client_id">,
  opts: { amount?: number } = {}
): Promise<Result<number>> {
  const { data: inst, error: instErr } = await supabase
    .from("installments")
    .select("id, amount_due, amount_paid, late_fee")
    .eq("id", installmentId)
    .single();
  if (instErr || !inst) return { data: null, error: instErr?.message ?? "Échéance introuvable." };

  const remaining = Math.max(Number(inst.amount_due) - Number(inst.amount_paid), 0);
  const fee = opts.amount != null ? round2(opts.amount) : round2(Math.max(15, remaining * 0.08));
  const newFee = round2(Number(inst.late_fee ?? 0) + fee);

  const { error } = await supabase.from("installments").update({ late_fee: newFee }).eq("id", installmentId);
  if (error) return { data: null, error: error.message };

  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "system",
    subject: "Pénalité de retard appliquée",
    body: `Frais de ${fee} € ajoutés à l'échéance (total pénalités : ${newFee} €).`,
  });
  await logActivity({
    action: "collection.late_fee",
    entity: "installments",
    entity_id: installmentId,
    metadata: { fee, total: newFee, loan_id: loan.id },
  });
  return { data: newFee, error: null };
}

// Apply a late fee to a loan's oldest overdue installment (collections desk
// shortcut when no specific installment is in focus).
export async function assessLateFeeOnLoan(
  loan: Pick<Loan, "id" | "client_id">,
  opts: { amount?: number } = {}
): Promise<Result<number>> {
  const { data, error } = await supabase
    .from("v_installments_status")
    .select("id")
    .eq("loan_id", loan.id)
    .eq("is_overdue", true)
    .order("due_date", { ascending: true })
    .limit(1);
  if (error) return { data: null, error: error.message };
  const target = (data ?? [])[0] as { id: string } | undefined;
  if (!target) return { data: null, error: "Aucune échéance en retard sur ce crédit." };
  return assessLateFee(target.id, loan, opts);
}

// Book a promise-to-pay: log it on the timeline, open a dated collection task and
// move the next action to the promised date.
export async function recordPromiseToPay(
  loan: Pick<Loan, "id" | "client_id">,
  opts: { promiseDate: string; amount?: number | null; note?: string }
): Promise<Result<null>> {
  const { error } = await supabase
    .from("loans")
    .update({ next_action_date: opts.promiseDate })
    .eq("id", loan.id);
  if (error) return { data: null, error: error.message };

  const amountLabel = opts.amount != null ? `${round2(opts.amount)} € ` : "";
  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "call",
    direction: "in",
    subject: "Promesse de paiement",
    body: `${amountLabel}promis pour le ${opts.promiseDate}.${opts.note ? ` ${opts.note}` : ""}`,
  });
  await supabase.from("tasks").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    title: `Vérifier la promesse de paiement (${amountLabel}${opts.promiseDate})`,
    category: "collection",
    priority: "high",
    due_date: opts.promiseDate,
  });
  await logActivity({
    action: "collection.promise_to_pay",
    entity: "loans",
    entity_id: loan.id,
    metadata: { promise_date: opts.promiseDate, amount: opts.amount ?? null },
  });
  return { data: null, error: null };
}

// Recognise default on a loan in arrears (keeps it open for write-off later).
export async function markDefault(
  loan: Pick<Loan, "id" | "client_id">,
  opts: { reason?: string } = {}
): Promise<Result<null>> {
  const { error } = await supabase.from("loans").update({ status: "defaulted" }).eq("id", loan.id);
  if (error) return { data: null, error: error.message };
  await supabase.from("interactions").insert({
    loan_id: loan.id,
    client_id: loan.client_id,
    type: "system",
    subject: "Crédit déclaré en défaut",
    body: opts.reason ?? "Passage en défaut suite à impayés persistants.",
  });
  await logActivity({ action: "collection.default", entity: "loans", entity_id: loan.id, metadata: { reason: opts.reason } });
  return { data: null, error: null };
}
