import { supabase } from "@/_lib/supabase";
import type { Result, Task, TaskCategory, TaskPriority, TaskStatus, TaskWithClient } from "./types";

export interface ListTasksParams {
  status?: TaskStatus | "all" | "open_overdue";
  clientId?: string;
  search?: string;
}

export async function listTasks(params: ListTasksParams = {}): Promise<Result<TaskWithClient[]>> {
  const { status = "all", clientId, search } = params;
  let query = supabase.from("v_tasks_due").select("*");
  if (clientId) query = query.eq("client_id", clientId);
  if (status === "open_overdue") query = query.eq("status", "open").eq("is_overdue", true);
  else if (status !== "all") query = query.eq("status", status);
  if (search && search.trim()) query = query.ilike("title", `%${search.trim()}%`);
  query = query.order("due_date", { ascending: true, nullsFirst: false });

  const { data, error } = await query;
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as TaskWithClient[], error: null };
}

export async function listClientTasks(clientId: string): Promise<Result<Task[]>> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("client_id", clientId)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Task[], error: null };
}

export interface TaskInput {
  title: string;
  description?: string | null;
  client_id?: string | null;
  loan_id?: string | null;
  application_id?: string | null;
  contract_id?: string | null;
  installment_id?: string | null;
  category?: TaskCategory;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
}

export async function createTask(input: TaskInput): Promise<Result<Task>> {
  const { data, error } = await supabase.from("tasks").insert(input).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Task, error: null };
}

export async function setTaskStatus(id: string, status: TaskStatus): Promise<Result<Task>> {
  const patch = { status, completed_at: status === "done" ? new Date().toISOString() : null };
  const { data, error } = await supabase.from("tasks").update(patch).eq("id", id).select().single();
  if (error) return { data: null, error: error.message };
  return { data: data as Task, error: null };
}
