import { supabase } from "@/_lib/supabase";
import type {
  CashflowStats,
  ClientsStats,
  CollectionsStats,
  FunnelStats,
  PortfolioStats,
  ProductsStats,
  Result,
  RiskStats,
  StatsFilters,
  VintagesStats,
} from "./types";

// ============================================================================
// Analytics data layer — one parameterised RPC per "Statistiques" page.
// Each rpc_stats_* aggregates server-side (the book exceeds the PostgREST
// 1000-row cap) and returns a single json payload covering every chart on the
// page, computed against the same filter (date window + dimensions).
// ============================================================================

async function callStats<T>(fn: string, params: Record<string, unknown>): Promise<Result<T>> {
  const { data, error } = await supabase.rpc(fn, params);
  if (error) return { data: null, error: error.message };
  return { data: (data ?? null) as T, error: null };
}

const win = (f: StatsFilters) => ({ p_from: f.from, p_to: f.to });
const nn = (v: string | null | undefined) => v ?? null;

export const getPortfolioStats = (f: StatsFilters) =>
  callStats<PortfolioStats>("rpc_stats_portfolio", {
    ...win(f),
    p_product: nn(f.product),
    p_country: nn(f.country),
    p_risk: nn(f.risk),
    p_status: nn(f.status),
  });

export const getProductsStats = (f: StatsFilters) =>
  callStats<ProductsStats>("rpc_stats_products", {
    ...win(f),
    p_country: nn(f.country),
    p_risk: nn(f.risk),
  });

export const getRiskStats = (f: StatsFilters) =>
  callStats<RiskStats>("rpc_stats_risk", {
    ...win(f),
    p_product: nn(f.product),
    p_country: nn(f.country),
    p_risk: nn(f.risk),
  });

export const getVintagesStats = (f: StatsFilters) =>
  callStats<VintagesStats>("rpc_stats_vintages", {
    ...win(f),
    p_product: nn(f.product),
    p_risk: nn(f.risk),
  });

export const getCollectionsStats = (f: StatsFilters) =>
  callStats<CollectionsStats>("rpc_stats_collections", {
    ...win(f),
    p_product: nn(f.product),
    p_risk: nn(f.risk),
  });

export const getCashflowStats = (f: StatsFilters) =>
  callStats<CashflowStats>("rpc_stats_cashflow", {
    ...win(f),
    p_product: nn(f.product),
  });

export const getClientsStats = (f: StatsFilters) =>
  callStats<ClientsStats>("rpc_stats_clients", {
    ...win(f),
    p_country: nn(f.country),
    p_risk: nn(f.risk),
    p_status: nn(f.status),
  });

export const getFunnelStats = (f: StatsFilters) =>
  callStats<FunnelStats>("rpc_stats_funnel", {
    ...win(f),
    p_source: nn(f.source),
    p_status: nn(f.status),
  });
