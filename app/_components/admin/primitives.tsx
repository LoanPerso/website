"use client";

import type { ReactNode } from "react";
import { cn } from "@/_lib/utils";

// Shared low-level visual primitives used across every admin dossier/detail.
// (Originally introduced in applications/parts.tsx; promoted here for reuse.)

export type Tone = "default" | "success" | "warning" | "error" | "info";

const TONE_TEXT: Record<Tone, string> = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-alert",
  error: "text-error",
  info: "text-foreground",
};

const TONE_BAR: Record<Tone, string> = {
  default: "bg-muted-foreground/40",
  success: "bg-success",
  warning: "bg-alert",
  error: "bg-error",
  info: "bg-foreground",
};

const SOFT_DOT: Record<Tone, string> = {
  default: "bg-muted-foreground/50",
  success: "bg-success",
  warning: "bg-alert",
  error: "bg-error",
  info: "bg-foreground",
};

// Compact metric tile.
export function Metric({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="rounded-md border border-border bg-secondary/30 px-3 py-2.5">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-0.5 text-base font-semibold tabular-nums", TONE_TEXT[tone])}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

// Horizontal progress/ratio bar with a label and right-aligned value.
export function Bar({
  label,
  pct,
  value,
  tone = "info",
  marker,
}: {
  label: ReactNode;
  pct: number;
  value?: ReactNode;
  tone?: Tone;
  marker?: number;
}) {
  const width = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">{label}</span>
        {value != null ? <span className="tabular-nums text-muted-foreground">{value}</span> : null}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", TONE_BAR[tone])} style={{ width: `${width}%` }} />
        {marker != null ? (
          <span
            className="absolute top-0 h-full w-px bg-foreground/50"
            style={{ left: `${Math.max(0, Math.min(100, marker))}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function SoftBadge({ tone = "default", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", SOFT_DOT[tone])} />
      {children}
    </span>
  );
}

export function KeyVal({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-1.5 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">
        {value === null || value === undefined || value === "" ? "—" : value}
      </dd>
    </div>
  );
}

export function GroupTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{children}</p>
      {hint ? <span className="text-xs text-muted-foreground/70">{hint}</span> : null}
    </div>
  );
}

// Verdict banner used at the top of analysis tabs.
export function VerdictBanner({
  tone,
  title,
  detail,
  right,
}: {
  tone: Tone;
  title: ReactNode;
  detail?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-secondary/30 px-4 py-3">
      <div>
        <p className={cn("text-sm font-semibold", TONE_TEXT[tone])}>{title}</p>
        {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
      </div>
      {right}
    </div>
  );
}

export { TONE_TEXT, TONE_BAR };

// Loading primitives live in ./bits; re-exported here so the primitives barrel
// is a one-stop import for detail/dossier scaffolding.
export { Skeleton, PanelLoading } from "./bits";
