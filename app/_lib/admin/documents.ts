import { supabase } from "@/_lib/supabase";
import type { ClientDocument, DocumentStatus, DocumentType, Result } from "./types";

export async function listClientDocuments(clientId: string): Promise<Result<ClientDocument[]>> {
  const { data, error } = await supabase
    .from("client_documents")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as ClientDocument[], error: null };
}

export interface DocumentInput {
  client_id: string;
  application_id?: string | null;
  type: DocumentType;
  label?: string | null;
  url?: string | null;
  status?: DocumentStatus;
  issued_on?: string | null;
  expires_on?: string | null;
}

export async function createDocument(input: DocumentInput): Promise<Result<ClientDocument>> {
  const payload = { uploaded_at: input.url ? new Date().toISOString() : null, ...input };
  const { data, error } = await supabase.from("client_documents").insert(payload).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as ClientDocument, error: null };
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  extra: Partial<Pick<ClientDocument, "rejection_reason" | "expires_on">> = {}
): Promise<Result<ClientDocument>> {
  const patch: Record<string, unknown> = { status, ...extra };
  if (status === "verified") patch.verified_at = new Date().toISOString();
  if (status !== "rejected") patch.rejection_reason = null;
  const { data, error } = await supabase.from("client_documents").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as ClientDocument, error: null };
}

export async function deleteDocument(id: string): Promise<Result<null>> {
  const { error } = await supabase.from("client_documents").delete().eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
