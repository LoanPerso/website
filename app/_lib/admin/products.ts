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
