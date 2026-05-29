import { supabase } from "@/_lib/supabase";
import type { Product, Result } from "./types";

export type ProductInput = Partial<Omit<Product, "id" | "created_at" | "updated_at">> & {
  slug: string;
  name: string;
};

export async function listProducts(activeOnly = false): Promise<Result<Product[]>> {
  let query = supabase.from("products").select("*").order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Product[], error: null };
}

export async function getProduct(id: string): Promise<Result<Product>> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as Product, error: null };
}

export async function createProduct(input: ProductInput): Promise<Result<Product>> {
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Product, error: null };
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Result<Product>> {
  const { data, error } = await supabase.from("products").update(input).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Product, error: null };
}

export async function setProductActive(id: string, isActive: boolean): Promise<Result<Product>> {
  return updateProduct(id, { is_active: isActive });
}

export interface ProductStats {
  loans_count: number;
  active_count: number;
  defaulted_count: number;
  total_principal: number;
  outstanding_principal: number;
  avg_rate: number | null;
}

// Portfolio footprint of a product: how many credits use it and their exposure.
export async function getProductStats(productId: string): Promise<ProductStats> {
  const { data: loans } = await supabase
    .from("loans")
    .select("id, principal_amount, annual_rate, status")
    .eq("product_id", productId);
  const rows = (loans ?? []) as { id: string; principal_amount: number; annual_rate: number; status: string }[];

  let outstanding = 0;
  if (rows.length) {
    const { data: balances } = await supabase
      .from("v_loan_balances")
      .select("outstanding_principal, status")
      .in("loan_id", rows.map((r) => r.id));
    outstanding = ((balances ?? []) as { outstanding_principal: number; status: string }[])
      .filter((b) => ["active", "defaulted"].includes(b.status))
      .reduce((s, b) => s + Number(b.outstanding_principal), 0);
  }

  const total = rows.reduce((s, r) => s + Number(r.principal_amount), 0);
  const avgRate = rows.length ? rows.reduce((s, r) => s + Number(r.annual_rate), 0) / rows.length : null;
  return {
    loans_count: rows.length,
    active_count: rows.filter((r) => r.status === "active").length,
    defaulted_count: rows.filter((r) => r.status === "defaulted").length,
    total_principal: Math.round(total * 100) / 100,
    outstanding_principal: Math.round(outstanding * 100) / 100,
    avg_rate: avgRate != null ? Math.round(avgRate * 100) / 100 : null,
  };
}
