import { Section } from "@/_components/section";

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-10">
      <Section
        title="Profile"
        description="Zone reservee pour l'edition du profil."
      />
      <div className="rounded-2xl border border-border bg-white/80 p-6 shadow-soft">
        <p className="text-sm text-muted-foreground">
          Relier ce module a Firebase pour les donnees long terme.
        </p>
      </div>
    </div>
  );
}
