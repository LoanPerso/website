import { supabase } from "@/_lib/supabase";
import type { Interaction, InteractionDirection, InteractionType, Result } from "./types";

export async function listInteractions(clientId: string): Promise<Result<Interaction[]>> {
  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("client_id", clientId)
    .order("occurred_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Interaction[], error: null };
}

export interface InteractionInput {
  client_id?: string | null;
  application_id?: string | null;
  loan_id?: string | null;
  contract_id?: string | null;
  type: InteractionType;
  direction?: InteractionDirection | null;
  subject?: string | null;
  body?: string | null;
  occurred_at?: string;
}

export async function createInteraction(input: InteractionInput): Promise<Result<Interaction>> {
  const { data, error } = await supabase.from("interactions").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Interaction, error: null };
}
