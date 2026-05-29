"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Plus, Search } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Panel } from "@/_components/admin/panel";
import { KpiCard } from "@/_components/admin/kpi-card";
import { DataTable, type Column } from "@/_components/admin/data-table";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { createTask, listTasks, setTaskStatus } from "@/_lib/admin/tasks";
import { formatDate, fullName, taskCategoryLabels, taskPriorityLabels } from "@/_lib/admin/format";
import type { TaskCategory, TaskPriority, TaskWithClient } from "@/_lib/admin/types";

type Filter = "open" | "open_overdue" | "done" | "all";

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-muted-foreground/40",
  normal: "bg-dark-gold",
  high: "bg-alert",
  urgent: "bg-error",
};

export default function TasksPage() {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<TaskWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("open");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "follow_up",
    priority: "normal",
    due_date: "",
    description: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listTasks({});
    setRows(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCount = rows.filter((t) => t.status === "open").length;
  const overdueCount = rows.filter((t) => t.status === "open" && t.is_overdue).length;
  const doneCount = rows.filter((t) => t.status === "done").length;

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((t) => {
      if (filter === "open" && t.status !== "open") return false;
      if (filter === "done" && t.status !== "done") return false;
      if (filter === "open_overdue" && !(t.status === "open" && t.is_overdue)) return false;
      if (s && !t.title.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [rows, filter, search]);

  async function toggle(t: TaskWithClient) {
    const res = await setTaskStatus(t.id, t.status === "done" ? "open" : "done");
    if (res.error) toast(res.error, "error");
    else load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast("Titre requis.", "error");
    setSaving(true);
    const res = await createTask({
      title: form.title.trim(),
      category: form.category as TaskCategory,
      priority: form.priority as TaskPriority,
      due_date: form.due_date || null,
      description: form.description || null,
    });
    setSaving(false);
    if (res.error) return toast(res.error, "error");
    toast("Tâche créée.");
    setOpen(false);
    setForm({ title: "", category: "follow_up", priority: "normal", due_date: "", description: "" });
    load();
  }

  const columns: Column<TaskWithClient>[] = [
    {
      header: "",
      cell: (t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggle(t);
          }}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border transition-colors",
            t.status === "done" ? "border-success bg-success text-white" : "border-border hover:border-accent"
          )}
          aria-label={t.status === "done" ? "Rouvrir" : "Marquer fait"}
        >
          {t.status === "done" ? <Check className="h-3 w-3" /> : null}
        </button>
      ),
    },
    {
      header: "Tâche",
      cell: (t) => (
        <div>
          <p className={cn("font-medium", t.status === "done" ? "text-muted-foreground line-through" : "text-foreground")}>
            {t.title}
          </p>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[t.priority])} />
            {taskCategoryLabels[t.category] ?? t.category}
          </span>
        </div>
      ),
    },
    {
      header: "Client",
      cell: (t) =>
        t.client_id ? (
          <span className="text-dark-gold">{fullName(t.first_name, t.last_name)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: "Échéance",
      cell: (t) =>
        t.due_date ? (
          <span className={cn(t.is_overdue && t.status === "open" && "font-semibold text-error")}>
            {formatDate(t.due_date)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { header: "Priorité", cell: (t) => taskPriorityLabels[t.priority] ?? t.priority },
  ];

  return (
    <div>
      <PageHeader
        title="Tâches"
        description="Relances et suivis de l'équipe (KYC, signatures, recouvrement)."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Nouvelle tâche
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <KpiCard label="À faire" value={String(openCount)} />
        <KpiCard label="En retard" value={String(overdueCount)} tone={overdueCount ? "error" : "default"} />
        <KpiCard label="Faites" value={String(doneCount)} tone="success" />
      </div>

      <Panel
        title="Liste"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
                className="h-9 w-44 rounded-md border border-input bg-background pl-8 pr-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} className="h-9 w-40">
              <option value="open">À faire</option>
              <option value="open_overdue">En retard</option>
              <option value="done">Faites</option>
              <option value="all">Toutes</option>
            </Select>
          </div>
        }
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            getKey={(t) => t.id}
            onRowClick={(t) => (t.client_id ? router.push(`/admin/clients/${t.client_id}`) : undefined)}
            empty={{ title: "Aucune tâche", hint: "Créez une tâche ou une relance." }}
          />
        )}
      </Panel>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Nouvelle tâche"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="global-task-form" disabled={saving}>
              Créer
            </Button>
          </>
        }
      >
        <form id="global-task-form" onSubmit={submit} className="space-y-4">
          <Field label="Titre" required>
            <TextInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <FieldGrid>
            <Field label="Catégorie">
              <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {Object.entries(taskCategoryLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priorité">
              <Select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                {Object.entries(taskPriorityLabels).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </FieldGrid>
          <Field label="Échéance">
            <TextInput type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
          </Field>
          <Field label="Détail">
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
