"use client";

import type { ReactNode } from "react";
import { cn } from "@/_lib/utils";

export interface TabDef<K extends string = string> {
  key: K;
  label: string;
  count?: number | null;
  icon?: ReactNode;
}

// Underlined tab bar (gold active rail) — the shared version of the inline bar
// the application dossier first introduced. Controlled: the page owns the state.
export function Tabs<K extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: readonly TabDef<K>[];
  active: K;
  onChange: (key: K) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1 border-b border-border", className)}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon ? <span className="opacity-80">{t.icon}</span> : null}
            {t.label}
            {t.count != null ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
                  isActive ? "bg-foreground/10 text-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                {t.count}
              </span>
            ) : null}
            {isActive ? (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-dark-gold" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// Pill-style segmented control for compact in-panel toggles.
export function SegmentedTabs<K extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: readonly TabDef<K>[];
  active: K;
  onChange: (key: K) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/40 p-0.5", className)}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.icon}
            {t.label}
            {t.count != null ? <span className="tabular-nums opacity-70">{t.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
