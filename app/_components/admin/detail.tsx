import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/_lib/utils";

// Standard back link sitting above a detail page header.
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}

// Key/value definition row used on every detail page (replaces the per-page
// local `Row` helper). Renders "—" for empty values.
export function DefRow({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className={cn("text-right font-medium text-foreground", mono && "font-mono text-xs")}>
        {empty ? "—" : value}
      </dd>
    </div>
  );
}

// A vertical definition list. Pass DefRow children.
export function DefList({ children, className }: { children: ReactNode; className?: string }) {
  return <dl className={cn("space-y-0.5 divide-y divide-border/60 text-sm", className)}>{children}</dl>;
}

// Two/three-column responsive grid of labelled values for dense info blocks.
export function InfoGrid({
  items,
  cols = 2,
}: {
  items: { label: string; value: ReactNode; mono?: boolean; span?: boolean }[];
  cols?: 2 | 3 | 4;
}) {
  const colClass = cols === 4 ? "sm:grid-cols-4" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={cn("grid gap-x-6 gap-y-3", colClass)}>
      {items.map((it, i) => (
        <div key={i} className={cn(it.span && "sm:col-span-full")}>
          <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{it.label}</dt>
          <dd className={cn("mt-0.5 text-sm font-medium text-foreground", it.mono && "font-mono text-xs")}>
            {it.value === null || it.value === undefined || it.value === "" ? "—" : it.value}
          </dd>
        </div>
      ))}
    </div>
  );
}
