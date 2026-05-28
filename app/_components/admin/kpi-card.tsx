import type { ReactNode } from "react";
import { cn } from "@/_lib/utils";

type Tone = "default" | "success" | "warning" | "error";

const toneRing: Record<Tone, string> = {
  default: "",
  success: "before:bg-success",
  warning: "before:bg-alert",
  error: "before:bg-error",
};

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  tone?: Tone;
}

export function KpiCard({ label, value, sub, icon, tone = "default" }: KpiCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-white p-5 shadow-soft",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
        tone === "default" ? "before:bg-transparent" : toneRing[tone]
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground/70">{icon}</span> : null}
      </div>
      <p className="mt-3 font-serif text-3xl tracking-tight text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}
