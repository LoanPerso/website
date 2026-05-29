"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { StatusBadge, RiskBadge, ScoreChip } from "@/_components/admin/status-badge";
import { Select } from "@/_components/admin/form";
import { ClientFormDialog } from "@/_components/admin/forms/client-form-dialog";
import { listClientOverview } from "@/_lib/admin/clients";
import type { ClientOverview, ClientStatus, RiskCategory } from "@/_lib/admin/types";
import { formatDate, fullName } from "@/_lib/admin/format";

const PAGE_SIZE = 25;

export default function ClientsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ClientOverview[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [category, setCategory] = useState<RiskCategory | "all">("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listClientOverview({ search, status, category, page, pageSize: PAGE_SIZE });
    setRows(res.data?.rows ?? []);
    setCount(res.data?.count ?? 0);
    setLoading(false);
  }, [search, status, category, page]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const columns: Column<ClientOverview>[] = [
    { header: "Réf.", cell: (c) => <span className="font-mono text-xs">{c.reference}</span> },
    { header: "Nom", cell: (c) => <span className="font-medium">{fullName(c.first_name, c.last_name)}</span> },
    { header: "Contact", cell: (c) => <span className="text-muted-foreground">{c.email || c.phone || "—"}</span> },
    {
      header: "Score",
      cell: (c) => <ScoreChip score={c.credit_score ?? c.latest_score} category={c.risk_category} />,
    },
    { header: "Risque", cell: (c) => <RiskBadge category={c.risk_category} /> },
    {
      header: "KYC",
      cell: (c) => (
        <span
          className={cn(
            "text-xs",
            c.docs_total > 0 && c.docs_verified >= 4 ? "text-success" : "text-muted-foreground"
          )}
        >
          {c.docs_verified}/{c.docs_total || 0}
        </span>
      ),
    },
    {
      header: "Tâches",
      align: "center",
      cell: (c) =>
        c.open_tasks > 0 ? (
          <span className={cn("text-xs font-medium", c.overdue_tasks > 0 ? "text-error" : "text-foreground")}>
            {c.open_tasks}
            {c.overdue_tasks > 0 ? ` (${c.overdue_tasks} en retard)` : ""}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    { header: "Statut", cell: (c) => <StatusBadge kind="client" status={c.status} /> },
    { header: "Créé le", align: "right", cell: (c) => <span className="text-muted-foreground">{formatDate(c.created_at)}</span> },
  ];

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${count} client${count > 1 ? "s" : ""}`}
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Nouveau client
          </Button>
        }
      />

      <Panel
        title="Liste"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                placeholder="Rechercher…"
                className="h-9 w-44 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <Select
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value as RiskCategory | "all");
              }}
              className="h-9 w-32"
            >
              <option value="all">Toutes cat.</option>
              <option value="A">Cat. A</option>
              <option value="B">Cat. B</option>
              <option value="C">Cat. C</option>
              <option value="D">Cat. D</option>
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value as ClientStatus | "all");
              }}
              className="h-9 w-36"
            >
              <option value="all">Tous statuts</option>
              <option value="prospect">Prospect</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="blacklisted">Bloqué</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              getKey={(c) => c.id}
              onRowClick={(c) => router.push(`/admin/clients/${c.id}`)}
              empty={{ title: "Aucun client", hint: "Créez un client ou importez vos données." }}
            />
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Page {page} / {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    Précédent
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Panel>

      <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={() => load()} />
    </div>
  );
}
