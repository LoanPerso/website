import { supabase } from "@/_lib/supabase";
import { categoryFromScore, computeClientScore, type ScoreResult, type ScoringInput } from "./scoring";
import type { Client, ClientScore, Result, ScoreSource } from "./types";

export async function listClientScores(clientId: string): Promise<Result<ClientScore[]>> {
  const { data, error } = await supabase
    .from("client_scores")
    .select("*")
    .eq("client_id", clientId)
    .order("computed_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ClientScore[], error: null };
}

// Sum of monthly payments on the client's active loans — the debt side of the DTI.
export async function getExistingMonthlyDebt(clientId: string): Promise<number> {
  const { data } = await supabase
    .from("loans")
    .select("monthly_payment")
    .eq("client_id", clientId)
    .eq("status", "active");
  const rows = (data ?? []) as { monthly_payment: number | null }[];
  return rows.reduce((s, l) => s + Number(l.monthly_payment ?? 0), 0);
}

export function scoringInputFromClient(c: Client, existingMonthlyDebt = 0): ScoringInput {
  return {
    employmentStatus: c.employment_status,
    employmentSince: c.employment_since,
    housingStatus: c.housing_status,
    creditHistory: c.credit_history,
    monthlyNetIncome: c.monthly_net_income,
    monthlyExpenses: c.monthly_expenses,
    existingMonthlyDebt,
    birthDate: c.birth_date,
    dependents: c.dependents,
  };
}

// Compute a fresh score, persist an immutable snapshot, and sync clients.*.
export async function recomputeClientScore(
  client: Client,
  source: ScoreSource = "recompute"
): Promise<Result<{ result: ScoreResult; snapshot: ClientScore }>> {
  const debt = await getExistingMonthlyDebt(client.id);
  const result = computeClientScore(scoringInputFromClient(client, debt));

  const { data: snap, error: snapErr } = await supabase
    .from("client_scores")
    .insert({
      client_id: client.id,
      score: result.score,
      category: result.category,
      factors: result.factors,
      reason_codes: result.reasonCodes,
      dti: result.dti,
      is_complete: result.complete,
      model_version: result.modelVersion,
      source,
    })
    .select()
    .single();
  if (snapErr) return { data: null, error: snapErr.message };

  const { error: updErr } = await supabase
    .from("clients")
    .update({
      credit_score: result.score,
      risk_category: result.category,
      score_updated_at: new Date().toISOString(),
      score_is_stale: false,
    })
    .eq("id", client.id);
  if (updErr) return { data: null, error: updErr.message };

  return { data: { result, snapshot: snap as ClientScore }, error: null };
}

// Manual override with justification (audited as a 'manual' snapshot).
export async function overrideClientScore(
  client: Client,
  score: number,
  reason: string
): Promise<Result<ClientScore>> {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const category = categoryFromScore(clamped);

  const { data: snap, error: snapErr } = await supabase
    .from("client_scores")
    .insert({
      client_id: client.id,
      score: clamped,
      category,
      factors: [],
      reason_codes: [],
      is_complete: true,
      source: "manual",
    })
    .select()
    .single();
  if (snapErr) return { data: null, error: snapErr.message };

  const { error: updErr } = await supabase
    .from("clients")
    .update({
      credit_score: clamped,
      risk_category: category,
      score_override: clamped,
      score_override_reason: reason,
      score_updated_at: new Date().toISOString(),
      score_is_stale: false,
    })
    .eq("id", client.id);
  if (updErr) return { data: null, error: updErr.message };
  return { data: snap as ClientScore, error: null };
}
