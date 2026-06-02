"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Bar, type Tone } from "./primitives";
import type { Result, StatsFilters } from "@/_lib/admin/types";

// ============================================================================
// Shared scaffolding for the Statistiques pages: a debounced filter-driven
// fetch hook + a couple of dense layout helpers, so every page stays terse and
// visually consistent.
// ============================================================================

// Refetch whenever the filters change (debounced so typing in the date inputs
// doesn't spam the RPC); ignores stale responses.
export function useStatsData<T>(
  fetcher: (f: StatsFilters) => Promise<Result<T>>,
  filters: StatsFilters
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await fetcher(filters);
      if (!alive) return;
      setData(res.data);
      setError(res.error);
      setLoading(false);
    }, 200);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [fetcher, filters]);

  return { data, loading, error };
}

// Responsive grid of compact Metric tiles.
export function StatGrid({ children, cols = 4 }: { children: ReactNode; cols?: 2 | 3 | 4 | 5 }) {
  const map: Record<number, string> = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-3 lg:grid-cols-5",
  };
  return <div className={`grid gap-3 ${map[cols]}`}>{children}</div>;
}

// Ranked horizontal bars from a value list (auto-scaled to the max).
export function MiniBars({
  items,
  format,
  tone = "info",
}: {
  items: { label: ReactNode; value: number; display?: ReactNode; tone?: Tone }[];
  format?: (n: number) => string;
  tone?: Tone;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <Bar
          key={i}
          label={it.label}
          pct={(it.value / max) * 100}
          value={it.display ?? (format ? format(it.value) : it.value)}
          tone={it.tone ?? tone}
        />
      ))}
    </div>
  );
}

// Centered loading line for the data area (the FilterBar stays mounted above).
export function StatsLoading() {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16">
      <span className="text-sm text-muted-foreground">Chargement des statistiques…</span>
    </div>
  );
}

// Inline error banner for a failed RPC call.
export function StatsError({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-error/40 bg-error/5 px-4 py-3 text-sm text-error">
      Erreur de chargement : {message}
    </div>
  );
}
