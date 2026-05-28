import { supabase } from "@/_lib/supabase";
import type { AdminUser, AdminRole, Result } from "./types";

export async function listAdmins(): Promise<Result<AdminUser[]>> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as AdminUser[], error: null };
}

export async function setAdminActive(id: string, isActive: boolean): Promise<Result<null>> {
  const { error } = await supabase.from("admin_users").update({ is_active: isActive }).eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function setAdminRole(id: string, role: AdminRole): Promise<Result<null>> {
  const { error } = await supabase.from("admin_users").update({ role }).eq("id", id);
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function touchLastLogin(id: string): Promise<void> {
  await supabase.from("admin_users").update({ last_login_at: new Date().toISOString() }).eq("id", id);
}
