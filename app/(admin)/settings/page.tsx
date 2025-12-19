import Link from "next/link";
import { Section } from "@/_components/section";

export default function SettingsPage() {
  return (
    <div className="app-page">
      <Section
        title="Settings"
        description="Parametres du projet et connexions data."
      />
      <div className="note">
        <h3>Raccourcis</h3>
        <ul>
          <li>
            <Link href="/settings/profile">Profil public</Link>
          </li>
          <li>
            <Link href="/dashboard">Retour dashboard</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
