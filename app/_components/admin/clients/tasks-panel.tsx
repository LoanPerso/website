"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Panel } from "@/_components/admin/panel";
import { Modal } from "@/_components/admin/dialog";
import { Field, FieldGrid, Select, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { createTask, listClientTasks, setTaskStatus } from "@/_lib/admin/tasks";
import { formatDate, taskCategoryLabels, taskPriorityLabels } from "@/_lib/admin/format";
import type { Task, TaskCategory, TaskPriority } from "@/_lib/admin/types";

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-muted-foreground/40",
  normal: "bg-dark-gold",
  high: "bg-alert",
  urgent: "bg-error",
};

export function TasksPanel({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [rows, setRows] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
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
    const res = await listClientTasks(clientId);
    setRows(res.data ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggle(t: Task) {
    const res = await setTaskStatus(t.id, t.status === "done" ? "open" : "done");
    if (res.error) toast(res.error, "error");
    else load();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast("Titre requis.", "error");
    setSaving(true);
    const res = await createTask({
      client_id: clientId,
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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Panel
      title="Tâches & relances"
      actions={
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Tâche
        </Button>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune tâche.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((t) => {
            const done = t.status === "done";
            const overdue = !done && t.due_date && t.due_date < today;
            return (
              <li key={t.id} className="flex items-start gap-3 py-3">
                <button
                  onClick={() => toggle(t)}
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                    done ? "border-success bg-success text-white" : "border-border hover:border-accent"
                  )}
                  aria-label={done ? "Rouvrir" : "Marquer fait"}
                >
                  {done ? <Check className="h-3 w-3" /> : null}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", done ? "text-muted-foreground line-through" : "text-foreground")}>
                    {t.title}
                  </p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className={cn("h-2 w-2 rounded-full", PRIORITY_DOT[t.priority])} />
                      {taskCategoryLabels[t.category] ?? t.category}
                    </span>
                    {t.due_date ? (
                      <span className={cn(overdue && "font-semibold text-error")}>
                        échéance {formatDate(t.due_date)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Nouvelle tâche"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" form="task-form" disabled={saving}>
              Créer
            </Button>
          </>
        }
      >
        <form id="task-form" onSubmit={submit} className="space-y-4">
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
    </Panel>
  );
}
