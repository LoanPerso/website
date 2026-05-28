import { supabase } from "@/_lib/supabase";
import type { Contract, ContractStatus, ContractWithRefs, Result } from "./types";

const CONTRACT_SELECT =
  "*, client:clients(id,reference,first_name,last_name), loan:loans(id,reference), product:products(id,slug,name)";

export interface ListContractsParams {
  status?: ContractStatus | "all";
  clientId?: string;
  search?: string;
}

export async function listContracts(
  params: ListContractsParams = {}
): Promise<Result<ContractWithRefs[]>> {
  const { status = "all", clientId, search } = params;
  let query = supabase.from("contracts").select(CONTRACT_SELECT);
  if (status !== "all") query = query.eq("status", status);
  if (clientId) query = query.eq("client_id", clientId);
  if (search && search.trim()) query = query.ilike("reference", `%${search.trim()}%`);
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as unknown as ContractWithRefs[], error: null };
}

export async function listClientContracts(clientId: string): Promise<Result<ContractWithRefs[]>> {
  return listContracts({ clientId });
}

export interface ContractInput {
  client_id: string;
  loan_id?: string | null;
  product_id?: string | null;
  status?: ContractStatus;
  principal_amount?: number | null;
  annual_rate?: number | null;
  duration_months?: number | null;
  monthly_payment?: number | null;
  offer_expires_on?: string | null;
  start_date?: string | null;
  notes?: string | null;
}

export async function createContract(input: ContractInput): Promise<Result<Contract>> {
  const { data, error } = await supabase.from("contracts").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Contract, error: null };
}

// Advance the lifecycle, stamping the relevant timestamps (and the EU cooling-off
// deadline on signature). Disbursement/activation belongs to the loan layer.
export async function setContractStatus(id: string, status: ContractStatus): Promise<Result<Contract>> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === "offer_sent") patch.offer_sent_at = now;
  if (status === "signed") {
    patch.signed_at = now;
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 14);
    patch.withdrawal_deadline = deadline.toISOString().slice(0, 10);
  }
  const { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Contract, error: null };
}
