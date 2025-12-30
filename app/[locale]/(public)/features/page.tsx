import { Card } from "@/_components/card";
import { Section } from "@/_components/section";

export default function FeaturesPage() {
  return (
    <div className="container space-y-10 py-12">
      <Section
        title="Modules et sous-modules"
        description="Chaque feature garde ses types, services, et logique au meme endroit."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Auth" body="Session, providers, et mapping utilisateur." />
          <Card title="Billing" body="Plans, quotas, et activation." />
          <Card title="Profile" body="Profil public, edition, et preferences." />
        </div>
      </Section>
    </div>
  );
}
