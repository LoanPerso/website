"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, RefreshCw, UserPlus } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { PageHeader } from "@/_components/admin/page-header";
import { Select } from "@/_components/admin/form";
import { StatusBadge } from "@/_components/admin/status-badge";
import { useToast } from "@/_components/admin/toast";
import { OverviewPanel } from "@/_components/admin/applications/overview-panel";
import { FinancialPanel } from "@/_components/admin/applications/financial-panel";
import { FraudPanel } from "@/_components/admin/applications/fraud-panel";
import { DecisionPanel } from "@/_components/admin/applications/decision-panel";
import { PricingPanel } from "@/_components/admin/applications/pricing-panel";
import { ContractPanel } from "@/_components/admin/applications/contract-panel";
import { CommsPanel } from "@/_components/admin/applications/comms-panel";
import { ApplicationTasksPanel } from "@/_components/admin/applications/tasks-panel";
import { EditApplicationDialog } from "@/_components/admin/applications/edit-dialog";
import { SoftBadge } from "@/_components/admin/applications/parts";
import {
  assignApplication,
  convertApplicationToClient,
  getApplicationFull,
  listApplicationPeers,
  recomputeApplicationScore,
  setApplicationPriority,
  transitionApplication,
} from "@/_lib/admin/applications";
import { listProducts } from "@/_lib/admin/products";
import { listAdmins } from "@/_lib/admin/admin-users";
import { SLA_HOURS, hoursSince } from "@/_lib/admin/application";
import type { AdminUser, ApplicationPriority, ApplicationStatus, LoanApplicationFull, Product } from "@/_lib/admin/types";
import { applicationStatusLabels, formatDate, fullName, taskPriorityLabels } from "@/_lib/admin/format";

const TABS = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "financial", label: "Analyse financière" },
  { key: "fraud", label: "Fraude & AML" },
  { key: "decision", label: "Décision" },
  { key: "pricing", label: "Tarification" },
  { key: "contract", label: "Contrat" },
  { key: "comms", label: "Communications" },
  { key: "tasks", label: "Tâches" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();

  const [app, setApp] = useState<LoanApplicationFull | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [peers, setPeers] = useState<LoanApplicationFull[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<TabKey>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const reload = useCallback(async () => {
    const a = await getApplicationFull(id);
    setApp(a.data);
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    const [a, p, pe, ad] = await Promise.all([
      getApplicationFull(id),
      listProducts(),
      listApplicationPeers(),
      listAdmins(),
    ]);
    setApp(a.data);
    setProducts(p.data ?? []);
    setPeers(pe.data ?? []);
    setAdmins(ad.data ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const product = useMemo(() => products.find((p) => p.slug === app?.credit_type) ?? null, [products, app]);

  const sla = useMemo(() => {
    if (!app) return null;
    const slaHours = SLA_HOURS[app.status] ?? 24;
    const ageHours = Math.round(hoursSince(app.stage_entered_at ?? app.created_at));
    const remaining = slaHours - ageHours;
    const band = slaHours > 0 && ageHours / slaHours > 1 ? "breach" : slaHours > 0 && ageHours / slaHours > 0.8 ? "warn" : "ok";
    return { remaining, band };
  }, [app]);

  if (loading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!app) return <p className="text-sm text-muted-foreground">Demande introuvable.</p>;

  async function changeStatus(status: ApplicationStatus) {
    setBusy(true);
    const res = await transitionApplication(app!.id, status);
    setBusy(false);
    if (res.error) toast(res.error, "error");
    else { toast("Statut mis à jour."); reload(); }
  }

  async function changePriority(priority: ApplicationPriority) {
    const res = await setApplicationPriority(app!.id, priority);
    if (res.error) toast(res.error, "error");
    else { toast("Priorité mise à jour."); reload(); }
  }

  async function changeAssignee(userId: string) {
    const res = await assignApplication(app!.id, userId || null);
    if (res.error) toast(res.error, "error");
    else { toast("Affectation mise à jour."); reload(); }
  }

  async function recompute() {
    setBusy(true);
    const res = await recomputeApplicationScore(app!);
    setBusy(false);
    if (res.error) toast(res.error, "error");
    else { toast("Score recalculé."); reload(); }
  }

  async function convert() {
    setBusy(true);
    const res = await convertApplicationToClient(app!.id);
    setBusy(false);
    if (res.error || !res.data) return toast(res.error ?? "Erreur", "error");
    toast("Demande convertie en client.");
    router.push(`/admin/clients/${res.data.id}`);
  }

  return (
    <div>
      <Link href="/admin/applications" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Demandes
      </Link>

      <PageHeader
        title={fullName(app.first_name, app.last_name)}
        description={`Dossier ${app.id.slice(0, 8).toUpperCase()} · reçue le ${formatDate(app.created_at)}${app.source ? ` · ${app.source}` : ""}`}
        actions={
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Modifier
            </Button>
            {app.converted_client_id ? (
              <Button asChild>
                <Link href={`/admin/clients/${app.converted_client_id}`}>Voir le client</Link>
              </Button>
            ) : (
              <Button onClick={convert} disabled={busy}>
                <UserPlus className="h-4 w-4" /> Convertir en client
              </Button>
            )}
          </>
        }
      />

      {/* Workflow bar */}
      <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg border border-border bg-background px-3 py-2">
        <StatusBadge kind="application" status={app.status} />
        {app.converted_client_id ? <SoftBadge tone="success">Convertie</SoftBadge> : null}
        {sla ? (
          <SoftBadge tone={sla.band === "breach" ? "error" : sla.band === "warn" ? "warning" : "success"}>
            SLA {sla.remaining >= 0 ? `${sla.remaining}h restantes` : `${Math.abs(sla.remaining)}h de retard`}
          </SoftBadge>
        ) : null}
        {app.score != null ? (
          <SoftBadge tone={app.score_category === "A" ? "success" : app.score_category === "B" ? "info" : app.score_category === "C" ? "warning" : "error"}>
            Score {app.score} · {app.score_category}
          </SoftBadge>
        ) : null}
        {(app.tags ?? []).map((t) => <SoftBadge key={t}>{t}</SoftBadge>)}

        <div className="ml-auto flex items-center gap-1.5">
          <Select aria-label="Statut" title="Statut" value={app.status} onChange={(e) => changeStatus(e.target.value as ApplicationStatus)} className="h-8 w-32 text-xs" disabled={busy}>
            {Object.entries(applicationStatusLabels).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </Select>
          <Select aria-label="Priorité" title="Priorité" value={app.priority ?? "normal"} onChange={(e) => changePriority(e.target.value as ApplicationPriority)} className="h-8 w-28 text-xs">
            {Object.entries(taskPriorityLabels).map(([v, l]) => (<option key={v} value={v}>{l}</option>))}
          </Select>
          <Select aria-label="Affecté à" title="Affecté à" value={app.assigned_to ?? ""} onChange={(e) => changeAssignee(e.target.value)} className="h-8 w-36 text-xs">
            <option value="">Non affecté</option>
            {admins.map((a) => (<option key={a.id} value={a.id}>{a.full_name ?? a.email}</option>))}
          </Select>
          <Button variant="outline" size="sm" onClick={recompute} disabled={busy} title="Recalculer le score" aria-label="Recalculer le score" className="h-8 w-8 p-0">
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
            {tab === t.key ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-dark-gold" /> : null}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewPanel app={app} product={product} peers={peers} onGoTab={(t) => setTab(t as TabKey)} />}
      {tab === "financial" && <FinancialPanel app={app} />}
      {tab === "fraud" && <FraudPanel app={app} peers={peers} onUpdated={reload} />}
      {tab === "decision" && <DecisionPanel app={app} product={product} peers={peers} onUpdated={reload} />}
      {tab === "pricing" && <PricingPanel app={app} product={product} onUpdated={reload} />}
      {tab === "contract" && <ContractPanel app={app} product={product} onUpdated={reload} />}
      {tab === "comms" && <CommsPanel app={app} peers={peers} onUpdated={reload} />}
      {tab === "tasks" && <ApplicationTasksPanel applicationId={app.id} />}

      <EditApplicationDialog app={app} open={editOpen} onOpenChange={setEditOpen} onSaved={reload} />
    </div>
  );
}
