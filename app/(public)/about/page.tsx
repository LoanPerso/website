import { Section } from "@/_components/section";

export default function AboutPage() {
  return (
    <div className="marketing-page">
      <Section
        title="Equipe"
        description="Vision simple: aller vite sans casser la structure."
      />
      <div className="note">
        <h3>Principes</h3>
        <ul>
          <li>Structure claire dans app/</li>
          <li>Moins de fichiers a la racine</li>
          <li>Modules evolutifs par feature</li>
        </ul>
      </div>
    </div>
  );
}
