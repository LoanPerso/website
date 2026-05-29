import { supabase } from "@/_lib/supabase";

// Actor identity + activity logging. Every meaningful admin mutation (decision,
// origination, disbursement, servicing, collections) records who did what in the
// shared activity_log so the back office keeps an auditable trail.

export interface Actor {
  id: string | null;
  email: string | null;
}

let cachedActor: Actor | null = null;

// Resolve the signed-in admin. Cached for the session to avoid a round-trip per
// mutation; the auth listener in the provider clears it on sign-out/refresh.
export async function currentActor(): Promise<Actor> {
  if (cachedActor) return cachedActor;
  const { data } = await supabase.auth.getUser();
  cachedActor = { id: data.user?.id ?? null, email: data.user?.email ?? null };
  return cachedActor;
}

export function clearActorCache(): void {
  cachedActor = null;
}

export interface ActivityInput {
  action: string; // e.g. "loan.disburse", "contract.sign", "application.decide"
  entity?: string | null; // table name: "loans", "contracts", …
  entity_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

// Best-effort audit write: never throws so it cannot break the business mutation
// it accompanies. Stamps the resolved actor (id + email snapshot).
export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    const actor = await currentActor();
    await supabase.from("activity_log").insert({
      actor_id: actor.id,
      actor_email: actor.email,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entity_id ?? null,
      metadata: input.metadata ?? null,
    });
  } catch {
    // Audit must not surface to the user nor block the action.
  }
}

export interface ActivityEntry {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// Recent audit entries for one record (entity timeline) or the whole book.
export async function listActivity(
  params: { entity?: string; entityId?: string; limit?: number } = {}
): Promise<ActivityEntry[]> {
  const { entity, entityId, limit = 50 } = params;
  let query = supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (entity) query = query.eq("entity", entity);
  if (entityId) query = query.eq("entity_id", entityId);
  const { data } = await query;
  return (data ?? []) as ActivityEntry[];
}
