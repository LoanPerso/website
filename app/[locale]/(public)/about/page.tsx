import type { Metadata } from "next";
import { Section } from "@/_components/section";
import { NEW_CREDIT_CLOSED } from "@/_config/site-mode";
import { ServiceClosedNotice } from "@/_components/service-closed-notice";

export function generateMetadata(): Metadata {
  return NEW_CREDIT_CLOSED ? { robots: { index: false, follow: false } } : {};
}

export default function AboutPage() {
  if (NEW_CREDIT_CLOSED) return <ServiceClosedNotice />;
  return (
    <div className="container space-y-10 py-12">
      <Section
        title="Equipe"
        description="Vision simple: aller vite sans casser la structure."
      />
      <div className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft">
        <h3 className="text-lg font-semibold tracking-tight">Principes</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Structure claire dans app/</li>
          <li>Moins de fichiers a la racine</li>
          <li>Modules evolutifs par feature</li>
        </ul>
      </div>
    </div>
  );
}
