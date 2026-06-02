"use client";

import { useMemo } from "react";
import { CalendarRange, RotateCcw, X } from "lucide-react";
import { cn } from "@/_lib/utils";
import { formatDate } from "@/_lib/admin/format";
import type { StatsFilters } from "@/_lib/admin/types";

// ============================================================================
// FilterBar — the shared, "ultra-complete" filter rail at the top of every
// Statistiques page. Date window (presets + custom range) + contextual
// dimension selects (product / country / risk / status / source), active-filter
// chips and a reset. Controlled: the page owns the StatsFilters state.
// Grayscale / Linear, inline, no modal.
// ============================================================================

export type DimensionKey = "product" | "country" | "risk" | "status" | "source";
export interface DimensionOption { value: string; label: string }
export interface DimensionConfig {
  key: DimensionKey;
  label: string;
  allLabel?: string;
  options: DimensionOption[];
}

// Catalogue-aligned option sets (the dataset's actual dimensions). ------------
export const PRODUCT_OPTIONS: DimensionOption[] = [
  { value: "micro-credit", label: "Micro-crédit" },
  { value: "consumer", label: "Crédit conso" },
  { value: "professional", label: "Crédit pro" },
  { value: "student", label: "Prêt étudiant" },
  { value: "salary-advance", label: "Avance sur salaire" },
  { value: "leasing", label: "Leasing" },
  { value: "loan-consolidation", label: "Regroupement de crédits" },
  { value: "financial-coaching", label: "Coaching financier" },
];

export const COUNTRY_OPTIONS: DimensionOption[] = [
  { value: "FR", label: "France" },
  { value: "EE", label: "Estonie" },
];

export const RISK_OPTIONS: DimensionOption[] = [
  { value: "A", label: "A — Très bon" },
  { value: "B", label: "B — Bon" },
  { value: "C", label: "C — Moyen" },
  { value: "D", label: "D — Risqué" },
];

export const LOAN_STATUS_OPTIONS: DimensionOption[] = [
  { value: "active", label: "En cours" },
  { value: "paid_off", label: "Soldé" },
  { value: "defaulted", label: "En défaut" },
  { value: "cancelled", label: "Annulé" },
  { value: "draft", label: "Brouillon" },
];

export const CLIENT_STATUS_OPTIONS: DimensionOption[] = [
  { value: "active", label: "Actif" },
  { value: "prospect", label: "Prospect" },
  { value: "inactive", label: "Inactif" },
  { value: "blacklisted", label: "Bloqué" },
];

export const APP_STATUS_OPTIONS: DimensionOption[] = [
  { value: "submitted", label: "Reçue" },
  { value: "under_review", label: "En étude" },
  { value: "approved", label: "Approuvée" },
  { value: "rejected", label: "Refusée" },
  { value: "cancelled", label: "Annulée" },
  { value: "draft", label: "Brouillon" },
];

export const SOURCE_OPTIONS: DimensionOption[] = [
  { value: "direct", label: "Direct" },
  { value: "website", label: "Site web" },
  { value: "simulator", label: "Simulateur" },
  { value: "referral", label: "Parrainage" },
  { value: "ads", label: "Publicité" },
];

export function defaultStatsFilters(): StatsFilters {
  return { from: null, to: null, product: null, country: null, risk: null, status: null, source: null };
}

// Date helpers ----------------------------------------------------------------
type PresetKey = "30d" | "90d" | "6m" | "12m" | "ytd" | "all";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "30d", label: "30 j" },
  { key: "90d", label: "90 j" },
  { key: "6m", label: "6 mois" },
  { key: "12m", label: "12 mois" },
  { key: "ytd", label: "YTD" },
  { key: "all", label: "Tout" },
];

const PRESET_LABELS: Record<PresetKey, string> = {
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  "6m": "6 derniers mois",
  "12m": "12 derniers mois",
  ytd: "Depuis le 1er janvier",
  all: "Tout l'historique",
};

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function presetRange(key: PresetKey): { from: string | null; to: string | null } {
  const today = new Date();
  const to = iso(today);
  const d = new Date(today);
  switch (key) {
    case "30d": d.setDate(d.getDate() - 30); return { from: iso(d), to };
    case "90d": d.setDate(d.getDate() - 90); return { from: iso(d), to };
    case "6m": d.setMonth(d.getMonth() - 6); return { from: iso(d), to };
    case "12m": d.setMonth(d.getMonth() - 12); return { from: iso(d), to };
    case "ytd": return { from: `${today.getFullYear()}-01-01`, to };
    case "all": return { from: null, to: null };
  }
}

function matchPreset(f: StatsFilters): PresetKey | "custom" {
  if (!f.from && !f.to) return "all";
  for (const p of PRESETS) {
    if (p.key === "all") continue;
    const r = presetRange(p.key);
    if (r.from === f.from && r.to === f.to) return p.key;
  }
  return "custom";
}

function periodChip(f: StatsFilters, preset: PresetKey | "custom"): string {
  if (preset !== "custom") return PRESET_LABELS[preset];
  return `${f.from ? formatDate(f.from) : "…"} → ${f.to ? formatDate(f.to) : "…"}`;
}

const dateInput =
  "rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

export function FilterBar({
  value,
  onChange,
  dimensions = [],
  dateLabel = "Période",
}: {
  value: StatsFilters;
  onChange: (next: StatsFilters) => void;
  dimensions?: DimensionConfig[];
  dateLabel?: string;
}) {
  const activePreset = useMemo(() => matchPreset(value), [value]);
  const activeDims = dimensions.filter((d) => value[d.key]);
  const hasActive = !!value.from || !!value.to || activeDims.length > 0;

  const setPreset = (key: PresetKey) => onChange({ ...value, ...presetRange(key) });
  const setDate = (k: "from" | "to", v: string) => onChange({ ...value, [k]: v || null });
  const setDim = (k: DimensionKey, v: string) => onChange({ ...value, [k]: v || null });
  const reset = () =>
    onChange({ ...value, from: null, to: null, ...Object.fromEntries(dimensions.map((d) => [d.key, null])) });

  return (
    <section className="rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <CalendarRange className="h-4 w-4" />
          {dateLabel}
        </span>

        <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPreset(p.key)}
              className={cn(
                "rounded px-2 py-1 text-xs font-medium transition-colors",
                activePreset === p.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="inline-flex items-center gap-1.5">
          <input
            type="date"
            value={value.from ?? ""}
            max={value.to ?? undefined}
            onChange={(e) => setDate("from", e.target.value)}
            aria-label="Date de début"
            className={dateInput}
          />
          <span className="text-xs text-muted-foreground">→</span>
          <input
            type="date"
            value={value.to ?? ""}
            min={value.from ?? undefined}
            onChange={(e) => setDate("to", e.target.value)}
            aria-label="Date de fin"
            className={dateInput}
          />
        </div>

        {dimensions.map((d) => (
          <label key={d.key} className="inline-flex items-center gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{d.label}</span>
            <select
              value={value[d.key] ?? ""}
              onChange={(e) => setDim(d.key, e.target.value)}
              className={cn(dateInput, "appearance-none pr-7")}
            >
              <option value="">{d.allLabel ?? "Tous"}</option>
              {d.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        {hasActive ? (
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser
          </button>
        ) : null}
      </div>

      {hasActive ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border px-3 py-2">
          {value.from || value.to ? (
            <Chip label={periodChip(value, activePreset)} onClear={() => onChange({ ...value, from: null, to: null })} />
          ) : null}
          {activeDims.map((d) => {
            const opt = d.options.find((o) => o.value === value[d.key]);
            return <Chip key={d.key} label={`${d.label} · ${opt?.label ?? value[d.key]}`} onClear={() => setDim(d.key, "")} />;
          })}
        </div>
      ) : null}
    </section>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs text-foreground">
      {label}
      <button type="button" onClick={onClear} className="text-muted-foreground hover:text-foreground" aria-label="Retirer le filtre">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
