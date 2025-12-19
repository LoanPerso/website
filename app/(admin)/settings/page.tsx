import Link from "next/link";
import { Section } from "@/_components/section";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <Section
        title="Settings"
        description="Parametres du projet et connexions data."
      />
      <div className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft">
        <h3 className="text-lg font-semibold tracking-tight">Raccourcis</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
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
