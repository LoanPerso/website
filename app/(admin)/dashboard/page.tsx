import { Card } from "@/_components/card";
import { Section } from "@/_components/section";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <Section
        title="Dashboard"
        description="Vue rapide des modules et de l'activite."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Auth" body="0 sessions actives" />
          <Card title="Billing" body="Plan: free" />
          <Card title="Profile" body="Derniere mise a jour: -" />
        </div>
      </Section>
    </div>
  );
}
