import type { ReactNode } from "react";
import { cn } from "@/_lib/utils";
import { EmptyState } from "./panel";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: { title: string; hint?: string };
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

export function DataTable<T>({ columns, rows, getKey, onRowClick, empty }: DataTableProps<T>) {
  if (!rows.length) {
    return <EmptyState title={empty?.title ?? "Aucun résultat"} hint={empty?.hint} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/40">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                  alignClass[c.align ?? "left"],
                  c.className
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-border last:border-0 transition-colors",
                onRowClick ? "cursor-pointer hover:bg-secondary/30" : "hover:bg-secondary/20"
              )}
            >
              {columns.map((c, i) => (
                <td
                  key={i}
                  className={cn("px-4 py-3 text-foreground", alignClass[c.align ?? "left"], c.className)}
                >
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
