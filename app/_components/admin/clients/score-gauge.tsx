import { cn } from "@/_lib/utils";
import type { RiskCategory } from "@/_lib/admin/types";

const CATEGORY_TEXT: Record<RiskCategory, string> = {
  A: "text-success",
  B: "text-dark-gold",
  C: "text-alert",
  D: "text-error",
};

const CATEGORY_LABEL: Record<RiskCategory, string> = {
  A: "Risque faible",
  B: "Risque modéré",
  C: "Risque élevé",
  D: "Risque limite",
};

export function ScoreGauge({
  score,
  category,
  size = 132,
}: {
  score: number | null;
  category: RiskCategory | null;
  size?: number;
}) {
  const stroke = 10;
  const r = (size - stroke - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score ?? 0)) / 100;
  const colorClass = category ? CATEGORY_TEXT[category] : "text-muted-foreground";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            className="stroke-secondary"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            className={cn("stroke-current transition-[stroke-dashoffset] duration-700", colorClass)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold leading-none tracking-tight">{score ?? "—"}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className={cn("mt-2 text-sm font-semibold", colorClass)}>
        {category ? `Catégorie ${category}` : "Non évalué"}
      </p>
      {category ? (
        <p className="text-xs text-muted-foreground">{CATEGORY_LABEL[category]}</p>
      ) : null}
    </div>
  );
}
