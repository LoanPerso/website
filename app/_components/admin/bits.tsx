"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/_lib/utils";

// Copy-to-clipboard inline button (references, IBANs, emails…).
export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className={cn("text-muted-foreground transition-colors hover:text-foreground", className)}
      title="Copier"
      aria-label="Copier"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// Monospace reference chip with a copy affordance.
export function RefChip({ value }: { value: string | null | undefined }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs text-foreground">{value}</span>
      <CopyButton value={value} />
    </span>
  );
}

// Section heading inside a panel/page (with optional right-side action).
export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{children}</h3>
      {action}
    </div>
  );
}

// Circular progress ring (completeness / utilisation gauges).
export function ProgressRing({
  value,
  size = 56,
  label,
  tone = "gold",
}: {
  value: number; // 0-100
  size?: number;
  label?: ReactNode;
  tone?: "gold" | "success" | "warning" | "error";
}) {
  const pct = Math.max(0, Math.min(100, value));
  const r = 22;
  const c = 2 * Math.PI * r;
  const color =
    tone === "success" ? "#16a34a" : tone === "warning" ? "#f59e0b" : tone === "error" ? "#dc2626" : "var(--dark-gold,#b08d57)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" className="-rotate-90" width={size} height={size}>
        <circle cx="28" cy="28" r={r} fill="none" stroke="var(--border,#e5e7eb)" strokeWidth="5" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums text-foreground">
        {label ?? `${Math.round(pct)}%`}
      </span>
    </div>
  );
}

// Loading skeleton block.
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-secondary", className)} />;
}

// Inline loading row for async panels.
export function PanelLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}
