import type { ReactNode } from "react";

type CardProps = {
  title: string;
  body: string;
  children?: ReactNode;
};

export function Card({ title, body, children }: CardProps) {
  return (
    <article className="rounded-2xl border border-border bg-white/90 p-5 shadow-soft">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
      {children}
    </article>
  );
}
