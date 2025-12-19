import Link from "next/link";
import { Card } from "@/_components/card";
import { Section } from "@/_components/section";

export default function MarketingHome() {
  return (
    <div className="marketing-home">
      <section className="hero">
        <div>
          <span className="eyebrow">Next.js Pro Stack</span>
          <h1>Structure solide pour demarrer vite.</h1>
          <p>
            Une base propre avec routes, modules, et un socle data pret pour
            Supabase et Firebase.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button primary" href="/dashboard">
            Voir le dashboard
          </Link>
          <Link className="button ghost" href="/features">
            Explorer les modules
          </Link>
        </div>
      </section>

      <Section
        title="Ce qui est deja en place"
        description="Architecture app router, modules internes, et routes de base."
      >
        <div className="grid">
          <Card
            title="Marketing"
            body="Pages publiques avec layout dedie et navigation." />
          <Card
            title="App"
            body="Zone privee avec shell et sections fonctionnelles." />
          <Card
            title="API"
            body="Endpoint health pour verifier la dispo." />
        </div>
      </Section>

      <Section
        title="Prochaine etape"
        description="On peut brancher le design system, puis connecter Supabase et Firebase."
      />
    </div>
  );
}
