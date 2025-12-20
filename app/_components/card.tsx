import type { ReactNode } from "react";

type CardProps = {
  title: string;
  body: string;
  children?: ReactNode;
};

export function Card({ title, body, children }: CardProps) {
  return (
    <article className="rounded-lg border border-border bg-white p-6 shadow-soft transition-shadow hover:shadow-crisp">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
      {children}
    </article>
  );
}
