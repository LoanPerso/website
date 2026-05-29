"use client";

import { formatCurrency, formatMonth } from "@/_lib/admin/format";

export interface ChartPoint {
  month: string;
  disbursed: number;
  collected: number;
}

// Lightweight two-series monthly bar chart (no chart dependency).
export function MonthlyBarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.disbursed, d.collected)));

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-foreground/35" /> Débloqué
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Encaissé
        </span>
      </div>
      <div className="flex h-48 items-end gap-2">
        {data.map((d) => (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/2 max-w-[18px] rounded-t-sm bg-foreground/35 transition-all"
                style={{ height: `${(d.disbursed / max) * 100}%` }}
                title={`${formatMonth(d.month)} — débloqué ${formatCurrency(d.disbursed)}`}
              />
              <div
                className="w-1/2 max-w-[18px] rounded-t-sm bg-primary transition-all"
                style={{ height: `${(d.collected / max) * 100}%` }}
                title={`${formatMonth(d.month)} — encaissé ${formatCurrency(d.collected)}`}
              />
            </div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {formatMonth(d.month)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
