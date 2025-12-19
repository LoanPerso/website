import { Card } from "@/_components/card";
import { Section } from "@/_components/section";

export default function PricingPage() {
  return (
    <div className="marketing-page">
      <Section
        title="Tarifs"
        description="Structure simple pour brancher votre modele pricing."
      >
        <div className="grid">
          <Card title="Free" body="Decouverte et tests." />
          <Card title="Pro" body="Fonctions avancees et support." />
          <Card title="Enterprise" body="Sur-mesure et SLA." />
        </div>
      </Section>
    </div>
  );
}
