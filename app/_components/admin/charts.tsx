"use client";

import { useId } from "react";
import { cn } from "@/_lib/utils";

// Dependency-free SVG charts matching the grayscale/gold design system.
// All take plain number arrays and scale to a viewBox; colours come from CSS vars.

export interface SeriesPoint {
  label: string;
  value: number;
}

// Smooth-ish area + line chart for a single time series (e.g. monthly volume).
export function LineChart({
  data,
  height = 180,
  format,
  tone = "gold",
}: {
  data: SeriesPoint[];
  height?: number;
  format?: (n: number) => string;
  tone?: "gold" | "foreground" | "success";
}) {
  const gid = useId().replace(/:/g, "");
  if (!data.length) return <Empty height={height} />;
  const w = 600;
  const h = height;
  const pad = { t: 12, r: 8, b: 22, l: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const min = Math.min(0, ...data.map((d) => d.value));
  const range = max - min || 1;
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const x = (i: number) => pad.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v: number) => pad.t + innerH - ((v - min) / range) * innerH;
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.value)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${pad.t + innerH} L${x(0)},${pad.t + innerH} Z`;
  const stroke =
    tone === "success" ? "var(--success, #16a34a)" : tone === "foreground" ? "currentColor" : "var(--dark-gold, #b08d57)";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full text-foreground" preserveAspectRatio="none" role="img">
      <defs>
        <linearGradient id={`grad-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#grad-${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.value)} r="2.5" fill={stroke}>
            <title>{`${d.label} · ${format ? format(d.value) : d.value}`}</title>
          </circle>
        </g>
      ))}
    </svg>
  );
}

// Two-series grouped vertical bars (re-usable beyond the dashboard's pair).
export function GroupedBars({
  data,
  height = 192,
  labels,
  format,
}: {
  data: { label: string; a: number; b: number }[];
  height?: number;
  labels?: [string, string];
  format?: (n: number) => string;
}) {
  if (!data.length) return <Empty height={height} />;
  const max = Math.max(1, ...data.flatMap((d) => [d.a, d.b]));
  return (
    <div>
      {labels ? (
        <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-foreground/35" /> {labels[0]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> {labels[1]}
          </span>
        </div>
      ) : null}
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-1/2 max-w-[18px] rounded-t-sm bg-foreground/35 transition-all"
                style={{ height: `${(d.a / max) * 100}%` }}
                title={`${d.label} · ${format ? format(d.a) : d.a}`}
              />
              <div
                className="w-1/2 max-w-[18px] rounded-t-sm bg-primary transition-all"
                style={{ height: `${(d.b / max) * 100}%` }}
                title={`${d.label} · ${format ? format(d.b) : d.b}`}
              />
            </div>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const DONUT_TONES = ["var(--dark-gold,#b08d57)", "#6b7280", "#9ca3af", "#d1d5db", "#16a34a", "#dc2626", "#f59e0b"];

// Donut chart for categorical distributions (status mix, risk mix…).
export function DonutChart({
  segments,
  size = 132,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color?: string }[];
  size?: number;
  centerLabel?: string;
  centerValue?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 54;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 132 132" width={size} height={size} className="-rotate-90">
        <circle cx="66" cy="66" r={r} fill="none" stroke="var(--border,#e5e7eb)" strokeWidth="14" />
        {total > 0 &&
          segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * c;
            const seg = (
              <circle
                key={i}
                cx="66"
                cy="66"
                r={r}
                fill="none"
                stroke={s.color ?? DONUT_TONES[i % DONUT_TONES.length]}
                strokeWidth="14"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-acc}
              >
                <title>{`${s.label} · ${s.value}`}</title>
              </circle>
            );
            acc += dash;
            return seg;
          })}
      </svg>
      <div className="min-w-0">
        {centerValue ? (
          <p className="text-lg font-semibold tabular-nums text-foreground">{centerValue}</p>
        ) : null}
        {centerLabel ? <p className="mb-2 text-xs text-muted-foreground">{centerLabel}</p> : null}
        <ul className="space-y-1">
          {segments.map((s, i) => (
            <li key={i} className="flex items-center gap-2 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ background: s.color ?? DONUT_TONES[i % DONUT_TONES.length] }}
              />
              <span className="flex-1 truncate text-muted-foreground">{s.label}</span>
              <span className="tabular-nums font-medium text-foreground">{s.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Tiny inline sparkline (table cells, KPI footers).
export function Sparkline({ data, width = 80, height = 22 }: { data: number[]; width?: number; height?: number }) {
  if (data.length < 2) return <span className="text-xs text-muted-foreground">—</span>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) - 1}`)
    .join(" ");
  return (
    <svg width={width} height={height} className="text-dark-gold">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

// Horizontal stacked proportion bar with legend (KYC completeness, allocation…).
export function StackedBar({
  segments,
  className,
}: {
  segments: { label: string; value: number; color?: string }[];
  className?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div className={className}>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {segments.map((s, i) => (
          <div
            key={i}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color ?? DONUT_TONES[i % DONUT_TONES.length] }}
            title={`${s.label} · ${s.value}`}
          />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ background: s.color ?? DONUT_TONES[i % DONUT_TONES.length] }}
            />
            {s.label} <span className="tabular-nums font-medium text-foreground">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ height }: { height: number }) {
  return (
    <div className={cn("flex items-center justify-center rounded-md border border-dashed border-border")} style={{ height }}>
      <span className="text-xs text-muted-foreground">Aucune donnée</span>
    </div>
  );
}
