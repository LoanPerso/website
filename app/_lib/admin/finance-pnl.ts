import { supabase } from "@/_lib/supabase";
import type { LedgerEntry, LedgerKind, PnlMonthly, PnlSummary, Result } from "./types";

// ============================================================================
// Finance / P&L data layer.
// Loan revenue (interest, fees, penalties) is DERIVED by the v_pnl_* views from
// the portfolio tables; this layer also manages the manual ledger entries
// (coaching revenue, operating expenses) the portfolio cannot know about.
// ============================================================================

export async function getPnlSummary(): Promise<Result<PnlSummary>> {
  const { data, error } = await supabase.from("v_pnl_summary").select("*").single();
  if (error) return { data: null, error: error.message };
  return { data: data as PnlSummary, error: null };
}

export async function getPnlMonthly(): Promise<Result<PnlMonthly[]>> {
  const { data, error } = await supabase
    .from("v_pnl_monthly")
    .select("*")
    .order("month", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as PnlMonthly[], error: null };
}

export interface LedgerInput {
  kind: LedgerKind;
  category: string;
  label?: string | null;
  amount: number;
  period_month: string; // "YYYY-MM-01"
  notes?: string | null;
}

export async function listLedgerEntries(
  params: { kind?: LedgerKind } = {}
): Promise<Result<LedgerEntry[]>> {
  let query = supabase.from("ledger_entries").select("*").order("period_month", { ascending: false });
  if (params.kind) query = query.eq("kind", params.kind);
  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as LedgerEntry[], error: null };
}

export async function createLedgerEntry(input: LedgerInput): Promise<Result<LedgerEntry>> {
  const { data, error } = await supabase.from("ledger_entries").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as LedgerEntry, error: null };
}

export async function updateLedgerEntry(
  id: string,
  input: Partial<LedgerInput>
): Promise<Result<LedgerEntry>> {
  const { data, error } = await supabase
    .from("ledger_entries")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  return { data: data as LedgerEntry, error: null };
}

export async function deleteLedgerEntry(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("ledger_entries").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
