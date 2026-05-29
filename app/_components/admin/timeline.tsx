"use client";

import type { ReactNode } from "react";
import { cn } from "@/_lib/utils";

export type TimelineTone = "default" | "success" | "warning" | "error" | "info";

const DOT: Record<TimelineTone, string> = {
  default: "bg-muted-foreground/50",
  success: "bg-success",
  warning: "bg-alert",
  error: "bg-error",
  info: "bg-foreground",
};

export interface TimelineItem {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  body?: ReactNode;
  at?: ReactNode;
  icon?: ReactNode;
  tone?: TimelineTone;
}

// Vertical activity feed with a connecting rail. Used for interactions, status
// history, audit trails — anywhere a chronological list of events is shown.
export function Timeline({ items, empty }: { items: TimelineItem[]; empty?: string }) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{empty ?? "Aucun évènement."}</p>;
  }
  return (
    <ol className="relative space-y-4 pl-5">
      <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" aria-hidden />
      {items.map((it) => (
        <li key={it.id} className="relative">
          <span
            className={cn(
              "absolute -left-[18px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-2 ring-background",
              DOT[it.tone ?? "default"]
            )}
            aria-hidden
          />
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                {it.icon ? <span className="text-muted-foreground">{it.icon}</span> : null}
                {it.title}
              </p>
              {it.meta ? <p className="mt-0.5 text-xs text-muted-foreground">{it.meta}</p> : null}
              {it.body ? <div className="mt-1 text-[13px] text-foreground/90">{it.body}</div> : null}
            </div>
            {it.at ? <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">{it.at}</span> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

// Horizontal stepper for a fixed lifecycle (application/contract/loan stages).
export function StageStepper<K extends string>({
  stages,
  current,
  reachedKeys,
}: {
  stages: { key: K; label: string }[];
  current: K;
  reachedKeys?: K[];
}) {
  const reached = new Set(reachedKeys ?? []);
  const currentIndex = stages.findIndex((s) => s.key === current);
  return (
    <ol className="flex w-full items-center">
      {stages.map((s, i) => {
        const isCurrent = s.key === current;
        const isDone = reached.has(s.key) || i < currentIndex;
        return (
          <li key={s.key} className={cn("flex items-center", i < stages.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold",
                  isCurrent
                    ? "border-dark-gold bg-dark-gold/10 text-dark-gold"
                    : isDone
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {i + 1}
              </span>
              <span
                className={cn(
                  "max-w-[88px] text-center text-[10px] uppercase tracking-wide",
                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 ? (
              <span className={cn("mx-1 h-px flex-1", isDone ? "bg-success" : "bg-border")} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
