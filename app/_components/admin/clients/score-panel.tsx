"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/_lib/utils";
import { Button } from "@/_components/ui/button";
import { Panel } from "@/_components/admin/panel";
import { Modal } from "@/_components/admin/dialog";
import { Field, TextInput, Textarea } from "@/_components/admin/form";
import { useToast } from "@/_components/admin/toast";
import { ScoreGauge } from "./score-gauge";
import { Badge } from "@/_components/admin/status-badge";
import { listClientScores, overrideClientScore, recomputeClientScore } from "@/_lib/admin/scores";
import { isScoreStale } from "@/_lib/admin/scoring";
import { formatDate, scoreSourceLabels } from "@/_lib/admin/format";
import type { Client, ClientScore } from "@/_lib/admin/types";

export function ScorePanel({ client, onUpdated }: { client: Client; onUpdated: () => void }) {
  const toast = useToast();
  const [scores, setScores] = useState<ClientScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideScore, setOverrideScore] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listClientScores(client.id);
    setScores(res.data ?? []);
    setLoading(false);
  }, [client.id]);

  useEffect(() => {
    load();
  }, [load]);

  const latest = scores[0] ?? null;
  const stale = isScoreStale(client.score_updated_at);

  async function recompute() {
    setBusy(true);
    const res = await recomputeClientScore(client, "recompute");
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Score recalculé.");
    await load();
    onUpdated();
  }

  async function submitOverride(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(overrideScore);
    if (!Number.isFinite(n) || n < 0 || n > 100) return toast("Score entre 0 et 100.", "error");
    if (!overrideReason.trim()) return toast("Justification requise.", "error");
    setBusy(true);
    const res = await overrideClientScore(client, n, overrideReason.trim());
    setBusy(false);
    if (res.error) return toast(res.error, "error");
    toast("Score ajusté manuellement.");
    setOverrideOpen(false);
    setOverrideScore("");
    setOverrideReason("");
    await load();
    onUpdated();
  }

  return (
    <Panel
      title="Scoring crédit"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setOverrideOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Ajuster
          </Button>
          <Button size="sm" onClick={recompute} disabled={busy}>
            <RefreshCw className={cn("h-4 w-4", busy && "animate-spin")} /> Recalculer
          </Button>
        </div>
      }
    >
      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[190px_1fr]">
          <div className="flex flex-col items-center gap-2">
            <ScoreGauge
              score={latest?.score ?? client.credit_score ?? null}
              category={latest?.category ?? client.risk_category ?? null}
            />
            <p className="text-center text-xs text-muted-foreground">
              {client.score_updated_at ? `MAJ ${formatDate(client.score_updated_at)}` : "Jamais calculé"}
            </p>
            <div className="flex flex-wrap justify-center gap-1">
              {stale ? (
                <Badge tone="warning">À actualiser</Badge>
              ) : null}
              {latest && !latest.is_complete ? (
                <Badge tone="neutral">Données incomplètes</Badge>
              ) : null}
            </div>
          </div>

          <div className="space-y-5">
            {latest ? (
              <>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Décomposition du score
                  </p>
                  <div className="space-y-2.5">
                    {latest.factors.map((f) => (
                      <FactorRow
                        key={f.code}
                        label={f.label}
                        weight={f.weight}
                        score={f.score}
                        raw={f.raw}
                        unknown={f.status === "unknown"}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Metric
                    label="Taux d'endettement"
                    value={latest.dti == null ? "—" : `${Math.round(Number(latest.dti) * 100)} %`}
                  />
                  <Metric label="Modèle" value={latest.model_version} />
                </div>

                {latest.reason_codes.length ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Points de vigilance
                    </p>
                    <ul className="space-y-1 text-sm">
                      {latest.reason_codes.map((r) => (
                        <li key={r.code} className="flex items-center justify-between gap-3">
                          <span className="text-foreground">{r.label}</span>
                          <span className="font-mono text-xs text-alert">{r.score}/100</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {client.score_override != null ? (
                  <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground">
                    <span className="font-semibold">Override manuel :</span> {client.score_override_reason || "—"}
                  </div>
                ) : null}

                {scores.length > 1 ? (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Historique
                    </p>
                    <ul className="space-y-1 text-sm">
                      {scores.slice(0, 6).map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center justify-between gap-3 text-muted-foreground"
                        >
                          <span>
                            {formatDate(s.computed_at)} · {scoreSourceLabels[s.source] ?? s.source}
                          </span>
                          <span className="font-mono text-foreground">
                            {s.score} · {s.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full flex-col items-start justify-center gap-3">
                <p className="text-sm text-muted-foreground">Aucun score calculé pour ce client.</p>
                <Button size="sm" onClick={recompute} disabled={busy}>
                  <RefreshCw className="h-4 w-4" /> Calculer le score
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        title="Ajuster le score manuellement"
        description="L'ajustement est tracé (snapshot manuel) et requiert une justification."
        footer={
          <>
            <Button variant="outline" onClick={() => setOverrideOpen(false)} disabled={busy}>
              Annuler
            </Button>
            <Button type="submit" form="override-form" disabled={busy}>
              Enregistrer
            </Button>
          </>
        }
      >
        <form id="override-form" onSubmit={submitOverride} className="space-y-4">
          <Field label="Score (0-100)" required>
            <TextInput
              type="number"
              min={0}
              max={100}
              value={overrideScore}
              onChange={(e) => setOverrideScore(e.target.value)}
            />
          </Field>
          <Field label="Justification" required>
            <Textarea value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
          </Field>
        </form>
      </Modal>
    </Panel>
  );
}

function FactorRow({
  label,
  weight,
  score,
  raw,
  unknown,
}: {
  label: string;
  weight: number;
  score: number | null;
  raw: string;
  unknown: boolean;
}) {
  const pct = score ?? 0;
  const tone =
    score == null
      ? "bg-muted-foreground/30"
      : pct >= 75
        ? "bg-success"
        : pct >= 50
          ? "bg-dark-gold"
          : pct >= 30
            ? "bg-alert"
            : "bg-error";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">
          {label} <span className="text-muted-foreground">· {weight}%</span>
        </span>
        <span className={cn("tabular-nums", unknown ? "text-muted-foreground" : "text-foreground")}>
          {unknown ? "Donnée manquante" : `${score}/100`}{" "}
          <span className="text-muted-foreground">({raw})</span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${unknown ? 0 : pct}%` }} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
