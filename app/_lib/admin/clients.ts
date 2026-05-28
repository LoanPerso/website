import { supabase } from "@/_lib/supabase";
import type { Client, ClientOverview, ClientStatus, Result, RiskCategory } from "./types";

export interface ListClientsParams {
  search?: string;
  status?: ClientStatus | "all";
  category?: RiskCategory | "all";
  page?: number;
  pageSize?: number;
}

export type ClientInput = Partial<Omit<Client, "id" | "created_at" | "updated_at" | "reference">> & {
  first_name: string;
  last_name: string;
};

export async function listClients(
  params: ListClientsParams = {}
): Promise<Result<{ rows: Client[]; count: number }>> {
  const { search, status = "all", category = "all", page = 1, pageSize = 25 } = params;
  let query = supabase.from("clients").select("*", { count: "exact" });

  if (status !== "all") query = query.eq("status", status);
  if (category !== "all") query = query.eq("risk_category", category);
  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(
      `first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},reference.ilike.${s},phone.ilike.${s}`
    );
  }

  const from = (page - 1) * pageSize;
  query = query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, error: error.message };
  return { data: { rows: (data ?? []) as Client[], count: count ?? 0 }, error: null };
}

// Client list enriched with the latest score, KYC completeness and open tasks
// (reads the v_client_overview reporting view).
export async function listClientOverview(
  params: ListClientsParams = {}
): Promise<Result<{ rows: ClientOverview[]; count: number }>> {
  const { search, status = "all", category = "all", page = 1, pageSize = 25 } = params;
  let query = supabase.from("v_client_overview").select("*", { count: "exact" });

  if (status !== "all") query = query.eq("status", status);
  if (category !== "all") query = query.eq("risk_category", category);
  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    query = query.or(
      `first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},reference.ilike.${s},phone.ilike.${s}`
    );
  }

  const from = (page - 1) * pageSize;
  query = query.order("created_at", { ascending: false }).range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, error: error.message };
  return { data: { rows: (data ?? []) as ClientOverview[], count: count ?? 0 }, error: null };
}

export async function getClient(id: string): Promise<Result<Client>> {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as Client, error: null };
}

export async function createClient(input: ClientInput): Promise<Result<Client>> {
  const { data, error } = await supabase.from("clients").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Client, error: null };
}

export async function updateClient(id: string, input: Partial<ClientInput>): Promise<Result<Client>> {
  const { data, error } = await supabase.from("clients").update(input).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Client, error: null };
}

export async function deleteClient(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
