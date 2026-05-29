import { supabase } from "@/_lib/supabase";
import { logActivity } from "./audit";
import type {
  Contract,
  ContractStatus,
  ContractTermsSnapshot,
  ContractWithRefs,
  Interaction,
  Result,
  SignatureMethod,
} from "./types";

const CONTRACT_SELECT =
  "*, client:clients(id,reference,first_name,last_name), loan:loans(id,reference,status), product:products(id,slug,name)";

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

export async function getContract(id: string): Promise<Result<ContractWithRefs>> {
  const { data, error } = await supabase.from("contracts").select(CONTRACT_SELECT).eq("id", id).single();
  if (error) return { data: null, error: error.message };
  return { data: data as unknown as ContractWithRefs, error: null };
}

// Find the contract originated from a given application (matched on the frozen
// terms snapshot). Returns the most recent non-cancelled one, if any.
export async function findContractByApplication(applicationId: string): Promise<Result<ContractWithRefs | null>> {
  const { data, error } = await supabase
    .from("contracts")
    .select(CONTRACT_SELECT)
    .eq("terms->>source_application_id", applicationId)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) return { data: null, error: error.message };
  return { data: ((data ?? [])[0] as unknown as ContractWithRefs) ?? null, error: null };
}

export async function listContractInteractions(contractId: string): Promise<Result<Interaction[]>> {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("contract_id", contractId)
    .order("occurred_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Interaction[], error: null };
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
  terms?: ContractTermsSnapshot | null;
  signature_method?: SignatureMethod | null;
  offer_expires_on?: string | null;
  start_date?: string | null;
  notes?: string | null;
}

export async function createContract(input: ContractInput): Promise<Result<Contract>> {
  const { data, error } = await supabase.from("contracts").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  await logActivity({
    action: "contract.create",
    entity: "contracts",
    entity_id: data.id,
    metadata: { client_id: input.client_id, amount: input.principal_amount },
  });
  return { data: data as Contract, error: null };
}

export async function updateContractTerms(
  id: string,
  patch: Partial<Pick<Contract, "principal_amount" | "annual_rate" | "duration_months" | "monthly_payment" | "notes" | "offer_expires_on">>
): Promise<Result<Contract>> {
  const { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Contract, error: null };
}

// Generic lifecycle setter used by the list view's inline dropdown. Stamps the
// timestamps tied to each milestone; cross-entity steps (loan generation,
// disbursement) live in the origination/servicing engines.
export async function setContractStatus(id: string, status: ContractStatus): Promise<Result<Contract>> {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { status };
  if (status === "offer_sent") patch.offer_sent_at = now;
  if (status === "signed") {
    patch.signed_at = now;
    patch.withdrawal_deadline = addDays(14);
  }
  const { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  await logActivity({ action: `contract.status.${status}`, entity: "contracts", entity_id: id });
  return { data: data as Contract, error: null };
}

// --- Typed lifecycle transitions (used by the contract dossier) ---------------

export async function sendOffer(
  id: string,
  opts: { expiresInDays?: number } = {}
): Promise<Result<Contract>> {
  const patch = {
    status: "offer_sent" as ContractStatus,
    offer_sent_at: new Date().toISOString(),
    offer_expires_on: addDays(opts.expiresInDays ?? 30),
  };
  const { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  await logInteraction(id, data.client_id, "Offre de crédit envoyée", `Offre valable jusqu'au ${patch.offer_expires_on}.`, "email");
  await logActivity({ action: "contract.send_offer", entity: "contracts", entity_id: id });
  return { data: data as Contract, error: null };
}

export async function signContract(
  id: string,
  opts: { method?: SignatureMethod; withdrawalDays?: number } = {}
): Promise<Result<Contract>> {
  const patch = {
    status: "signed" as ContractStatus,
    signed_at: new Date().toISOString(),
    signature_method: opts.method ?? "e_sign",
    withdrawal_deadline: addDays(opts.withdrawalDays ?? 14),
  };
  const { data, error } = await supabase.from("contracts").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  await logInteraction(id, data.client_id, "Contrat signé", `Délai de rétractation jusqu'au ${patch.withdrawal_deadline}.`, "system");
  await logActivity({ action: "contract.sign", entity: "contracts", entity_id: id, metadata: { method: patch.signature_method } });
  return { data: data as Contract, error: null };
}

export async function cancelContract(id: string, reason?: string): Promise<Result<Contract>> {
  const { data, error } = await supabase
    .from("contracts")
    .update({ status: "cancelled", notes: reason ?? null })
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: error.message };
  await logInteraction(id, data.client_id, "Contrat annulé", reason ?? null, "system");
  await logActivity({ action: "contract.cancel", entity: "contracts", entity_id: id, metadata: { reason } });
  return { data: data as Contract, error: null };
}

export async function expireContract(id: string): Promise<Result<Contract>> {
  const { data, error } = await supabase.from("contracts").update({ status: "expired" }).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  await logActivity({ action: "contract.expire", entity: "contracts", entity_id: id });
  return { data: data as Contract, error: null };
}

async function logInteraction(
  contractId: string,
  clientId: string | null,
  subject: string,
  body: string | null,
  type: "email" | "system"
): Promise<void> {
  await supabase.from("interactions").insert({
    contract_id: contractId,
    client_id: clientId,
    type,
    direction: type === "email" ? "out" : null,
    subject,
    body,
  });
}

function addDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
