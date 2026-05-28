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

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-alert/12 text-alert border-alert/25",
  error: "bg-error/12 text-error border-error/25",
  neutral: "bg-secondary text-muted-foreground border-border",
  info: "bg-accent/15 text-dark-gold border-accent/30",
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
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClass[tone]
      )}
    >
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
