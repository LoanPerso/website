import { Card } from "@/_components/card";
import { Section } from "@/_components/section";

export default function PricingPage() {
  return (
    <div className="container space-y-10 py-12">
      <Section
        title="Tarifs"
        description="Structure simple pour brancher votre modele pricing."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Free" body="Decouverte et tests." />
          <Card title="Pro" body="Fonctions avancees et support." />
          <Card title="Enterprise" body="Sur-mesure et SLA." />
        </div>
      </Section>
    </div>
  );
}
