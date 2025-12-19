import { Section } from "@/_components/section";

export default function ProfileSettingsPage() {
  return (
    <div className="app-page">
      <Section
        title="Profile"
        description="Zone reservee pour l'edition du profil."
      />
      <div className="note">
        <p>Relier ce module a Firebase pour les donnees long terme.</p>
      </div>
    </div>
  );
}
