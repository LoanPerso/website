import { supabase } from "@/_lib/supabase";
import type { MailFolder, MailFolderWithCount, Result } from "../types";

export async function listFolders(accountId: string): Promise<Result<MailFolder[]>> {
  const { data, error } = await supabase
    .from("mail_folders")
    .select("*")
    .eq("account_id", accountId)
    .order("sort_order", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as MailFolder[], error: null };
}

// Folders enriched with total + unread (incoming-only) counts for the sidebar.
export async function listFoldersWithCounts(accountId: string): Promise<Result<MailFolderWithCount[]>> {
  const base = await listFolders(accountId);
  if (base.error || !base.data) return { data: null, error: base.error };

  const rows = await Promise.all(
    base.data.map(async (f) => {
      const [{ count: total }, { count: unread }] = await Promise.all([
        supabase.from("mail_messages").select("id", { count: "exact", head: true }).eq("folder_id", f.id),
        supabase
          .from("mail_messages")
          .select("id", { count: "exact", head: true })
          .eq("folder_id", f.id)
          .eq("direction", "in")
          .eq("is_seen", false),
      ]);
      return { ...f, total: total ?? 0, unread: unread ?? 0 };
    })
  );
  return { data: rows, error: null };
}
