"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Badge } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { useAdminAuth } from "@/_components/admin/auth-provider";
import { listAdmins, setAdminActive, setAdminRole } from "@/_lib/admin/admin-users";
import type { AdminRole, AdminUser } from "@/_lib/admin/types";
import { formatDate } from "@/_lib/admin/format";

export default function SettingsPage() {
  const toast = useToast();
  const { admin } = useAdminAuth();
  const isSuperadmin = admin?.role === "superadmin";
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listAdmins();
    setRows(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function changeRole(id: string, role: AdminRole) {
    const res = await setAdminRole(id, role);
    if (res.error) toast(res.error, "error");
    else {
      toast("Rôle mis à jour.");
      load();
    }
  }

  async function toggleActive(u: AdminUser) {
    const res = await setAdminActive(u.id, !u.is_active);
    if (res.error) toast(res.error, "error");
    else {
      toast(u.is_active ? "Compte désactivé." : "Compte activé.");
      load();
    }
  }

  const columns: Column<AdminUser>[] = [
    {
      header: "Administrateur",
      cell: (u) => (
        <div>
          <span className="font-medium">{u.full_name || u.email}</span>
          <p className="text-xs text-muted-foreground">{u.email}</p>
        </div>
      ),
    },
    {
      header: "Rôle",
      cell: (u) =>
        isSuperadmin ? (
          <Select value={u.role} onChange={(e) => changeRole(u.id, e.target.value as AdminRole)} className="h-8 w-36 text-xs">
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="viewer">Lecture seule</option>
          </Select>
        ) : (
          <Badge tone="info">{u.role}</Badge>
        ),
    },
    { header: "Dernière connexion", cell: (u) => <span className="text-muted-foreground">{u.last_login_at ? formatDate(u.last_login_at) : "—"}</span> },
    {
      header: "Statut",
      cell: (u) => <Badge tone={u.is_active ? "success" : "neutral"}>{u.is_active ? "Actif" : "Inactif"}</Badge>,
    },
    {
      header: "",
      align: "right",
      cell: (u) =>
        isSuperadmin && u.id !== admin?.id ? (
          <button onClick={() => toggleActive(u)} className="text-xs font-medium text-dark-gold hover:underline">
            {u.is_active ? "Désactiver" : "Activer"}
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title="Paramètres" description="Comptes administrateurs et configuration." />

      <div className="space-y-6">
        <Panel title="Administrateurs">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : (
            <DataTable columns={columns} rows={rows} getKey={(u) => u.id} empty={{ title: "Aucun administrateur" }} />
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            Pour ajouter un administrateur : créez l&apos;utilisateur dans Supabase Auth, puis ajoutez une ligne dans la
            table <code className="rounded bg-secondary px-1">admin_users</code> (avec son <code className="rounded bg-secondary px-1">id</code>).
          </p>
        </Panel>

        <Panel title="Connexion data">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Supabase URL</dt>
              <dd className="truncate font-mono text-xs">{process.env.NEXT_PUBLIC_SUPABASE_URL || "non configuré"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Compte connecté</dt>
              <dd className="font-medium">{admin?.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Rôle</dt>
              <dd className="font-medium">{admin?.role}</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </div>
  );
}
