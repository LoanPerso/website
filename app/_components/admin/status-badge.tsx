import { cn } from "@/_lib/utils";
import {
  applicationStatusLabels,
  clientStatusLabels,
  contractStatusLabels,
  documentStatusLabels,
  installmentStatusLabels,
  loanStatusLabels,
  paymentStatusLabels,
  taskStatusLabels,
} from "@/_lib/admin/format";

type Tone = "success" | "warning" | "error" | "neutral" | "info";

// Neutral chip; the status colour lives only in the leading dot (grayscale-first).
const toneDot: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-alert",
  error: "bg-error",
  neutral: "bg-muted-foreground/50",
  info: "bg-foreground",
};

export type BadgeKind =
  | "loan"
  | "client"
  | "installment"
  | "payment"
  | "application"
  | "document"
  | "task"
  | "contract";

const toneMaps: Record<BadgeKind, Record<string, Tone>> = {
  loan: { active: "success", paid_off: "info", defaulted: "error", cancelled: "neutral", draft: "neutral" },
  client: { active: "success", prospect: "info", inactive: "neutral", blacklisted: "error" },
  installment: { paid: "success", partial: "warning", late: "error", pending: "neutral", waived: "neutral" },
  payment: { completed: "success", pending: "warning", failed: "error", refunded: "neutral" },
  application: {
    approved: "success",
    qualified: "info",
    submitted: "info",
    under_review: "warning",
    rejected: "error",
    draft: "neutral",
    cancelled: "neutral",
  },
  document: { verified: "success", received: "info", missing: "neutral", rejected: "error", expired: "warning" },
  task: { open: "info", done: "success", cancelled: "neutral" },
  contract: {
    active: "success",
    signed: "info",
    offer_sent: "warning",
    completed: "info",
    draft: "neutral",
    cancelled: "neutral",
    expired: "error",
  },
};

const labelMaps: Record<BadgeKind, Record<string, string>> = {
  loan: loanStatusLabels,
  client: clientStatusLabels,
  installment: installmentStatusLabels,
  payment: paymentStatusLabels,
  application: applicationStatusLabels,
  document: documentStatusLabels,
  task: taskStatusLabels,
  contract: contractStatusLabels,
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", toneDot[tone])} />
      {children}
    </span>
  );
}

export function StatusBadge({ kind, status }: { kind: BadgeKind; status: string }) {
  const tone = toneMaps[kind][status] ?? "neutral";
  const label = labelMaps[kind][status] ?? status;
  return <Badge tone={tone}>{label}</Badge>;
}

export function RiskBadge({ category }: { category: string | null }) {
  if (!category) return <span className="text-xs text-muted-foreground">—</span>;
  const tone: Tone = category === "A" ? "success" : category === "B" ? "info" : category === "C" ? "warning" : "error";
  return <Badge tone={tone}>Cat. {category}</Badge>;
}

// Numeric credit score in a neutral chip; the risk category shows only as a small dot.
const scoreDot: Record<string, string> = {
  A: "bg-success",
  B: "bg-foreground",
  C: "bg-alert",
  D: "bg-error",
};

export function ScoreChip({ score, category }: { score: number | null; category: string | null }) {
  if (score == null) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-foreground">
      {category ? (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", scoreDot[category] ?? "bg-muted-foreground/50")} />
      ) : null}
      {score}
    </span>
  );
}
