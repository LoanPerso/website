import { Card } from "@/_components/card";
import { Section } from "@/_components/section";

export default function DashboardPage() {
  return (
    <div className="app-page">
      <Section
        title="Dashboard"
        description="Vue rapide des modules et de l'activite."
      >
        <div className="grid">
          <Card title="Auth" body="0 sessions actives" />
          <Card title="Billing" body="Plan: free" />
          <Card title="Profile" body="Derniere mise a jour: -" />
        </div>
      </Section>
    </div>
  );
}
