import { supabase } from "@/_lib/supabase";
import type {
  LoanWithClient,
  MonthlyCollection,
  MonthlyDisbursement,
  OverdueInstallment,
  PortfolioKpis,
  Result,
} from "./types";

export async function getKpis(): Promise<Result<PortfolioKpis>> {
  const { data, error } = await supabase.from("v_portfolio_kpis").select("*").single();
  if (error) return { data: null, error: error.message };
  return { data: data as PortfolioKpis, error: null };
}

export interface MonthlyPoint {
  month: string;
  disbursed: number;
  collected: number;
  loans_count: number;
}

function lastMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    keys.push(`${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export async function getMonthlySeries(monthsBack = 12): Promise<Result<MonthlyPoint[]>> {
  const [disb, coll] = await Promise.all([
    supabase.from("v_monthly_disbursements").select("*"),
    supabase.from("v_monthly_collections").select("*"),
  ]);
  if (disb.error) return { data: null, error: disb.error.message };
  if (coll.error) return { data: null, error: coll.error.message };

  const disbMap = new Map<string, MonthlyDisbursement>(
    (disb.data as MonthlyDisbursement[]).map((r) => [r.month, r])
  );
  const collMap = new Map<string, MonthlyCollection>(
    (coll.data as MonthlyCollection[]).map((r) => [r.month, r])
  );

  const series = lastMonthKeys(monthsBack).map((month) => ({
    month,
    disbursed: Number(disbMap.get(month)?.total_principal ?? 0),
    collected: Number(collMap.get(month)?.total_collected ?? 0),
    loans_count: Number(disbMap.get(month)?.loans_count ?? 0),
  }));

  return { data: series, error: null };
}

export async function getRecentLoans(limit = 6): Promise<Result<LoanWithClient[]>> {
  const { data, error } = await supabase
    .from("loans")
    .select("*, client:clients(id,reference,first_name,last_name), product:products(id,slug,name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as LoanWithClient[], error: null };
}

export async function getTopOverdue(limit = 6): Promise<Result<OverdueInstallment[]>> {
  const { data, error } = await supabase
    .from("v_installments_status")
    .select("*")
    .eq("is_overdue", true)
    .order("days_late", { ascending: false })
    .limit(limit);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as OverdueInstallment[], error: null };
}
