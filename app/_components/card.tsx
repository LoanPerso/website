import type { ReactNode } from "react";

type CardProps = {
  title: string;
  body: string;
  children?: ReactNode;
};

export function Card({ title, body, children }: CardProps) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </article>
  );
}
